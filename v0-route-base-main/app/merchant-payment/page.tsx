"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { ArrowRight, Check, CreditCard, ShoppingBag, Shield, AlertCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function MerchantPaymentPage() {
  const searchParams = useSearchParams()
  const merchantId = searchParams.get('id') || 'demo'
  
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    name: "",
    expiry: "",
    cvc: "",
    email: "",
    amount: ""
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!paymentData.name.trim()) {
      newErrors.name = "Cardholder name is required"
    }
    
    if (!paymentData.cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required"
    } else if (paymentData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = "Card number must be at least 16 digits"
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
    
    if (!paymentData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    if (!paymentData.amount.trim()) {
      newErrors.amount = "Amount is required"
    } else if (parseFloat(paymentData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePayment = async () => {
    if (!validateForm()) return
    
    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setPaymentSuccess(true)
    }, 3000)
  }

  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim()
    setPaymentData(prev => ({ ...prev, cardNumber: formatted }))
  }

  const handleExpiryChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      const formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
      setPaymentData(prev => ({ ...prev, expiry: formatted }))
    } else {
      setPaymentData(prev => ({ ...prev, expiry: cleaned }))
    }
  }

  const handleCvcChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4)
    setPaymentData(prev => ({ ...prev, cvc: cleaned }))
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
              Your payment of PKR {paymentData.amount} has been processed successfully.
            </p>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-6">
              <p className="text-sm text-emerald-400">
                Transaction ID: TXN{Date.now()}
              </p>
              <p className="text-sm text-emerald-400">
                Merchant ID: {merchantId}
              </p>
            </div>
            <Button 
              onClick={() => window.close()}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              Close Window
            </Button>
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
                <ShoppingBag className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Secure Payment</h2>
                <p className="text-muted-foreground">
                  Complete your purchase securely
                </p>
              </div>
            </div>

            {/* Merchant Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-400">Merchant</p>
                  <p className="font-bold">RouteBase Merchant</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-400">Merchant ID</p>
                  <p className="font-bold">{merchantId}</p>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Cardholder Name</Label>
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="customer@example.com"
                    value={paymentData.email}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-white/5 border-white/10"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="amount">Amount (PKR)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                  className="bg-white/5 border-white/10"
                />
                {errors.amount && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.amount}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  className="bg-white/5 border-white/10"
                />
                {errors.cardNumber && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.cardNumber}
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

            {/* Action Button */}
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-emerald-500 hover:bg-emerald-600 mt-8"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Payment...
                </div>
              ) : (
                <>
                  Pay PKR {paymentData.amount || '0'}
                  <CreditCard className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
