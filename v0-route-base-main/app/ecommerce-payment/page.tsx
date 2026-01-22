"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, CreditCard, Store, Crown, Gem, Rocket, ShoppingBag, Lock } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

const ecommercePlans = [
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
    name: "Ecommerce Pro",
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

export default function EcommercePaymentPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<typeof ecommercePlans[0] | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentData, setPaymentData] = useState({
    name: "",
    accountNumber: "",
    expiry: "",
    cvc: ""
  })

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const groups = cleaned.match(/.{1,4}/g) || []
    return groups.join(' ').substr(0, 19) // Max 19 chars (16 digits + 3 spaces)
  }

  // Format expiry date with auto slash
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned.slice(0, 2)
  }

  // Handle card number input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setPaymentData(prev => ({ ...prev, accountNumber: formatted }))
  }

  // Handle expiry date input
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value)
    setPaymentData(prev => ({ ...prev, expiry: formatted }))
  }

  // Handle CVC input (numbers only, max 3 digits)
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 3)
    setPaymentData(prev => ({ ...prev, cvc: cleaned }))
  }

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const handlePlanSelect = (plan: typeof ecommercePlans[0]) => {
    if (plan.isFree) {
      // Free plan - require login then go to dashboard
      if (!isAuthenticated) {
        router.push('/login?redirect=dashboard&plan=ecommerce-free')
      } else {
        router.push('/dashboard?plan=ecommerce-free')
      }
      return
    }
    
    setSelectedPlan(plan)
    setShowCheckout(true)
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setPaymentSuccess(true)
      
      // Store guest payment info in localStorage for later
      if (!isAuthenticated) {
        localStorage.setItem('guestPayment', JSON.stringify({
          plan: selectedPlan?.id,
          amount: selectedPlan?.price,
          timestamp: new Date().toISOString(),
          paymentData: {
            name: paymentData.name,
            last4: paymentData.accountNumber.slice(-4)
          }
        }))
      }
    }, 3000)
  }

  // Free plan direct to dashboard
  if (selectedPlan?.isFree && isAuthenticated) {
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
            <h2 className="text-2xl font-black mb-4">Free Plan Activated!</h2>
            <p className="text-muted-foreground mb-8">
              You now have access to E-commerce Free features
            </p>
            <Link href="/dashboard?plan=ecommerce-free">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </GlassCard>
        </motion.div>
      </div>
    )
  }

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
                You now have access to {selectedPlan?.name} features. Your payment has been processed successfully.
              </p>
              
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
                <p className="text-xs text-emerald-400 mb-2">
                  <strong>Payment Details:</strong>
                </p>
                <div className="text-xs text-emerald-300 space-y-1">
                  <p>Plan: {selectedPlan?.name}</p>
                  <p>Amount: PKR {selectedPlan?.price}</p>
                  <p>Card: ****{paymentData.accountNumber.slice(-4)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link href={`/login?redirect=setup-ecommerce&plan=${selectedPlan?.id}`}>
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                    Sign In to Setup Your Store
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline" className="w-full border-white/10">
                    Create New Account
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={() => window.location.href = 'mailto:support@routebase.com'}
                >
                  Need Help? Contact Support
                </Button>
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
            <Link href="/setup-ecommerce">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                Configure Your E-commerce Store
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <ShoppingBag className="w-4 h-4" />
            E-commerce Payment Plans
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Choose Your
            <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              {" "}E-commerce Plan
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your e-commerce business and start accepting payments with a fully integrated shopping cart.
          </p>
        </motion.div>

        {/* Guest Payment Notice */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GlassCard className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-amber-400 font-medium">
                    <strong>Guest Payment Available:</strong> You can make payments without creating an account. Your payment details are secure and processed immediately.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Plans Grid */}
        {!showCheckout && (
          <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
            {ecommercePlans.map((plan, index) => (
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
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-emerald-400" />
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
                  <Label htmlFor="name">Account Holder Name</Label>
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
                    value={paymentData.accountNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    className="bg-white/5 border-white/10 font-mono text-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={paymentData.expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      className="bg-white/5 border-white/10 font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={paymentData.cvc}
                      onChange={handleCvcChange}
                      maxLength={3}
                      className="bg-white/5 border-white/10 font-mono"
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
                  disabled={!paymentData.name || !paymentData.accountNumber || !paymentData.expiry || !paymentData.cvc || isProcessing}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
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
