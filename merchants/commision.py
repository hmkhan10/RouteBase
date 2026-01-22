from django.conf import settings
from django.db import transaction as db_transaction
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import logging

from merchants.models import Transaction, CommissionLedger, Withdrawal 

logger = logging.getLogger(__name__)

class CommissionService:
    
    
    def __init__(self):
        try:
            self.commission_rate = Decimal(str(settings.PLATFORM_COMMISSION))
        except AttributeError:
            logger.error("PLATFORM_COMMISSION setting is missing or invalid.")
            self.commission_rate = Decimal('0.03') 
            
    
    def aggregate_daily_commission(self, target_date=None):
        
        
        if target_date is None:
            target_date = (timezone.now() - timedelta(days=1)).date()
            
        start_of_day = timezone.make_aware(timezone.datetime.combine(target_date, timezone.datetime.min.time()))
        end_of_day = timezone.make_aware(timezone.datetime.combine(target_date, timezone.datetime.max.time()))

        logger.info(f"Starting commission aggregation for date: {target_date}")

        try:
            with db_transaction.atomic():
                
                transaction_stats = Transaction.objects.filter(
                    completed_at__range=[start_of_day, end_of_day],
                    status='completed'
                ).aggregate(
                    total_volume=Sum('amount'),
                    total_commission_collected=Sum('platform_fee'),
                    total_transactions=Count('transaction_id')
                )

                volume = transaction_stats.get('total_volume') or Decimal('0.00')
                commission_collected = transaction_stats.get('total_commission_collected') or Decimal('0.00')
                total_transactions = transaction_stats.get('total_transactions') or 0
                
                
                ledger, created = CommissionLedger.objects.get_or_create(
                    date=target_date,
                    defaults={
                        'total_volume': volume,
                        'total_commission_collected': commission_collected,
                        'total_transactions': total_transactions,
                    }
                )

                if not created:
                    
                    ledger.total_volume = volume
                    ledger.total_commission_collected = commission_collected
                    ledger.total_transactions = total_transactions
                    ledger.save()
                    logger.warning(f"Ledger for {target_date} was updated (re-aggregated).")

            logger.info(f"Successfully aggregated commission for {target_date}: Volume={volume}, Commission={commission_collected}")
            return {'success': True, 'ledger': ledger}

        except Exception as e:
            logger.critical(f"FATAL ERROR during daily commission aggregation for {target_date}: {e}", exc_info=True)
            return {'success': False, 'error': str(e)}

    

    def process_commission_withdrawal(self, withdrawal_obj, bank_details):
        
        from merchants.payment_service import PaymentService 
        
        try:
            
            ledger = CommissionLedger.objects.get(date=withdrawal_obj.created_at.date())
            
            if withdrawal_obj.amount > ledger.available_to_withdraw():
                 raise Exception("Insufficient commission balance in ledger for withdrawal.")

            with db_transaction.atomic():
                ledger.total_withdrawn += withdrawal_obj.amount
                ledger.save()
                
                payment_service = PaymentService() 
                result = payment_service.jazzcash.withdraw_to_bank(
                    amount=withdrawal_obj.amount,
                    bank_details=bank_details
                )
                
                if result['success']:
                    withdrawal_obj.mark_completed(result['response']['pp_TxnRefNo'])
                    return {'success': True, 'message': 'Withdrawal completed.'}
                else:
                    raise Exception(f"Gateway failed: {result.get('error', 'Unknown failure')}")

        except CommissionLedger.DoesNotExist:
             withdrawal_obj.status_message = "Error: Cannot find corresponding commission ledger."
             withdrawal_obj.status = 'failed'
             withdrawal_obj.save()
             return {'success': False, 'error': "Commission ledger not found."}
        
        except Exception as e:
            if 'ledger' in locals():
                ledger.total_withdrawn -= withdrawal_obj.amount
                ledger.save()
                logger.warning(f"Reverted ledger entry for withdrawal {withdrawal_obj.reference_id}.")

            withdrawal_obj.status_message = f"Gateway/Internal error: {str(e)}"
            withdrawal_obj.status = 'failed'
            withdrawal_obj.save()
            return {'success': False, 'error': f"Processing failed: {str(e)}"}