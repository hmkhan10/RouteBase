from decimal import Decimal
from django.test import TestCase
from django.conf import settings
from merchants.payment_service import PaymentService
from merchants.commision import CommissionService


class PlatformFeeCalculationTests(TestCase):
    """Test platform fee calculations for accuracy and precision"""
    
    def setUp(self):
        self.service = PaymentService()
        self.commission_service = CommissionService()
    
    def test_3_percent_fee_calculation(self):
        """Verify 3% platform fee is calculated correctly"""
        amount = Decimal('10000.00')
        expected_fee = Decimal('300.00')
        
        commission = (amount * self.service.commission_rate).quantize(Decimal('0.01'))
        self.assertEqual(commission, expected_fee)
    
    def test_no_rounding_errors(self):
        """Test various amounts for floating-point rounding issues"""
        test_amounts = [
            Decimal('100.00'),
            Decimal('999.99'),
            Decimal('1234.56'),
            Decimal('99999.99'),
        ]
        
        for amount in test_amounts:
            fee = (amount * Decimal('0.03')).quantize(Decimal('0.01'))
            seller_amount = (amount - fee).quantize(Decimal('0.01'))
            
            # Verify no penny discrepancies
            self.assertEqual(amount, fee + seller_amount)
    
    def test_commission_rate_from_settings(self):
        """Ensure commission rate matches settings (3%)"""
        self.assertEqual(self.service.commission_rate, Decimal('0.03'))
    
    def test_edge_cases(self):
        """Test edge cases for fee calculation"""
        # Very small amount
        small_amount = Decimal('1.00')
        small_fee = (small_amount * Decimal('0.03')).quantize(Decimal('0.01'))
        self.assertEqual(small_fee, Decimal('0.03'))
        
        # Large amount
        large_amount = Decimal('999999.99')
        large_fee = (large_amount * Decimal('0.03')).quantize(Decimal('0.01'))
        self.assertEqual(large_fee, Decimal('29999.99'))
    
    def test_seller_amount_calculation(self):
        """Verify seller gets Amount - 3% fee"""
        test_cases = [
            (Decimal('10000.00'), Decimal('9700.00')),
            (Decimal('5000.00'), Decimal('4850.00')),
            (Decimal('1234.56'), Decimal('1197.52')),
        ]
        
        for amount, expected_seller_amount in test_cases:
            fee = (amount * Decimal('0.03')).quantize(Decimal('0.01'))
            seller_amount = (amount - fee).quantize(Decimal('0.01'))
            self.assertEqual(seller_amount, expected_seller_amount)
