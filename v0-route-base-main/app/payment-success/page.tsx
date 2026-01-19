'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePayment } from '@/lib/payment-context';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { status, confirmPayment, saasActive, error } = usePayment();
    const token = searchParams.get('token');

    useEffect(() => {
        if (token && status === 'idle') {
            confirmPayment(token);
        }
    }, [token, status, confirmPayment]);

    return (
        <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6">
            <Navbar />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <GlassCard variant="elevated" className="p-10 rounded-3xl text-center">
                    {status === 'processing' && (
                        <>
                            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
                            <h2 className="text-2xl font-black mb-2">Verifying Payment</h2>
                            <p className="text-muted-foreground">Please wait while we confirm your transaction...</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-black mb-2">
                                {saasActive ? 'SaaS Activated!' : 'Payment Confirmed!'}
                            </h2>
                            <p className="text-muted-foreground mb-8">
                                {saasActive
                                    ? 'Your Pro subscription is now active. Welcome to the elite tier.'
                                    : 'Your account has been upgraded to PRO status.'}
                            </p>
                            <Button
                                onClick={() => router.push('/dashboard')}
                                className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold uppercase tracking-widest"
                            >
                                {saasActive ? 'Enter Pro Dashboard' : 'Go to Dashboard'}
                            </Button>
                        </>
                    )}

                    {status === 'failed' && (
                        <>
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-10 h-10 text-red-400" />
                            </div>
                            <h2 className="text-2xl font-black mb-2">Verification Failed</h2>
                            <p className="text-red-400 mb-8">{error || 'Something went wrong during verification.'}</p>
                            <Button
                                onClick={() => router.push('/pricing')}
                                variant="outline"
                                className="w-full py-6 border-white/10 rounded-xl font-bold uppercase tracking-widest"
                            >
                                Back to Pricing
                            </Button>
                        </>
                    )}
                </GlassCard>
            </motion.div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
