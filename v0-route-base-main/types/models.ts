/**
 * Shared TypeScript types for RouteBase platform
 * Synced with Django models in merchants/models.py
 */

export interface Merchant {
    id: number;
    slug: string;
    store_name: string;
    created_at: string;
    updated_at: string;
}

export interface Seller {
    id: number;
    user: number;
    phone: string;
    cnic?: string;
    email: string;
    jazzcash_number: string;
    easypaisa_number?: string;
    bank_name?: string;
    bank_account?: string;
    page_slug: string;
    page_title: string;
    page_color: string;
    page_logo?: string;
    welcome_message?: string;
    require_phone: boolean;
    require_cnic: boolean;
    show_seller_info: boolean;
    is_active: boolean;
    balance: string;  // Decimal as string
    total_earned: string;  // Decimal as string
    platform_fees_paid: string;  // Decimal as string
    is_verified: boolean;
    verified_at?: string;
    created_at: string;
    updated_at: string;
    page_url: string;
}

export interface Transaction {
    transaction_id: string;  // UUID
    reference_id: string;
    seller: number;
    buyer_phone: string;
    buyer_cnic?: string;
    buyer_email?: string;
    amount: string;  // Decimal as string
    platform_fee: string;  // Decimal as string
    seller_amount: string;  // Decimal as string
    currency: string;
    payment_method: 'sadapay' | 'jazzcash' | 'easypaisa' | 'bank';
    gateway_txn_id?: string;
    gateway_response?: Record<string, any>;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
    status_message?: string;
    ip_address?: string;
    user_agent?: string;
    page_type: string;
    created_at: string;
    updated_at: string;
    completed_at?: string;
}

export interface MerchantPage {
    id: number;
    user?: number;
    admin_name: string;
    admin_mobile: string;
    description?: string;
    is_active: boolean;
    slug: string;
    created_at: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface HelloWorldResponse {
    message: string;
    timestamp: string;
    backend: string;
    cors_enabled: boolean;
}

export interface HealthCheckResponse {
    status: string;
    message: string;
    version: string;
}

export interface MerchantListResponse {
    success: boolean;
    count: number;
    merchants: Merchant[];
}
