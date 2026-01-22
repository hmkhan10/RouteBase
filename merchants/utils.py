import requests
import uuid
import string
import random
def generate_paymob_iframe(amount, plan_name, email):
    # 1. Get Authentication Token
    auth_response = requests.post("https://pakistan.paymob.com/api/auth/tokens", 
                                 json={"api_key": "YOUR_PAYMOB_API_KEY"}, timeout=30)
    token = auth_response.json().get('token')

    # 2. Register Order
    order_data = {
        "auth_token": token,
        "delivery_needed": "false",
        "amount_cents": str(int(amount) * 100), # Paymob uses cents (e.g., 4500 PKR = 450000)
        "currency": "PKR",
        "items": [{"name": plan_name, "amount_cents": str(int(amount) * 100)}]
    }
    order_response = requests.post("https://pakistan.paymob.com/api/ecommerce/orders", json=order_data, timeout=30)
    order_id = order_response.json().get('id')

    # 3. Get Payment Key
    payment_data = {
        "auth_token": token,
        "amount_cents": str(int(amount) * 100),
        "expiration": 3600,
        "order_id": order_id,
        "billing_data": {
            "first_name": "SaaS", "last_name": "User", "email": email,
            "phone_number": "03001234567", "city": "NA", "country": "PK", "street": "NA"
        },
        "currency": "PKR",
        "integration_id": 12345 # Replace with your Paymob Card Integration ID
    }
    key_response = requests.post("https://pakistan.paymob.com/api/acceptance/payment_keys", json=payment_data, timeout=30)
    payment_token = key_response.json().get('token')

    # 4. Return the Final Iframe URL
    iframe_id = "67890" # Replace with your Paymob Iframe ID
    return f"https://pakistan.paymob.com/api/acceptance/iframes/{iframe_id}?payment_token={payment_token}"
def generate_reference_id(prefix="RB"):
    """
    Generates a unique reference ID for transactions.
    Example output: RB-7A2B9
    """
    random_str = ''.join(random.choices(string.get_alphabet().upper() + string.digits, k=5))
    return f"{prefix}-{random_str}-{uuid.uuid4().hex[:4].upper()}"

def get_client_ip(request):
    """Retrieves the user's IP address from the request headers."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def send_email_notification(user_email, subject, message):
    """Placeholder for your email logic (using Django's send_mail)."""
    from django.core.mail import send_mail
    # send_mail(subject, message, 'admin@routebase.com', [user_email])
    print(f"Email sent to {user_email}: {subject}")