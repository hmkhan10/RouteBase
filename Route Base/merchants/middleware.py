import re
import logging
from urllib.parse import urlparse
from django.http import HttpResponseForbidden, JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)

class WAFMiddleware:
    """
    Deep Level Security: Web Application Firewall Middleware
    Blocks requests containing common SQL Injection and XSS patterns.
    """
    
    SQL_PATTERNS = [
        r"(\%27)|(\')|(\-\-)|(\%23)|(#)",  # Common SQLi chars
        r"((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))", # SQL meta-chars
        r"\w*((\%27)|(\'))(\s|\%20)*((\%6F)|o|(\%4F))((\%72)|r|(\%52))", # ' OR '
        r"exec(\s|\+)+(s|x)p\w+", # Exec sp_
    ]
    
    XSS_PATTERNS = [
        r"<script>(.*?)</script>",
        r"javascript:",
        r"onerror=",
        r"onload=",
    ]

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check GET params
        for key, value in request.GET.items():
            if self._is_malicious(value):
                return HttpResponseForbidden("Security Block: Malicious Payload Detected")

        # Check POST data (if not file upload)
        if request.content_type != 'multipart/form-data':
            for key, value in request.POST.items():
                if self._is_malicious(str(value)):
                    return HttpResponseForbidden("Security Block: Malicious Payload Detected")

        response = self.get_response(request)
        return response

    def _is_malicious(self, text):
        # Check SQLi
        for pattern in self.SQL_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        # Check XSS
        for pattern in self.XSS_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False


class DomainBindingMiddleware(MiddlewareMixin):
    """
    Middleware that verifies the Origin header matches the merchant's verified domain
    from the OTP verification step. Prevents unauthorized API access.
    """
    
    def process_request(self, request):
        # Skip domain binding for health checks and admin routes
        if self.should_skip_domain_check(request):
            return None
            
        # Get Origin header from request
        origin = request.META.get('HTTP_ORIGIN')
        referer = request.META.get('HTTP_REFERER')
        
        # Extract merchant ID from request (from JWT token or API key)
        merchant_id = self.extract_merchant_id(request)
        
        if not merchant_id:
            logger.warning("No merchant ID found in request")
            return JsonResponse({
                'error': 'Authentication required',
                'code': 'AUTH_REQUIRED'
            }, status=401)
        
        # Get verified domains for this merchant from database
        verified_domains = self.get_verified_domains(merchant_id)
        
        if not verified_domains:
            logger.error(f"No verified domains found for merchant {merchant_id}")
            return JsonResponse({
                'error': 'Merchant not verified',
                'code': 'MERCHANT_NOT_VERIFIED'
            }, status=403)
        
        # Validate origin or referer against verified domains
        if not self.validate_request_origin(origin, referer, verified_domains):
            logger.warning(f"Invalid origin for merchant {merchant_id}: {origin}")
            return JsonResponse({
                'error': 'Domain validation failed',
                'code': 'INVALID_ORIGIN',
                'message': 'Request must originate from verified domain'
            }, status=403)
        
        # Store verified domain info for downstream processing
        request.verified_domain = self.get_matching_domain(origin, referer, verified_domains)
        request.merchant_id = merchant_id
        
        return None
    
    def should_skip_domain_check(self, request):
        """Skip domain binding for certain routes"""
        skip_paths = [
            '/admin/',
            '/health/',
            '/api/auth/',
            '/api/webhooks/',
            '/api/mcp/',
            '/api/merchant/verify-domain/',
        ]
        
        return any(request.path.startswith(path) for path in skip_paths)
    
    def extract_merchant_id(self, request):
        """Extract merchant ID from JWT token or API key"""
        # Try to get from Authorization header (JWT)
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if auth_header and auth_header.startswith('Bearer '):
            try:
                # In production, decode JWT token here
                # For now, simulate extraction
                token = auth_header.split(' ')[1]
                if token.startswith('merchant_'):
                    return token
            except Exception as e:
                logger.error(f"JWT decode error: {e}")
        
        # Try to get from API key header
        api_key = request.META.get('HTTP_X_API_KEY')
        if api_key:
            try:
                # In production, validate API key against database
                if api_key.startswith('rbk_'):
                    return self.get_merchant_from_api_key(api_key)
            except Exception as e:
                logger.error(f"API key validation error: {e}")
        
        return None
    
    def get_verified_domains(self, merchant_id):
        """Get verified domains for merchant from database"""
        try:
            from merchants.models import Merchant, VerifiedDomain
            merchant = Merchant.objects.get(id=merchant_id)
            return list(merchant.verified_domains.values_list('domain', flat=True))
        except Merchant.DoesNotExist:
            logger.error(f"Merchant {merchant_id} not found")
            return []
        except Exception as e:
            logger.error(f"Database error: {e}")
            return []
    
    def validate_request_origin(self, origin, referer, verified_domains):
        """Validate that origin or referer matches verified domains"""
        if not origin and not referer:
            return False
        
        # Check origin first
        if origin:
            origin_domain = urlparse(origin).netloc
            if self.domain_matches(origin_domain, verified_domains):
                return True
        
        # Fall back to referer
        if referer:
            referer_domain = urlparse(referer).netloc
            if self.domain_matches(referer_domain, verified_domains):
                return True
        
        return False
    
    def domain_matches(self, request_domain, verified_domains):
        """Check if request domain matches any verified domain"""
        request_domain = request_domain.lower()
        
        for verified_domain in verified_domains:
            verified_domain = verified_domain.lower()
            
            # Exact match
            if request_domain == verified_domain:
                return True
            
            # Wildcard subdomain matching
            if verified_domain.startswith('*.'):
                base_domain = verified_domain[2:]
                if request_domain.endswith(base_domain) or request_domain == base_domain:
                    return True
            
            # Check if request domain is a subdomain of verified domain
            if request_domain.endswith('.' + verified_domain):
                return True
        
        return False
    
    def get_matching_domain(self, origin, referer, verified_domains):
        """Get the specific verified domain that matches the request"""
        domains_to_check = []
        if origin:
            domains_to_check.append(urlparse(origin).netloc)
        if referer:
            domains_to_check.append(urlparse(referer).netloc)
        
        for request_domain in domains_to_check:
            for verified_domain in verified_domains:
                if self.domain_matches(request_domain, [verified_domain]):
                    return verified_domain
        
        return verified_domains[0] if verified_domains else None
    
    def get_merchant_from_api_key(self, api_key):
        """Get merchant ID from API key"""
        try:
            from merchants.models import APIKey
            key_obj = APIKey.objects.get(key=api_key, is_active=True)
            return key_obj.merchant.id
        except APIKey.DoesNotExist:
            return None


class SentinelAgentMiddleware(MiddlewareMixin):
    """
    Sentinel Agent monitors transaction patterns for fraud detection
    Automatically flags suspicious activity and notifies merchants
    """
    
    def process_request(self, request):
        # Only monitor payment-related requests
        if not self.is_payment_request(request):
            return None
        
        # Extract client information
        client_ip = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Check for suspicious patterns
        suspicious_activity = self.detect_suspicious_activity(client_ip, user_agent, request)
        
        if suspicious_activity:
            self.handle_suspicious_activity(suspicious_activity, request)
        
        return None
    
    def is_payment_request(self, request):
        """Check if this is a payment-related request"""
        payment_paths = [
            '/api/payments/',
            '/api/transactions/',
            '/api/checkout/',
        ]
        return any(request.path.startswith(path) for path in payment_paths)
    
    def get_client_ip(self, request):
        """Extract real client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        
        x_real_ip = request.META.get('HTTP_X_REAL_IP')
        if x_real_ip:
            return x_real_ip
        
        return request.META.get('REMOTE_ADDR')
    
    def detect_suspicious_activity(self, client_ip, user_agent, request):
        """Detect various types of suspicious activity"""
        suspicious_patterns = []
        
        # 1. Card Testing Attack Detection
        try:
            from merchants.models import Transaction
            recent_transactions = Transaction.objects.filter(
                ip_address=client_ip,
                created_at__gte=timezone.now() - timedelta(minutes=15)
            )
            
            if recent_transactions.count() > 10:
                suspicious_patterns.append({
                    'type': 'card_testing',
                    'severity': 'high',
                    'description': f'High frequency transactions from {client_ip}',
                    'count': recent_transactions.count(),
                    'timeframe': '15 minutes'
                })
        except:
            pass  # Handle gracefully if models don't exist yet
        
        # 2. Failed Payment Attempts
        try:
            failed_attempts = Transaction.objects.filter(
                ip_address=client_ip,
                status='failed',
                created_at__gte=timezone.now() - timedelta(hours=1)
            )
            
            if failed_attempts.count() > 5:
                suspicious_patterns.append({
                    'type': 'failed_payment_attempts',
                    'severity': 'medium',
                    'description': f'Multiple failed payment attempts from {client_ip}',
                    'count': failed_attempts.count(),
                    'timeframe': '1 hour'
                })
        except:
            pass
        
        # 3. Suspicious User Agent Patterns
        if self.is_suspicious_user_agent(user_agent):
            suspicious_patterns.append({
                'type': 'suspicious_user_agent',
                'severity': 'low',
                'description': f'Suspicious user agent detected: {user_agent[:100]}',
                'user_agent': user_agent
            })
        
        return suspicious_patterns if suspicious_patterns else None
    
    def is_suspicious_user_agent(self, user_agent):
        """Detect suspicious user agent patterns"""
        suspicious_patterns = [
            r'bot',
            r'crawler',
            r'scraper',
            r'curl',
            r'wget',
            r'python-requests',
            r'postman',
            r'insomnia'
        ]
        
        user_agent_lower = user_agent.lower()
        return any(re.search(pattern, user_agent_lower) for pattern in suspicious_patterns)
    
    def handle_suspicious_activity(self, suspicious_activity, request):
        """Handle detected suspicious activity"""
        client_ip = self.get_client_ip(request)
        merchant_id = getattr(request, 'merchant_id', None)
        
        # Log suspicious activity
        for activity in suspicious_activity:
            try:
                from merchants.models import SuspiciousActivity
                SuspiciousActivity.objects.create(
                    merchant_id=merchant_id,
                    ip_address=client_ip,
                    activity_type=activity['type'],
                    severity=activity['severity'],
                    description=activity['description'],
                    metadata=activity,
                    created_at=timezone.now()
                )
            except:
                pass  # Handle gracefully if models don't exist yet
        
        # Auto-flag IP for high severity activities
        high_severity = any(a['severity'] == 'high' for a in suspicious_activity)
        if high_severity:
            self.flag_ip_address(client_ip, suspicious_activity)
        
        # Notify merchant
        if merchant_id:
            self.notify_merchant(merchant_id, suspicious_activity)
        
        logger.warning(f"Suspicious activity detected from {client_ip}: {suspicious_activity}")
    
    def flag_ip_address(self, ip_address, suspicious_activity):
        """Flag IP address for automatic blocking"""
        try:
            from merchants.models import FlaggedIP
            FlaggedIP.objects.update_or_create(
                ip_address=ip_address,
                defaults={
                    'is_flagged': True,
                    'flag_reason': suspicious_activity[0]['description'],
                    'flagged_at': timezone.now(),
                    'auto_block': True
                }
            )
        except:
            pass
    
    def notify_merchant(self, merchant_id, suspicious_activity):
        """Notify merchant of suspicious activity"""
        try:
            from merchants.models import Merchant, MerchantNotification
            merchant = Merchant.objects.get(id=merchant_id)
            
            # Store notification in database
            MerchantNotification.objects.create(
                merchant=merchant,
                notification_type='security_alert',
                title='Suspicious Activity Detected',
                message=f"We detected suspicious activity on your account. Please review your security settings.",
                metadata=suspicious_activity,
                is_read=False
            )
            
            logger.info(f"Merchant notification sent to {merchant.email}: {suspicious_activity}")
            
        except:
            logger.error(f"Cannot notify merchant {merchant_id}: not found")
