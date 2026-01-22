'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { usePayment } from "@/lib/payment-context"
import { useAuth } from "@/lib/auth-context"
import { ArrowRight, Check, Crown, Store, CreditCard, Loader2, Lock, Mail, User, Globe, Shield } from "lucide-react"

const plans = [
  {
    id: "basic-monthly",
    name: "Basic",
    price: "$0",
    period: "month",
    description: "Perfect for small businesses",
    features: ["Payment links", "Basic checkout", "Email support"],
    popular: false,
    color: "from-gray-500 to-gray-600"
  },
  {
    id: "pro-monthly",
    name: "Ecommerce Pro", 
    price: "$29",
    period: "month",
    description: "Advanced features for growing businesses",
    features: ["Everything in Basic", "Advanced analytics", "Priority support", "Custom branding"],
    popular: true,
    color: "from-emerald-500 to-emerald-600"
  },
  {
    id: "saas-monthly",
    name: "SaaS Max",
    price: "$99", 
    period: "month",
    description: "Complete solution for large enterprises",
    features: ["Everything in Pro", "API access", "White labeling", "Dedicated support"],
    popular: false,
    color: "from-purple-500 to-purple-600"
  }
]

export default function PaymentPage() {
  const { user, isAuthenticated } = useAuth()
  const { currentPlan, startPayment, confirmPayment, isLoading } = usePayment()
  const [selectedPlan, setSelectedPlan] = useState("")
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentData, setPaymentData] = useState({
    planName: "",
    fullName: "",
    email: "",
    accountNumber: "",
    expiryDate: "",
    cvv: "",
    website: ""
  })

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    setShowPaymentForm(true)
    const plan = plans.find(p => p.id === planId)
    if (plan) {
      setPaymentData(prev => ({
        ...prev,
        planName: plan.name
      }))
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!paymentData.fullName || !paymentData.email || !paymentData.accountNumber) {
      alert("Please fill in all required fields")
      return
    }

    startPayment("ecommerce-pro" as any)
    
    // Simulate payment processing
    setTimeout(() => {
      confirmPayment("mock-payment-token")
    }, 2000)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Please Login First</h1>
          <p className="text-muted-foreground mb-8">You need to be logged in to access payment page.</p>
          <Link href="/login">
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0C10]">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Choose Your Plan</h1>
            <p className="text-xl text-muted-foreground mb-8">Select perfect plan for your business needs</p>
          </div>

          {!showPaymentForm ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {plans.map((plan) => (
                <GlassCard key={plan.id} className={`p-8 rounded-2xl border-2 ${plan.popular ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10'}`}>
                  <div className="text-center">
                    {plan.popular && (
                      <div className="inline-block bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                        MOST POPULAR
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <span className="text-4xl font-black">{plan.price}</span>
                      <span className="text-lg text-muted-foreground">/{plan.period}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4">{plan.name}</h3>
                    <p className="text-muted-foreground mb-6">{plan.description}</p>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      onClick={() => handlePlanSelect(plan.id)}
                      className={`w-full py-3 font-bold rounded-lg transition-all ${
                        plan.popular 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                          : 'bg-white hover:bg-gray-100 text-black border border-gray-300'
                      }`}
                    >
                      {plan.popular ? (
                        <span className="flex items-center justify-center gap-2">
                          <Crown className="w-4 h-4" />
                          Get Started
                        </span>
                      ) : (
                        "Get Started"
                      )}
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="max-w-2xl mx-auto p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Payment Details</h2>
              
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Selected Plan
                  </label>
                  <div className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg">
                    {paymentData.planName}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={paymentData.fullName}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-black"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={paymentData.email}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-black"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={paymentData.accountNumber}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-black"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={paymentData.expiryDate}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-black"
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-black"
                      placeholder="123"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={paymentData.website}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-black"
                    placeholder="https://yourwebsite.com"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Complete Payment"
                  )}
                </Button>
              </form>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  )
}
