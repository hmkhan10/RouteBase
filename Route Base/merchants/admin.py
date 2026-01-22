from django.contrib import admin
from .models import UserSubscription, Merchant
from django.db.models import Sum

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'platform_fee', 'status', 'created_at')

    # This adds a "Total Profit" box at the bottom of the page
    def changelist_view(self, request, extra_context=None):
        result = Transaction.objects.aggregate(
            total_revenue=Sum('amount'),
            total_profit=Sum('platform_fee')
        )
        extra_context = extra_context or {}
        extra_context['revenue'] = result['total_revenue']
        extra_context['profit'] = result['total_profit']
        return super().changelist_view(request, extra_context=extra_context)
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