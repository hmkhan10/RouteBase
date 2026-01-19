"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { RouteBaseLogo } from "@/components/routebase-logo"
import { Navbar } from "@/components/navbar"
import { Zap, Shield, BarChart3, CreditCard, Users, TrendingUp, ArrowRight, Check, Store, Cloud } from "lucide-react"

const features = [
  {
    icon: CreditCard,
    title: "Instant Payments",
    description: "Accept JazzCash, Easypaisa, Raast, and Bank Transfers with zero setup time.",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "PCI-DSS Level 1 compliant with end-to-end encryption for all transactions.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track revenue, churn, and growth metrics with our Intelligence Suite.",
  },
  {
    icon: Users,
    title: "Multi-Tenant Ready",
    description: "Custom branded checkout pages with your logo and colors.",
  },
  {
    icon: TrendingUp,
    title: "Subscription Management",
    description: "Built-in recurring billing for SaaS businesses with churn tracking.",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description: "Get your funds within 24 hours with our rapid settlement system.",
  },
]

const pricingPlans = [
  {
    name: "Basic",
    vertical: "E-commerce",
    price: "Free",
    period: "",
    description: "For small businesses just getting started",
    features: ["Payment links", "Basic checkout", "Email support", "3% transaction fee"],
    cta: "Start Free",
    popular: false,
    icon: Store,
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
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0C10]">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-500/20 text-emerald-400 text-sm font-medium">
              <Zap className="w-4 h-4" />
              Pakistan&apos;s Dual-Vertical Payment Platform
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-balance">
              One Platform.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Two Verticals.
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              RouteBase is a sophisticated financial orchestration layer engineered to catalyze economic velocity.
              By synthesizing high-frequency e-commerce with the complex recurring logic of the subscription economy,
              we provide a unified neural infrastructure for the modern Pakistani enterprise.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-600 font-bold uppercase tracking-widest px-8 py-6 text-sm"
                >
                  Start Building Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/10 bg-transparent font-bold uppercase tracking-widest px-8 py-6 text-sm"
                >
                  View Pricing
                </Button>
              </Link>
            </div>

            <div className="pt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                No setup fees
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                24hr settlement
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                PCI-DSS compliant
              </div>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-transparent to-transparent z-10 pointer-events-none" />
            <GlassCard className="p-2 rounded-3xl max-w-5xl mx-auto overflow-hidden">
              <div className="bg-[#0F1218] rounded-2xl p-8 h-[400px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
                    <BarChart3 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold">Intelligence Suite</h3>
                  <p className="text-muted-foreground text-sm max-w-md">
                    Real-time analytics for E-commerce and SaaS businesses with revenue tracking, churn metrics, and
                    growth insights.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4">Everything You Need to Scale</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built for Pakistani businesses, optimized for growth
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-8 rounded-2xl h-full hover:border-emerald-500/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">The Financial Synapse</h2>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto" />
            <p className="text-xl text-muted-foreground leading-relaxed font-light italic">
              "We don't just process payments; we orchestrate economic velocity. RouteBase exists at the intersection of
              high-frequency commerce and recurring value, providing the neural infrastructure required for a sovereign
              financial future in Pakistan."
            </p>
            <div className="grid md:grid-cols-2 gap-12 pt-12 text-left">
              <div className="space-y-4">
                <h4 className="text-emerald-400 font-bold uppercase tracking-widest text-sm">Dual-Vertical Synergy</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  By synthesizing the immediacy of E-commerce with the continuity of SaaS, we eliminate the friction
                  between disparate financial models, allowing enterprises to scale horizontally across multiple verticals.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-blue-400 font-bold uppercase tracking-widest text-sm">Sovereign Infrastructure</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our stack is engineered for resilience and autonomy. We provide the tools for Pakistani businesses
                  to own their financial narrative, backed by end-to-end encryption and real-time intelligence.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Choose the plan that fits your business model</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 rounded-full text-xs font-bold uppercase tracking-widest">
                    Popular
                  </div>
                )}
                <GlassCard
                  className={`p-8 rounded-2xl h-full flex flex-col ${plan.popular ? "border-emerald-500/50" : ""}`}
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

                  <Link href="/register">
                    <Button
                      className={`w-full font-bold uppercase tracking-widest text-xs py-5 ${plan.popular
                        ? "bg-emerald-500 hover:bg-emerald-600"
                        : "bg-white/5 hover:bg-white/10 border border-white/10"
                        }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-12 rounded-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to Transform Your Payments?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join hundreds of Pakistani businesses already using RouteBase to power their payment infrastructure.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 font-bold uppercase tracking-widest px-12 py-6"
              >
                Get Started Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <RouteBaseLogo size="sm" />
            <span className="text-muted-foreground text-sm">© 2025 RouteBase. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-muted-foreground text-sm">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/support" className="hover:text-foreground transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
