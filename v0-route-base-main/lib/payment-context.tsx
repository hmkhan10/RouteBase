'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { apiClient } from './api-client';

type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';
type SubscriptionPlan = 'free' | 'ecommerce-pro' | 'saas-pro' | 'saas-max';

interface UserSubscription {
    plan: SubscriptionPlan;
    is_active: boolean;
    expires_at?: string;
    features: string[];
}

interface PaymentContextType {
    status: PaymentStatus;
    isPro: boolean;
    saasActive: boolean;
    currentPlan: SubscriptionPlan;
    subscription: UserSubscription | null;
    error: string | null;
    isLoading: boolean;
    startPayment: (plan: SubscriptionPlan) => void;
    confirmPayment: (token: string) => Promise<void>;
    resetPayment: () => void;
    clearCart: () => void;
    refreshSubscription: () => Promise<void>;
    hasAccess: (requiredPlan: SubscriptionPlan) => boolean;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const [status, setStatus] = useState<PaymentStatus>('idle');
    const [isPro, setIsPro] = useState(false);
    const [saasActive, setSaasActive] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>('free');
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const refreshSubscription = async () => {
        if (!isAuthenticated) {
            setCurrentPlan('free');
            setIsPro(false);
            setSaasActive(false);
            setSubscription(null);
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiClient.getSubscription();
            if (response && response.plan) {
                setSubscription(response);
                setCurrentPlan(response.plan);
                setIsPro(response.plan === 'ecommerce-pro' || response.plan === 'saas-max');
                setSaasActive(response.plan === 'saas-pro' || response.plan === 'saas-max');
            } else {
                // Default to free plan if no subscription found
                setCurrentPlan('free');
                setIsPro(false);
                setSaasActive(false);
                setSubscription({
                    plan: 'free',
                    is_active: true,
                    features: ['basic_checkout', 'payment_links']
                });
            }
        } catch (error) {
            console.error('Failed to fetch subscription:', error);
            // Default to free plan on error
            setCurrentPlan('free');
            setIsPro(false);
            setSaasActive(false);
            setSubscription({
                plan: 'free',
                is_active: true,
                features: ['basic_checkout', 'payment_links']
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshSubscription();
    }, [isAuthenticated]);

    const startPayment = (plan: SubscriptionPlan) => {
        setStatus('processing');
        setError(null);
    };

    const confirmPayment = async (token: string) => {
        setStatus('processing');
        try {
            const { verifyPayment } = await import('@/lib/api-client');
            const response = await verifyPayment(token);

            if (response.success) {
                setStatus('success');
                // Refresh subscription after successful payment
                await refreshSubscription();

                // Clear cart if it exists
                localStorage.removeItem('routebase_cart');
            } else {
                setStatus('failed');
                setError(response.message || 'Verification failed');
            }
        } catch (err) {
            setStatus('failed');
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
    };

    const resetPayment = () => {
        setStatus('idle');
        setError(null);
    };

    const clearCart = () => {
        localStorage.removeItem('routebase_cart');
    };

    const hasAccess = (requiredPlan: SubscriptionPlan): boolean => {
        if (!subscription) return requiredPlan === 'free';
        
        const planHierarchy = {
            'free': 0,
            'ecommerce-pro': 1,
            'saas-pro': 1,
            'saas-max': 2
        };
        
        return planHierarchy[currentPlan] >= planHierarchy[requiredPlan];
    };

    return (
        <PaymentContext.Provider value={{ 
            status, 
            isPro, 
            saasActive, 
            currentPlan,
            subscription,
            error, 
            isLoading,
            startPayment, 
            confirmPayment, 
            resetPayment, 
            clearCart,
            refreshSubscription,
            hasAccess
        }}>
            {children}
        </PaymentContext.Provider>
    );
}

export function usePayment() {
    const context = useContext(PaymentContext);
    if (context === undefined) {
        throw new Error('usePayment must be used within a PaymentProvider');
    }
    return context;
}
