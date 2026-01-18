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
