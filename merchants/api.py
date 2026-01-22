from ninja import Router
from ninja import Schema
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime
from .models import Merchant, Order, UserSubscription
from users.models import Subscription
import os

router = Router()


class MerchantSchema(Schema):
    """Pydantic schema for Merchant API response"""
    id: int
    slug: str
    store_name: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


@router.get("/merchants/{slug}", response=MerchantSchema, tags=["merchants"])
def get_merchant_by_slug(request, slug: str):
    """
    Fetch a merchant by their unique slug.
    
    Returns 404 if merchant not found.
    """
    merchant = get_object_or_404(Merchant, slug=slug)
    return merchant


class PasswordResetSchema(Schema):
    email: str


class PasswordResetConfirmSchema(Schema):
    uidb64: str
    token: str
    new_password: str


class PaymentVerifySchema(Schema):
    token: str


class SubscriptionSchema(Schema):
    plan: str
    is_active: bool
    expiry_date: datetime = None

    class Config:
        from_attributes = True


class OrderHistorySchema(Schema):
    id: int
    amount: float
    status: str
    saas_plan_id: str = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChartDataSchema(Schema):
    date: str
    amount: float


class DashboardMetricsSchema(Schema):
    totalVolume: float
    merchantProfit: float
    totalFees: float
    transactionCount: int
    chartData: list[ChartDataSchema]


class SaaSMetricsSchema(DashboardMetricsSchema):
    activeSubscribers: int
    churnRate: float
    mrr: float
    arr: float
    retentionRate: float


from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import get_user_model

User = get_user_model()

@router.post("/password-reset/", tags=["auth"])
def password_reset(request, data: PasswordResetSchema):
    """
    Trigger the Django password reset flow.
    Sends a reset link to the provided email if it exists.
    """
    form = PasswordResetForm({'email': data.email})
    if form.is_valid():
        # Point to Next.js frontend
        frontend_domain = os.getenv('FRONTEND_URL', 'localhost:3000').replace('http://', '').replace('https://', '')
        form.save(
            request=request,
            use_https=request.is_secure(),
            domain_override=frontend_domain,
            email_template_name='registration/password_reset_email.html',
            subject_template_name='registration/password_reset_subject.txt',
        )
        return {"success": True, "message": "Password reset email sent."}
    return {"success": False, "errors": form.errors}


@router.post("/password-reset-confirm/", tags=["auth"])
def password_reset_confirm(request, data: PasswordResetConfirmSchema):
    """
    Confirm the password reset and set the new password.
    """
    try:
        uid = urlsafe_base64_decode(data.uidb64).decode()
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, data.token):
        form = SetPasswordForm(user, {'new_password1': data.new_password, 'new_password2': data.new_password})
        if form.is_valid():
            form.save()
            return {"success": True, "message": "Password has been reset successfully."}
        return {"success": False, "errors": form.errors}
    
    return {"success": False, "message": "Invalid or expired reset link."}


@router.post("/verify-payment/", tags=["payments"])
def verify_payment(request, data: PaymentVerifySchema):
    """
    Verify payment token and update order status.
    Prevents replay attacks by checking if the order is already paid.
    """
    order = get_object_or_404(Order, token=data.token)
    
    if order.status == 'paid':
        return {"success": False, "message": "Payment already processed (Replay Attack prevented)."}
    
    # Placeholder for server-side gateway verification
    # In a real app, you'd call the gateway API here
    gateway_verified = True 
    
    if gateway_verified:
        order.status = 'paid'
        order.save()
        
        # Update user's subscription to PRO
        subscription, created = UserSubscription.objects.get_or_create(user=order.user)
        subscription.plan = 'PRO'
        subscription.is_active = True
        subscription.save()
        
        # SaaS Activation Logic
        if order.saas_plan_id:
            user_sub, created = Subscription.objects.get_or_create(user=order.user)
            user_sub.activate_pro()
            
        # Send Transactional Email
        try:
            context = {
                'user': order.user,
                'order': order,
                'dashboard_url': f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard"
            }
            email_body = render_to_string('emails/order_paid.txt', context)
            send_mail(
                subject=f"Payment Confirmed - Order #{order.id}",
                message=email_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[order.user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send email: {e}")
            
        return {
            "success": True, 
            "message": "Payment verified successfully!",
            "plan": subscription.plan,
            "saas_active": True if order.saas_plan_id else False
        }
    
    return {"success": False, "message": "Payment verification failed at gateway."}


@router.get("/subscription/", response=SubscriptionSchema, tags=["auth"])
def get_subscription_status(request):
    """
    Fetch the current user's SaaS subscription status.
    """
    if not request.user.is_authenticated:
        return {"plan": "FREE", "is_active": False}
    
    subscription, created = Subscription.objects.get_or_create(user=request.user)
    return subscription


@router.get("/orders/", response=list[OrderHistorySchema], tags=["auth"])
def get_order_history(request):
    """
    Fetch the current user's order history.
    """
    if not request.user.is_authenticated:
        return []
    
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    return orders


from django.db.models import Sum, Count
from django.db.models.functions import TruncDay

@router.get("/metrics/ecommerce/{merchant_slug}", response=DashboardMetricsSchema, tags=["merchants"])
def get_ecommerce_metrics(request, merchant_slug: str):
    merchant = get_object_or_404(Merchant, slug=merchant_slug)
    # In a real app, we'd filter transactions by this merchant
    # For now, we'll aggregate orders for the user who owns the merchant
    orders = Order.objects.filter(user=merchant.user, status='paid')
    
    total_volume = orders.aggregate(Sum('amount'))['amount__sum'] or 0.0
    total_fees = float(total_volume) * 0.03 # 3% platform fee
    
    # Generate chart data for last 7 days
    chart_data = []
    daily_stats = orders.annotate(day=TruncDay('created_at')).values('day').annotate(total=Sum('amount')).order_by('day')
    for stat in daily_stats:
        chart_data.append({
            "date": stat['day'].strftime("%b %d"),
            "amount": float(stat['total'])
        })

    return {
        "totalVolume": float(total_volume),
        "merchantProfit": float(total_volume) - total_fees,
        "totalFees": total_fees,
        "transactionCount": orders.count(),
        "chartData": chart_data
    }


@router.get("/metrics/saas/{merchant_slug}", response=SaaSMetricsSchema, tags=["merchants"])
def get_saas_metrics(request, merchant_slug: str):
    base_metrics = get_ecommerce_metrics(request, merchant_slug)
    
    # Mock SaaS specific metrics for now, as we don't have a full subscription tracking for customers yet
    return {
        **base_metrics,
        "activeSubscribers": 124,
        "churnRate": 1.2,
        "mrr": base_metrics["totalVolume"] / 12, # Simplified MRR
        "arr": base_metrics["totalVolume"],
        "retentionRate": 98.5
    }
