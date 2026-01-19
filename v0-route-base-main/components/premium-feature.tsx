'use client';

import React from 'react';
import { useSubscription } from '@/lib/use-subscription';
import { Lock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface PremiumFeatureProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function PremiumFeature({ children, fallback }: PremiumFeatureProps) {
    const { isActive, isLoading } = useSubscription();

    if (isLoading) {
        return (
            <div className="animate-pulse bg-white/5 rounded-2xl h-48 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!isActive) {
        return fallback || (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-10 flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-white/10">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Lock className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Premium Feature</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mb-6">
                        This feature is only available for Pro members. Upgrade your account to unlock full access.
                    </p>
                    <Link href="/pricing">
                        <Button className="bg-emerald-500 hover:bg-emerald-600 font-bold uppercase tracking-widest text-xs px-8">
                            Upgrade to Pro
                        </Button>
                    </Link>
                </div>
                <div className="opacity-20 grayscale blur-sm pointer-events-none">
                    {children}
                </div>
            </motion.div>
        );
    }

    return <>{children}</>;
}
