from django.urls import path
from . import views
from . import oauth_views

app_name = 'users'

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('me/', views.get_current_user, name='me'),
    path('subscription/', views.get_subscription, name='subscription'),
    # OAuth URLs
    path('oauth/<str:provider>/', oauth_views.oauth_login, name='oauth_login'),
    path('oauth/<str:provider>/callback/', oauth_views.oauth_callback, name='oauth_callback'),
    path('oauth/demo/<str:provider>/', oauth_views.oauth_demo_success, name='oauth_demo'),
]
