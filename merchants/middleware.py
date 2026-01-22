import re
from django.http import HttpResponseForbidden

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
