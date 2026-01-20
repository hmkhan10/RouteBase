from ninja import Router, Schema
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from .models import CheckoutSession, Transaction, Product

router = Router()

class CheckoutSessionSchema(Schema):
    id: str
    merchant_id: int
    items: list
    total: float
    platform_fee: float
    gateway_fee: float
    merchant_payout: float
    currency: str = 'PKR'
    status: str = 'pending'
    created_at: str
    updated_at: str

class TransactionSchema(Schema):
    id: str
    checkout_session_id: str
    merchant_id: int
    amount: float
    platform_fee: float
    gateway_fee: float
    merchant_payout: float
    payment_method: str
    status: str
    created_at: str

class DashboardStatsSchema(Schema):
    total_revenue: float
    total_orders: int
    average_order_value: float
    platform_fee_total: float
    merchant_payout_total: float
    recent_transactions: list
    revenue_chart: list

@router.post("/checkout/session")
def create_checkout_session(request, payload: CheckoutSessionSchema):
    try:
        # Get merchant
        merchant = User.objects.get(id=payload.merchant_id)
        
        # Create checkout session
        checkout_session = CheckoutSession.objects.create(
            id=payload.id,
            merchant=merchant,
            items=payload.items,
            total=payload.total,
            platform_fee=payload.platform_fee,
            gateway_fee=payload.gateway_fee,
            merchant_payout=payload.merchant_payout,
            currency=payload.currency,
            status=payload.status
        )
        
        return {
            "success": True,
            "checkout_session": {
                "id": checkout_session.id,
                "total": float(checkout_session.total),
                "platform_fee": float(checkout_session.platform_fee),
                "gateway_fee": float(checkout_session.gateway_fee),
                "merchant_payout": float(checkout_session.merchant_payout),
                "currency": checkout_session.currency,
                "status": checkout_session.status,
                "checkout_url": f"/checkout/{checkout_session.id}"
            },
            "items": checkout_session.items
        }
    except User.DoesNotExist:
        return {"error": "Merchant not found"}, 404
    except Exception as e:
        return {"error": str(e)}, 500

@router.get("/checkout/session")
def get_checkout_sessions(request, session_id: str = None, merchant_id: int = None):
    try:
        if session_id:
            checkout_session = CheckoutSession.objects.get(id=session_id)
            return {
                "id": checkout_session.id,
                "merchant_id": checkout_session.merchant.id,
                "items": checkout_session.items,
                "total": float(checkout_session.total),
                "platform_fee": float(checkout_session.platform_fee),
                "gateway_fee": float(checkout_session.gateway_fee),
                "merchant_payout": float(checkout_session.merchant_payout),
                "currency": checkout_session.currency,
                "status": checkout_session.status,
                "created_at": checkout_session.created_at.isoformat(),
                "updated_at": checkout_session.updated_at.isoformat()
            }
        elif merchant_id:
            sessions = CheckoutSession.objects.filter(merchant_id=merchant_id)
            return [{
                "id": session.id,
                "total": float(session.total),
                "status": session.status,
                "created_at": session.created_at.isoformat()
            } for session in sessions]
        else:
            return {"error": "session_id or merchant_id required"}, 400
    except CheckoutSession.DoesNotExist:
        return {"error": "Checkout session not found"}, 404
    except Exception as e:
        return {"error": str(e)}, 500

@router.post("/transactions")
def create_transaction(request, payload: TransactionSchema):
    try:
        # Get checkout session and merchant
        checkout_session = CheckoutSession.objects.get(id=payload.checkout_session_id)
        merchant = User.objects.get(id=payload.merchant_id)
        
        # Create transaction
        transaction = Transaction.objects.create(
            id=payload.id,
            checkout_session=checkout_session,
            merchant=merchant,
            amount=payload.amount,
            platform_fee=payload.platform_fee,
            gateway_fee=payload.gateway_fee,
            merchant_payout=payload.merchant_payout,
            payment_method=payload.payment_method,
            status=payload.status
        )
        
        # Update checkout session status if transaction is completed
        if payload.status == 'completed':
            checkout_session.status = 'completed'
            checkout_session.save()
        
        return {
            "success": True,
            "transaction": {
                "id": transaction.id,
                "merchant_id": transaction.merchant.id,
                "checkout_session_id": transaction.checkout_session.id,
                "status": transaction.status,
                "payment_method": transaction.payment_method,
                "created_at": transaction.created_at.isoformat()
            },
            "dashboard_updated": True
        }
    except (CheckoutSession.DoesNotExist, User.DoesNotExist):
        return {"error": "Checkout session or merchant not found"}, 404
    except Exception as e:
        return {"error": str(e)}, 500

@router.get("/transactions")
def get_transactions(request, merchant_id: int, status: str = None, limit: int = 50):
    try:
        merchant = User.objects.get(id=merchant_id)
        transactions = Transaction.objects.filter(merchant=merchant)
        
        if status:
            transactions = transactions.filter(status=status)
        
        transactions = transactions.order_by('-created_at')[:limit]
        
        return [{
            "id": txn.id,
            "checkout_session_id": txn.checkout_session.id,
            "amount": float(txn.amount),
            "platform_fee": float(txn.platform_fee),
            "gateway_fee": float(txn.gateway_fee),
            "merchant_payout": float(txn.merchant_payout),
            "payment_method": txn.payment_method,
            "status": txn.status,
            "created_at": txn.created_at.isoformat(),
            "updated_at": txn.updated_at.isoformat()
        } for txn in transactions]
    except User.DoesNotExist:
        return {"error": "Merchant not found"}, 404
    except Exception as e:
        return {"error": str(e)}, 500

@router.get("/dashboard/stats")
def get_dashboard_stats(request, merchant_id: int, period: str = '30d'):
    try:
        merchant = User.objects.get(id=merchant_id)
        
        # Calculate date range based on period
        now = timezone.now()
        if period == '7d':
            start_date = now - timedelta(days=7)
        elif period == '30d':
            start_date = now - timedelta(days=30)
        elif period == '90d':
            start_date = now - timedelta(days=90)
        elif period == '1y':
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=30)
        
        # Get completed transactions for the period
        transactions = Transaction.objects.filter(
            merchant=merchant,
            status='completed',
            created_at__gte=start_date
        )
        
        # Calculate stats
        total_revenue = sum(txn.amount for txn in transactions)
        total_orders = transactions.count()
        platform_fee_total = sum(txn.platform_fee for txn in transactions)
        merchant_payout_total = sum(txn.merchant_payout for txn in transactions)
        average_order_value = total_revenue / total_orders if total_orders > 0 else 0
        
        # Get recent transactions
        recent_transactions = transactions.order_by('-created_at')[:5]
        recent_data = [{
            "id": txn.id,
            "amount": float(txn.amount),
            "status": txn.status,
            "created_at": txn.created_at.isoformat()
        } for txn in recent_transactions]
        
        # Generate revenue chart data (daily aggregation)
        revenue_chart = []
        current_date = start_date.date()
        end_date = now.date()
        
        while current_date <= end_date:
            day_transactions = transactions.filter(
                created_at__date=current_date
            )
            day_revenue = sum(txn.amount for txn in day_transactions)
            revenue_chart.append({
                "date": current_date.isoformat(),
                "revenue": float(day_revenue)
            })
            current_date += timedelta(days=1)
        
        return {
            "total_revenue": float(total_revenue),
            "total_orders": total_orders,
            "average_order_value": float(average_order_value),
            "platform_fee_total": float(platform_fee_total),
            "merchant_payout_total": float(merchant_payout_total),
            "recent_transactions": recent_data,
            "revenue_chart": revenue_chart
        }
    except User.DoesNotExist:
        return {"error": "Merchant not found"}, 404
    except Exception as e:
        return {"error": str(e)}, 500
