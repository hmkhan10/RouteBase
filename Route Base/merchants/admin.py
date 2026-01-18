from django.contrib import admin
from .models import UserSubscription, Merchant

@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'slug', 'is_active', 'expiry_date')
    list_filter = ('plan', 'is_active')
    search_fields = ('user__username', 'slug')

@admin.register(Merchant)
class MerchantAdmin(admin.ModelAdmin):
    list_display = ('store_name', 'slug', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('store_name', 'slug', 'user__username')
    readonly_fields = ('created_at', 'updated_at')