from decimal import Decimal, ROUND_HALF_UP
from django.conf import settings
from django.db import transaction as db_transaction
from merchants.services.sadapay import SadaPayPayment
import logging
import uuid

logger = logging.getLogger(__name__)

class PaymentService:
     
    def __init__(self):
        self.sadapay = SadaPayPayment()
        try:
            self.commission_rate = Decimal(str(settings.PLATFORM_COMMISSION))
        except AttributeError:
            self.commission_rate = Decimal('0.03') 
     
    def initiate_payment(self, amount, seller, buyer_info, payment_method='jazzcash'):
        
        from merchants.models import Transaction, Seller
        from django.utils import timezone
         
        try:
            
            order_id = f"PF{timezone.now().strftime('%y%m%d%H%M%S')}{str(uuid.uuid4())[:8].upper()}"
            transaction_id = uuid.uuid4()
             
            total_amount = Decimal(str(amount)).quantize(Decimal('0.01'))
            commission = (total_amount * self.commission_rate).quantize(Decimal('0.01'))
            seller_amount = (total_amount - commission).quantize(Decimal('0.01'))
             
            transaction = Transaction.objects.create(
                transaction_id=transaction_id,
                reference_id=order_id,
                seller=seller,
                buyer_phone=buyer_info.get('phone', ''),
                buyer_cnic=buyer_info.get('cnic', ''),
                buyer_email=buyer_info.get('email', ''),
                amount=total_amount,
                platform_fee=commission,
                seller_amount=seller_amount,
                payment_method=payment_method,
                status='pending'
            )
             
            payment_data = self.sadapay.create_payment_request(
                amount=total_amount,
                order_id=order_id,
                customer_phone=buyer_info.get('phone', ''),
                customer_email=buyer_info.get('email', ''),
                description=f"Payment to {seller.user.username}"
            )
             
            if payment_data['success']:
                transaction.status = 'processing'
                transaction.save()
                 
                return {
                    'success': True,
                    'transaction': transaction,
                    'payment_data': payment_data,
                    'message': 'Payment initiated successfully'
                }
            else:
                transaction.status = 'failed'
                transaction.status_message = payment_data.get('error', 'Payment initiation failed')
                transaction.save()
                 
                return {
                    'success': False,
                    'error': payment_data.get('error', 'Payment initiation failed'),
                    'transaction': transaction
                }
                 
        except Exception as e:
            logger.error(f"Error initiating payment: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': f'Payment initiation error: {str(e)}'
            }
     
    def handle_payment_callback(self, request_data):
        
        from merchants.models import Transaction
         
        try:
            verification = self.sadapay.verify_payment_callback(request_data)
             
            if not verification['success']:
                logger.error(f"Payment verification failed: {verification.get('error')}")
                return verification
             
            order_id = verification['order_id']
             
            with db_transaction.atomic():
                transaction = Transaction.objects.select_for_update().get(reference_id=order_id)
                 
                if transaction.status == 'completed':
                    logger.warning(f"Transaction {order_id} already completed (Idempotency check passed).")
                    return {
                        'success': True,
                        'message': 'Transaction already completed',
                        'transaction': transaction
                    }
                 
                transaction.mark_completed(
                    gateway_txn_id=verification.get('gateway_txn_id', ''),
                    response_data=verification.get('raw_data', {})
                )
                 
                logger.info(f"Transaction {order_id} completed successfully and seller balance updated.")
                 
                return {
                    'success': True,
                    'transaction': transaction,
                    'message': 'Payment completed successfully'
                }
                 
        except Transaction.DoesNotExist:
            logger.error(f"Transaction not found during callback: {order_id}")
            return {
                'success': False,
                'error': 'Transaction not found or mismatch'
            }
        except Exception as e:
            logger.error(f"Error handling payment callback: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': f'Callback handling error: {str(e)}'
            }