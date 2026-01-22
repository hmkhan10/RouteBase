from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
import json
import re

@csrf_exempt
@require_http_methods(["POST"])
def register_user(request):
    try:
        data = json.loads(request.body)
        
        # Validate email format
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, data.get('email', '')):
            return JsonResponse({"error": "Invalid email format"}, status=400)
        
        # Check if username or email already exists
        if User.objects.filter(username=data.get('username', '')).exists():
            return JsonResponse({"error": "Username already exists"}, status=400)
        if User.objects.filter(email=data.get('email', '')).exists():
            return JsonResponse({"error": "Email already exists"}, status=400)
        
        # Create new user
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password']
        )
        
        return JsonResponse({
            "success": True,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "user_type": "CUSTOMER"
            }
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def login_user(request):
    try:
        data = json.loads(request.body)
        
        # Determine login field (username or email)
        login_field = None
        if data.get('username'):
            login_field = data['username']
        elif data.get('email'):
            try:
                user = User.objects.get(email=data['email'])
                login_field = user.username
            except User.DoesNotExist:
                return JsonResponse({"error": "Invalid credentials"}, status=401)
        else:
            return JsonResponse({"error": "Username or email required"}, status=400)
        
        # Authenticate user
        user = authenticate(request, username=login_field, password=data['password'])
        
        if user is not None:
            login(request, user)
            return JsonResponse({
                "success": True,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "user_type": "CUSTOMER"
                }
            })
        else:
            return JsonResponse({"error": "Invalid credentials"}, status=401)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def logout_user(request):
    try:
        logout(request)
        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def get_current_user(request):
    try:
        if request.user.is_authenticated:
            return JsonResponse({
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
                "user_type": "CUSTOMER"
            })
        else:
            return JsonResponse({"error": "Not authenticated"}, status=401)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def get_subscription(request):
    try:
        if request.user.is_authenticated:
            # For now, return a basic free plan subscription
            # In production, this would come from a database
            return JsonResponse({
                "plan": "free",
                "is_active": True,
                "features": ["basic_checkout", "payment_links"]
            })
        else:
            return JsonResponse({"error": "Not authenticated"}, status=401)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
