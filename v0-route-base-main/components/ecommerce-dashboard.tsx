"use client"

import { motion } from "framer-motion"
import { GlassCard } from "./glass-card"
import { Button } from "@/components/ui/button"
import type { Merchant, DashboardMetrics } from "@/lib/types"
import { TrendingUp, DollarSign, ShoppingCart, FileText, ArrowUpRight, Percent } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

interface EcommerceDashboardProps {
  merchant: Merchant
  metrics: DashboardMetrics
}

export function EcommerceDashboard({ merchant, metrics }: EcommerceDashboardProps) {
  const feePercentage = 3 // RouteBase 3% fee

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black uppercase tracking-tight"
          >
            Intelligence Suite
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            Ecommerce analytics for <span className="text-emerald-400 font-bold">{merchant.businessName}</span>
          </p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 font-bold uppercase tracking-widest text-xs px-6">
          <FileText className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="p-6 rounded-2xl h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> 12%
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Gross Volume</p>
            <h2 className="text-3xl font-black">Rs. {metrics.totalVolume.toLocaleString()}</h2>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard glow="emerald" className="p-6 rounded-2xl h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Merchant Profit
            </p>
            <h2 className="text-3xl font-black text-emerald-400">Rs. {metrics.merchantProfit.toLocaleString()}</h2>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className="p-6 rounded-2xl h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Percent className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              RouteBase Fee ({feePercentage}%)
            </p>
            <h2 className="text-3xl font-black text-blue-400">Rs. {metrics.totalFees.toLocaleString()}</h2>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard className="p-6 rounded-2xl h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Orders</p>
            <h2 className="text-3xl font-black">{metrics.transactionCount}</h2>
          </GlassCard>
        </motion.div>
      </div>

      {/* Revenue Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <GlassCard className="p-8 rounded-3xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold">Revenue Trend</h3>
              <p className="text-muted-foreground text-sm">Last 7 days performance</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs border-white/10 bg-transparent">
                7D
              </Button>
              <Button variant="ghost" size="sm" className="text-xs opacity-50">
                30D
              </Button>
              <Button variant="ghost" size="sm" className="text-xs opacity-50">
                90D
              </Button>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `Rs ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F1218",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                  }}
                  formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={3} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      {/* Fee Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <GlassCard className="p-8 rounded-3xl">
          <h3 className="text-lg font-bold mb-6">Fee Structure</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold">Total Sales Volume</p>
                  <p className="text-sm text-muted-foreground">Gross transaction amount</p>
                </div>
              </div>
              <span className="text-xl font-black">Rs. {metrics.totalVolume.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Percent className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-blue-400">RouteBase Platform Fee</p>
                  <p className="text-sm text-muted-foreground">{feePercentage}% of gross volume</p>
                </div>
              </div>
              <span className="text-xl font-black text-blue-400">- Rs. {metrics.totalFees.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-emerald-400">Net Merchant Revenue</p>
                  <p className="text-sm text-muted-foreground">After RouteBase deduction</p>
                </div>
              </div>
              <span className="text-2xl font-black text-emerald-400">
                Rs. {metrics.merchantProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
