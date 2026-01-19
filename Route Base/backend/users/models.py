from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

class Subscription(models.Model):
    PLAN_CHOICES = [
        ('FREE', 'Free'),
        ('PRO', 'Pro'),
    ]
    USER_TYPE_CHOICES = [
        ('MERCHANT', 'Merchant'),
        ('SAAS', 'SaaS'),
        ('CUSTOMER', 'Customer'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user_subscription')
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='FREE')
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='CUSTOMER')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expiry_date = models.DateTimeField(null=True, blank=True)

    def activate_pro(self):
        self.plan = 'PRO'
        self.is_active = True
        self.expiry_date = timezone.now() + timedelta(days=30)
        self.save()

    def __str__(self):
        return f"{self.user.username} - {self.plan}"
