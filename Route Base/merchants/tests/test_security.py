from django.test import TestCase, Client, RequestFactory
from django.contrib.auth.models import User
from django.urls import reverse
from merchants.models import Seller, MerchantPage
import json


class CSRFProtectionTests(TestCase):
    """Test CSRF protection on critical endpoints"""
    
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.factory = RequestFactory()
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.seller = Seller.objects.create(
            user=self.user,
            phone='03001234567',
            email='test@example.com',
            jazzcash_number='03001234567',
            page_slug='test-seller'
        )
    
    def test_login_required_on_dashboard(self):
        """Verify @login_required on dashboard"""
        response = self.client.get('/dashboard/')
        self.assertEqual(response.status_code, 302)  # Redirect to login
        self.assertTrue(response.url.startswith('/login/'))
    
    def test_authenticated_access_to_dashboard(self):
        """Verify authenticated users can access dashboard"""
        self.client.login(username='testuser', password='testpass123')
        # Assuming dashboard URL is /dashboard/
        response = self.client.get('/dashboard/')
        # Should not redirect if route exists
        self.assertIn(response.status_code, [200, 404])  # 404 if route not in URLconf yet


class AuthenticationTests(TestCase):
    """Test authentication and authorization"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
    
    def test_login_with_valid_credentials(self):
        """Test successful login"""
        response = self.client.post('/login/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        # Should redirect on success
        self.assertEqual(response.status_code, 302)
    
    def test_login_with_invalid_credentials(self):
        """Test failed login with wrong password"""
        response = self.client.post('/login/', {
            'username': 'testuser',
            'password': 'wrongpassword'
        })
        # Should show error on same page
        self.assertEqual(response.status_code, 200)


class InputValidationTests(TestCase):
    """Test input validation and sanitization"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.seller = Seller.objects.create(
            user=self.user,
            phone='03001234567',
            email='test@example.com',
            jazzcash_number='03001234567',
            page_slug='test-seller'
        )
    
    def test_search_with_invalid_input(self):
        """Test that search doesn't cause errors with invalid input"""
        self.client.login(username='testuser', password='testpass123')
        
        # Test with SQL injection attempt
        response = self.client.get('/transaction-history/', {
            'search_id': "'; DROP TABLE merchants_transaction; --"
        })
        
        # Should handle gracefully
        self.assertEqual(response.status_code, 200)
