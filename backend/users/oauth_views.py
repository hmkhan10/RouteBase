from django.shortcuts import redirect
from django.conf import settings
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from urllib.parse import urlencode
import secrets
import json

# OAuth configuration (in production, these would be in settings)
OAUTH_CONFIG = {
    'google': {
        'auth_url': 'https://accounts.google.com/o/oauth2/v2/auth',
        'client_id': 'your-google-client-id',  # Replace with actual client ID
        'redirect_uri': 'http://localhost:8001/api/oauth/google/callback/',
        'scope': 'openid email profile',
    },
    'apple': {
        'auth_url': 'https://appleid.apple.com/auth/authorize',
        'client_id': 'your-apple-client-id',  # Replace with actual client ID
        'redirect_uri': 'http://localhost:8001/api/oauth/apple/callback/',
        'scope': 'name email',
    },
    'microsoft': {
        'auth_url': 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        'client_id': 'your-microsoft-client-id',  # Replace with actual client ID
        'redirect_uri': 'http://localhost:8001/api/oauth/microsoft/callback/',
        'scope': 'openid email profile',
    }
}

def oauth_login(request, provider):
    """Initiate OAuth login for the specified provider"""
    if provider not in OAUTH_CONFIG:
        return JsonResponse({'error': f'Provider {provider} not supported'}, status=400)
    
    config = OAUTH_CONFIG[provider]
    
    # Generate state parameter for security
    state = secrets.token_urlsafe(32)
    
    # Store state in session for verification in callback
    request.session[f'oauth_state_{provider}'] = state
    
    # Build OAuth URL
    params = {
        'client_id': config['client_id'],
        'redirect_uri': config['redirect_uri'],
        'scope': config['scope'],
        'response_type': 'code',
        'state': state,
        'access_type': 'offline',  # For Google
    }
    
    # Add provider-specific parameters
    if provider == 'apple':
        params['response_mode'] = 'form_post'
    
    auth_url = f"{config['auth_url']}?{urlencode(params)}"
    
    return redirect(auth_url)

def oauth_callback(request, provider):
    """Handle OAuth callback from provider"""
    if provider not in OAUTH_CONFIG:
        return JsonResponse({'error': f'Provider {provider} not supported'}, status=400)
    
    # Verify state parameter
    state = request.GET.get('state')
    stored_state = request.session.get(f'oauth_state_{provider}')
    
    if not state or state != stored_state:
        return JsonResponse({'error': 'Invalid state parameter'}, status=400)
    
    # Clear state from session
    del request.session[f'oauth_state_{provider}']
    
    # Get authorization code
    code = request.GET.get('code')
    if not code:
        error = request.GET.get('error', 'Unknown error')
        return JsonResponse({'error': f'OAuth error: {error}'}, status=400)
    
    # In a real implementation, you would:
    # 1. Exchange the code for access token
    # 2. Get user info from the provider
    # 3. Create or update user in your database
    # 4. Log the user in
    
    # For demo purposes, we'll simulate a successful login
    # In production, replace this with actual OAuth token exchange
    
    try:
        # Simulate user info (replace with actual API calls)
        user_info = {
            'google': {
                'email': 'user@gmail.com',
                'name': 'Google User',
                'username': 'google_user',
            },
            'apple': {
                'email': 'user@icloud.com',
                'name': 'Apple User',
                'username': 'apple_user',
            },
            'microsoft': {
                'email': 'user@outlook.com',
                'name': 'Microsoft User',
                'username': 'microsoft_user',
            }
        }.get(provider, {})
        
        # For demo, create a mock user session
        request.session['oauth_user'] = {
            'provider': provider,
            'email': user_info['email'],
            'name': user_info['name'],
            'username': user_info['username'],
        }
        
        # Redirect to frontend with success message
        frontend_url = 'http://localhost:3000/login'
        params = urlencode({
            'message': f'Successfully logged in with {provider.capitalize()}!',
            'provider': provider,
        })
        return redirect(f'{frontend_url}?{params}')
        
    except Exception as e:
        return JsonResponse({'error': f'OAuth processing error: {str(e)}'}, status=500)

def oauth_demo_success(request, provider):
    """Demo endpoint to simulate successful OAuth without actual OAuth setup"""
    try:
        # Simulate user info (replace with actual API calls)
        user_info = {
            'google': {
                'email': 'google_user@example.com',
                'name': 'Google User',
                'username': 'google_user',
            },
            'apple': {
                'email': 'apple_user@example.com',
                'name': 'Apple User',
                'username': 'apple_user',
            },
            'microsoft': {
                'email': 'microsoft_user@example.com',
                'name': 'Microsoft User',
                'username': 'microsoft_user',
            }
        }.get(provider, {})
        
        # Create or get user in database
        user, created = User.objects.get_or_create(
            username=user_info['username'],
            defaults={
                'email': user_info['email'],
                'first_name': user_info['name'].split()[0],
                'last_name': ' '.join(user_info['name'].split()[1:]) if len(user_info['name'].split()) > 1 else '',
            }
        )
        
        # If user already exists, update email and name
        if not created:
            user.email = user_info['email']
            user.first_name = user_info['name'].split()[0]
            user.last_name = ' '.join(user_info['name'].split()[1:]) if len(user_info['name'].split()) > 1 else ''
            user.save()
        
        # Log the user in
        login(request, user)
        
        # Store OAuth info in session
        request.session['oauth_user'] = {
            'provider': provider,
            'email': user_info['email'],
            'name': user_info['name'],
            'username': user_info['username'],
            'user_id': user.id,
        }
        
        # Redirect to frontend with success and user info
        frontend_url = 'http://localhost:3000/dashboard'
        params = urlencode({
            'message': f'Successfully logged in with {provider.capitalize()}!',
            'provider': provider,
            'username': user.username,
            'email': user.email,
        })
        return redirect(f'{frontend_url}?{params}')
        
    except Exception as e:
        # If anything fails, redirect to login with error
        frontend_url = 'http://localhost:3000/login'
        params = urlencode({
            'error': f'OAuth login failed: {str(e)}',
            'provider': provider,
        })
        return redirect(f'{frontend_url}?{params}')
