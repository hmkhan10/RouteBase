'use client';

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { 
  LayoutDashboard, 
  Settings, 
  CreditCard, 
  Users, 
  Activity, 
  ShieldCheck,
  ShoppingCart,
  Package,
  TrendingUp,
  DollarSign,
  Copy,
  CheckCircle,
  Code,
  Globe,
  ArrowRight,
  Brain,
  Zap,
  Crown,
  AlertTriangle,
  BarChart3,
  Lightbulb,
  Target
} from "lucide-react"

interface GhomoudInsight {
  type: 'warning' | 'opportunity' | 'trend' | 'recommendation'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  suggested_action?: string
}

export default function MerchantDashboardPage() {
  const searchParams = useSearchParams()
  const planType = searchParams.get('type') || 'ecommerce'
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [ghomoudInsights, setGhomoudInsights] = useState<GhomoudInsight[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [userTier, setUserTier] = useState<'FREE' | 'PRO'>('FREE')

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setWelcomeMessage(message)
    }
    
    // Get user tier from database (simulated)
    fetchUserTier()
    
    // Fetch insights for PRO users
    if (userTier === 'PRO') {
      fetchGhomoudInsights()
    }
  }, [searchParams, userTier])

  const fetchUserTier = async () => {
    try {
      const response = await fetch('/api/user/subscription')
      const data = await response.json()
      setUserTier(data.subscription_tier || 'FREE')
    } catch (error) {
      console.error('Failed to fetch user tier:', error)
    }
  }

  const fetchGhomoudInsights = async () => {
    setInsightsLoading(true)
    try {
      // Simulate API call to get AI insights
      setTimeout(() => {
        const mockInsights: GhomoudInsight[] = [
          {
            type: 'warning',
            title: 'Conversion Rate Drop',
            description: 'Your conversion rate dropped by 15% on Tuesday. Check your mobile checkout speed.',
            impact: 'high',
            actionable: true,
            suggested_action: 'Optimize Mobile Checkout'
          },
          {
            type: 'opportunity',
            title: 'Peak Traffic Opportunity',
            description: 'Most purchases happen between 8-10 PM. Consider running targeted ads during this window.',
            impact: 'medium',
            actionable: true,
            suggested_action: 'Schedule Evening Campaign'
          },
          {
            type: 'trend',
            title: 'Mobile Usage Increase',
            description: 'Mobile transactions increased by 32% this week. Ensure mobile experience is optimized.',
            impact: 'medium',
            actionable: false
          },
          {
            type: 'recommendation',
            title: 'Cart Abandonment Recovery',
            description: '23% of users abandon carts with value > PKR 5,000. Implement email recovery sequence.',
            impact: 'high',
            actionable: true,
            suggested_action: 'Setup Recovery Emails'
          }
        ]
        setGhomoudInsights(mockInsights)
        setInsightsLoading(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to fetch insights:', error)
      setInsightsLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />
      case 'opportunity': return <TrendingUp className="w-5 h-5 text-emerald-500" />
      case 'trend': return <BarChart3 className="w-5 h-5 text-blue-500" />
      case 'recommendation': return <Lightbulb className="w-5 h-5 text-purple-500" />
      default: return <Brain className="w-5 h-5 text-gray-500" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-red-500 bg-red-500/10'
      case 'medium': return 'border-amber-500 bg-amber-500/10'
      case 'low': return 'border-blue-500 bg-blue-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const isEcommerce = planType === 'ecommerce'
  
  // Sample integration codes
  const cartButtonCode = `<!-- RouteBase Cart Button -->
<button id="routebase-cart-btn" 
        style="background: #10b981; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
  View Cart (${isEcommerce ? '3' : '0'} items)
</button>

<script>
document.getElementById('routebase-cart-btn').addEventListener('click', function() {
  window.open('https://routebase.com/cart/${planType}', '_blank');
});
</script>`

  const paymentButtonCode = `<!-- RouteBase Payment Button -->
<button id="routebase-pay-btn" 
        style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
  ${isEcommerce ? 'Checkout' : 'Subscribe'} Now
</button>

<script>
document.getElementById('routebase-pay-btn').addEventListener('click', function() {
  window.open('https://routebase.com/pay/${planType}', '_blank');
});
</script>`

  const stats = isEcommerce ? [
    { label: 'Total Sales', value: 'PKR 45,230', icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Orders', value: '127', icon: ShoppingCart, color: 'text-blue-400' },
    { label: 'Products', value: '48', icon: Package, color: 'text-purple-400' },
    { label: 'Conversion Rate', value: '3.2%', icon: TrendingUp, color: 'text-orange-400' },
  ] : [
    { label: 'Monthly Revenue', value: 'PKR 89,450', icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Active Subscribers', value: '234', icon: Users, color: 'text-blue-400' },
    { label: 'MRR Growth', value: '+12%', icon: TrendingUp, color: 'text-green-400' },
    { label: 'Churn Rate', value: '2.1%', icon: Activity, color: 'text-red-400' },
  ]

  return (
    <div className="min-h-screen bg-[#0A0C10] p-20">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">
              {isEcommerce ? 'E-commerce' : 'SaaS'} Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your {isEcommerce ? 'online store' : 'subscription business'} and track performance.
            </p>
            {welcomeMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
              >
                <p className="text-emerald-400 font-medium">{welcomeMessage}</p>
              </motion.div>
            )}
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-2 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs">
              {isEcommerce ? 'ECOMMERCE PRO' : 'SAAS PRO'} ACTIVE
            </span>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <GlassCard key={i} className="p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">{stat.label}</span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-black">{stat.value}</div>
            </GlassCard>
          ))}
        </div>

        {/* Ghomoud AI Insights (PRO Only) */}
        {userTier === 'PRO' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <GlassCard className="p-8 rounded-3xl border-purple-500/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Brain className="w-6 h-6 text-purple-500" />
                  Ghomoud AI Insights
                </h3>
                <Button
                  onClick={fetchGhomoudInsights}
                  disabled={insightsLoading}
                  variant="outline"
                  className="border-white/10"
                >
                  {insightsLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {insightsLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Analyzing your business data...</p>
                </div>
              ) : ghomoudInsights.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {ghomoudInsights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className={`p-4 rounded-xl border ${getImpactColor(insight.impact)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                          {insight.actionable && insight.suggested_action && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-white/10"
                            >
                              {insight.suggested_action}
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-purple-500/20 mx-auto mb-4" />
                  <p className="text-muted-foreground">No insights available yet. Check back after more transactions.</p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* Upgrade Prompt for FREE Users */}
        {userTier === 'FREE' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <GlassCard className="p-8 rounded-3xl border-amber-500/10 bg-gradient-to-r from-amber-500/5 to-purple-500/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-3 mb-2">
                    <Crown className="w-6 h-6 text-amber-500" />
                    Unlock Ghomoud AI Insights
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Get AI-powered business intelligence, fraud detection, and advanced analytics with PRO plan.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">AI Business Insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">Advanced Fraud Detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Predictive Analytics</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => window.location.href = '/plan-selection'}
                    className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                  >
                    Upgrade to PRO
                    <Crown className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="hidden lg:block">
                  <Brain className="w-24 h-24 text-purple-500/20" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Integration Codes */}
          <GlassCard className="p-8 rounded-3xl border-white/5">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Code className="w-5 h-5 text-muted-foreground" />
              Integration Codes
            </h3>
            
            <div className="space-y-6">
              {isEcommerce && (
                <div>
                  <h4 className="font-medium mb-3 text-emerald-400">Cart Button Code</h4>
                  <div className="bg-black/50 border border-white/10 rounded-lg p-4 mb-3">
                    <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
                      {cartButtonCode}
                    </pre>
                  </div>
                  <Button
                    onClick={() => handleCopyCode(cartButtonCode)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                  >
                    {copiedCode ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Cart Code Copied!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Copy className="w-4 h-4" />
                        Copy Cart Code
                      </span>
                    )}
                  </Button>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-3 text-blue-400">
                  {isEcommerce ? 'Checkout Button' : 'Payment Button'} Code
                </h4>
                <div className="bg-black/50 border border-white/10 rounded-lg p-4 mb-3">
                  <pre className="text-xs text-blue-400 overflow-x-auto whitespace-pre-wrap">
                    {paymentButtonCode}
                  </pre>
                </div>
                <Button
                  onClick={() => handleCopyCode(paymentButtonCode)}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  {copiedCode ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Payment Code Copied!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Copy className="w-4 h-4" />
                      Copy Payment Code
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard className="p-8 rounded-3xl border-white/5">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Settings className="w-5 h-5 text-muted-foreground" />
              Quick Actions
            </h3>
            
            <div className="space-y-4">
              {isEcommerce ? (
                <>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Add Product</h4>
                      <p className="text-xs text-muted-foreground">Add new products to your store</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Manage Orders</h4>
                      <p className="text-xs text-muted-foreground">View and process customer orders</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Customer Management</h4>
                      <p className="text-xs text-muted-foreground">Manage customer data and preferences</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Sales Analytics</h4>
                      <p className="text-xs text-muted-foreground">View detailed sales reports</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Subscription Plans</h4>
                      <p className="text-xs text-muted-foreground">Manage pricing tiers and features</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Subscriber Management</h4>
                      <p className="text-xs text-muted-foreground">View and manage subscribers</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Revenue Analytics</h4>
                      <p className="text-xs text-muted-foreground">Track MRR and ARR metrics</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Billing Settings</h4>
                      <p className="text-xs text-muted-foreground">Configure payment and billing</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Recent Activity */}
        <GlassCard className="mt-8 p-8 rounded-3xl border-white/5">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Activity className="w-5 h-5 text-muted-foreground" />
            Recent Activity
          </h3>
          
          <div className="space-y-4">
            {isEcommerce ? (
              <>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div className="flex-1">
                    <h4 className="font-medium">New Order</h4>
                    <p className="text-sm text-muted-foreground">Order #1234 - PKR 2,450</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 mins ago</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <div className="flex-1">
                    <h4 className="font-medium">Product Added</h4>
                    <p className="text-sm text-muted-foreground">Wireless Headphones added to catalog</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 hour ago</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div className="flex-1">
                    <h4 className="font-medium">Payment Received</h4>
                    <p className="text-sm text-muted-foreground">Order #1233 - PKR 1,890</p>
                  </div>
                  <span className="text-xs text-muted-foreground">3 hours ago</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div className="flex-1">
                    <h4 className="font-medium">New Subscriber</h4>
                    <p className="text-sm text-muted-foreground">john@example.com - Pro Plan</p>
                  </div>
                  <span className="text-xs text-muted-foreground">5 mins ago</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div className="flex-1">
                    <h4 className="font-medium">Subscription Renewed</h4>
                    <p className="text-sm text-muted-foreground">sarah@example.com - Monthly Plan</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="flex-1">
                    <h4 className="font-medium">Payment Failed</h4>
                    <p className="text-sm text-muted-foreground">mike@example.com - Retry scheduled</p>
                  </div>
                  <span className="text-xs text-muted-foreground">4 hours ago</span>
                </div>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
