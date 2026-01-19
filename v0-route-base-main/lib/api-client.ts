/**
 * API Client for RouteBase Django Backend
 * Handles all HTTP requests to Django API
 */

import type { HelloWorldResponse, HealthCheckResponse, MerchantListResponse } from '@/types/models';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultHeaders: HeadersInit = {
            'Content-Type': 'application/json',
        };

        const config: RequestInit = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options?.headers,
            },
            credentials: 'include', // Include cookies for CSRF
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error: ${endpoint}`, error);
            throw error;
        }
    }

    // Health Check
    async healthCheck(): Promise<HealthCheckResponse> {
        return this.request<HealthCheckResponse>('/api/health/');
    }

    // Hello World - Test endpoint
    async helloWorld(): Promise<HelloWorldResponse> {
        return this.request<HelloWorldResponse>('/api/hello/');
    }

    // Get Merchants List
    async getMerchants(): Promise<MerchantListResponse> {
        return this.request<MerchantListResponse>('/api/merchants/');
    }

    // Generic GET request
    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    // Generic POST request
    async post<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    // Login
    async login(data: any): Promise<any> {
        return this.request<any>('/login/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Register
    async register(data: any): Promise<any> {
        return this.request<any>('/register/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Password Reset Request
    async requestPasswordReset(email: string): Promise<any> {
        return this.request<any>('/api/password-reset/', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    // Password Reset Confirm
    async confirmPasswordReset(data: any): Promise<any> {
        return this.request<any>('/api/password-reset-confirm/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Verify Payment
    async verifyPayment(token: string): Promise<any> {
        return this.request<any>('/api/verify-payment/', {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
    }

    // Get Subscription Status
    async getSubscription(): Promise<any> {
        return this.request<any>('/api/subscription/', {
            method: 'GET',
        });
    }

    // Get Order History
    async getOrderHistory(): Promise<any[]> {
        return this.request<any[]>('/api/orders/', {
            method: 'GET',
        });
    }

    // Get Ecommerce Metrics
    async getEcommerceMetrics(merchantSlug: string): Promise<any> {
        return this.request<any>(`/api/metrics/ecommerce/${merchantSlug}`, {
            method: 'GET',
        });
    }

    // Get SaaS Metrics
    async getSaaSMetrics(merchantSlug: string): Promise<any> {
        return this.request<any>(`/api/metrics/saas/${merchantSlug}`, {
            method: 'GET',
        });
    }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Named exports for convenience with proper 'this' binding
export const healthCheck = apiClient.healthCheck.bind(apiClient);
export const helloWorld = apiClient.helloWorld.bind(apiClient);
export const getMerchants = apiClient.getMerchants.bind(apiClient);
export const login = apiClient.login.bind(apiClient);
export const register = apiClient.register.bind(apiClient);
export const requestPasswordReset = apiClient.requestPasswordReset.bind(apiClient);
export const confirmPasswordReset = apiClient.confirmPasswordReset.bind(apiClient);
export const verifyPayment = apiClient.verifyPayment.bind(apiClient);
export const getSubscription = apiClient.getSubscription.bind(apiClient);
export const getOrderHistory = apiClient.getOrderHistory.bind(apiClient);
export const getEcommerceMetrics = apiClient.getEcommerceMetrics.bind(apiClient);
export const getSaaSMetrics = apiClient.getSaaSMetrics.bind(apiClient);
