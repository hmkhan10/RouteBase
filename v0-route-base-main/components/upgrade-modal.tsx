"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/glass-card"
import { X, Upload, Check, Store, Cloud, CreditCard } from "lucide-react"
import type { PlanType } from "@/lib/types"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan: PlanType
}

type UpgradePlan = "Ecommerce-Pro" | "SaaS-Max"

const upgradePlans: Record<UpgradePlan, { name: string; price: number; icon: typeof Store; features: string[] }> = {
  "Ecommerce-Pro": {
    name: "Ecommerce Pro",
    price: 2200,
    icon: Store,
    features: [
      "Custom branded checkout",
      "Product catalog management",
      "Inventory tracking",
      "Analytics dashboard",
      "Priority support",
    ],
  },
  "SaaS-Max": {
    name: "SaaS Max",
    price: 4500,
    icon: Cloud,
    features: [
      "Advanced subscription analytics",
      "Churn prediction & alerts",
      "MRR/ARR tracking",
      "Retention dashboard",
      "Dedicated support",
    ],
  },
}

export function UpgradeModal({ isOpen, onClose, currentPlan }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<UpgradePlan | null>(null)
  const [step, setStep] = useState<"select" | "details" | "success">("select")
  const [businessUrl, setBusinessUrl] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePlanSelect = (plan: UpgradePlan) => {
    setSelectedPlan(plan)
    setStep("details")
  }

  const handleSubmit = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setStep("success")
  }

  const handleClose = () => {
    setSelectedPlan(null)
    setStep("select")
    setBusinessUrl("")
    setLogoFile(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <GlassCard className="p-8 rounded-3xl relative">
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {step === "select" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black">Upgrade Your Plan</h2>
                    <p className="text-muted-foreground mt-1">
                      Current plan: <span className="text-emerald-400 font-bold">{currentPlan}</span>
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {(Object.keys(upgradePlans) as UpgradePlan[]).map((planKey) => {
                      const plan = upgradePlans[planKey]
                      const isCurrentPlan = currentPlan === planKey

                      return (
                        <button
                          key={planKey}
                          onClick={() => !isCurrentPlan && handlePlanSelect(planKey)}
                          disabled={isCurrentPlan}
                          className={`p-6 rounded-2xl text-left transition-all ${
                            isCurrentPlan
                              ? "bg-white/5 opacity-50 cursor-not-allowed"
                              : "bg-white/5 hover:bg-white/10 hover:border-emerald-500/50 border border-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                              <plan.icon className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                              <h3 className="font-bold">{plan.name}</h3>
                              {isCurrentPlan && <span className="text-xs text-emerald-400">Current Plan</span>}
                            </div>
                          </div>

                          <div className="mb-4">
                            <span className="text-sm text-muted-foreground">PKR </span>
                            <span className="text-2xl font-black">{plan.price.toLocaleString()}</span>
                            <span className="text-muted-foreground">/mo</span>
                          </div>

                          <ul className="space-y-2">
                            {plan.features.slice(0, 3).map((feature) => (
                              <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="w-3 h-3 text-emerald-400" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {step === "details" && selectedPlan && (
                <div className="space-y-6">
                  <div>
                    <button
                      onClick={() => setStep("select")}
                      className="text-sm text-muted-foreground hover:text-foreground mb-2"
                    >
                      ← Back to plans
                    </button>
                    <h2 className="text-2xl font-black">Complete Your Upgrade</h2>
                    <p className="text-muted-foreground mt-1">
                      Upgrading to <span className="text-emerald-400 font-bold">{upgradePlans[selectedPlan].name}</span>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Business URL Slug
                      </Label>
                      <div className="flex items-center">
                        <span className="px-4 py-3 bg-white/5 border border-white/10 border-r-0 rounded-l-xl text-muted-foreground text-sm">
                          routebase.pk/
                        </span>
                        <Input
                          value={businessUrl}
                          onChange={(e) => setBusinessUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                          placeholder="your-brand"
                          className="py-5 bg-white/5 border-white/10 rounded-l-none rounded-r-xl font-mono"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">This will be your unique checkout URL</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Business Logo
                      </Label>
                      <div
                        className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-emerald-500/30 transition-colors cursor-pointer"
                        onClick={() => document.getElementById("logo-upload")?.click()}
                      >
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                        />
                        {logoFile ? (
                          <div className="flex items-center justify-center gap-3">
                            <Check className="w-5 h-5 text-emerald-400" />
                            <span className="font-medium">{logoFile.name}</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-emerald-400" />
                          <span className="font-bold">Monthly Subscription</span>
                        </div>
                        <span className="text-xl font-black text-emerald-400">
                          PKR {upgradePlans[selectedPlan].price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!businessUrl || isProcessing}
                    className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 font-bold uppercase tracking-widest rounded-xl disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "Confirm Upgrade"
                    )}
                  </Button>
                </div>
              )}

              {step === "success" && (
                <div className="text-center py-8 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                    <Check className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">Upgrade Successful!</h2>
                    <p className="text-muted-foreground mt-2">
                      Your plan has been upgraded to{" "}
                      <span className="text-emerald-400 font-bold">
                        {selectedPlan && upgradePlans[selectedPlan].name}
                      </span>
                    </p>
                  </div>
                  <Button
                    onClick={handleClose}
                    className="bg-emerald-500 hover:bg-emerald-600 font-bold uppercase tracking-widest px-8"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
