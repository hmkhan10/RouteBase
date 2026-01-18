"use client"

import { motion } from "framer-motion"
import { GlassCard } from "./glass-card"
import { Button } from "@/components/ui/button"
import type { Merchant, SaaSMetrics } from "@/lib/types"
import {
  Users,
  TrendingDown,
  RefreshCcw,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Calendar,
} from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface SaaSDashboardProps {
  merchant: Merchant
  metrics: SaaSMetrics
}

export function SaaSDashboard({ merchant, metrics }: SaaSDashboardProps) {
  const retentionData = [
    { name: "Retained", value: metrics.retentionRate, color: "#10B981" },
    { name: "Churned", value: metrics.churnRate, color: "#EF4444" },
  ]

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
            SaaS Intelligence
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            Subscription analytics for <span className="text-purple-400 font-bold">{merchant.businessName}</span>
          </p>
        </div>
        <Button className="bg-purple-500 hover:bg-purple-600 font-bold uppercase tracking-widest text-xs px-6">
          <FileText className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard glow="purple" className="p-6 rounded-2xl h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> 8%
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Monthly Recurring
            </p>
            <h2 className="text-3xl font-black text-purple-400">Rs. {(metrics.mrr / 1000).toFixed(0)}k</h2>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="p-6 rounded-2xl h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Annual Recurring
            </p>
            <h2 className="text-3xl font-black text-blue-400">Rs. {(metrics.arr / 1000000).toFixed(1)}M</h2>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard glow="emerald" className="p-6 rounded-2xl h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> 24
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Active Subscribers
            </p>
            <h2 className="text-3xl font-black text-emerald-400">{metrics.activeSubscribers}</h2>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard className="p-6 rounded-2xl h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" /> 0.3%
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Churn Rate</p>
            <h2 className="text-3xl font-black text-red-400">{metrics.churnRate}%</h2>
          </GlassCard>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-8 rounded-3xl h-full">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-bold">MRR Growth</h3>
                <p className="text-muted-foreground text-sm">Monthly recurring revenue trend</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs border-white/10 bg-transparent">
                  7D
                </Button>
                <Button variant="ghost" size="sm" className="text-xs opacity-50">
                  30D
                </Button>
              </div>
            </div>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData}>
                  <defs>
                    <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
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
                    }}
                    formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, "MRR"]}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#8B5CF6" strokeWidth={3} fill="url(#colorMRR)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Retention Donut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <GlassCard className="p-8 rounded-3xl h-full">
            <h3 className="text-lg font-bold mb-2">Retention Rate</h3>
            <p className="text-muted-foreground text-sm mb-6">Subscriber retention this month</p>

            <div className="h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={retentionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {retentionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-black text-emerald-400">{metrics.retentionRate}%</span>
                <span className="text-xs text-muted-foreground font-bold uppercase">Retained</span>
              </div>
            </div>

            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold">Retained</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs font-bold">Churned</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Subscription Health */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <GlassCard className="p-8 rounded-3xl">
          <h3 className="text-lg font-bold mb-6">Subscription Health</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <RefreshCcw className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-emerald-400">Retention Rate</p>
                  <p className="text-xs text-muted-foreground">Monthly average</p>
                </div>
              </div>
              <p className="text-4xl font-black text-emerald-400">{metrics.retentionRate}%</p>
            </div>

            <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="font-bold text-red-400">Churn Rate</p>
                  <p className="text-xs text-muted-foreground">Monthly churn</p>
                </div>
              </div>
              <p className="text-4xl font-black text-red-400">{metrics.churnRate}%</p>
            </div>

            <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-bold text-purple-400">Net New Subs</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
              </div>
              <p className="text-4xl font-black text-purple-400">+24</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
