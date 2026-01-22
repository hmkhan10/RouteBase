"use client"

import { useAuth } from "@/lib/auth-context"
import { usePayment } from "@/lib/payment-context"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { Lock, Crown, ArrowRight, CreditCard } from "lucide-react"
import Link from "next/link"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPlan?: "free" | "ecommerce-pro" | "saas-pro" | "saas-max"
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, requiredPlan = "free", fallback }: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth()
  const { isPro, saasActive } = usePayment()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <GlassCard variant="elevated" className="p-10 rounded-3xl text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-black mb-4">Authentication Required</h2>
            <p className="text-muted-foreground mb-8">
              Please sign in to access this page.
            </p>
            <div className="space-y-3">
              <Link href="/login">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" className="w-full border-white/10">
                  Create Account
                </Button>
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    )
  }

  // Check plan requirements
  const hasAccess = checkPlanAccess(requiredPlan, isPro, saasActive)

  if (!hasAccess) {
    // Redirect to payment if user is authenticated but lacks access
    if (user && (requiredPlan === "ecommerce-pro" || requiredPlan.includes("saas"))) {
      return (
        <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <GlassCard variant="elevated" className="p-10 rounded-3xl text-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-2xl font-black mb-4">Payment Required</h2>
              <p className="text-muted-foreground mb-8">
                This feature requires a {getPlanName(requiredPlan)} plan.
              </p>
              <div className="space-y-3">
                {requiredPlan.includes("saas") ? (
                  <Link href="/saas-payment">
                    <Button className="w-full bg-blue-500 hover:bg-blue-600">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Purchase SaaS Plan
                    </Button>
                  </Link>
                ) : (
                  <Link href="/payment-setup">
                    <Button className="w-full bg-amber-500 hover:bg-amber-600">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </Link>
                )}
                <Link href="/pricing">
                  <Button variant="outline" className="w-full border-white/10">
                    View Plans
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )
    }

    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <GlassCard variant="elevated" className="p-10 rounded-3xl text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-2xl font-black mb-4">Upgrade Required</h2>
            <p className="text-muted-foreground mb-8">
              This feature requires a {getPlanName(requiredPlan)} plan.
            </p>
            <Link href="/pricing">
              <Button className="w-full bg-amber-500 hover:bg-amber-600">
                <CreditCard className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            </Link>
          </GlassCard>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}

function checkPlanAccess(requiredPlan: string, isPro: boolean, saasActive: boolean): boolean {
  switch (requiredPlan) {
    case "free":
      return true
    case "ecommerce-pro":
      return isPro
    case "saas-pro":
      return saasActive
    case "saas-max":
      return saasActive && isPro
    default:
      return true
  }
}

function getPlanName(plan: string): string {
  switch (plan) {
    case "ecommerce-pro":
      return "Ecommerce Pro"
    case "saas-pro":
      return "SaaS Pro"
    case "saas-max":
      return "SaaS Max"
    default:
      return "paid"
  }
}
