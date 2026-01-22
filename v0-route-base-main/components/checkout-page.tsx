"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouteBases } from "@/components/routeBases-provider"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, ArrowRight, CreditCard, Truck, CheckCircle, ShoppingBag, Package } from "lucide-react"
import type { CartItem } from "@/lib/types"

interface ShippingAddress {
  name: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
}

export const CheckoutPage: React.FC = () => {
  const { state, simulatePaymentSuccess, clearCart } = useRouteBases()
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: ""
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const cartTotal = state.cartItems.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0)

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep(2)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    simulatePaymentSuccess({
      items: state.cartItems,
      totalAmount: cartTotal,
      status: "confirmed",
      shippingAddress
    })
    
    setIsProcessing(false)
    setCurrentStep(3)
  }

  const renderShippingStep = () => (
    <motion.div
      key="shipping"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Truck className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Shipping Information</h2>
          <p className="text-muted-foreground">Enter your delivery details</p>
        </div>
      </div>

      <form onSubmit={handleShippingSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={shippingAddress.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShippingAddress(prev => ({ ...prev, name: e.target.value }))}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={shippingAddress.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShippingAddress(prev => ({ ...prev, email: e.target.value }))}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={shippingAddress.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="address">Street Address</Label>
          <Input
            id="address"
            value={shippingAddress.address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
            required
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={shippingAddress.city}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              value={shippingAddress.postalCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShippingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
              required
              className="mt-1"
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600">
          Continue to Payment
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </motion.div>
  )

  const renderPaymentStep = () => (
    <motion.div
      key="payment"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Payment Information</h2>
          <p className="text-muted-foreground">Mock payment processing</p>
        </div>
      </div>

      <GlassCard className="p-6">
        <h3 className="font-bold mb-4">Order Summary</h3>
        <div className="space-y-3">
          {state.cartItems.map((item: CartItem) => (
            <div key={item.productId} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
          <div className="border-t border-white/10 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total</span>
              <span className="text-xl font-black text-emerald-400">Rs. {cartTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <form onSubmit={handlePaymentSubmit} className="space-y-4">
        <div>
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input
            id="cardNumber"
            placeholder="1234 5678 9012 3456"
            defaultValue="4242 4242 4242 4242"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input
              id="expiry"
              placeholder="MM/YY"
              defaultValue="12/25"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              placeholder="123"
              defaultValue="123"
              className="mt-1"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-blue-500 hover:bg-blue-600"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Processing Payment...
            </>
          ) : (
            <>
              Complete Purchase
              <CheckCircle className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      <Button 
        variant="outline" 
        onClick={() => setCurrentStep(1)}
        className="w-full"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Shipping
      </Button>
    </motion.div>
  )

  const renderConfirmationStep = () => (
    <motion.div
      key="confirmation"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto"
      >
        <CheckCircle className="w-10 h-10 text-emerald-400" />
      </motion.div>

      <div>
        <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
        <p className="text-muted-foreground">Thank you for your purchase</p>
      </div>

      <GlassCard className="p-6 text-left">
        <h3 className="font-bold mb-4">Order Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID:</span>
            <span className="font-mono">#{Date.now()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-bold text-emerald-400">Rs. {cartTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping to:</span>
            <span>{shippingAddress.name}</span>
          </div>
        </div>
      </GlassCard>

      <Button 
        onClick={() => window.location.href = "/"}
        className="w-full bg-emerald-500 hover:bg-emerald-600"
      >
        <ShoppingBag className="w-4 h-4 mr-2" />
        Continue Shopping
      </Button>
    </motion.div>
  )

  if (state.cartItems.length === 0 && currentStep !== 3) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-8 text-center max-w-md">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some products to get started</p>
          <Button onClick={() => window.location.href = "/"} className="bg-emerald-500 hover:bg-emerald-600">
            Browse Products
          </Button>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-black uppercase tracking-tight">Guest Checkout</h1>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step <= currentStep
                      ? "bg-emerald-500 text-white"
                      : "bg-white/10 text-muted-foreground"
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span className={currentStep >= 1 ? "text-emerald-400" : ""}>Shipping</span>
            <span>→</span>
            <span className={currentStep >= 2 ? "text-emerald-400" : ""}>Payment</span>
            <span>→</span>
            <span className={currentStep >= 3 ? "text-emerald-400" : ""}>Confirmation</span>
          </div>
        </motion.div>

        <GlassCard className="p-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderShippingStep()}
            {currentStep === 2 && renderPaymentStep()}
            {currentStep === 3 && renderConfirmationStep()}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  )
}
