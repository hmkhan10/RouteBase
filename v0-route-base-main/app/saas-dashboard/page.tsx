"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Settings, 
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  Zap,
  Crown,
  RefreshCcw,
  FileText,
  Mail,
  Globe,
  RefreshCw,
  ArrowLeft,
  BanknoteIcon
} from "lucide-react"

const mockMetrics = {
  totalRevenue: 125000,
  activeSubscriptions: 450,
  monthlyRecurringRevenue: 45000,
  churnRate: 2.3,
  customerAcquisitionCost: 120,
  lifetimeValue: 2400,
  averageRevenuePerUser: 100
}

const recentTransactions = [
  { id: 1, customer: "John Doe", amount: 4500, plan: "SaaS Max", date: "2025-01-21", status: "success" },
  { id: 2, customer: "Jane Smith", amount: 450, plan: "SaaS Pro", date: "2025-01-21", status: "success" },
  { id: 3, customer: "Bob Johnson", amount: 450, plan: "SaaS Pro", date: "2025-01-20", status: "success" },
  { id: 4, customer: "Alice Brown", amount: 4500, plan: "SaaS Max", date: "2025-01-20", status: "failed" },
]

const revenueData = [
  { month: "Jan", revenue: 35000 },
  { month: "Feb", revenue: 42000 },
  { month: "Mar", revenue: 38000 },
  { month: "Apr", revenue: 45000 },
  { month: "May", revenue: 52000 },
  { month: "Jun", revenue: 48000 },
]

export default function SaaSDashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const handlePreviewPayment = () => {
    // Open payment preview in new window
    window.open('/saas-pay-preview', '_blank', 'width=400,height=600')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6">
        <GlassCard className="p-10 rounded-3xl text-center max-w-md">
          <h2 className="text-2xl font-black mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">Please sign in to access your SaaS dashboard</p>
          <Link href="/login">
            <Button className="w-full">Sign In</Button>
          </Link>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-black mb-2">SaaS Dashboard</h1>
            <p className="text-muted-foreground">Manage your subscription business</p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-white/10"
            >
              <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handlePreviewPayment} className="bg-blue-500 hover:bg-blue-600">
              <Eye className="w-4 h-4 mr-2" />
              Preview Payment Page
            </Button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          {["overview", "transactions", "analytics", "settings", "payments"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 capitalize font-medium transition-colors ${
                activeTab === tab
                  ? "text-emerald-400 border-b-2 border-emerald-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Revenue", value: `PKR ${mockMetrics.totalRevenue.toLocaleString()}`, icon: DollarSign, change: "+12%", positive: true },
                { label: "Active Subscriptions", value: mockMetrics.activeSubscriptions.toString(), icon: Users, change: "+8%", positive: true },
                { label: "MRR", value: `PKR ${mockMetrics.monthlyRecurringRevenue.toLocaleString()}`, icon: TrendingUp, change: "+15%", positive: true },
                { label: "Churn Rate", value: `${mockMetrics.churnRate}%`, icon: ArrowDownRight, change: "-2%", positive: false },
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <metric.icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <Badge variant={metric.positive ? "default" : "destructive"} className="text-xs">
                        {metric.change}
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{metric.value}</h3>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {/* Revenue Chart */}
            <GlassCard className="p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-6">Revenue Overview</h3>
              <div className="h-64 flex items-end justify-between gap-4">
                {revenueData.map((data, index) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-emerald-500/20 rounded-t-lg relative"
                      style={{ height: `${(data.revenue / 60000) * 100}%` }}
                    >
                      <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg opacity-80" />
                    </div>
                    <span className="text-xs text-muted-foreground">{data.month}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Recent Transactions */}
            <GlassCard className="p-8 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Recent Transactions</h3>
                <Link href="/transactions">
                  <Button variant="outline" size="sm" className="border-white/10">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${transaction.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <div>
                        <p className="font-medium">{transaction.customer}</p>
                        <p className="text-sm text-muted-foreground">{transaction.plan}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">PKR {transaction.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="space-y-8">
            <GlassCard className="p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-6">All Transactions</h3>
              <div className="space-y-4">
                {[...recentTransactions, ...recentTransactions].map((transaction, index) => (
                  <div key={`${transaction.id}-${index}`} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${transaction.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <div>
                        <p className="font-medium">{transaction.customer}</p>
                        <p className="text-sm text-muted-foreground">{transaction.plan} • {transaction.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">PKR {transaction.amount.toLocaleString()}</span>
                      <Badge variant={transaction.status === 'success' ? 'default' : 'destructive'}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard className="p-8 rounded-2xl">
                <h3 className="text-xl font-bold mb-6">Customer Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Customer Acquisition Cost</span>
                    <span className="font-bold">PKR {mockMetrics.customerAcquisitionCost}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Lifetime Value</span>
                    <span className="font-bold">PKR {mockMetrics.lifetimeValue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Average Revenue Per User</span>
                    <span className="font-bold">PKR {mockMetrics.averageRevenuePerUser}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">LTV:CAC Ratio</span>
                    <span className="font-bold text-emerald-400">20:1</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-8 rounded-2xl">
                <h3 className="text-xl font-bold mb-6">Subscription Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">SaaS Pro</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-white/10 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }} />
                      </div>
                      <span className="font-bold">70%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">SaaS Max</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-white/10 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '30%' }} />
                      </div>
                      <span className="font-bold">30%</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            <GlassCard className="p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-6">SaaS Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Business Name</label>
                  <input
                    type="text"
                    defaultValue="My SaaS Business"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Support Email</label>
                  <input
                    type="email"
                    defaultValue="support@example.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Website URL</label>
                  <input
                    type="url"
                    defaultValue="https://mysaas.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  Save Settings
                </Button>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/refunds">
                <GlassCard className="p-6 rounded-2xl hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                      <RefreshCw className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold">Refunds</h3>
                      <p className="text-sm text-muted-foreground">Manage refunds and returns</p>
                    </div>
                  </div>
                </GlassCard>
              </Link>

              <Link href="/payouts">
                <GlassCard className="p-6 rounded-2xl hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <BanknoteIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold">Payouts</h3>
                      <p className="text-sm text-muted-foreground">Request and track payouts</p>
                    </div>
                  </div>
                </GlassCard>
              </Link>

              <Link href="/webhooks">
                <GlassCard className="p-6 rounded-2xl hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <Globe className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-bold">Webhooks</h3>
                      <p className="text-sm text-muted-foreground">Configure webhook notifications</p>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </div>

            <GlassCard className="p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-6">Payment Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm">Automated Refund Processing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm">Instant Payout Requests</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm">Real-time Webhook Events</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm">Multiple Payment Methods</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm">Secure API Endpoints</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm">Detailed Transaction Logs</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  )
}
