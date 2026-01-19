'use client';

import { PremiumFeature } from '@/components/premium-feature';
import { GlassCard } from '@/components/glass-card';
import { Navbar } from '@/components/navbar';
import { BarChart3, Zap, Shield } from 'lucide-react';

export default function SubscriptionTestPage() {
    return (
        <div className="min-h-screen bg-[#0A0C10] p-20">
            <Navbar />
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center">
                    <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">SaaS Dashboard</h1>
                    <p className="text-muted-foreground">Test your subscription gating here.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <GlassCard className="p-8 rounded-3xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                                <Zap className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold">Basic Analytics</h3>
                        </div>
                        <p className="text-muted-foreground text-sm mb-6">
                            Available to all users. Track your basic transaction volume and success rates.
                        </p>
                        <div className="h-24 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Chart Data</span>
                        </div>
                    </GlassCard>

                    <PremiumFeature>
                        <GlassCard className="p-8 rounded-3xl border-emerald-500/20">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold">Advanced Intelligence</h3>
                            </div>
                            <p className="text-muted-foreground text-sm mb-6">
                                Pro only. Deep dive into churn prediction, MRR growth, and customer lifetime value.
                            </p>
                            <div className="h-24 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center justify-center">
                                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Advanced Metrics</span>
                            </div>
                        </GlassCard>
                    </PremiumFeature>
                </div>

                <PremiumFeature>
                    <GlassCard className="p-12 rounded-3xl border-blue-500/20 text-center">
                        <Shield className="w-12 h-12 text-blue-400 mx-auto mb-6" />
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight">Enterprise Security Suite</h2>
                        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                            Unlock advanced WAF rules, IP whitelisting, and custom security headers for your payment terminals.
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-12 bg-blue-500/5 rounded-xl border border-blue-500/10" />
                            ))}
                        </div>
                    </GlassCard>
                </PremiumFeature>
            </div>
        </div>
    );
}
