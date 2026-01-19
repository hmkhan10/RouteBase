from django.shortcuts import render
from django.http import JsonResponse

def handler500(request):
    """
    Custom 500 error handler that returns a helpful message.
    If the request is an API request, return JSON.
    """
    if request.path.startswith('/api/'):
        return JsonResponse({
            'success': False,
            'message': 'A server-side error occurred. Our engineers have been notified.',
            'error_code': 'INTERNAL_SERVER_ERROR'
        }, status=500)
    
    return render(request, '500.html', status=500)
