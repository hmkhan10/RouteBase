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
}

// Export singleton instance
export const apiClient = new ApiClient();

// Named exports for convenience
export const { healthCheck, helloWorld, getMerchants } = apiClient;
