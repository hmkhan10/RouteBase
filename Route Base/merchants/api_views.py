from django.http import JsonResponse
from django.views.decorators.http import require_GET
from rest_framework.decorators import api_view
from rest_framework.response import Response
from merchants.models import Merchant
from merchants.serializers import MerchantSerializer


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
def merchant_list(request):
    """List all merchants - test endpoint for frontend"""
    merchants = Merchant.objects.all()[:10]  # Limit to 10 for testing
    serializer = MerchantSerializer(merchants, many=True)
    return Response({
        'success': True,
        'count': merchants.count(),
        'merchants': serializer.data
    })
