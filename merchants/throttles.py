from rest_framework.throttling import AnonRateThrottle

class BurstRateThrottle(AnonRateThrottle):
    """
    Deep Level Security: Burst Rate Throttle
    Enforces strict short-term limits (e.g. 10/minute) to prevent rapid-fire attacks.
    """
    scope = 'burst'
