"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { ArrowRight, Check, Crown, Store, Lock, Zap, Shield, Globe, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"

const plans = [
  {
    id: "ecommerce-free",
    name: "E-commerce Free",
    price: "Free",
    period: "",
    description: "Perfect for small businesses just getting started",
    features: [
      "Payment links", 
      "Basic checkout", 
      "Email support", 
      "3% transaction fee",
      "Up to 50 orders/month",
      "Basic analytics"
    ],
    icon: Store,
    color: "gray",
    popular: false,
    isFree: true
  },
  {
    id: "ecommerce-pro",
    name: "E-commerce Pro",
    price: "2,200",
    period: "/month",
    description: "Full-featured e-commerce payment solution",
    features: [
      "Custom branded checkout",
      "Product catalog", 
      "Inventory management",
      "Advanced analytics dashboard",
      "3% transaction fee",
      "Priority support",
      "Unlimited orders",
      "Custom domain",
      "API access",
      "Abandoned cart recovery"
    ],
    icon: Crown,
    color: "emerald",
    popular: true,
    isFree: false
  }
]

export default function PlanSelectionPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null)

  const handlePlanSelect = (plan: typeof plans[0]) => {
    if (plan.isFree) {
      // Free plan - direct to setup
      router.push('/ecommerce-setup?plan=ecommerce-free')
    } else {
      // Pro plan - to payment
      router.push('/ecommerce-checkout?plan=ecommerce-pro')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6">
        <GlassCard className="p-10 rounded-3xl text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please login or register to select a plan.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/login?redirect=plan-selection')}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              Login
            </Button>
            <Button 
              onClick={() => router.push('/signup?redirect=plan-selection')}
              variant="outline"
              className="w-full border-white/10"
            >
              Register
            </Button>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] p-6">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Beruni Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Choose Your
            <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              {" "}E-commerce Plan
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your e-commerce business and start accepting payments with Beruni Intelligence.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 rounded-full text-xs font-bold uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              {plan.isFree && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-500 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  FREE
                </div>
              )}
              <GlassCard 
                className={`p-8 rounded-2xl h-full cursor-pointer transition-all hover:border-${plan.color}-500/50 ${
                  selectedPlan?.id === plan.id ? `border-${plan.color}-500/50` : ""
                }`}
                onClick={() => handlePlanSelect(plan)}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-${plan.color}-500/10 flex items-center justify-center`}>
                    <plan.icon className={`w-6 h-6 text-${plan.color}-400`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-muted-foreground">PKR</span>
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full font-bold uppercase tracking-widest text-xs py-5 ${
                    plan.isFree
                      ? "bg-gray-500 hover:bg-gray-600"
                      : plan.popular 
                      ? "bg-emerald-500 hover:bg-emerald-600" 
                      : "bg-white hover:bg-gray-100 text-black border border-gray-300"
                  }`}
                >
                  {plan.isFree ? "Get Started Free" : `Select Plan`}
                  {!plan.isFree && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <GlassCard className="p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Feature Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-500/10 flex items-center justify-center mx-auto mb-4">
                  <Store className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="font-bold mb-2">Free</h3>
                <p className="text-sm text-muted-foreground mb-4">Perfect for testing and small stores</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 50 orders/month</li>
                  <li>• Basic checkout</li>
                  <li>• Email support</li>
                </ul>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-bold mb-2">Pro</h3>
                <p className="text-sm text-muted-foreground mb-4">For growing businesses</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Unlimited orders</li>
                  <li>• Advanced analytics</li>
                  <li>• Priority support</li>
                </ul>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-bold mb-2">Enterprise</h3>
                <p className="text-sm text-muted-foreground mb-4">Coming soon</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Custom features</li>
                  <li>• Dedicated support</li>
                  <li>• SLA guarantee</li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
