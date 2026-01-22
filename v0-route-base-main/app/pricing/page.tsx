"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { usePayment } from "@/lib/payment-context"
import { useAuth } from "@/lib/auth-context"
import { ArrowRight, Check, Crown, Store, Cloud, CreditCard, Loader2 } from "lucide-react"

const pricingPlans = [
  {
    name: "Basic",
    vertical: "E-commerce",
    price: "Free",
    period: "",
    description: "For small businesses just getting started",
    features: ["Payment links", "Basic checkout", "Email support", "3% transaction fee"],
    cta: "Current Plan",
    popular: false,
    icon: Store,
    planKey: "free" as const,
  },
  {
    name: "Ecommerce Pro",
    vertical: "E-commerce",
    price: "2,200",
    period: "/mo",
    description: "Full-featured e-commerce payment solution",
    features: [
      "Custom branded checkout",
      "Product catalog",
      "Inventory management",
      "Analytics dashboard",
      "3% transaction fee",
      "Priority support",
    ],
    cta: "Upgrade Now",
    popular: true,
    icon: Store,
    planKey: "ecommerce-pro" as const,
  },
  {
    name: "SaaS Pro",
    vertical: "SaaS",
    price: "450",
    period: "/mo",
    description: "For SaaS startups with recurring billing needs",
    features: ["Subscription billing", "Basic metrics", "Webhook integrations", "3% transaction fee"],
    cta: "Get Started",
    popular: false,
    icon: Cloud,
    planKey: "saas-pro" as const,
  },
  {
    name: "SaaS Max",
    vertical: "SaaS",
    price: "4,500",
    period: "/mo",
    description: "Enterprise-grade subscription management",
    features: [
      "Advanced analytics",
      "Churn prediction",
      "MRR/ARR tracking",
      "Retention dashboard",
      "3% transaction fee",
      "Dedicated support",
    ],
    cta: "Upgrade Now",
    popular: true,
    icon: Cloud,
    planKey: "saas-max" as const,
  },
]

export default function PricingPage() {
  const { currentPlan, subscription, isLoading, startPayment, hasAccess } = usePayment()
  const { user } = useAuth()
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null)
  const router = useRouter()

  const handleUpgrade = (vertical: string) => {
    // Redirect to unified plan selection system
    router.push('/plan-selection')
  }

  const getPlanButton = (plan: typeof pricingPlans[0]) => {
    if (isLoading) {
      return (
        <Button disabled className="w-full font-bold uppercase tracking-widest text-xs py-5">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </Button>
      )
    }

    if (currentPlan === plan.planKey) {
      return (
        <Button disabled className="w-full font-bold uppercase tracking-widest text-xs py-5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
          <Check className="w-4 h-4 mr-2" />
          Current Plan
        </Button>
      )
    }

    if (plan.planKey === "free") {
      return (
        <Link href="/setup-ecommerce">
          <Button className="w-full font-bold uppercase tracking-widest text-xs py-5 bg-white/5 hover:bg-white/10 border border-white/10">
            Get Started
          </Button>
        </Link>
      )
    }

    if (plan.planKey === "ecommerce-pro") {
      return (
        <Link href="/setup-ecommerce">
          <Button className="w-full font-bold uppercase tracking-widest text-xs py-5 bg-emerald-500 hover:bg-emerald-600">
            Setup E-commerce
          </Button>
        </Link>
      )
    }

    if (plan.planKey === "saas-pro" || plan.planKey === "saas-max") {
      return (
        <Link href="/setup-saas">
          <Button className="w-full font-bold uppercase tracking-widest text-xs py-5 bg-purple-500 hover:bg-purple-600">
            Setup SaaS
          </Button>
        </Link>
      )
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0A0C10]">
        {/* Navigation */}
        <Navbar />

        {/* Header */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-balance">
                Simple, Transparent
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  Pricing
                </span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
                Choose the perfect plan for your business. Start free and scale as you grow.
              </p>

              {user && subscription && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                  <Crown className="w-4 h-4" />
                  Current Plan: <span className="font-bold">{currentPlan.replace('-', ' ').toUpperCase()}</span>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 rounded-full text-xs font-bold uppercase tracking-widest">
                      Popular
                    </div>
                  )}
                  <GlassCard
                    className={`p-8 rounded-2xl h-full flex flex-col ${
                      plan.popular ? "border-emerald-500/50" : ""
                    } ${
                      currentPlan === plan.planKey ? "border-emerald-500/30 bg-emerald-500/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <plan.icon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {plan.vertical}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mt-2 mb-6">{plan.description}</p>

                    <div className="mb-6">
                      {plan.price === "Free" ? (
                        <span className="text-4xl font-black">Free</span>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm text-muted-foreground">PKR</span>
                          <span className="text-4xl font-black">{plan.price}</span>
                          <span className="text-muted-foreground">{plan.period}</span>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {getPlanButton(plan)}
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-black mb-4">Compare Plans</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                See exactly what you get with each plan
              </p>
            </motion.div>

            <GlassCard className="p-8 rounded-3xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-4 font-bold">Feature</th>
                      <th className="text-center py-4 px-4 font-bold">Basic</th>
                      <th className="text-center py-4 px-4 font-bold">Ecommerce Pro</th>
                      <th className="text-center py-4 px-4 font-bold">SaaS Pro</th>
                      <th className="text-center py-4 px-4 font-bold">SaaS Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="py-4 px-4">Payment Links</td>
                      <td className="text-center py-4 px-4">✓</td>
                      <td className="text-center py-4 px-4">✓</td>
                      <td className="text-center py-4 px-4">✓</td>
                      <td className="text-center py-4 px-4">✓</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-4 px-4">Custom Checkout</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">✓</td>
                      <td className="text-center py-4 px-4">✓</td>
                      <td className="text-center py-4 px-4">✓</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-4 px-4">Product Catalog</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">✓</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">✓</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-4 px-4">Subscription Billing</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">✓</td>
                      <td className="text-center py-4 px-4">✓</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-4 px-4">Advanced Analytics</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">✓</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">✓</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">Priority Support</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">✓</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  )
}
