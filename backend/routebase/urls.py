from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from merchants.views import home_view
from merchants import views
from django.views.generic.base import RedirectView
from ninja import NinjaAPI
from merchants.api import router as merchants_router
from users.api import router as users_router
from users import urls as users_urls

# Initialize Django Ninja API
api = NinjaAPI(
    title="RouteBase API",
    version="1.0.0",
    description="RouteBase Fintech SaaS Platform API",
)

# Include routers
api.add_router("/", merchants_router)
api.add_router("users", users_router)

urlpatterns = [
    path("api/", api.urls),
    path('api/users/', include('users.urls')),
    path('', include('merchants.urls')),
    path('admin-setup/', RedirectView.as_view(pattern_name='merchants:dashboard', permanent=True)),
    path('admin/', admin.site.urls),
    path('', home_view, name='home'),
    path('subscription/', views.subscription_page, name='subscription_page'),
   path('builder/', views.build_and_deploy, name='payment_builder'),
    
    
    path('pay/<slug:business_slug>/', views.public_payment_page, name='public_payment_page'),
    
    ]

handler500 = 'merchants.views_errors.handler500'

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    