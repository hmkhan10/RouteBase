"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CreditCard, Check, Crown, Zap, Shield, Star } from "lucide-react"

const plans = [
  {
    name: "SaaS Pro",
    price: "450",
    period: "/month",
    features: [
      "Up to 1,000 customers",
      "Advanced analytics dashboard", 
      "Priority customer support",
      "Custom branding options",
      "API access",
      "Webhook integrations"
    ],
    icon: Zap,
    color: "blue",
    popular: false
  },
  {
    name: "SaaS Max",
    price: "4,500", 
    period: "/month",
    features: [
      "Unlimited customers",
      "Enterprise-grade analytics",
      "Dedicated account manager",
      "White-label solution",
      "Advanced API access",
      "Custom integrations",
      "Priority SLA support"
    ],
    icon: Crown,
    color: "emerald",
    popular: true
  }
]

export default function SaaSPayPreviewPage() {
  const [selectedPlan, setSelectedPlan] = useState(plans[0])
  const [paymentData, setPaymentData] = useState({
    email: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    name: ""
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setPaymentSuccess(true)
    }, 3000)
  }

  if (paymentSuccess) {
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
              Welcome to {selectedPlan.name}. Your subscription is now active.
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-sm text-emerald-400">Transaction ID</p>
                <p className="font-mono text-xs">TXN-{Date.now()}-SAAS</p>
              </div>
              <Button 
                onClick={() => window.close()}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
              >
                Close Window
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.close()}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-black mb-2">Choose Your SaaS Plan</h1>
          <p className="text-muted-foreground">Select the perfect plan for your business needs</p>
        </motion.div>

        {/* Plans Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard 
                className={`p-6 rounded-2xl cursor-pointer transition-all ${
                  selectedPlan.name === plan.name 
                    ? "border-emerald-500/50 bg-emerald-500/5" 
                    : "border-white/10 hover:border-white/20"
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                {plan.popular && (
                  <div className="flex justify-center mb-4">
                    <Badge className="bg-emerald-500 hover:bg-emerald-600">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <plan.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-3xl font-black">PKR {plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    selectedPlan.name === plan.name
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-white/5 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {selectedPlan.name === plan.name ? "Selected" : "Select Plan"}
                </Button>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Payment Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (GST):</span>
                  <span>PKR {Math.floor(parseInt(selectedPlan.price) * 0.18)}</span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>PKR {Math.floor(parseInt(selectedPlan.price) * 1.18)}</span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={paymentData.email}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-white/5 border-white/10"
                />
              </div>

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

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-400 font-medium mb-1">Secure Payment</p>
                  <p className="text-xs text-amber-300">
                    Your payment information is encrypted and processed securely. We do not store your card details.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={!paymentData.email || !paymentData.name || !paymentData.cardNumber || !paymentData.expiry || !paymentData.cvc || isProcessing}
              className="w-full mt-8 bg-emerald-500 hover:bg-emerald-600 py-4"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Payment...
                </span>
              ) : (
                `Pay PKR ${Math.floor(parseInt(selectedPlan.price) * 1.18)}`
              )}
            </Button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" />
                SSL Secured
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Star className="w-3 h-3" />
                Trusted by 1000+ SaaS
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="w-3 h-3" />
                Instant Activation
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
