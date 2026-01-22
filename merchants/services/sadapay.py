import hashlib
import hmac
import base64
import requests
from datetime import datetime
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from urllib.parse import urlencode
import json
import logging

logger = logging.getLogger(__name__)

class SadaPayPayment:
    
    def __init__(self):
        self.merchant_id = settings.JAZZCASH_MERCHANT_ID
        self.password = settings.JAZZCASH_PASSWORD
        self.integrity_salt = settings.JAZZCASH_INTEGRITY_SALT
        self.return_url = settings.JAZZCASH_RETURN_URL
        
        
        if settings.JAZZCASH_SANDBOX:
            self.base_url = "https://sandbox.jazzcash.com.pk/ApplicationAPI/API"
            logger.info("Using JazzCash Sandbox")
        else:
            self.base_url = "https://payments.jazzcash.com.pk/ApplicationAPI/API"
            logger.info("Using JazzCash Production")
    
    def create_payment_request(self, amount, order_id, customer_phone, customer_email='', description=''):
        
        try:
            
            amount_paisas = int(Decimal(str(amount)) * 100)
            
            
            current_time = datetime.now().strftime('%Y%m%d%H%M%S')
            
            
            secure_hash = self._generate_secure_hash(amount_paisas, order_id, current_time)
            
            
            payload = {
                "pp_Version": "2.0",
                "pp_TxnType": "MWALLET",
                "pp_Language": "EN",
                "pp_MerchantID": self.merchant_id,
                "pp_Password": self.password,
                "pp_TxnRefNo": order_id,
                "pp_Amount": str(amount_paisas),
                "pp_TxnCurrency": "PKR",
                "pp_TxnDateTime": current_time,
                "pp_BillReference": "billref" + order_id[-10:],
                "pp_Description": description[:100] if description else "Payment via PayFast",
                "pp_TxnExpiryDateTime": (datetime.now() + timedelta(hours=24)).strftime('%Y%m%d%H%M%S'),
                "pp_ReturnURL": self.return_url,
                "pp_SecureHash": secure_hash,
                "ppmpf_1": customer_phone,
                "ppmpf_2": customer_email,
                "ppmpf_3": "",
                "ppmpf_4": "",
                "ppmpf_5": "",
            }
            
            logger.info(f"Created payment request for order {order_id}, amount: {amount}")
            
            return {
                'success': True,
                'redirect_url': f"{self.base_url}/Payment/DoTransaction",
                'method': 'POST',
                'data': payload,
                'order_id': order_id,
            }
            
        except Exception as e:
            logger.error(f"Error creating payment request: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _generate_secure_hash(self, amount, order_id, timestamp):
        try:
            
            data_string = (
                f"{self.integrity_salt}&"
                f"pp_Amount={amount}&"
                f"pp_BillReference=billref{order_id[-10:]}&"
                f"pp_Description=Payment&"
                f"pp_Language=EN&"
                f"pp_MerchantID={self.merchant_id}&"
                f"pp_Password={self.password}&"
                f"pp_ReturnURL={self.return_url}&"
                f"pp_TxnCurrency=PKR&"
                f"pp_TxnDateTime={timestamp}&"
                f"pp_TxnExpiryDateTime={timestamp}&"
                f"pp_TxnRefNo={order_id}&"
                f"pp_TxnType=MWALLET&"
                f"pp_Version=2.0"
            )
            
            
            hash_object = hashlib.sha256(data_string.encode('utf-8'))
            secure_hash = hash_object.hexdigest().upper()
            
            logger.debug(f"Generated hash for order {order_id}")
            return secure_hash
            
        except Exception as e:
            logger.error(f"Error generating secure hash: {str(e)}")
            raise
    
    def verify_payment_callback(self, request_data):
        """
        Verify JazzCash callback after payment
        """
        try:
            
            required_fields = ['pp_TxnRefNo', 'pp_Amount', 'pp_ResponseCode', 'pp_SecureHash']
            
            for field in required_fields:
                if field not in request_data:
                    logger.error(f"Missing field in callback: {field}")
                    return {
                        'success': False,
                        'error': f'Missing field: {field}',
                        'response_code': '999'
                    }
            
            order_id = request_data['pp_TxnRefNo']
            amount_paisas = request_data['pp_Amount']
            response_code = request_data['pp_ResponseCode']
            received_hash = request_data['pp_SecureHash']
            
            
            expected_hash = self._generate_callback_hash(request_data)
            
            if received_hash != expected_hash:
                logger.error(f"Hash mismatch for order {order_id}")
                logger.debug(f"Received: {received_hash}, Expected: {expected_hash}")
                return {
                    'success': False,
                    'error': 'Hash verification failed',
                    'response_code': '998'
                }
            
            
            if response_code == '000':
                
                amount_rupees = Decimal(amount_paisas) / 100
                
                logger.info(f"Payment successful for order {order_id}, amount: {amount_rupees}")
                
                return {
                    'success': True,
                    'order_id': order_id,
                    'amount': amount_rupees,
                    'response_code': response_code,
                    'response_message': request_data.get('pp_ResponseMessage', 'Payment Successful'),
                    'gateway_txn_id': request_data.get('pp_TxnRefNo', ''),
                    'raw_data': request_data
                }
            else:
                error_message = request_data.get('pp_ResponseMessage', 'Payment Failed')
                logger.warning(f"Payment failed for order {order_id}: {error_message}")
                
                return {
                    'success': False,
                    'order_id': order_id,
                    'error': error_message,
                    'response_code': response_code,
                    'raw_data': request_data
                }
                
        except Exception as e:
            logger.error(f"Error verifying payment callback: {str(e)}")
            return {
                'success': False,
                'error': f'Verification error: {str(e)}',
                'response_code': '999'
            }
    
    def _generate_callback_hash(self, response_data):
        
        try:
            
            data_to_hash = {k: v for k, v in response_data.items() if k != 'pp_SecureHash'}
            
            sorted_keys = sorted(data_to_hash.keys())
            
            
            hash_string = self.integrity_salt
            
            for key in sorted_keys:
                if data_to_hash[key]:  
                    hash_string += '&' + str(data_to_hash[key])
            
            
            hash_object = hashlib.sha256(hash_string.encode('utf-8'))
            secure_hash = hash_object.hexdigest().upper()
            
            return secure_hash
            
        except Exception as e:
            logger.error(f"Error generating callback hash: {str(e)}")
            raise
    
    def check_transaction_status(self, order_id):
        
        try:
            url = f"{self.base_url}/Payment/Inquiry"
            
            payload = {
                "pp_Version": "2.0",
                "pp_TxnType": "MWALLET",
                "pp_Language": "EN",
                "pp_MerchantID": self.merchant_id,
                "pp_Password": self.password,
                "pp_TxnRefNo": order_id,
            }
            
            response = requests.post(url, data=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Transaction status for {order_id}: {result.get('pp_ResponseMessage')}")
                return {
                    'success': True,
                    'data': result
                }
            else:
                logger.error(f"Status check failed for {order_id}: HTTP {response.status_code}")
                return {
                    'success': False,
                    'error': f'HTTP {response.status_code}',
                    'status_code': response.status_code
                }
                
        except requests.RequestException as e:
            logger.error(f"Network error checking status for {order_id}: {str(e)}")
            return {
                'success': False,
                'error': f'Network error: {str(e)}'
            }
    
    def payout_to_seller(self, amount, seller_jazzcash, description=""):
        
        try:
            
            url = f"{self.base_url}/Payment/DoP2P"
            
            payload = {
                "pp_Version": "2.0",
                "pp_TxnType": "MWALLET",
                "pp_Language": "EN",
                "pp_MerchantID": self.merchant_id,
                "pp_Password": self.password,
                "pp_TxnRefNo": f"P2P{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "pp_Amount": str(int(Decimal(str(amount)) * 100)),
                "pp_TxnCurrency": "PKR",
                "pp_TxnDateTime": datetime.now().strftime('%Y%m%d%H%M%S'),
                "pp_BillReference": "payout" + str(int(timezone.now().timestamp())),
                "pp_Description": description[:100] if description else "Payout from PayFast",
                "pp_TxnExpiryDateTime": datetime.now().strftime('%Y%m%d%H%M%S'),
                "pp_ReturnURL": self.return_url,
                "ppmpf_1": seller_jazzcash,
                "ppmpf_2": "",
                "ppmpf_3": "",
                "ppmpf_4": "",
                "ppmpf_5": "",
            }
            
            
            payout_hash = self._generate_secure_hash(
                int(Decimal(str(amount)) * 100),
                payload['pp_TxnRefNo'],
                payload['pp_TxnDateTime']
            )
            payload['pp_SecureHash'] = payout_hash
            
            response = requests.post(url, data=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('pp_ResponseCode') == '000':
                    logger.info(f"Payout successful to {seller_jazzcash}, amount: {amount}")
                    return {
                        'success': True,
                        'gateway_txn_id': result.get('pp_TxnRefNo'),
                        'response': result
                    }
                else:
                    logger.warning(f"Payout failed to {seller_jazzcash}: {result.get('pp_ResponseMessage')}")
                    return {
                        'success': False,
                        'error': result.get('pp_ResponseMessage', 'Payout failed'),
                        'response': result
                    }
            else:
                logger.error(f"Payout HTTP error: {response.status_code}")
                return {
                    'success': False,
                    'error': f'HTTP {response.status_code}'
                }
                
        except Exception as e:
            logger.error(f"Error in payout to seller: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def withdraw_to_bank(self, amount, bank_details):
        
        try:
            url = f"{self.base_url}/Payment/DoOTC"
            
            payload = {
                "pp_Version": "2.0",
                "pp_TxnType": "OTC",
                "pp_Language": "EN",
                "pp_MerchantID": self.merchant_id,
                "pp_Password": self.password,
                "pp_TxnRefNo": f"WDR{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "pp_Amount": str(int(Decimal(str(amount)) * 100)),
                "pp_TxnCurrency": "PKR",
                "pp_TxnDateTime": datetime.now().strftime('%Y%m%d%H%M%S'),
                "pp_BillReference": "withdraw" + str(int(timezone.now().timestamp())),
                "pp_Description": "Commission Withdrawal",
                "pp_BankID": bank_details.get('bank_id', ''),
                "pp_AccountNo": bank_details.get('account_number', ''),
                "pp_AccountTitle": bank_details.get('account_title', ''),
                "pp_CNIC": bank_details.get('cnic', ''),
                "pp_ContactNo": bank_details.get('phone', ''),
                "pp_Email": bank_details.get('email', ''),
            }
            
            response = requests.post(url, data=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('pp_ResponseCode') == '000':
                    logger.info(f"Bank withdrawal successful: {amount}")
                    return {
                        'success': True,
                        'gateway_txn_id': result.get('pp_TxnRefNo'),
                        'response': result
                    }
                else:
                    logger.warning(f"Bank withdrawal failed: {result.get('pp_ResponseMessage')}")
                    return {
                        'success': False,
                        'error': result.get('pp_ResponseMessage', 'Withdrawal failed'),
                        'response': result
                    }
            else:
                logger.error(f"Withdrawal HTTP error: {response.status_code}")
                return {
                    'success': False,
                    'error': f'HTTP {response.status_code}'
                }
                
        except Exception as e:
            logger.error(f"Error in bank withdrawal: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

class PaymentService:
    
    
    def __init__(self):
        self.jazzcash = SadaPayPayment()
        self.commission_rate = Decimal(str(settings.PLATFORM_COMMISSION))
    
    def initiate_payment(self, amount, seller, buyer_info, payment_method='jazzcash'):
        
        from merchants.models import Transaction
        from django.utils import timezone
        import uuid
        
        try:
            
            order_id = f"PF{timezone.now().strftime('%y%m%d%H%M%S')}{str(uuid.uuid4())[:8].upper()}"
            transaction_id = uuid.uuid4()
            
            
            total_amount = Decimal(str(amount))
            commission = total_amount * self.commission_rate
            seller_amount = total_amount - commission
            
            
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
            
            
            payment_data = self.jazzcash.create_payment_request(
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
            logger.error(f"Error initiating payment: {str(e)}")
            return {
                'success': False,
                'error': f'Payment initiation error: {str(e)}'
            }
    
    def handle_payment_callback(self, request_data):
        
        from merchants.models import Transaction
        from django.db import transaction as db_transaction
        
        try:
            
            verification = self.jazzcash.verify_payment_callback(request_data)
            
            if not verification['success']:
                logger.error(f"Payment verification failed: {verification.get('error')}")
                return verification
            
            order_id = verification['order_id']
            
            with db_transaction.atomic():
                
                transaction = Transaction.objects.select_for_update().get(reference_id=order_id)
                
                if transaction.status == 'completed':
                    logger.warning(f"Transaction {order_id} already completed")
                    return {
                        'success': True,
                        'message': 'Transaction already completed',
                        'transaction': transaction
                    }
                
                if verification['success']:
                    
                    transaction.mark_completed(
                        gateway_txn_id=verification.get('gateway_txn_id', ''),
                        response_data=verification.get('raw_data', {})
                    )
                    
                    logger.info(f"Transaction {order_id} completed successfully")
                    
                    
                    
                    return {
                        'success': True,
                        'transaction': transaction,
                        'message': 'Payment completed successfully'
                    }
                else:
                    
                    transaction.status = 'failed'
                    transaction.status_message = verification.get('error', 'Payment failed')
                    transaction.save()
                    
                    logger.warning(f"Transaction {order_id} failed: {verification.get('error')}")
                    
                    return {
                        'success': False,
                        'transaction': transaction,
                        'error': verification.get('error', 'Payment failed')
                    }
                    
        except Transaction.DoesNotExist:
            logger.error(f"Transaction not found: {order_id}")
            return {
                'success': False,
                'error': 'Transaction not found'
            }
        except Exception as e:
            logger.error(f"Error handling payment callback: {str(e)}")
            return {
                'success': False,
                'error': f'Callback handling error: {str(e)}'
            }