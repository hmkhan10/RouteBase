'use client';

import { GlassCard } from '@/components/glass-card';
import { Navbar } from '@/components/navbar';
import { useSubscription } from '@/lib/use-subscription';
import { LayoutDashboard, Settings, CreditCard, Users, Activity, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
    const { plan, isActive } = useSubscription();

    return (
        <div className="min-h-screen bg-[#0A0C10] p-20">
            <Navbar />
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Pro Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back. Here's what's happening with your terminals.</p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-2 rounded-2xl flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs">{plan} ACTIVE</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {[
                        { label: 'Total Volume', value: '$128,430', icon: Activity, color: 'text-blue-400' },
                        { label: 'Active Terminals', value: '12', icon: LayoutDashboard, color: 'text-emerald-400' },
                        { label: 'Team Members', value: '4', icon: Users, color: 'text-purple-400' },
                    ].map((stat, i) => (
                        <GlassCard key={i} className="p-8 rounded-3xl">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">{stat.label}</span>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div className="text-3xl font-black">{stat.value}</div>
                        </GlassCard>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <GlassCard className="p-10 rounded-3xl border-white/5">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <Settings className="w-5 h-5 text-muted-foreground" />
                            Quick Settings
                        </h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-12 bg-white/5 rounded-2xl border border-white/5" />
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard className="p-10 rounded-3xl border-white/5">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-muted-foreground" />
                            Recent Transactions
                        </h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-12 bg-white/5 rounded-2xl border border-white/5" />
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
