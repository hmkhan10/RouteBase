"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, CreditCard, Zap, Crown, Gem, Rocket } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

const saasPlans = [
  {
    id: "saas-pro",
    name: "SaaS Pro",
    price: "450",
    period: "/month",
    description: "For SaaS startups with recurring billing needs",
    features: [
      "Subscription billing",
      "Basic metrics", 
      "Webhook integrations",
      "3% transaction fee",
      "Email support"
    ],
    icon: Zap,
    color: "blue",
    popular: false
  },
  {
    id: "saas-max", 
    name: "SaaS Max",
    price: "4,500",
    period: "/month",
    description: "Enterprise-grade subscription management",
    features: [
      "Advanced analytics",
      "Churn prediction",
      "MRR/ARR tracking", 
      "Retention dashboard",
      "3% transaction fee",
      "Dedicated support"
    ],
    icon: Crown,
    color: "emerald",
    popular: true
  }
]

export default function SaaSPaymentPage() {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<typeof saasPlans[0] | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
    name: ""
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const handlePlanSelect = (plan: typeof saasPlans[0]) => {
    setSelectedPlan(plan)
    setShowCheckout(true)
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setPaymentSuccess(true)
    }, 3000)
  }

  // Remove authentication check - allow direct access

  if (paymentSuccess) {
    // Check if user is logged in after successful payment
    if (!user) {
      return (
        <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-10 rounded-3xl text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black mb-4">Payment Successful!</h2>
              <p className="text-muted-foreground mb-6">
                You now have access to {selectedPlan?.name} features. Please sign in to continue setup.
              </p>
              <div className="space-y-3">
                <Link href={`/login?redirect=setup-saas&plan=${selectedPlan?.id}`}>
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                    Sign In to Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline" className="w-full border-white/10">
                    Create New Account
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )
    }

    // User is logged in - show setup link
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-10 rounded-3xl text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black mb-4">Payment Successful!</h2>
            <p className="text-muted-foreground mb-8">
              You now have access to {selectedPlan?.name} features
            </p>
            <Link href="/setup-saas">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                Configure Your SaaS
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </GlassCard>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <Rocket className="w-4 h-4" />
            SaaS Payment Plans
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Choose Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}SaaS Plan
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your SaaS business and start accepting recurring payments today.
          </p>
        </motion.div>

        {/* Plans Grid */}
        {!showCheckout && (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {saasPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 rounded-full text-xs font-bold uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <GlassCard className={`p-8 rounded-2xl h-full cursor-pointer transition-all hover:border-${plan.color}-500/50 ${
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
                      plan.popular 
                        ? "bg-blue-500 hover:bg-blue-600" 
                        : "bg-white/5 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    Select Plan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Checkout Form */}
        {showCheckout && selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <GlassCard className="p-8 rounded-3xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Complete Payment</h2>
                  <p className="text-muted-foreground">
                    Pay for {selectedPlan.name} - PKR {selectedPlan.price}{selectedPlan.period}
                  </p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white/5 rounded-xl p-6 mb-6">
                <h3 className="font-bold mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span>{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span>PKR {selectedPlan.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fee:</span>
                    <span>PKR 0</span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>PKR {selectedPlan.price}</span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={paymentData.name}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={paymentData.expiry}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, expiry: e.target.value }))}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={paymentData.cvc}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cvc: e.target.value }))}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-xs text-amber-400">
                  <strong>Security Note:</strong> Your card details are processed securely and are not stored in our database.
                </p>
              </div>

              <div className="flex gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 border-white/10"
                >
                  Back to Plans
                </Button>
                
                <Button
                  onClick={handlePayment}
                  disabled={!paymentData.name || !paymentData.cardNumber || !paymentData.expiry || !paymentData.cvc || isProcessing}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  {isProcessing ? "Processing..." : `Pay PKR ${selectedPlan.price}`}
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}
