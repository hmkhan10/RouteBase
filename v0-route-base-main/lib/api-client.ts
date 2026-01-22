/**
 * API Client for RouteBases Django Backend
 * Handles all HTTP requests to Django API
 */

import type { HelloWorldResponse, HealthCheckResponse, MerchantListResponse } from '@/types/models';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

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

            const data = await response.json();

            if (!response.ok) {
                // Handle API error responses
                if (data.error) {
                    throw new Error(`HTTP ${response.status}: ${data.error}`);
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            // Don't log 401 errors for /api/users/me/ endpoint as they're expected for unauthenticated users
            const isExpected401 = error instanceof Error && 
                                 error.message.includes('HTTP 401') && 
                                 endpoint.includes('/users/me');
            
            if (!isExpected401) {
                console.error(`API Error: ${endpoint}`, error);
            }
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
        const response = await this.request<any>('/api/users/login/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response;
    }

    // Register
    async register(data: any): Promise<any> {
        return this.request<any>('/api/users/register/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // User Registration (simple signup)
    async userRegister(data: any): Promise<any> {
        return this.request<any>('/api/users/register/', {
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

    // Get Current User
    async getCurrentUser(): Promise<any> {
        return this.request<any>('/api/users/me/', {
            method: 'GET',
        });
    }

    // Update Profile
    async updateProfile(data: any): Promise<any> {
        return this.request<any>('/api/users/me/', {
            method: 'PATCH',
            body: JSON.stringify(data),
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
export const getCurrentUser = apiClient.getCurrentUser.bind(apiClient);
export const updateProfile = apiClient.updateProfile.bind(apiClient);
export const getOrderHistory = apiClient.getOrderHistory.bind(apiClient);
export const getEcommerceMetrics = apiClient.getEcommerceMetrics.bind(apiClient);
export const getSaaSMetrics = apiClient.getSaaSMetrics.bind(apiClient);
