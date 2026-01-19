'use client';

import { useState, useEffect } from 'react';
import { getSubscription } from '@/lib/api-client';

export function useSubscription() {
    const [subscription, setSubscription] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscription = async () => {
        setIsLoading(true);
        try {
            const response = await getSubscription();
            if (response.success) {
                setSubscription(response.data);
            } else {
                setError(response.message || 'Failed to fetch subscription');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, []);

    return {
        subscription,
        isActive: subscription?.is_active || false,
        plan: subscription?.plan || 'FREE',
        isLoading,
        error,
        refresh: fetchSubscription
    };
}
