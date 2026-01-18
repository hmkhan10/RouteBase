from django import forms
from django.contrib.auth.models import User
from .models import Seller
from django.core.validators import RegexValidator
import re

phone_regex = RegexValidator(
    regex=r'^(0|92)3[0-9]{2}[0-9]{7}$',
    message="Phone number must be entered in the format: '03xxxxxxxxx' or '923xxxxxxxxx'. Up to 11 digits allowed."
)

cnic_regex = RegexValidator(
    regex=r'^[0-9]{5}-[0-9]{7}-[0-9]{1}$',
    message="CNIC must be entered in the format: 'xxxxx-xxxxxxx-x'."
)

class SellerRegistrationForm(forms.ModelForm):
    username = forms.CharField(max_length=150)
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)
    confirm_password = forms.CharField(widget=forms.PasswordInput)

    phone = forms.CharField(max_length=15, validators=[phone_regex])
    jazzcash_number = forms.CharField(max_length=15, validators=[phone_regex])
    page_slug = forms.SlugField(max_length=50, help_text="A unique, short identifier for your payment page URL.")

    class Meta:
        model = User
        fields = ['username', 'email']

    def clean_username(self):
        username = self.cleaned_data['username']
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError("This username is already taken.")
        return username
    
    def clean_email(self):
        email = self.cleaned_data['email']
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("This email is already associated with an account.")
        return email

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")

        if password and confirm_password and password != confirm_password:
            self.add_error('confirm_password', "Passwords do not match.")
        
        page_slug = cleaned_data.get("page_slug")
        if page_slug and Seller.objects.filter(page_slug=page_slug).exists():
            self.add_error('page_slug', "This page URL is already in use. Please choose another one.")

        return cleaned_data

    def save(self, commit=True):
        user = User.objects.create_user(
            username=self.cleaned_data['username'],
            email=self.cleaned_data['email'],
            password=self.cleaned_data['password']
        )
        return user


class CustomizePageForm(forms.ModelForm):
    class Meta:
        model = Seller
        fields = [
            'page_slug', 'page_title', 'page_color', 'page_logo', 'welcome_message',
            'require_phone', 'require_cnic', 'show_seller_info', 'is_active',
            'jazzcash_number', 'easypaisa_number', 'bank_name', 'bank_account',
        ]
        widgets = {
            'page_color': forms.TextInput(attrs={'type': 'color'}),
            'welcome_message': forms.Textarea(attrs={'rows': 3}),
        }

    def clean_page_slug(self):
        page_slug = self.cleaned_data['page_slug']
        if Seller.objects.filter(page_slug=page_slug).exclude(pk=self.instance.pk).exists():
            raise forms.ValidationError("This page URL is already in use by another seller.")
        return page_slug


class PaymentForm(forms.Form):
    amount = forms.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        min_value=float('1.00'),
        label="Amount to Pay (PKR)"
    )
    buyer_phone = forms.CharField(
        max_length=15, 
        required=False, 
        label="Your Phone Number",
        validators=[phone_regex]
    )
    buyer_email = forms.EmailField(
        required=False,
        label="Your Email"
    )
    buyer_cnic = forms.CharField(
        max_length=15, 
        required=False, 
        label="Your CNIC",
        validators=[cnic_regex]
    )

    def __init__(self, *args, **kwargs):
        self.seller = kwargs.pop('seller', None)
        super().__init__(*args, **kwargs)

        if self.seller:
            if self.seller.require_phone:
                self.fields['buyer_phone'].required = True
                self.fields['buyer_phone'].help_text = "Required by the seller."
            
            if self.seller.require_cnic:
                self.fields['buyer_cnic'].required = True
                self.fields['buyer_cnic'].help_text = "Required by the seller."