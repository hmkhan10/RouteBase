'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { ArrowRight, Check, Globe, Mail, Shield, Copy, CheckCircle, CreditCard, Tag, Calendar, DollarSign } from "lucide-react"

const saasPlans = [
  {
    id: "saas-starter",
    name: "SaaS Starter",
    price: "$29",
    period: "month",
    description: "Perfect for small SaaS businesses",
    features: ["Up to 100 customers", "Basic analytics", "Email support"],
    popular: false
  },
  {
    id: "saas-pro",
    name: "SaaS Pro",
    price: "$99",
    period: "month",
    description: "For growing SaaS companies",
    features: ["Up to 1000 customers", "Advanced analytics", "Priority support", "Custom branding"],
    popular: true
  },
  {
    id: "saas-enterprise",
    name: "SaaS Enterprise",
    price: "$299",
    period: "month",
    description: "Complete solution for large enterprises",
    features: ["Unlimited customers", "Full analytics", "Dedicated support", "White labeling", "API access"],
    popular: false
  }
]

const tagColors = [
  { name: "Blue", value: "blue", bg: "bg-blue-500", text: "text-blue-400" },
  { name: "Green", value: "green", bg: "bg-green-500", text: "text-green-400" },
  { name: "Red", value: "red", bg: "bg-red-500", text: "text-red-400" },
  { name: "Purple", value: "purple", bg: "bg-purple-500", text: "text-purple-400" }
]

export default function SaasSetupPage() {
  const { user, isAuthenticated } = useAuth()
  const [step, setStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState("")
  const [setupData, setSetupData] = useState({
    websiteName: "",
    websiteUrl: "",
    planType: "monthly",
    planAmount: "",
    planHeadings: "",
    tags: [] as string[],
    email: ""
  })
  const [paymentData, setPaymentData] = useState({
    accountNumber: "",
    expiryDate: "",
    cvv: ""
  })
  const [otp, setOtp] = useState("")
  const [generatedOtp, setGeneratedOtp] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [showCodes, setShowCodes] = useState(false)
  const [copiedPayButton, setCopiedPayButton] = useState(false)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [paymentCompleted, setPaymentCompleted] = useState(false)

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    const plan = saasPlans.find(p => p.id === planId)
    if (plan) {
      setSetupData(prev => ({
        ...prev,
        planAmount: plan.price.replace("$", ""),
        planHeadings: plan.features.join(", ")
      }))
    }
    setStep(2)
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsPaymentProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentCompleted(true)
      setIsPaymentProcessing(false)
      setStep(3)
    }, 2000)
  }

  const handleSaasSetup = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(4)
  }

  const handleSendOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(newOtp)
    setIsOtpSent(true)
    
    console.log(`OTP sent to ${setupData.email}: ${newOtp}`)
    alert(`OTP sent to ${setupData.email}: ${newOtp} (for testing)`)
  }

  const handleVerifyOtp = () => {
    if (otp === generatedOtp) {
      setIsVerified(true)
      setStep(5)
    } else {
      alert("Invalid OTP. Please try again.")
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedPayButton(true)
    setTimeout(() => setCopiedPayButton(false), 2000)
  }

  const payButtonCode = `<!-- RouteBase SaaS Pay Button -->
<button id="routebase-pay-btn" 
        style="background: #10b981; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
  Subscribe to ${setupData.planType === 'monthly' ? 'Monthly' : 'Yearly'} Plan - $${setupData.planAmount}
</button>

<script>
document.getElementById('routebase-pay-btn').addEventListener('click', function() {
  window.open('https://routebase.com/saas-pay/${user?.id}', '_blank');
});
</script>`

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Please Login First</h1>
          <p className="text-muted-foreground mb-8">You need to be logged in to setup your SaaS business.</p>
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
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">SaaS Setup</h1>
            <p className="text-xl text-muted-foreground mb-8">Setup your SaaS payment system</p>
          </div>

          {/* Step 1: Plan Selection */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {saasPlans.map((plan) => (
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
                      Select Plan
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <GlassCard className="max-w-2xl mx-auto p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-emerald-500" />
                Complete Payment
              </h2>
              
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400 font-medium">Selected Plan:</span>
                  <span className="text-white font-bold">{saasPlans.find(p => p.id === selectedPlan)?.name}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-emerald-400 font-medium">Amount:</span>
                  <span className="text-white font-bold">{saasPlans.find(p => p.id === selectedPlan)?.price}/{saasPlans.find(p => p.id === selectedPlan)?.period}</span>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={paymentData.accountNumber}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
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
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
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
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="123"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isPaymentProcessing}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg"
                >
                  {isPaymentProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Pay ${saasPlans.find(p => p.id === selectedPlan)?.price}`
                  )}
                </Button>
              </form>
            </GlassCard>
          )}

          {/* Step 3: SaaS Setup */}
          {step === 3 && (
            <GlassCard className="max-w-2xl mx-auto p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Globe className="w-6 h-6 text-emerald-500" />
                SaaS Configuration
              </h2>
              
              <form onSubmit={handleSaasSetup} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Website Name
                    </label>
                    <input
                      type="text"
                      value={setupData.websiteName}
                      onChange={(e) => setSetupData(prev => ({ ...prev, websiteName: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="My SaaS App"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={setupData.websiteUrl}
                      onChange={(e) => setSetupData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="https://www.mysaas.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Plan Type
                    </label>
                    <select
                      value={setupData.planType}
                      onChange={(e) => setSetupData(prev => ({ ...prev, planType: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Plan Amount ($)
                    </label>
                    <input
                      type="number"
                      value={setupData.planAmount}
                      onChange={(e) => setSetupData(prev => ({ ...prev, planAmount: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="99"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Plan Features (comma separated)
                  </label>
                  <textarea
                    value={setupData.planHeadings}
                    onChange={(e) => setSetupData(prev => ({ ...prev, planHeadings: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="Feature 1, Feature 2, Feature 3"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Plan Tags
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {tagColors.map((tag) => (
                      <label key={tag.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setupData.tags.includes(tag.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSetupData(prev => ({ ...prev, tags: [...prev.tags, tag.value] }))
                            } else {
                              setSetupData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag.value) }))
                            }
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${tag.bg} ${tag.text}`}>
                          {tag.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={setupData.email}
                    onChange={(e) => setSetupData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="contact@mysaas.com"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg"
                >
                  Continue to Email Verification
                </Button>
              </form>
            </GlassCard>
          )}

          {/* Step 4: Email Verification */}
          {step === 4 && (
            <GlassCard className="max-w-2xl mx-auto p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Mail className="w-6 h-6 text-emerald-500" />
                Email Verification
              </h2>
              
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    We've sent a verification code to:
                  </p>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg">
                    <span className="text-emerald-400 font-medium">{setupData.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-2xl font-mono"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleVerifyOtp}
                    className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg"
                  >
                    Verify Code
                  </Button>
                  
                  <Button
                    onClick={handleSendOtp}
                    variant="outline"
                    className="flex-1 py-4 border-white/20 hover:bg-white/10 text-white font-bold rounded-lg"
                  >
                    Resend Code
                  </Button>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Step 5: Generated Code */}
          {step === 5 && (
            <GlassCard className="max-w-4xl mx-auto p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                Your SaaS Pay Button Code
              </h2>
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-emerald-400 font-medium">Setup Completed Successfully!</span>
                </div>
              </div>

              <div className="bg-black/50 border border-white/10 rounded-lg p-4 mb-6">
                <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
                  {payButtonCode}
                </pre>
              </div>

              <Button
                onClick={() => handleCopyCode(payButtonCode)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 mb-6"
              >
                {copiedPayButton ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Copied!
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Copy className="w-4 h-4" />
                    Copy Pay Button Code
                  </span>
                )}
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="text-lg font-bold mb-3 text-blue-400">Your SaaS Details:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Website:</span>
                      <span className="text-white">{setupData.websiteName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan Type:</span>
                      <span className="text-white capitalize">{setupData.planType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="text-white">${setupData.planAmount}/{setupData.planType}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <h4 className="text-lg font-bold mb-3 text-purple-400">Next Steps:</h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li>1. Copy the pay button code</li>
                    <li>2. Add it to your SaaS website</li>
                    <li>3. Test the payment flow</li>
                    <li>4. Start accepting payments!</li>
                  </ol>
                </div>
              </div>

              <div className="text-center mt-8">
                <Link href="/merchant-dashboard?type=saas&message=SaaS setup completed successfully!">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 px-8">
                    Go to SaaS Dashboard
                  </Button>
                </Link>
              </div>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  )
}
