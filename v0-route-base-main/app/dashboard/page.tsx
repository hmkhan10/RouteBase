'use client';

import { GlassCard } from '@/components/glass-card';
import { Navbar } from '@/components/navbar';
import { useSubscription } from '@/lib/use-subscription';
import { LayoutDashboard, Settings, CreditCard, Users, Activity, ShieldCheck, ShoppingCart, DollarSign, TrendingUp, Package, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
    const { plan, isActive } = useSubscription();
    const searchParams = useSearchParams();
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const planType = searchParams.get('plan') || 'ecommerce-free';
    
    // Get user subscription tier from localStorage
    const [userTier, setUserTier] = useState('FREE');
    
    useEffect(() => {
        const message = searchParams.get('message');
        const provider = searchParams.get('provider');
        const username = searchParams.get('username');
        
        if (message && provider) {
            setWelcomeMessage(`${message} Welcome, ${username || 'User'}!`);
        }
        
        // Get subscription tier from localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        setUserTier(userData.subscription_tier || 'FREE');
    }, [searchParams]);

    // Plan-specific features based on subscription tier
    const planFeatures = {
        'ecommerce-free': {
            name: 'E-commerce Free',
            features: [
                'Payment links',
                'Basic checkout', 
                'Email support',
                'Up to 50 orders/month',
                'Basic analytics'
            ],
            stats: [
                { label: 'Orders This Month', value: '23', icon: ShoppingCart },
                { label: 'Revenue', value: 'PKR 12,450', icon: DollarSign },
                { label: 'Conversion Rate', value: '2.1%', icon: TrendingUp },
                { label: 'Support Tickets', value: '3', icon: Users }
            ]
        },
        'ecommerce-pro': {
            name: 'E-commerce Pro',
            features: [
                'Advanced payment links',
                'Premium checkout',
                'Priority support',
                'Unlimited orders',
                'Advanced analytics',
                'Ghomoud AI insights',
                'Fraud detection'
            ],
            stats: [
                { label: 'Orders This Month', value: '156', icon: ShoppingCart },
                { label: 'Revenue', value: 'PKR 89,750', icon: DollarSign },
                { label: 'Conversion Rate', value: '4.8%', icon: TrendingUp },
                { label: 'AI Insights', value: '12', icon: ShieldCheck }
            ]
        }
    };

    const currentPlan = planFeatures[planType as keyof typeof planFeatures] || planFeatures['ecommerce-free'];

    return (
        <div className="min-h-screen bg-[#0A0C10] relative overflow-hidden">
            {/* Sovereign Sun Background Effect */}
            <div className="sovereign-sun" />
            
            <Navbar />
            
            <div className="relative z-10 max-w-7xl mx-auto p-6">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-black text-white mb-2">
                        {currentPlan.name} Dashboard
                    </h1>
                    {welcomeMessage && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-4 bg-sovereign-gold-500/10 border border-sovereign-gold-500/30 rounded-xl"
                        >
                            <p className="text-sovereign-gold-400 font-medium">{welcomeMessage}</p>
                        </motion.div>
                    )}
                    <p className="text-gray-400">
                        Welcome back! Here's your business overview.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {currentPlan.stats.map((stat, i) => (
                        <GlassCard 
                            key={i} 
                            variant="sovereign" 
                            glow="gold"
                            className="p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.label}</span>
                                <stat.icon className="w-5 h-5 text-sovereign-gold-400" />
                            </div>
                            <div className="text-2xl font-black text-white">{stat.value}</div>
                        </GlassCard>
                    ))}
                </div>

                {/* Features Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    {/* Plan Features */}
                    <GlassCard variant="luminous" glow="sovereign" className="p-8">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-sovereign-gold-400" />
                            Your Features
                        </h3>
                        <div className="space-y-4">
                            {currentPlan.features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-2 h-2 bg-sovereign-gold-400 rounded-full" />
                                    <span className="text-gray-300">{feature}</span>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Quick Actions */}
                    <GlassCard variant="luminous" glow="gold" className="p-8">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <LayoutDashboard className="w-6 h-6 text-sovereign-gold-400" />
                            Quick Actions
                        </h3>
                        <div className="space-y-4">
                            <Link href="/ecommerce-setup">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="p-4 bg-sovereign-sun-100/10 border border-sovereign-gold-500/20 rounded-xl cursor-pointer hover:border-sovereign-gold-500/40 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Settings className="w-5 h-5 text-sovereign-gold-400" />
                                            <span className="text-white">Configure Store</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                    </div>
                                </motion.div>
                            </Link>
                            
                            <Link href="/merchant-payment">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="p-4 bg-sovereign-sun-100/10 border border-sovereign-gold-500/20 rounded-xl cursor-pointer hover:border-sovereign-gold-500/40 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="w-5 h-5 text-sovereign-gold-400" />
                                            <span className="text-white">Payment Settings</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                    </div>
                                </motion.div>
                            </Link>

                            {userTier === 'FREE' && (
                                <Link href="/plan-selection">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="p-4 bg-gradient-to-r from-sovereign-gold-500/20 to-sovereign-gold-600/20 border border-sovereign-gold-500/40 rounded-xl cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Lock className="w-5 h-5 text-sovereign-gold-400" />
                                                <span className="text-sovereign-gold-400 font-medium">Upgrade to Pro</span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-sovereign-gold-400" />
                                        </div>
                                    </motion.div>
                                </Link>
                            )}
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    );
}
