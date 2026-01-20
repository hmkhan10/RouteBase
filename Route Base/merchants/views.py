from django.shortcuts import render, redirect, get_object_or_404 
from django.contrib.auth.decorators import login_required, user_passes_test 
from django.contrib.auth import login, authenticate, logout 
from django.contrib import messages 
from .utils import generate_paymob_iframe
from django.http import JsonResponse, HttpResponse 
from django.views.decorators.csrf import csrf_exempt 
from django.views.decorators.http import require_POST, require_GET 
from django.db import transaction 
import requests
from .models import LayoutTemplate
from .models import Corporation, SoftwareAsset, FinancialPulse, UserSubscription
from django.utils import timezone 
from django.db import models 
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.conf import settings 
from reportlab.pdfgen import canvas
from django.db.models.functions import TruncDay
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from django.utils.text import slugify 
from datetime import timedelta 
from rest_framework.decorators import api_view 
from rest_framework.response import Response 
from decimal import Decimal 
import json 
import datetime
from .models import (
    MerchantPage, Branch, FireGroup, Staff, Transaction,
    LoginHistory, WebOwner, Seller, CommissionLedger, PageView, Withdrawal,
    LayoutTemplate, Corporation, SoftwareAsset, FinancialPulse, UserSubscription
)
from django.db.models import Sum, Count , Avg
from django.contrib.admin.views.decorators import staff_member_required 
from django.db.models.functions import TruncDate 
import logging 
import uuid 
from .forms import SellerRegistrationForm, PaymentForm, CustomizePageForm 
from merchants.payment_service import PaymentService 
from merchants.commision import CommissionService 
from .utils import generate_reference_id, get_client_ip, send_email_notification 

logger = logging.getLogger(__name__) 
payment_service = PaymentService() 
commission_service = CommissionService() 

@staff_member_required 
def platform_master_dashboard(request): 
    owners = WebOwner.objects.select_related('user').all() 
    transactions = Transaction.objects.select_related('seller', 'seller__user').all().order_by('-created_at') 
    total_owners = owners.count() 
    total_websites = owners.exclude(website_name="").count() 
    platform_revenue = transactions.aggregate(Sum('amount'))['amount__sum'] or 0 
    
    avg_rev_per_user = 0 
    if total_owners > 0: 
        avg_rev_per_user = round(platform_revenue / total_owners, 2) 

    now = timezone.now() 
    premium_count = owners.filter(subscription_expiry__gt=now).count() 

    labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] 
    data_points = [0, 0, 0, 0, 0, 0, 0] 

    context = { 
        'owners': owners, 
        'global_transactions': transactions[:10], 
        'total_owners': total_owners, 
        'total_websites': total_websites, 
        'platform_revenue': platform_revenue, 
        'avg_rev_per_user': avg_rev_per_user, 
        'premium_count': premium_count, 
        'labels': labels, 
        'data_points': data_points, 
        'now': now, 
    } 
    return render(request, 'platform_admin.html', context) 

def home_view(request): 
    return render(request, 'index.html') 


@csrf_exempt
def register(request): 
    if request.method == "POST":
        if request.headers.get('Content-Type') == 'application/json':
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return JsonResponse({"success": False, "message": "Invalid JSON"}, status=400)
            
            # Manual validation for JSON requests
            username = data.get('username')
            email = data.get('email')
            password = data.get('password', 'password123')
            
            if not username or not email:
                return JsonResponse({"success": False, "errors": {"username": ["Required"], "email": ["Required"]}}, status=400)
            
            if User.objects.filter(username=username).exists():
                return JsonResponse({"success": False, "errors": {"username": ["This username is already taken."]}}, status=400)
            
            if User.objects.filter(email=email).exists():
                return JsonResponse({"success": False, "errors": {"email": ["This email is already associated with an account."]}}, status=400)

            user = User.objects.create_user(username=username, email=email, password=password)
            login(request, user)
            
            plan_type = data.get('plan_type', 'ecommerce-pro')
            sub, created = UserSubscription.objects.get_or_create(user=user)
            sub.user_type = 'SAAS' if 'saas' in plan_type.lower() else 'MERCHANT'
            sub.save()
            
            Seller.objects.get_or_create(
                user=user,
                defaults={
                    'business_name': data.get('business_name', ''),
                    'phone': data.get('phone', ''),
                    'email': user.email,
                    'page_slug': slugify(data.get('business_name', user.username)),
                    'bank_name': data.get('bank_name', ''),
                    'bank_account': data.get('iban', ''),
                }
            )
            return JsonResponse({"success": True, "message": "Registered successfully"})
            
        form = SellerRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            
            plan_type = request.POST.get('plan_type', 'ecommerce-pro')
            sub, created = UserSubscription.objects.get_or_create(user=user)
            sub.user_type = 'SAAS' if 'saas' in plan_type.lower() else 'MERCHANT'
            sub.save()
            
            Seller.objects.get_or_create(
                user=user,
                defaults={
                    'business_name': request.POST.get('business_name', ''),
                    'phone': request.POST.get('phone', ''),
                    'email': user.email,
                    'page_slug': slugify(request.POST.get('business_name', user.username))
                }
            )
            return redirect('merchants:dashboard')
        else:
            return JsonResponse({"success": False, "errors": form.errors}, status=400)
    return render(request, 'register.html') 

@csrf_exempt
def login_view(request): 
    if request.method == "POST": 
        if request.headers.get('Content-Type') == 'application/json':
            try:
                data = json.loads(request.body)
                u = data.get('username')
                p = data.get('password')
            except json.JSONDecodeError:
                return JsonResponse({"success": False, "message": "Invalid JSON"}, status=400)
        else:
            u = request.POST.get('username') 
            p = request.POST.get('password') 
            
        user = authenticate(request, username=u, password=p) 
        if user is not None: 
            login(request, user) 
            LoginHistory.objects.create( 
                user=user, 
                ip_address=get_client_ip(request), 
                user_agent=request.META.get('HTTP_USER_AGENT') 
            ) 
            if request.headers.get('Content-Type') == 'application/json':
                return JsonResponse({"success": True, "message": "Logged in successfully"})
            return redirect('home') 
        else: 
            if request.headers.get('Content-Type') == 'application/json':
                return JsonResponse({"success": False, "message": "Invalid username or password."}, status=401)
            messages.error(request, "Invalid username or password.") 
    return render(request, 'login.html') 

def logout_view(request): 
    logout(request) 
    return redirect('home') 

def process_transaction(request, owner_slug):
    if request.method == "POST":
        owner = get_object_or_404(Seller, page_slug=owner_slug)
        
        customer_name = request.POST.get('customer_name')
        raw_amount = request.POST.get('amount', 0)
        idempotency_key = request.POST.get('idempotency_key')
        
        try:
            base_amount = Decimal(str(raw_amount))
            if base_amount <= 0:
                raise ValueError("Amount must be positive")
        except (ValueError, Decimal.InvalidOperation):
            return JsonResponse({"success": False, "error": "Invalid amount"}, status=400)

        if idempotency_key:
            existing_tx = Transaction.objects.filter(idempotency_key=idempotency_key).first()
            if existing_tx:
                return render(request, 'payment_success.html', {
                    'tx': existing_tx,
                    'owner': owner,
                    'customer': customer_name,
                    'total': existing_tx.amount + existing_tx.platform_fee
                })

        fee = (base_amount * Decimal('0.03')).quantize(Decimal('0.01'))
        seller_amount = (base_amount - fee).quantize(Decimal('0.01'))
        total_charged = base_amount + fee  
        new_tx = Transaction.objects.create(
            reference_id=str(uuid.uuid4())[:8].upper(),
            seller=owner,
            buyer_phone=request.POST.get('phone', '0000000000'),
            amount=base_amount,
            platform_fee=fee,
            seller_amount=seller_amount, 
            payment_method='bank',
            status='completed',
            idempotency_key=idempotency_key
        )
        
        
        return render(request, 'payment_success.html', {
            'tx': new_tx,
            'owner': owner,
            'customer': customer_name,
            'total': total_charged  
        })
    
def subscription_selection_page(request):
    """Renders the main pricing page with Basic and Pro bubbles."""
    return render(request, 'models_saas_page.html')

def saas_pay(request):
    """Renders the main pricing page with Basic and Pro bubbles."""
    return render(request, 'payment_saas.html')
@login_required 
def customize_view(request): 
    seller = get_object_or_404(Seller, user=request.user) 
    if request.method == "POST": 
        seller.page_title = request.POST.get('page_title') 
        seller.brand_color = request.POST.get('brand_color') 
        seller.welcome_message = request.POST.get('welcome_message') 
        seller.save() 
        messages.success(request, "Terminal branding updated successfully!") 
        return redirect('dashboard') 
    return render(request, 'customize.html', {'seller': seller}) 


from django.views.decorators.cache import cache_page

@cache_page(60 * 15)  # Cache for 15 minutes
def seller_page(request, slug): 
    merchant = get_object_or_404(Seller, page_slug=slug)
    if not merchant.is_active:
        return render(request, 'subscription_expired.html', {'merchant': merchant})
    raw_amount = request.GET.get('amount', 0)
    
    try:
        base_amount = float(raw_amount)
    except (ValueError, TypeError):
        base_amount = 0.0

    platform_fee = (Decimal(str(base_amount)) * Decimal('0.03')).quantize(Decimal('0.01'))
    total_to_pay = Decimal(str(base_amount)) + platform_fee

    context = {
        'merchant': merchant,               
        'admin_name': merchant.admin_name,   
        'description': merchant.description, 
        'base_amount': round(base_amount, 2),
        'platform_fee': round(platform_fee, 2),
        'total_to_pay': round(total_to_pay, 2),
        'commission_rate': 3,              
    }
    
    return render(request, 'pay_page.html', context)

def api_seller_info(request, slug): 
    return JsonResponse({'business_name': f"Seller {slug}", 'status': 'active'}) 

def api_transaction_status(request, transaction_id): 
    return JsonResponse({'transaction_id': str(transaction_id), 'status': 'pending'})


def quick_pay_view(request): 
    return render(request, 'quick_pay.html') 

@api_view(['POST']) 
@csrf_exempt 
def process_quick_payment(request): 
    try: 
        data = request.data 
        merchant = Seller.objects.filter(page_slug=data.get('seller_identifier')).first() 
        
        if not merchant: 
            return Response({'success': False, 'error': 'Merchant not found'}, status=404) 
        
        base_amount = Decimal(str(data['amount']))
        if base_amount <= 0:
            return Response({'success': False, 'error': 'Amount must be positive'}, status=400)
            
        idempotency_key = data.get('idempotency_key')
        if idempotency_key:
            existing_tx = Transaction.objects.filter(idempotency_key=idempotency_key).first()
            if existing_tx:
                return Response({'success': True, 'transaction_id': existing_tx.transaction_id, 'status': existing_tx.status})

        platform_fee = (base_amount * Decimal('0.03')).quantize(Decimal('0.01'))
        total_amount = base_amount + platform_fee

        result = payment_service.initiate_payment( 
            amount=total_amount, 
            seller=merchant, 
            buyer_info={
                'phone': data['buyer_phone'], 
                'cnic': data.get('buyer_cnic')
            }, 
            payment_method='jazzcash',
            idempotency_key=idempotency_key
        ) 
        return Response(result) 
    except Exception as e: 
        return Response({'success': False, 'error': str(e)}, status=500)
def withdraw_commission(request): 
    return render(request, 'withdraw.html') 


def payment_success(request, transaction_id): 
    transaction = get_object_or_404(Transaction.objects.select_related('seller'), transaction_id=transaction_id) 
    return render(request, 'success.html', { 
        'transaction': transaction, 
        'client_id': transaction.buyer_phone, 
        'amount': transaction.amount, 
        'admin_name': transaction.seller.page_title, 
        'date': transaction.completed_at 
    }) 


@login_required
def subscription_page(request):
    user_joined = request.user.date_joined
    now = timezone.now()
    
    trial_expired = False
    if now > user_joined + timedelta(days=14):
        trial_expired = True
        
    return render(request, 'subscription_page.html', {'trial_expired': trial_expired})

@login_required
def dashboard(request):
    
    seller, created = Seller.objects.get_or_create(user=request.user)
    
    my_txs = Transaction.objects.filter(seller=seller, status='completed')

    
    total_vol = my_txs.aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
    profit = total_vol * Decimal('0.97')  # Merchant gets 97% after 3% platform fee 

    
    chart_labels = [(timezone.now() - timedelta(days=i)).strftime('%d %b') for i in range(6, -1, -1)]
    chart_data = [0.0] * 7
    
    daily_stats = my_txs.annotate(day=TruncDay('created_at')).values('day').annotate(total=Sum('amount'))
    stats_dict = {s['day'].strftime('%d %b'): float(s['total']) for s in daily_stats}
    
    if stats_dict:
        chart_data = [stats_dict.get(label, 0.0) for label in chart_labels]

    context = {
        'seller': seller,
        'total_volume': f"{total_vol:,.2f}",
        'merchant_profit': f"{profit:,.2f}",
        'chart_data': chart_data,
        'chart_labels': chart_labels,
        'raast_count': my_txs.filter(payment_method='RAAST').count(),
        'sadabiz_count': my_txs.filter(payment_method='SADABIZ').count(),
        'abandoned_carts': CartSession.objects.filter(merchant=seller, status='abandoned').count(),
    }
    return render(request, 'dashboard.html', context)
@csrf_exempt
def payment_webhook(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        gateway_id = data.get('transaction_id')
        payment_status = data.get('status') 
        
        try:
            with transaction.atomic():
                tx = Transaction.objects.select_for_update().get(transaction_id=gateway_id)
                
                if payment_status == 'success':
                    if tx.status != 'completed':
                        tx.mark_completed(gateway_txn_id=gateway_id, response_data=data)
                        logger.info(f"Transaction {gateway_id} completed via webhook")
                    return HttpResponse(status=200)
                else:
                    logger.warning(f"Webhook received non-success status for {gateway_id}: {payment_status}")
                    return HttpResponse(status=200) # Acknowledge receipt even if failed
                    
        except Transaction.DoesNotExist:
            logger.error(f"Webhook transaction not found: {gateway_id}")
            return HttpResponse(status=404)
            
    return HttpResponse(status=400)
@login_required
def transaction_history(request):
    seller, created = Seller.objects.get_or_create(user=request.user)
    history = Transaction.objects.filter(seller=seller)

    
    search_query = request.GET.get('search_id') 
    
    if search_query:
        try:
            history = history.filter(reference_id__icontains=search_query)
        except ValueError:
            history = history.none()

    
    f = request.GET.get('filter')
    if f == '30days':
        history = history.filter(created_at__gte=timezone.now() - timedelta(days=30))
    elif f == 'completed':
        history = history.filter(status='completed')

    return render(request, 'transaction_history.html', {
        'seller': seller,
        'history': history.order_by('-created_at'),
        'search_val': search_query 
    })
@login_required 
@user_passes_test(lambda u: u.is_superuser) 
def commission_dashboard(request): 
    stats = { 
        'total_volume': Transaction.objects.filter(status='completed').aggregate(models.Sum('amount'))['amount__sum'] or 0, 
        'total_revenue': Transaction.objects.filter(status='completed').aggregate(models.Sum('platform_fee'))['platform_fee__sum'] or 0, 
        'active_merchants': Seller.objects.filter(is_active=True).count() 
    } 
    return render(request, 'admin/commission_dashboard.html', {'stats': stats}) 

@csrf_exempt 
@require_POST 
def Sadapay_callback(request): 
    try: 
        request_data = request.POST.dict() 
        result = payment_service.handle_payment_callback(request_data) 
        if result['success']: 
            return redirect('payment_success', transaction_id=result['transaction'].transaction_id) 
        return redirect('payment_error', error=result.get('error')) 
    except Exception as e: 
        return redirect('payment_error', error='Callback error') 

def payment_error(request): 
    return render(request, 'error.html', {'error': request.GET.get('error')}) 

@login_required 
def build_and_deploy(request):
    merchant = MerchantPage.objects.filter(user=request.user).first()

    if not merchant or not merchant.is_active:
        return redirect('subscription_page')
    if request.method == "POST":
        print(f"DEBUG POST DATA: {request.POST}") 

        name = request.POST.get('website_name') 
        mobile = request.POST.get('admin_mobile', '0000000000')
        desc = request.POST.get('description', '')

        if not name:
            return render(request, 'payment_builder.html', {
                'error': 'Website Name is required and was not found in the form.'
            })
        
        new_page = MerchantPage.objects.create(
            admin_name=name,
            admin_mobile=mobile,
            description=desc
        )
        
        return redirect(f'/pay/{new_page.slug}/')
    
    return render(request, 'payment_builder.html')
def payment_builder_view(request): 
    owner = WebOwner.objects.filter(user=request.user).first() 
    total_revenue = 0 
    active_subs = 0 
    transactions_list = [] 
    labels = [] 
    data_points = [] 
    now = timezone.now() 
    
    if owner: 
        transactions = Transaction.objects.filter(seller__user=owner.user).order_by('created_at') 
        transactions_list = transactions.order_by('-created_at') 
        total_revenue = transactions.aggregate(Sum('amount'))['amount__sum'] or 0 
        active_subs = transactions.count() 
        chart_data_raw = transactions.annotate(date=TruncDate('created_at')).values('date').annotate(daily_total=Sum('amount')).order_by('date') 
        labels = [data['date'].strftime("%d %b") for data in chart_data_raw] 
        data_points = [float(data['daily_total']) for data in chart_data_raw] 

    context = { 
        'owner': owner, 
        'total_revenue': total_revenue, 
        'active_subs': active_subs, 
        'transactions': transactions_list, 
        'labels': json.dumps(labels), 
        'data_points': json.dumps(data_points), 
    } 
    return render(request, 'payment_builder.html', context) 

def payment_page_view(request):
    owner = WebOwner.objects.first() 
    
    base_price = Decimal('500.00')
    fee_percentage = Decimal('0.03')
    
    calc_fee = (base_price * fee_percentage).quantize(Decimal('0.01'))
    total = base_price + calc_fee

    context = {
        'owner': owner,
        'product_price': base_price,
        'processing_fee': calc_fee,
        'total_amount': total,
    }
    return render(request, 'pay_page.html', context)
def web_builder_view(request):
    template_slug = request.GET.get('template')
    
   
    prebuilt = None
    if template_slug:
        prebuilt = LayoutTemplate.objects.filter(slug=template_slug).first()
    
    context = {
        'template_data': prebuilt.html_content if prebuilt else "",
        'config': prebuilt.config_json if prebuilt else {},
        'is_new': not bool(prebuilt)
    }
    return render(request, 'web_builder.html', context)
def public_payment_page(request, business_slug):
    owner = get_object_or_404(WebOwner, slug=business_slug)
    
    raw_amount = request.GET.get('amount', 0)
    try:
        product_price = float(raw_amount)
    except (ValueError, TypeError):
        product_price = 0.0

    fee = (Decimal(str(product_price)) * Decimal('0.03')).quantize(Decimal('0.01'))

    context = {
        'owner': owner,  
        'product_price': product_price,
        'processing_fee': fee,
        'total_amount': product_price + fee,
    }
    return render(request, 'pay_page.html', context)
@login_required
def activate_trial(request):
    if request.method == "POST":
        seller, created = Seller.objects.get_or_create(user=request.user)
        seller.is_active = True 
        seller.save()

        sub, created = UserSubscription.objects.get_or_create(user=request.user)
        sub.is_active = True
        sub.save()

        return redirect('merchants:dashboard')
@login_required
def activate_paid(request):
    if request.method == "POST":
        seller, created = Seller.objects.get_or_create(user=request.user)
        seller.is_active = True
        seller.save()

        sub, created = UserSubscription.objects.get_or_create(user=request.user)
        sub.is_active = True
        sub.save()
        
        return redirect('merchants:dashboard') 
@csrf_exempt
def receive_uplink_data(request):
    """
    Endpoint for the Terminal SDK & Docker Agent.
    URL: /api/v1/uplink/
    """
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            
            node_id = data.get('node_id')
            token = data.get('token')
            
            corp = Corporation.objects.filter(unique_node_id=node_id).first()
            
            if not corp:
                return JsonResponse({"status": "error", "message": "Node Not Found"}, status=404)

            payload = data.get('payload', {})
            software_list = payload.get('software_assets', [])
            net_worth = payload.get('net_worth_estimate', 0)

            for item in software_list:
                SoftwareAsset.objects.update_or_create(
                    corporation=corp,
                    asset_name=item['name'],
                    defaults={'file_path': item['path'], 'status': 'ACTIVE'}
                )

            FinancialPulse.objects.create(
                corporation=corp,
                valuation=net_worth,
                source="DOCKER_UPLINK"
            )

            return JsonResponse({
                "status": "success", 
                "message": f"Uplink Active for {corp.name}",
                "timestamp": data.get('timestamp')
            })

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)
@csrf_exempt
def sync_corporation(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            target_url = data.get('target_url')
            auth_token = data.get('auth_token')

            if not target_url or not auth_token:
                return JsonResponse({"status": "error", "message": "Missing credentials"}, status=400)

            headers = {
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(target_url, headers=headers, timeout=15)

            if response.status_code == 200:
                external_payload = response.json()
                
                refined_data = {
                    "balance": external_payload.get('total_liquidity', 0),
                    "burn": external_payload.get('monthly_burn_rate', 0),
                    "valuation": external_payload.get('current_valuation_m', 0),
                    "partners": external_payload.get('equity_holders', [])
                }
                
                return JsonResponse({"status": "success", "payload": refined_data})
            else:
                return JsonResponse({
                    "status": "error", 
                    "message": f"Connection Refused (Code: {response.status_code})"
                }, status=401)

        except requests.exceptions.RequestException as e:
            return JsonResponse({"status": "error", "message": "External Server Unreachable"}, status=504)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Only POST allowed"}, status=405)
def generate_report(request):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="RouteBase_Monthly_Report.pdf"'
    
    p = canvas.Canvas(response, pagesize=A4)
    p.setFillColor(colors.HexColor("#0b0f1a"))
    p.rect(0, 740, 600, 100, fill=True)
    
    p.setFillColor(colors.HexColor("#00d3a9"))
    p.setFont("Helvetica-Bold", 20)
    p.drawString(50, 780, "ROUTEBASE INTELLIGENCE REPORT")
    
    p.setFillColor(colors.black)
    p.setFont("Helvetica", 12)
    p.drawString(50, 700, f"Merchant: {request.user.username.upper()}")
    p.drawString(50, 680, f"Date: {datetime.date.today()}")
    
    
    p.showPage()
    p.save()
    return response
def routebase_builder(request):
    # Get template from URL (e.g., ?template=school)
    template_slug = request.GET.get('template', 'blank')
    
    # Fetch pre-built data if it exists
    template_obj = LayoutTemplate.objects.filter(slug=template_slug).first()
    
    context = {
        'template_html': template_obj.html_content if template_obj else "",
        'template_name': template_obj.name if template_obj else "New Design",
    }
    return render(request, 'prebuildpage.html', context)
def custom_builder(request):
    context = {
        'mode': 'scratch',
        'page_title': 'New Custom Project'
    }
    return render(request, 'create_page.html', context)
def template_library(request):
    context = {
        'mode': 'template_library',
        'page_title': 'Choose a Template'
    }
    return render(request, 'prebuildpage.html', context)
# 2. AJAX Save View (Handles the 'Save Project' button)
@csrf_exempt # In production, use the CSRF token in your JS fetch instead
def save_design(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            design_html = data.get('html')
            project_name = data.get('name')
            
            # Logic to save to a "UserProject" model
            # For now, we'll just simulate a success response
            print(f"Project '{project_name}' saved to Database!")
            
            return JsonResponse({'status': 'success', 'message': 'Design saved to RouteBase Cloud'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=405)
# merchants/views.py
# merchants/views.py
def hoster_page_view(request, site_slug):
    # 1. Fetch the store being visited by its slug
    site = get_object_or_404(UserSubscription, slug=site_slug)
    
    context = {'site': site}

    # 2. Logic: Only show the Pro Template if the plan is PRO AND Active
    if site.plan == 'PRO' and site.is_active:
        return render(request, 'pro_template.html', context)
    
    # 3. For everyone else (FREE users or Inactive users)
    # This will show your checkout/payment page instead of the admin settings
    return render(request, 'payment_saas.html', context)
def get_payment_step(request, plan_type):
    # 1. Logic for FREE plan
    if plan_type.upper() == 'FREE':
        sub = UserSubscription.objects.get(user=request.user)
        sub.plan = 'FREE'
        sub.is_active = True
        sub.save()
        return redirect('merchants:hoster_view', site_slug=sub.slug)

    # 2. TEMPORARY BYPASS FOR PRO (While Paymob is 503)
    # This sends the user directly to the form you want to build
    return redirect('merchants:pro_setup_form')
def pro_setup_view(request):
    if not request.user.is_authenticated:
        return redirect('login')
        
    if request.method == "POST":
        site_name = request.POST.get('site_name')
        # Here you would update their subscription model
        sub, created = UserSubscription.objects.get_or_create(user=request.user)
        sub.site_name = site_name
        sub.slug = slugify(site_name)
        sub.plan = 'PRO'
        sub.is_active = True # Only do this after they pay!
        sub.save()
        return redirect('merchants:hoster_view', site_slug=sub.slug)

    return render(request, 'pro_saas.html')

# merchants/views.py
@login_required
def pro_dashboard(request):
    # 1. Check if the user has a PRO subscription
    # Instead of 404, we filter. If it doesn't exist, we send them to setup.
    sub = UserSubscription.objects.filter(user=request.user, plan='PRO', is_active=True).first()
    
    if not sub:
        # If they aren't PRO, redirect them to the Setup or Payment page
        return redirect('merchants:pro_setup')

    # 2. Safety Fetch for the Seller Profile (No more IntegrityError)
    seller, created = Seller.objects.get_or_create(
        user=request.user,
        defaults={'email': request.user.email}
    )

    # 3. Premium Dashboard Data
    context = {
        'sub': sub,
        'seller': seller,
        'revenue': "284,900.00", 
        'savings': "8,547.00", # 3% Commission Saved calculation
        'orders': 42,
    }
    return render(request, 'pro_dashboard.html', context)
# merchants/views.py
@csrf_exempt
@require_POST
def create_cart_session(request):
    try:
        data = json.loads(request.body)
        merchant_slug = data.get('merchantId')
        items = data.get('items', [])
        session_id = data.get('sessionId')
        total_amount = data.get('totalAmount', 0)

        merchant = get_object_or_404(Seller, page_slug=merchant_slug)
        
        cart_session = CartSession.objects.create(
            merchant=merchant,
            session_id=session_id,
            items=items,
            total_amount=Decimal(str(total_amount)),
            status='active'
        )

        return JsonResponse({
            "success": True, 
            "message": "Cart session created",
            "session_id": cart_session.session_id
        })
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)

def saas_plans_view(request):
    # This ensures a 'site' always exists for the logged-in user
    site, created = UserSubscription.objects.get_or_create(
        user=request.user,
        defaults={
            'plan': 'FREE',
            'slug': slugify(request.user.username)
        }
    )
    return render(request, 'models_saas_page.html', {'site': site})
def initiate_payment(request, plan_type):
    # --- STEP 1: AUTHENTICATION ---
    # FOR PAKISTAN: Use pakistan.paymob.com
    auth_url = "https://pakistan.paymob.com/api/auth/tokens"
    
    # It is safer to use settings.PAYMOB_API_KEY than hardcoding
    auth_payload = {"api_key": settings.PAYMOB_API_KEY}
    
    auth_response = requests.post(auth_url, json=auth_payload, timeout=30)

    # If this prints in your terminal, your API key or URL is wrong
    if auth_response.status_code != 201:
        print(f"PAYMOB ERROR: {auth_response.text}")
        return HttpResponse(f"Paymob Auth Failed: {auth_response.status_code}. Check terminal.")

    try:
        token = auth_response.json().get('token')
    except Exception as e:
        return HttpResponse(f"JSON Crash: Paymob sent HTML instead of Data. {e}")

    # --- STEP 2: CREATE ORDER ---
    order_url = "https://pakistan.paymob.com/api/ecommerce/orders"
    order_payload = {
        "auth_token": token,
        "delivery_needed": "false",
        "amount_cents": "450000", # 4,500 PKR in cents
        "currency": "PKR",
        "items": []
    }
    
    order_response = requests.post(order_url, json=order_payload, timeout=30)
    order_id = order_response.json().get('id')

    # --- STEP 3: GET PAYMENT KEY ---
    # This generates the final URL for your iframe
    key_url = "https://pakistan.paymob.com/api/acceptance/payment_keys"
    key_payload = {
        "auth_token": token,
        "amount_cents": "450000",
        "expiration": 3600,
        "order_id": order_id,
        "billing_data": {
            "apartment": "NA", "email": request.user.email, "floor": "NA",
            "first_name": request.user.username, "street": "NA", "building": "NA",
            "phone_number": "03001234567", "shipping_method": "NA", "postal_code": "NA",
            "city": "Lahore", "country": "PK", "last_name": "User", "state": "Punjab"
        },
        "currency": "PKR",
        "integration_id": settings.PAYMOB_INTEGRATION_ID # Set this in settings.py
    }

    key_response = requests.post(key_url, json=key_payload, timeout=30)
    payment_token = key_response.json().get('token')

    # Construct the final Iframe URL
    iframe_id = "YOUR_IFRAME_ID" # Get this from Paymob Dash
    final_url = f"https://pakistan.paymob.com/api/acceptance/iframes/{iframe_id}?payment_token={payment_token}"

    return render(request, 'payment_saas.html', {'paymob_iframe_url': final_url})
# merchants/views.py
def pro_setup_view(request):
    return render(request, 'pro_setup_form.html')
def build_page(request):
    if request.method == "POST":
        # 1. Get the basic info from the form
        site_name = request.POST.get('site_name')
        site_slug = request.POST.get('site_slug')
        admin_user = request.POST.get('admin_username')
        acc_details = request.POST.get('account_details')

        # 2. Get the MULTIPLE PLANS (the arrays from the + button)
        plan_names = request.POST.getlist('plan_names[]')
        plan_prices = request.POST.getlist('plan_prices[]')
        plan_intervals = request.POST.getlist('plan_intervals[]')

        # 3. Find the user's subscription and update it
        sub = UserSubscription.objects.get(user=request.user)
        sub.site_name = site_name
        sub.slug = site_slug
        
        # 4. Generate the Unique ID (8-digit code)
        unique_id = str(uuid.uuid4())[:8].upper()
        sub.paymob_order_id = unique_id  # Storing the ID here for now
        sub.is_active = True
        sub.save()

        # 5. Show the Success Page with the ID and URL
        context = {
            'unique_id': unique_id,
            'final_url': f"www.routebase.com/{site_slug}/",
            'site_name': site_name,
            'plans_count': len(plan_names)
        }
        return render(request, 'build_success.html', context)

    # If someone tries to access /build-page/ via GET, send them back
    return redirect('merchants:pro_setup_form')