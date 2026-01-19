"use client"

import { use, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { notFound } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { GlassCard } from "@/components/glass-card"
import { PageTransition } from "@/components/page-transition"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Users, Zap, Target, BarChart3 } from "lucide-react"

interface AnalyticsPageProps {
    params: Promise<{ merchant_slug: string }>
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
    const { merchant_slug } = use(params)
    const [merchant, setMerchant] = useState<any>(null)
    const [metrics, setMetrics] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const merchantData = await apiClient.get<any>(`/api/merchants/${merchant_slug}`)
                setMerchant(merchantData)

                const data = await apiClient.getEcommerceMetrics(merchant_slug)
                setMetrics(data)
            } catch (error) {
                console.error("Failed to fetch analytics data:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [merchant_slug])

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-10 w-48 bg-white/5 rounded" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
                </div>
                <div className="h-[400px] bg-white/5 rounded-3xl" />
            </div>
        )
    }

    if (!merchant) {
        notFound()
    }

    const customerData = [
        { name: "New", value: 45 },
        { name: "Returning", value: 55 },
    ]

    return (
        <PageTransition>
            <div className="space-y-8">
                <header>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-black uppercase tracking-tight"
                    >
                        Advanced Analytics
                    </motion.h1>
                    <p className="text-muted-foreground mt-1">Deep insights for {merchant.businessName || merchant.store_name}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GlassCard className="p-6 rounded-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Unique Customers</p>
                                <h3 className="text-2xl font-black">1,284</h3>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[70%]" />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 rounded-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Conversion Rate</p>
                                <h3 className="text-2xl font-black">3.2%</h3>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[45%]" />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 rounded-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Target className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Avg. Order Value</p>
                                <h3 className="text-2xl font-black">Rs. 4,500</h3>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 w-[60%]" />
                        </div>
                    </GlassCard>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    <GlassCard className="p-8 rounded-3xl">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-emerald-400" />
                            Customer Distribution
                        </h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metrics?.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                                    <YAxis stroke="#64748B" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#0F1218", border: "1px solid rgba(255,255,255,0.1)" }}
                                    />
                                    <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-8 rounded-3xl">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-400" />
                            Growth Velocity
                        </h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={metrics?.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                                    <YAxis stroke="#64748B" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#0F1218", border: "1px solid rgba(255,255,255,0.1)" }}
                                    />
                                    <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} dot={{ fill: "#3B82F6" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </PageTransition>
    )
}
