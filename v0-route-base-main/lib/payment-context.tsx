'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

interface PaymentContextType {
    status: PaymentStatus;
    isPro: boolean;
    saasActive: boolean;
    error: string | null;
    startPayment: () => void;
    confirmPayment: (token: string) => Promise<void>;
    resetPayment: () => void;
    clearCart: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<PaymentStatus>('idle');
    const [isPro, setIsPro] = useState(false);
    const [saasActive, setSaasActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startPayment = () => {
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
                setIsPro(true);

                // Clear cart if it exists (assuming a cart state or localStorage)
                localStorage.removeItem('routebase_cart');

                // If it was a SaaS purchase, we might want to redirect specifically
                if (response.saas_active) {
                    setSaasActive(true);
                    // Redirect logic can be handled in the component using this context
                }
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
        setSaasActive(false);
        setError(null);
    };

    const clearCart = () => {
        localStorage.removeItem('routebase_cart');
    };

    return (
        <PaymentContext.Provider value={{ status, isPro, saasActive, error, startPayment, confirmPayment, resetPayment, clearCart }}>
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
