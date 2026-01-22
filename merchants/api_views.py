from django.http import JsonResponse
from django.views.decorators.http import require_GET
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from merchants.models import Merchant
from merchants.serializers import MerchantSerializer
from django.contrib.auth.models import User


@require_GET
def health_check(request):
    """Simple health check endpoint"""
    return JsonResponse({
        'status': 'healthy',
        'message': 'Django backend is running!',
        'version': '1.0.0'
    })


@api_view(['GET'])
def hello_world(request):
    """Hello World endpoint for frontend integration testing"""
    return Response({
        'message': 'Hello from Django backend!',
        'timestamp': '2026-01-18T17:05:55+05:00',
        'backend': 'Django 4.x',
        'cors_enabled': True
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get current authenticated user information"""
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_authenticated': True,
        'date_joined': user.date_joined.isoformat() if user.date_joined else None
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """Update current user profile information"""
    user = request.user
    data = request.data
    
    # Update allowed fields
    allowed_fields = ['username', 'email', 'first_name', 'last_name']
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])
    
    try:
        user.save()
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_authenticated': True,
            'date_joined': user.date_joined.isoformat() if user.date_joined else None
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)


@api_view(['GET'])
def merchant_list(request):
    """List all merchants - test endpoint for frontend"""
    merchants = Merchant.objects.all()[:10]  # Limit to 10 for testing
    serializer = MerchantSerializer(merchants, many=True)
    return Response({
        'success': True,
        'count': merchants.count(),
        'merchants': serializer.data
    })
