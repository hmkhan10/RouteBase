"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { ArrowRight, Check, CreditCard, Crown, Shield, AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

const proPlan = {
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
  ]
}

export default function EcommerceCheckoutPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  
  const [paymentData, setPaymentData] = useState({
    accountNumber: "",
    name: "",
    expiry: "",
    cvc: ""
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!paymentData.name.trim()) {
      newErrors.name = "Account holder name is required"
    }
    
    if (!paymentData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required"
    } else if (paymentData.accountNumber.replace(/\s/g, '').length < 16) {
      newErrors.accountNumber = "Account number must be at least 16 digits"
    }
    
    if (!paymentData.expiry.trim()) {
      newErrors.expiry = "Expiry date is required"
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentData.expiry)) {
      newErrors.expiry = "Expiry date must be in MM/YY format"
    }
    
    if (!paymentData.cvc.trim()) {
      newErrors.cvc = "CVC is required"
    } else if (paymentData.cvc.length < 3 || paymentData.cvc.length > 4) {
      newErrors.cvc = "CVC must be 3-4 digits"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePayment = async () => {
    if (!validateForm()) return
    
    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      // Update user subscription tier in database (simulated)
      const userData = JSON.parse(localStorage.getItem('userData') || '{}')
      userData.subscription_tier = 'PRO'
      localStorage.setItem('userData', JSON.stringify(userData))
      
      setIsProcessing(false)
      setPaymentSuccess(true)
    }, 3000)
  }

  const handleAccountNumberChange = (value: string) => {
    // Format account number with spaces
    const cleaned = value.replace(/\s/g, '')
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim()
    setPaymentData(prev => ({ ...prev, accountNumber: formatted }))
  }

  const handleExpiryChange = (value: string) => {
    // Format expiry date
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      const formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
      setPaymentData(prev => ({ ...prev, expiry: formatted }))
    } else {
      setPaymentData(prev => ({ ...prev, expiry: cleaned }))
    }
  }

  const handleCvcChange = (value: string) => {
    // Only allow digits
    const cleaned = value.replace(/\D/g, '').slice(0, 4)
    setPaymentData(prev => ({ ...prev, cvc: cleaned }))
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6">
        <GlassCard className="p-10 rounded-3xl text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please login to access the checkout page.
          </p>
          <Button 
            onClick={() => router.push('/login?redirect=ecommerce-checkout')}
            className="w-full bg-emerald-500 hover:bg-emerald-600"
          >
            Login to Continue
          </Button>
        </GlassCard>
      </div>
    )
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
            <p className="text-muted-foreground mb-6">
              Your E-commerce Pro subscription is now active. You have been upgraded to PRO tier.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/ecommerce-setup?plan=ecommerce-pro')}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
              >
                Continue to Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                onClick={() => router.push('/plan-selection')}
                variant="outline"
                className="w-full border-white/10"
              >
                Back to Plans
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] p-6">
      <Navbar />
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-8 rounded-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Crown className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Complete Your Pro Subscription</h2>
                <p className="text-muted-foreground">
                  Upgrade to {proPlan.name} - PKR {proPlan.price}{proPlan.period}
                </p>
              </div>
            </div>

            {/* Plan Summary */}
            <div className="bg-white/5 rounded-xl p-6 mb-8">
              <h3 className="font-bold mb-4">Plan Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan:</span>
                  <span>{proPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span>PKR {proPlan.price}{proPlan.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction Fee:</span>
                  <span>3%</span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total Due Today:</span>
                  <span>PKR {proPlan.price}</span>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 mb-8">
              <h3 className="font-bold mb-4 text-emerald-400">What You'll Get:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {proPlan.features.slice(0, 6).map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
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
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.accountNumber}
                  onChange={(e) => handleAccountNumberChange(e.target.value)}
                  className="bg-white/5 border-white/10"
                />
                {errors.accountNumber && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.accountNumber}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={paymentData.expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                  {errors.expiry && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.expiry}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={paymentData.cvc}
                    onChange={(e) => handleCvcChange(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                  {errors.cvc && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.cvc}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-400 font-medium mb-1">Secure Payment Processing</p>
                  <p className="text-xs text-amber-300">
                    Your payment information is encrypted and processed securely. We do not store your card details on our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => router.push('/plan-selection')}
                className="flex-1 border-white/10"
              >
                Back to Plans
              </Button>
              
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <>
                    Pay PKR {proPlan.price}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
