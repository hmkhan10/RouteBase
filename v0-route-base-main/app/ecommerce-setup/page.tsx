"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { ArrowRight, Check, Globe, Mail, Shield, Copy, CheckCircle, ShoppingBag, CreditCard, LayoutDashboard, AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export default function EcommerceSetupPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const planType = searchParams.get('plan') || 'ecommerce-free'
  
  const [step, setStep] = useState(1)
  const [setupData, setSetupData] = useState({
    websiteName: "",
    websiteUrl: "",
    email: ""
  })
  const [otp, setOtp] = useState("")
  const [generatedOtp, setGeneratedOtp] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [showCodes, setShowCodes] = useState(false)
  const [copiedButton, setCopiedButton] = useState(false)
  const [copiedCart, setCopiedCart] = useState(false)
  const [merchantUrl, setMerchantUrl] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Check user subscription tier
  const [userTier, setUserTier] = useState('FREE')
  
  useEffect(() => {
    if (isAuthenticated) {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}')
      setUserTier(userData.subscription_tier || 'FREE')
    }
  }, [isAuthenticated])

  const validateWebsiteSetup = () => {
    const newErrors: Record<string, string> = {}
    
    if (!setupData.websiteName.trim()) {
      newErrors.websiteName = "Website name is required"
    }
    
    if (!setupData.websiteUrl.trim()) {
      newErrors.websiteUrl = "Website URL is required"
    } else {
      const urlPattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
      if (!urlPattern.test(setupData.websiteUrl)) {
        newErrors.websiteUrl = "Please enter a valid website URL"
      }
    }
    
    if (!setupData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(setupData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleWebsiteSetup = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateWebsiteSetup()) return
    
    setStep(2)
  }

  const handleSendOtp = () => {
    // Generate 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(newOtp)
    setIsOtpSent(true)
    
    // In real implementation, send OTP to email
    console.log(`OTP sent to ${setupData.email}: ${newOtp}`)
    alert(`OTP sent to ${setupData.email}: ${newOtp} (for testing)`)
  }

  const handleVerifyOtp = () => {
    if (otp === generatedOtp) {
      setIsVerified(true)
      setStep(3)
      handleGenerateCodes()
    } else {
      setErrors({ otp: "Invalid OTP. Please try again." })
    }
  }

  const handleGenerateCodes = () => {
    // Generate unique merchant URL
    const merchantId = user?.id || Math.random().toString(36).substr(2, 9)
    const url = `https://routebase.io/p/${merchantId}`
    setMerchantUrl(url)
    setShowCodes(true)
  }

  const handleCopyCode = (code: string, type: 'button' | 'cart' | 'url') => {
    navigator.clipboard.writeText(code)
    
    if (type === 'button') {
      setCopiedButton(true)
      setTimeout(() => setCopiedButton(false), 2000)
    } else if (type === 'cart') {
      setCopiedCart(true)
      setTimeout(() => setCopiedCart(false), 2000)
    }
  }

  // Generate integration codes
  const cartButtonCode = `<!-- RouteBase Cart Button -->
<button onclick="window.open('${merchantUrl}', '_blank')" 
        style="background: linear-gradient(135deg, #10b981, #059669); 
               color: white; 
               padding: 12px 24px; 
               border: none; 
               border-radius: 8px; 
               font-weight: bold; 
               cursor: pointer;
               font-size: 16px;">
  🛒 Add to Cart
</button>`

  const cartPageCode = `<!-- RouteBase Cart Embed -->
<iframe src="${merchantUrl}/cart" 
        style="width: 100%; 
               height: 600px; 
               border: none; 
               border-radius: 12px;
               box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
</iframe>`

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6">
        <GlassCard className="p-10 rounded-3xl text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please login to set up your e-commerce store.
          </p>
          <Button 
            onClick={() => router.push('/login?redirect=ecommerce-setup')}
            className="w-full bg-emerald-500 hover:bg-emerald-600"
          >
            Login to Continue
          </Button>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] p-6">
      <Navbar />
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-black mb-2">
            {planType === 'ecommerce-pro' ? 'Pro' : 'Free'} E-commerce Setup
          </h1>
          <p className="text-muted-foreground">
            {planType === 'ecommerce-pro' 
              ? 'Configure your professional e-commerce payment solution'
              : 'Set up your free e-commerce payment solution'
            }
          </p>
          
          {/* Plan Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-500/20">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-medium">
              {userTier === 'PRO' ? 'PRO PLAN ACTIVE' : 'FREE PLAN ACTIVE'}
            </span>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  step >= stepNumber 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-white/10 text-muted-foreground'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-8 h-0.5 ${
                    step > stepNumber ? 'bg-emerald-500' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Website Setup */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GlassCard className="p-8 rounded-3xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Globe className="w-6 h-6 text-emerald-500" />
                Website Information
              </h2>
              
              <form onSubmit={handleWebsiteSetup} className="space-y-6">
                <div>
                  <Label htmlFor="websiteName">Website Name</Label>
                  <Input
                    id="websiteName"
                    placeholder="My Awesome Store"
                    value={setupData.websiteName}
                    onChange={(e) => setSetupData(prev => ({ ...prev, websiteName: e.target.value }))}
                    className="bg-white/5 border-white/10"
                  />
                  {errors.websiteName && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.websiteName}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    placeholder="https://mystore.com"
                    value={setupData.websiteUrl}
                    onChange={(e) => setSetupData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                    className="bg-white/5 border-white/10"
                  />
                  {errors.websiteUrl && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.websiteUrl}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Merchant Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="merchant@mystore.com"
                    value={setupData.email}
                    onChange={(e) => setSetupData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-white/5 border-white/10"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  Send Verification Email
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GlassCard className="p-8 rounded-3xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Mail className="w-6 h-6 text-emerald-500" />
                Email Verification
              </h2>
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-muted-foreground mb-2">
                  We've sent a 6-digit verification code to:
                </p>
                <p className="font-bold text-emerald-400">{setupData.email}</p>
              </div>

              {!isOtpSent ? (
                <Button
                  onClick={handleSendOtp}
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  Send OTP
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="otp">Enter 6-digit OTP</Label>
                    <Input
                      id="otp"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="bg-white/5 border-white/10 text-center text-2xl font-bold tracking-widest"
                      maxLength={6}
                    />
                    {errors.otp && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.otp}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={otp.length !== 6}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                    >
                      Verify OTP
                      <Check className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      onClick={handleSendOtp}
                      variant="outline"
                      className="border-white/10"
                    >
                      Resend OTP
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-center mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="text-emerald-400 hover:text-emerald-300 text-sm"
                >
                  ← Back to Website Setup
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Step 3: Generated Codes & Merchant URL */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <GlassCard className="p-8 rounded-3xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                Your Integration Assets
              </h2>
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-emerald-400 font-medium">Email Verified Successfully!</span>
                </div>
              </div>

              {/* Merchant URL Section */}
              <div className="mb-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h3 className="text-lg font-bold mb-4 text-blue-400">Your Unique Payment URL</h3>
                <div className="bg-black/50 border border-white/10 rounded-lg p-4 mb-4">
                  <pre className="text-sm text-blue-400 overflow-x-auto whitespace-pre-wrap break-all">
                    {merchantUrl}
                  </pre>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleCopyCode(merchantUrl, 'url')}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                  <Button
                    onClick={() => window.open(merchantUrl, '_blank')}
                    variant="outline"
                    className="flex-1 border-white/10"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit URL
                  </Button>
                </div>
              </div>

              {/* Integration Codes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Cart Button Code */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-500" />
                    Cart Button Code
                  </h3>
                  <div className="bg-black/50 border border-white/10 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto">
                    <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
                      {cartButtonCode}
                    </pre>
                  </div>
                  <Button
                    onClick={() => handleCopyCode(cartButtonCode, 'button')}
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                  >
                    {copiedButton ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Copied!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Copy className="w-4 h-4" />
                        Copy Button Code
                      </span>
                    )}
                  </Button>
                </div>

                {/* Cart Page Code */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-500" />
                    Cart Page Code
                  </h3>
                  <div className="bg-black/50 border border-white/10 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto">
                    <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
                      {cartPageCode}
                    </pre>
                  </div>
                  <Button
                    onClick={() => handleCopyCode(cartPageCode, 'cart')}
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                  >
                    {copiedCart ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Copied!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Copy className="w-4 h-4" />
                        Copy Cart Code
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Platform Actions */}
              <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <h4 className="text-lg font-bold mb-4 text-purple-400">Platform Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => router.push('/dashboard?plan=' + planType)}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Visit Dashboard
                  </Button>
                  <Button
                    onClick={() => window.open(merchantUrl, '_blank')}
                    variant="outline"
                    className="border-white/10"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Payment Page
                  </Button>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-lg font-bold mb-3 text-blue-400">Next Steps:</h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li>1. Copy the Cart Button code and paste it on your website</li>
                  <li>2. Copy the Cart Page code and create a cart page on your website</li>
                  <li>3. Test the integration by clicking the cart button</li>
                  <li>4. Your customers will be directed to your RouteBase payment page</li>
                  <li>5. Use the buttons above to access your dashboard or payment page</li>
                </ol>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}
