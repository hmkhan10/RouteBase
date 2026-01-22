'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { ArrowRight, Check, Globe, Mail, Shield, Copy, CheckCircle, ShoppingBag, CreditCard, LayoutDashboard } from "lucide-react"

export default function EcommerceSetupPage() {
  const { user, isAuthenticated } = useAuth()
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

  const handleWebsiteSetup = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate URL format
    const urlPattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
    if (!urlPattern.test(setupData.websiteUrl)) {
      alert("Please enter a valid website URL")
      return
    }
    
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
    } else {
      alert("Invalid OTP. Please try again.")
    }
  }

  const handleGenerateCodes = () => {
    // Generate unique merchant URL
    const merchantUrl = `https://routebase.com/merchant/${user?.id}`
    setMerchantUrl(merchantUrl)
    setShowCodes(true)
  }

  const handleCopyCode = (code: string, type: 'button' | 'cart') => {
    navigator.clipboard.writeText(code)
    if (type === 'button') {
      setCopiedButton(true)
      setTimeout(() => setCopiedButton(false), 2000)
    } else {
      setCopiedCart(true)
      setTimeout(() => setCopiedCart(false), 2000)
    }
  }

  const cartButtonCode = `<!-- RouteBase Cart Button -->
<button id="routebase-cart-btn" 
        style="background: #10b981; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
  View Cart
</button>

<script>
document.getElementById('routebase-cart-btn').addEventListener('click', function() {
  window.open('https://routebase.com/cart/${user?.id}', '_blank');
});
</script>`

  const cartPageCode = `<!-- RouteBase Cart Page -->
<!DOCTYPE html>
<html>
<head>
    <title>Your Shopping Cart</title>
    <style>
        .cart-container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .cart-item { display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid #eee; }
        .cart-total { font-size: 18px; font-weight: bold; margin-top: 20px; }
        .checkout-btn { background: #10b981; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="cart-container">
        <h2>Your Shopping Cart</h2>
        <div id="cart-items">
            <!-- Cart items will be loaded here -->
        </div>
        <div class="cart-total">
            Total: $<span id="total-amount">0.00</span>
        </div>
        <button class="checkout-btn" onclick="proceedToCheckout()">
            Proceed to Checkout
        </button>
    </div>

    <script>
        // Load cart items from RouteBase API
        fetch('https://routebase.com/api/cart/${user?.id}')
            .then(response => response.json())
            .then(data => {
                displayCartItems(data.items);
            });

        function displayCartItems(items) {
            // Display cart items logic here
        }

        function proceedToCheckout() {
            window.location.href = 'https://routebase.com/checkout/${user?.id}';
        }
    </script>
</body>
</html>`

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Please Login First</h1>
          <p className="text-muted-foreground mb-8">You need to be logged in to setup your e-commerce store.</p>
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
      
      <div className="max-w-4xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">E-commerce Setup</h1>
            <p className="text-xl text-muted-foreground mb-8">Setup your e-commerce payment system</p>
            
            {/* Progress Steps */}
            <div className="flex justify-center items-center gap-4 mb-8">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-500' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-emerald-500 text-white' : 'bg-gray-700'}`}>
                  1
                </div>
                <span className="text-sm font-medium">Website Info</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-700"></div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-500' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-emerald-500 text-white' : 'bg-gray-700'}`}>
                  2
                </div>
                <span className="text-sm font-medium">Email Verification</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-700"></div>
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-500' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-emerald-500 text-white' : 'bg-gray-700'}`}>
                  3
                </div>
                <span className="text-sm font-medium">Get Codes</span>
              </div>
            </div>
          </div>

          {/* Step 1: Website Setup */}
          {step === 1 && (
            <GlassCard className="max-w-2xl mx-auto p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Globe className="w-6 h-6 text-emerald-500" />
                Website Information
              </h2>
              
              <form onSubmit={handleWebsiteSetup} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Website Name
                  </label>
                  <input
                    type="text"
                    value={setupData.websiteName}
                    onChange={(e) => setSetupData(prev => ({ ...prev, websiteName: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="My Awesome Store"
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
                    placeholder="https://www.mystore.com or www.mystore.com"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepts both www.mystore.com and https://www.mystore.com formats
                  </p>
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
                    placeholder="contact@mystore.com"
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

          {/* Step 2: Email Verification */}
          {step === 2 && (
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

                <div className="text-center">
                  <button
                    onClick={() => setStep(1)}
                    className="text-emerald-400 hover:text-emerald-300 text-sm"
                  >
                    ← Back to Website Setup
                  </button>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Step 3: Generated Codes & Merchant URL */}
          {step === 3 && (
            <div className="space-y-8">
              <GlassCard className="max-w-4xl mx-auto p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  Your Integration Codes & Merchant URL
                </h2>
                
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-emerald-400 font-medium">Email Verified Successfully!</span>
                  </div>
                </div>

                {/* Merchant URL Section */}
                <div className="mb-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h3 className="text-lg font-bold mb-4 text-blue-400">Your Merchant URL</h3>
                  <div className="bg-black/50 border border-white/10 rounded-lg p-4 mb-4">
                    <pre className="text-sm text-blue-400 overflow-x-auto whitespace-pre-wrap break-all">
                      {merchantUrl}
                    </pre>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => navigator.clipboard.writeText(merchantUrl)}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Cart Button Code */}
                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-emerald-500" />
                      Cart Button Code
                    </h3>
                    <div className="bg-black/50 border border-white/10 rounded-lg p-4">
                      <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
                        {cartButtonCode}
                      </pre>
                    </div>
                    <Button
                      onClick={() => handleCopyCode(cartButtonCode, 'button')}
                      className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600"
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
                    <div className="bg-black/50 border border-white/10 rounded-lg p-4">
                      <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
                        {cartPageCode}
                      </pre>
                    </div>
                    <Button
                      onClick={() => handleCopyCode(cartPageCode, 'cart')}
                      className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600"
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

                {/* Platform Buttons */}
                <div className="mt-8 p-6 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <h4 className="text-lg font-bold mb-4 text-purple-400">Platform Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => window.open('/merchant-dashboard?type=ecommerce', '_blank')}
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
                      Visit Merchant Page
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
                    <li>5. Use the buttons above to access your dashboard or merchant page</li>
                  </ol>
                </div>
              </GlassCard>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
