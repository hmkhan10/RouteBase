from ninja import Router
from ninja import Schema
from django.shortcuts import get_object_or_404
from datetime import datetime
from .models import Merchant

router = Router()


class MerchantSchema(Schema):
    """Pydantic schema for Merchant API response"""
    id: int
    slug: str
    store_name: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


@router.get("/merchants/{slug}", response=MerchantSchema, tags=["merchants"])
def get_merchant_by_slug(request, slug: str):
    """
    Fetch a merchant by their unique slug.
    
    Returns 404 if merchant not found.
    """
    merchant = get_object_or_404(Merchant, slug=slug)
    return merchant


class PasswordResetSchema(Schema):
    email: str


class PasswordResetConfirmSchema(Schema):
    uidb64: str
    token: str
    new_password: str


from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import get_user_model

User = get_user_model()

@router.post("/password-reset/", tags=["auth"])
def password_reset(request, data: PasswordResetSchema):
    """
    Trigger the Django password reset flow.
    Sends a reset link to the provided email if it exists.
    """
    form = PasswordResetForm({'email': data.email})
    if form.is_valid():
        # Point to Next.js frontend
        frontend_domain = os.getenv('FRONTEND_URL', 'localhost:3000').replace('http://', '').replace('https://', '')
        form.save(
            request=request,
            use_https=request.is_secure(),
            domain_override=frontend_domain,
            email_template_name='registration/password_reset_email.html',
            subject_template_name='registration/password_reset_subject.txt',
        )
        return {"success": True, "message": "Password reset email sent."}
    return {"success": False, "errors": form.errors}


@router.post("/password-reset-confirm/", tags=["auth"])
def password_reset_confirm(request, data: PasswordResetConfirmSchema):
    """
    Confirm the password reset and set the new password.
    """
    try:
        uid = urlsafe_base64_decode(data.uidb64).decode()
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, data.token):
        form = SetPasswordForm(user, {'new_password1': data.new_password, 'new_password2': data.new_password})
        if form.is_valid():
            form.save()
            return {"success": True, "message": "Password has been reset successfully."}
        return {"success": False, "errors": form.errors}
    
    return {"success": False, "message": "Invalid or expired reset link."}
