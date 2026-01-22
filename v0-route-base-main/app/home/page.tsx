"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { RouteBasesLogo } from "@/components/routebase-logo"
import { ShoppingCart, Store, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-4xl mx-auto"
        >
          <div className="flex justify-center mb-8">
            <RouteBasesLogo size="lg" />
          </div>

          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight">
            RouteBases
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Marketplace
            </span>
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed">
            Experience the future of fintech e-commerce with our high-performance marketplace. 
            Powered by React Context for seamless state management and instant cart persistence.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Link href="/marketplace">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 font-bold uppercase tracking-widest px-8 py-6 text-lg"
              >
                <Store className="w-5 h-5 mr-2" />
                Browse Marketplace
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <Link href="/marketplace">
              <Button
                size="lg"
                variant="outline"
                className="border-white/10 bg-transparent font-bold uppercase tracking-widest px-8 py-6 text-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Start Shopping
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-bold mb-2">Persistent Cart</h3>
                <p className="text-sm text-muted-foreground">
                  Your cart survives browser refreshes with React Context + localStorage
                </p>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <Store className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-bold mb-2">Guest Checkout</h3>
                <p className="text-sm text-muted-foreground">
                  Streamlined multi-step checkout with smooth Framer Motion transitions
                </p>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-bold mb-2">Smart Filters</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time search and faceted filtering with inventory management
                </p>
              </GlassCard>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
