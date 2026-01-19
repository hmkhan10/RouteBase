"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { RouteBaseLogo } from "@/components/routebase-logo"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, Mail, Phone, Globe, ArrowRight, CheckCircle2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    business_name: "",
    email: "",
    phone: "",
    website: "",
    plan_type: "ecommerce-pro",
    account_holder: "",
    bank_name: "",
    iban: "",
    branch_code: "",
    cnic: "",
    password: "password123", // Default for now, should be added to UI
    username: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === "business_name" && !formData.username) {
      setFormData(prev => ({ ...prev, username: value.toLowerCase().replace(/\s+/g, '_') }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      setStep(2)
      return
    }

    setIsLoading(true)
    try {
      await apiClient.register(formData)
      router.push("/dashboard")
    } catch (error) {
      console.error("Registration failed:", error)
      alert("Registration failed. Please check your details and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] mesh-gradient flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/">
            <RouteBaseLogo className="justify-center mb-6" />
          </Link>
          <h1 className="text-3xl font-black uppercase tracking-tight">Deploy Terminal</h1>
          <p className="text-muted-foreground mt-2">Create your payment infrastructure in minutes</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${s <= step ? "bg-emerald-500 text-black" : "bg-white/5 text-muted-foreground"
                  }`}
              >
                {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-widest ${s <= step ? "text-foreground" : "text-muted-foreground"
                  }`}
              >
                {s === 1 ? "Business" : "Payout"}
              </span>
              {s < 2 && <div className={`w-12 h-0.5 ${s < step ? "bg-emerald-500" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        <GlassCard variant="elevated" className="p-10 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Business Name
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      name="business_name"
                      type="text"
                      placeholder="Your Business Name"
                      className="pl-11 py-6 bg-white/5 border-white/10 rounded-xl"
                      required
                      value={formData.business_name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Business Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      name="email"
                      type="email"
                      placeholder="contact@business.pk"
                      className="pl-11 py-6 bg-white/5 border-white/10 rounded-xl"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      name="phone"
                      type="tel"
                      placeholder="+92 300 1234567"
                      className="pl-11 py-6 bg-white/5 border-white/10 rounded-xl"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Website (Optional)
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      name="website"
                      type="url"
                      placeholder="https://yourbusiness.pk"
                      className="pl-11 py-6 bg-white/5 border-white/10 rounded-xl"
                      value={formData.website}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Plan Type
                  </Label>
                  <Select name="plan_type" value={formData.plan_type} onValueChange={(v) => handleSelectChange("plan_type", v)}>
                    <SelectTrigger className="py-6 bg-white/5 border-white/10 rounded-xl">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="saas-pro">SaaS Pro</SelectItem>
                      <SelectItem value="ecommerce-pro">Ecommerce Pro</SelectItem>
                      <SelectItem value="saas-max">SaaS Max</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <p className="text-sm text-blue-400 font-medium">
                    Enter your bank account details for receiving payouts. All data is encrypted.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Account Holder Name
                  </Label>
                  <Input
                    name="account_holder"
                    type="text"
                    placeholder="Full name as per bank records"
                    className="py-6 bg-white/5 border-white/10 rounded-xl"
                    required
                    value={formData.account_holder}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Bank / Wallet Name
                  </Label>
                  <Select name="bank_name" value={formData.bank_name} onValueChange={(v) => handleSelectChange("bank_name", v)}>
                    <SelectTrigger className="py-6 bg-white/5 border-white/10 rounded-xl">
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hbl">HBL</SelectItem>
                      <SelectItem value="ubl">UBL</SelectItem>
                      <SelectItem value="mcb">MCB</SelectItem>
                      <SelectItem value="allied">Allied Bank</SelectItem>
                      <SelectItem value="jazzcash">JazzCash</SelectItem>
                      <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Account / IBAN Number
                  </Label>
                  <Input
                    name="iban"
                    type="text"
                    placeholder="PK00 XXXX XXXX XXXX XXXX XXXX"
                    className="py-6 bg-white/5 border-white/10 rounded-xl font-mono"
                    required
                    value={formData.iban}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Branch Code
                    </Label>
                    <Input name="branch_code" type="text" placeholder="0000" className="py-6 bg-white/5 border-white/10 rounded-xl" value={formData.branch_code} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      CNIC (Optional)
                    </Label>
                    <Input
                      name="cnic"
                      type="text"
                      placeholder="00000-0000000-0"
                      className="py-6 bg-white/5 border-white/10 rounded-xl"
                      value={formData.cnic}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-6 border-white/10 rounded-xl font-bold uppercase tracking-widest"
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-6 bg-emerald-500 hover:bg-emerald-600 font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deploying...
                  </span>
                ) : step === 1 ? (
                  <span className="flex items-center gap-2">
                    Continue
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                ) : (
                  "Deploy Terminal"
                )}
              </Button>
            </div>
          </form>

          <p className="text-center mt-8 text-sm text-muted-foreground">
            Already have a terminal?{" "}
            <Link href="/login" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
              Sign In
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-white/5 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy</Link>
            <Link href="/support" className="hover:text-emerald-400 transition-colors">Support</Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
