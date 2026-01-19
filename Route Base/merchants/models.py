from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid
from django.utils.text import slugify
from django.db.models import JSONField  # Native Django JSONField
from decimal import Decimal
from datetime import timedelta
from django.conf import settings
class MerchantPage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    admin_name = models.CharField(max_length=100)
    admin_mobile = models.CharField(max_length=15)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=False)
    slug = models.SlugField(unique=True, max_length=150, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.admin_name)
            self.slug = base_slug
            if MerchantPage.objects.filter(slug=self.slug).exists():
                self.slug = f"{base_slug}-{uuid.uuid4().hex[:4]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.admin_name


class Merchant(models.Model):
    """Merchant model for RouteBase multi-tenant platform"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='merchant_profile'
    )
    slug = models.SlugField(unique=True, max_length=150, db_index=True)
    store_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.store_name)
            self.slug = base_slug
            # Ensure uniqueness
            if Merchant.objects.filter(slug=self.slug).exists():
                self.slug = f"{base_slug}-{uuid.uuid4().hex[:4]}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.store_name} ({self.slug})"


class LoginHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField() 
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

class Branch(models.Model):
    TAG_COLORS = [
        ('blue', 'Blue (Dev/Corporate)'),
        ('red', 'Red (HR/High Priority)'),
    ]

    name = models.CharField(max_length=255)
    unique_id = models.CharField(max_length=8, unique=True, editable=False) # RB-XXXX
    is_main_branch = models.BooleanField(default=False)
    
    tag = models.CharField(max_length=50, help_text="HR, DEV, etc.")
    tag_color = models.CharField(max_length=10, choices=TAG_COLORS, default='blue')
    icon = models.CharField(max_length=50, default='fa-bolt') # For the Tap-to-Icon feature
    
    parent_branch = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='sub_branches'
    )
    
    is_private = models.BooleanField(default=False)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_branches')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.unique_id:
            self.unique_id = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.unique_id})"
class APIKey(models.Model):
    PROVIDER_CHOICES = [
        ('openai', 'OpenAI (ChatGPT)'),
        ('xai', 'xAI (Grok)'),
        ('google', 'Google Gemini'),
        ('deepseek', 'DeepSeek'),
        ('qwen', 'Qwen'),
        ('ollama', 'Ollama (Local)'),
        ('huggingface', 'Hugging Face'),
        ('whatsapp', 'WhatsApp Business'),
        ('twitter', 'X (Twitter)'),
        ('google_workspace', 'Google Workspace'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES)
    name = models.CharField(max_length=100, default="Default Key")
    key = models.CharField(max_length=500)  # Store encrypted at application level
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'provider')

    def __str__(self):
        return f"{self.user.username} - {self.get_provider_display()}"

class Workflow(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    graph_json = JSONField() 
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} by {self.user.username}"

class WorkflowRun(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    input_data = JSONField(null=True, blank=True)
    output_data = JSONField(null=True, blank=True)
    logs = JSONField(default=list)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
class FireGroup(models.Model):
    name = models.CharField(max_length=100)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='groups')
    purpose = models.CharField(max_length=255)
    leader = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='led_groups')
    is_private = models.BooleanField(default=False) 
    
    def __str__(self):
        return f"{self.name} - {self.branch.name}"

class Staff(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True)
    group = models.ForeignKey(FireGroup, on_delete=models.SET_NULL, null=True, related_name='members')
    role = models.CharField(max_length=100, default='Member')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"
class FinanceAccessRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
class CodeSnippet(models.Model):
    title = models.CharField(max_length=255)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='codebase')
    language = models.CharField(max_length=50) 
    content = models.TextField() 
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    version = models.IntegerField(default=1)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Company Code Library"

class FinanceGate(models.Model):
    owner = models.OneToOneField(User, on_delete=models.CASCADE)
    is_public_access = models.BooleanField(default=False)
    pending_approvals = models.ManyToManyField(User, related_name='finance_requests', blank=True)
    authorized_managers = models.ManyToManyField(User, related_name='authorized_finance', blank=True)

    class Meta:
        verbose_name = "Finance Control Center"
class CodeLibrary(models.Model):
    LANGUAGES = [
        ('python', 'Python'),
        ('javascript', 'JavaScript'),
        ('html', 'HTML/CSS'),
        ('sql', 'SQL'),
    ]

    title = models.CharField(max_length=200)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    language = models.CharField(max_length=20, choices=LANGUAGES)
    content = models.TextField() # The actual code
    commit_message = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = "Code Library Commits"
class Seller(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='seller_profile')
    
    phone = models.CharField(max_length=15, unique=True, db_index=True)
    cnic = models.CharField(max_length=13, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True)
    
    jazzcash_number = models.CharField(max_length=15)
    easypaisa_number = models.CharField(max_length=15, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    bank_account = models.CharField(max_length=50, blank=True)
    
    page_slug = models.SlugField(max_length=50, unique=True, db_index=True)
    page_title = models.CharField(max_length=100, default="My Shop")
    page_color = models.CharField(max_length=7, default="#007bff")
    page_logo = models.ImageField(upload_to='logos/', null=True, blank=True)
    welcome_message = models.TextField(blank=True)
    
    require_phone = models.BooleanField(default=True)
    require_cnic = models.BooleanField(default=False)
    show_seller_info = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_earned = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    platform_fees_paid = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['phone']),
            models.Index(fields=['page_slug']),
            models.Index(fields=['is_active', 'is_verified']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.phone}"
    
    @property
    def page_url(self):
        return f"/p/{self.page_slug}/"
    
    def update_balance(self, amount):
        from django.db import transaction
        with transaction.atomic():
            self.balance += Decimal(str(amount))
            self.save(update_fields=['balance', 'updated_at'])

class Transaction(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_METHODS = [
        ('sadapay', 'SADAPAY'),
        ('jazzcash', 'JazzCash'),
        ('easypaisa', 'EasyPaisa'),
        ('bank', 'Bank Transfer'),
    ]
    
    transaction_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    reference_id = models.CharField(max_length=50, unique=True, db_index=True)
    
    seller = models.ForeignKey(Seller, on_delete=models.PROTECT, related_name='transactions')
    buyer_phone = models.CharField(max_length=15)
    buyer_cnic = models.CharField(max_length=13, blank=True)
    buyer_email = models.EmailField(blank=True)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2)
    seller_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='PKR')
    
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    gateway_txn_id = models.CharField(max_length=255, blank=True, db_index=True)
    gateway_response = models.JSONField(default=dict, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    status_message = models.TextField(blank=True)
    
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    page_type = models.CharField(max_length=20, default='custom')
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['seller', 'status']),
            models.Index(fields=['created_at', 'status']),
            models.Index(fields=['gateway_txn_id']),
        ]
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'
    
    def __str__(self):
        return f"{self.reference_id} - PKR {self.amount}"
    
    def mark_completed(self, gateway_txn_id='', response_data=None):
        from django.db import transaction
        with transaction.atomic():
            self.status = 'completed'
            self.completed_at = timezone.now()
            self.gateway_txn_id = gateway_txn_id
            if response_data:
                self.gateway_response = response_data
            self.save()
            
            self.seller.update_balance(self.seller_amount)
            self.seller.total_earned += self.amount
            self.seller.platform_fees_paid += self.platform_fee
            self.seller.save()

class CommissionLedger(models.Model):
    date = models.DateField(unique=True, db_index=True)
    total_transactions = models.IntegerField(default=0)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_commission = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    sadapay_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    withdrawn = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
        verbose_name = 'Commission Ledger'
        verbose_name_plural = 'Commission Ledger'
    
    def __str__(self):
        return f"Commission for {self.date}"
    
    @property
    def available_to_withdraw(self):
        return self.jazzcash_balance - self.withdrawn

class Withdrawal(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    METHOD_CHOICES = [
        ('jazzcash', 'JazzCash Wallet'),
        ('bank', 'Bank Transfer'),
        ('easypaisa', 'EasyPaisa'),
    ]
    
    reference_id = models.CharField(max_length=50, unique=True, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    recipient_number = models.CharField(max_length=20, blank=True)
    recipient_name = models.CharField(max_length=100, blank=True)
    recipient_bank = models.CharField(max_length=100, blank=True)
    recipient_account = models.CharField(max_length=50, blank=True)
    
    gateway_response = models.JSONField(default=dict, blank=True)
    gateway_txn_id = models.CharField(max_length=100, blank=True)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Withdrawal'
        verbose_name_plural = 'Withdrawals'
    
    def __str__(self):
        return f"{self.reference_id} - PKR {self.amount}"
    
    def mark_completed(self, gateway_txn_id='', response_data=None):
        from django.db import transaction
        with transaction.atomic():
            self.status = 'completed'
            self.completed_at = timezone.now()
            self.gateway_txn_id = gateway_txn_id
            if response_data:
                self.gateway_response = response_data
            self.save()
            
            ledger = CommissionLedger.objects.get(date=self.created_at.date())
            ledger.withdrawn += self.amount
            ledger.save()

class PageView(models.Model):
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE, related_name='page_views')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    referrer = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['seller', 'created_at']),
        ]
class WebOwner(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    website_name = models.CharField(max_length=255)
    website_url = models.URLField()
    payout_account_num = models.CharField(max_length=20)
    payout_cvc = models.CharField(max_length=4)
    payout_expiry = models.CharField(max_length=7)
    owner_phone = models.CharField(max_length=20)
    owner_display_name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    trial_started_at = models.DateTimeField(null=True, blank=True)
    subscription_expiry = models.DateTimeField(null=True, blank=True)

    @property
    def has_active_access(self):
        now = timezone.now()
        
        if self.subscription_expiry and self.subscription_expiry > now:
            return True
            
        if self.trial_started_at:
            trial_expiry = self.trial_started_at + timedelta(days=14)
            if now < trial_expiry:
                return True
                
        return False
    
class CorporateUplink(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    corp_name = models.CharField(max_length=255)
    api_endpoint = models.URLField()
    # Encrypt this in a real production app!
    api_key = models.CharField(max_length=500) 
    last_sync = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return f"Uplink: {self.corp_name}"
    
class Corporation(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    unique_node_id = models.CharField(max_length=100, unique=True) # e.g., NODE-1
    total_valuation = models.DecimalField(max_digits=20, decimal_places=2, default=0)

class SoftwareAsset(models.Model):
    corporation = models.ForeignKey(Corporation, on_delete=models.CASCADE)
    asset_name = models.CharField(max_length=255)
    file_path = models.TextField()
    status = models.CharField(max_length=50, default='OFFLINE')
    detected_at = models.DateTimeField(auto_now=True)

class FinancialPulse(models.Model):
    corporation = models.ForeignKey(Corporation, on_delete=models.CASCADE)
    valuation = models.DecimalField(max_digits=20, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)
    source = models.CharField(max_length=50)

class LayoutTemplate(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True) # e.g., 'school-pro', 'business-glass'
    thumbnail = models.ImageField(upload_to='template_previews/')
    html_content = models.TextField() # The pre-built HTML structure
    config_json = models.JSONField(default=dict) # Default settings (colors, fonts)

    def __str__(self):
        return self.name
    
class SaaSPlan(models.Model):
    """Defines the available subscription tiers (Basic vs Pro)"""
    name = models.CharField(max_length=100) # e.g., "SaaS Pro"
    slug = models.SlugField(unique=True)     # e.g., "saas-pro"
    price_pkr = models.DecimalField(max_digits=10, decimal_places=2) # 300.00 or 4500.00
    
    # Feature Gating: Booleans to check what a user can access
    has_spa_routing = models.BooleanField(default=False)  # True for Pro
    has_advanced_analytics = models.BooleanField(default=False)
    has_custom_branding = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.name} - {self.price_pkr} PKR"

class UserSubscription(models.Model):
    """Tracks which user has which plan and when it expires"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    plan = models.CharField(max_length=20, default='FREE')
    site_name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    # Status tracking
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    
    # Paymob Marketplace fields for "Silent" tracking
    paymob_order_id = models.CharField(max_length=100, null=True, blank=True)
    paymob_transaction_id = models.CharField(max_length=100, null=True, blank=True)

    def activate(self):
        """Helper to extend subscription by 30 days upon successful payment"""
        self.is_active = True
        self.expiry_date = timezone.now() + timedelta(days=30)
        self.save()

    @property
    def is_expired(self):
        if self.expiry_date and timezone.now() > self.expiry_date:
            return True
        return False
    def save(self, *args, **kwargs):
        if not self.slug:
            # Create a slug from the username if site_name is empty
            base_slug = self.site_name if self.site_name else self.user.username
            self.slug = slugify(base_slug)
        super().save(*args, **kwargs)
    def __str__(self):
        return f"{self.user.username} - {self.plan} ({self.slug})"
class CustomerPage(models.Model):
    """The actual website/page the user built on your platform"""
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pages')
    page_name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content_data = models.JSONField(default=dict) # Stores the builder configuration
    
    def is_pro_enabled(self):
        """Check if the owner has the 4,500 PKR plan active for this page"""
        sub = self.owner.UserSubscription
        return sub.is_active and not sub.is_expired and sub.plan.has_spa_routing

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    token = models.CharField(max_length=255, unique=True)
    saas_plan_id = models.CharField(max_length=50, null=True, blank=True) # e.g., "saas-pro"
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} - {self.user.username} - {self.status}"