"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, Globe, Mail, CreditCard, Code, ShoppingCart, Store } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export default function PaymentSetupPage() {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    websiteName: "",
    websiteUrl: "",
    email: "",
    verificationCode: "",
    planType: "ecommerce" as "ecommerce" | "saas"
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [showCodes, setShowCodes] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSendVerification = async () => {
    setIsLoading(true)
    // Simulate sending verification code
    setTimeout(() => {
      setIsLoading(false)
      alert(`Verification code sent to ${formData.email}`)
    }, 2000)
  }

  const handleVerifyCode = async () => {
    setIsLoading(true)
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false)
      setIsVerified(true)
      setShowCodes(true)
    }, 1500)
  }

  const cartButtonCode = `<script src="https://routebase.com/cart-button.js"></script>
<button class="routebase-cart-btn" data-merchant-id="${user?.id}">
  View Cart (${0})
</button>`

  const cartPageCode = `<script src="https://routebase.com/cart-page.js"></script>
<div id="routebase-cart-container" data-merchant-id="${user?.id}">
  <!-- Cart will be rendered here -->
</div>`

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6">
        <GlassCard className="p-10 rounded-3xl text-center max-w-md">
          <h2 className="text-2xl font-black mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">Please sign in to set up payments</p>
          <Link href="/login">
            <Button className="w-full">Sign In</Button>
          </Link>
        </GlassCard>
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
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <CreditCard className="w-4 h-4" />
            Payment Setup
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Configure Your
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              {" "}Payment System
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Set up your payment infrastructure and get your JavaScript codes to integrate RouteBases into your website.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i <= step ? "bg-emerald-500 text-black" : "bg-white/10 text-muted-foreground"
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i}
                </div>
                {i < 3 && (
                  <div className={`w-12 h-0.5 mx-2 transition-colors ${
                    i < step ? "bg-emerald-500" : "bg-white/10"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Website Information */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GlassCard className="p-8 rounded-3xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Website Information</h2>
                  <p className="text-muted-foreground">Tell us about your website</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="websiteName">Website Name</Label>
                  <Input
                    id="websiteName"
                    placeholder="My Awesome Store"
                    value={formData.websiteName}
                    onChange={(e) => handleInputChange("websiteName", e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div>
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    placeholder="www.example.com or https://www.example.com"
                    value={formData.websiteUrl}
                    onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Both www and https formats are accepted
                  </p>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    We'll send a verification code to this email
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!formData.websiteName || !formData.websiteUrl || !formData.email}
                className="w-full mt-8 bg-emerald-500 hover:bg-emerald-600"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </GlassCard>
          </motion.div>
        )}

        {/* Step 2: Email Verification */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GlassCard className="p-8 rounded-3xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Email Verification</h2>
                  <p className="text-muted-foreground">Verify your email address</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Verification code sent to:</span>
                  <Badge variant="outline">{formData.email}</Badge>
                </div>
                
                <div>
                  <Label htmlFor="verificationCode">Enter Verification Code</Label>
                  <Input
                    id="verificationCode"
                    placeholder="123456"
                    value={formData.verificationCode}
                    onChange={(e) => handleInputChange("verificationCode", e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleSendVerification}
                  variant="outline"
                  disabled={isLoading}
                  className="flex-1 border-white/10"
                >
                  {isLoading ? "Sending..." : "Resend Code"}
                </Button>
                
                <Button
                  onClick={handleVerifyCode}
                  disabled={!formData.verificationCode || isLoading || isVerified}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
              </div>

              {isVerified && (
                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-3 text-emerald-400">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Email verified successfully!</span>
                  </div>
                </div>
              )}
            </GlassCard>

            {isVerified && (
              <Button
                onClick={() => setStep(3)}
                className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600"
              >
                Get Your Codes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </motion.div>
        )}

        {/* Step 3: JavaScript Codes */}
        {step === 3 && showCodes && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GlassCard className="p-8 rounded-3xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Code className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Your Integration Codes</h2>
                  <p className="text-muted-foreground">Copy these codes to your website</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Cart Button Code */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <ShoppingCart className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold">Cart Button Code</h3>
                    <Badge variant="outline">Required</Badge>
                  </div>
                  <div className="bg-black/50 border border-white/10 rounded-xl p-4">
                    <pre className="text-sm text-emerald-400 overflow-x-auto">
                      {cartButtonCode}
                    </pre>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Add this to your product pages where you want the cart button to appear
                  </p>
                </div>

                {/* Cart Page Code */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Store className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-bold">Cart Page Code</h3>
                    <Badge variant="outline">Required</Badge>
                  </div>
                  <div className="bg-black/50 border border-white/10 rounded-xl p-4">
                    <pre className="text-sm text-blue-400 overflow-x-auto">
                      {cartPageCode}
                    </pre>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Add this to your dedicated cart page where users view their items
                  </p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-sm text-amber-400">
                  <strong>Important:</strong> Your customers will be directed to your RouteBases payment page where they can securely complete their purchases using various payment methods.
                </p>
              </div>

              <Link href="/dashboard">
                <Button className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}
