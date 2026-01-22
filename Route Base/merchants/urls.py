from django.urls import path
from django.contrib.auth import views as auth_views
from . import views
from . import api_views
from .views import receive_uplink_data
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
app_name = 'merchants' 

urlpatterns = [
    # API Endpoints for Frontend Integration
    path('api/health/', api_views.health_check, name='health_check'),
    path('api/hello/', api_views.hello_world, name='hello_world'),
    path('api/merchants/', api_views.merchant_list, name='merchant_list'),
    path('api/users/me/', api_views.current_user, name='current_user'),
    
    # Existing routes
    path('master-admin/', views.platform_master_dashboard, name='platform_admin'),
    path('', views.home_view, name='home'),
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('checkout/initiate/<str:plan_type>/', views.get_payment_step, name='get_payment_step'),
    path('subscribe/', views.subscription_selection_page, name='saas_plans'),
    path('saas_pay/', views.saas_pay, name='saas_pay'),
    path('host/<slug:site_slug>/', views.hoster_page_view, name='hoster_view'),
    path('hoster-setup-pro/', views.pro_setup_view, name='pro_setup'),
    path('webhook/payment/', views.payment_webhook, name='payment_webhook'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('setup-pro/', views.pro_setup_view, name='pro_setup_form'),
    path('build-page/', login_required(views.build_page), name='build_page'),
    path('pro-dashboard/', views.pro_dashboard, name='pro_dashboard'),
     path('transaction_history/', views.transaction_history, name='transaction_history'),
    path('generate-report/', views.generate_report, name='generate_report'),
    path('pay/', views.payment_page_view, name='pay_page'),
     path('payment_builder/', views.payment_builder_view, name='payment_builder'),
       path('customize/', views.customize_view, name='customize_page'), 
   path('admin/customize/', views.customize_view, name='customize_page'),
    path('quick-pay/', views.quick_pay_view, name='quick_pay'), 
    path('pay/<slug:slug>/', views.seller_page, name='seller_page'),
    path('api/v1/uplink/', receive_uplink_data, name='sdk_uplink'),
   path('api/sync-corporation/', views.sync_corporation, name='sync_corporation'),
   path('api/process-payment/', views.process_payment, name='process_payment_form'),
   path('payment/jazzcash/callback/', views.Sadapay_callback, name='jazzcash_callback'),
    path('payment/success/<uuid:transaction_id>/', views.payment_success, name='payment_success'),
    path('payment/error/', views.payment_error, name='payment_error'),
    path('activate-trial/', views.activate_trial, name='activate_trial'),
    path('activate-paid/', views.activate_paid, name='activate_paid'),
    path('web-builder/', views.web_builder_view, name='web-builder'),
    path('api/seller/<slug:slug>/', views.api_seller_info, name='api_seller_info'),
    path('api/transaction/<uuid:transaction_id>/', views.api_transaction_status, name='api_transaction_status'),
    path('web-builder/custom/', views.custom_builder, name='custom_builder'),
    path('web-builder/templates/', views.template_library, name='template_library'),
    
    path('admin/commission/', views.commission_dashboard, name='commission_dashboard'),
    path('admin/withdraw/', views.withdraw_commission, name='withdraw_commission'),
    path('process-transaction/<slug:owner_slug>/', views.process_transaction, name='process_transaction'),
    
    path('password-reset/', 
         auth_views.PasswordResetView.as_view(template_name='password_reset.html'), 
         name='password_reset'),
    path('password-reset/done/', 
         auth_views.PasswordResetDoneView.as_view(template_name='password_reset_done.html'), 
         name='password_reset_done'),
    path('password-reset-confirm/<uidb64>/<token>/', 
         auth_views.PasswordResetConfirmView.as_view(template_name='password_reset_confirm.html'), 
         name='password_reset_confirm'),
    path('password-reset-complete/', 
         auth_views.PasswordResetCompleteView.as_view(template_name='password_reset_complete.html'), 
         name='password_reset_complete'),
    path('api/checkout/session/', views.create_cart_session, name='create_cart_session'),
]