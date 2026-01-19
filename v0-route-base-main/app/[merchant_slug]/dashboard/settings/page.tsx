"use client"

import { use, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { notFound } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { GlassCard } from "@/components/glass-card"
import { UpgradeModal } from "@/components/upgrade-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageTransition } from "@/components/page-transition"
import { Building, Mail, Phone, Globe, Palette, Save, CreditCard, Shield, Upload, Check } from "lucide-react"

interface SettingsPageProps {
  params: Promise<{ merchant_slug: string }>
}

// Local helper for dashboard access check
function canShowDashboard(planType: string): boolean {
  return planType === "Ecommerce-Pro" || planType === "SaaS-Max" || planType === "SaaS-Pro"
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const { merchant_slug } = use(params)
  const [merchant, setMerchant] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [urlSlug, setUrlSlug] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)

  useEffect(() => {
    async function fetchMerchant() {
      try {
        const merchantData = await apiClient.get<any>(`/api/merchants/${merchant_slug}`)
        setMerchant(merchantData)
        setUrlSlug(merchantData.slug)
      } catch (error) {
        console.error("Failed to fetch merchant for settings:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMerchant()
  }, [merchant_slug])

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-10 w-48 bg-white/5 rounded" />
        <div className="h-64 bg-white/5 rounded-2xl" />
      </div>
    )
  }

  if (!merchant) {
    notFound()
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <>
      <PageTransition>
        <div className="space-y-8 max-w-3xl">
          {/* Header */}
          <header>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black uppercase tracking-tight"
            >
              Settings
            </motion.h1>
            <p className="text-muted-foreground mt-1">Manage your terminal configuration</p>
          </header>

          {/* Business Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard className="p-8 rounded-2xl">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                <Building className="w-5 h-5 text-emerald-400" />
                Business Information
              </h2>

              <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Business Name
                    </Label>
                    <Input
                      defaultValue={merchant.businessName || merchant.store_name}
                      className="py-5 bg-white/5 border-white/10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      URL Slug
                    </Label>
                    <div className="flex items-center">
                      <span className="px-4 py-3 bg-white/5 border border-white/10 border-r-0 rounded-l-xl text-muted-foreground text-sm">
                        routebase.pk/
                      </span>
                      <Input
                        value={urlSlug}
                        onChange={(e) => setUrlSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        className="py-5 bg-white/5 border-white/10 rounded-l-none rounded-r-xl font-mono"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Your unique checkout URL for customers</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Business Description
                  </Label>
                  <Input defaultValue={merchant.description} className="py-5 bg-white/5 border-white/10 rounded-xl" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <Mail className="w-3 h-3 inline mr-2" />
                      Email
                    </Label>
                    <Input
                      type="email"
                      defaultValue={merchant.email}
                      className="py-5 bg-white/5 border-white/10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <Phone className="w-3 h-3 inline mr-2" />
                      Phone
                    </Label>
                    <Input
                      type="tel"
                      defaultValue={merchant.phone}
                      className="py-5 bg-white/5 border-white/10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <Globe className="w-3 h-3 inline mr-2" />
                    Website URL
                  </Label>
                  <Input
                    type="url"
                    defaultValue={merchant.websiteUrl}
                    className="py-5 bg-white/5 border-white/10 rounded-xl"
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Branding */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard className="p-8 rounded-2xl">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                <Palette className="w-5 h-5 text-blue-400" />
                Branding
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Business Logo
                  </Label>
                  <div
                    className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-emerald-500/30 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("logo-upload-settings")?.click()}
                  >
                    <input
                      id="logo-upload-settings"
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
                        <p className="text-sm text-muted-foreground">Click to upload your logo</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your logo will appear on checkout pages instead of RouteBase branding
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Brand Color
                  </Label>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl border border-white/10"
                      style={{ backgroundColor: merchant.brandColor || "#3B82F6" }}
                    />
                    <Input
                      type="text"
                      defaultValue={merchant.brandColor || "#3B82F6"}
                      className="py-5 bg-white/5 border-white/10 rounded-xl font-mono flex-1 max-w-40"
                    />
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-muted-foreground">
                    Your brand color and logo are used on your checkout page header and call-to-action buttons,
                    replacing RouteBase branding with your own.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Plan Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard className="p-8 rounded-2xl">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-purple-400" />
                Subscription Plan
              </h2>

              <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Current Plan</span>
                  <h3 className="text-2xl font-black mt-1">{merchant.planType}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {canShowDashboard(merchant.planType)
                      ? "Full dashboard access enabled"
                      : "Upgrade for dashboard access"}
                  </p>
                </div>
                <Button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="bg-purple-500 hover:bg-purple-600 font-bold uppercase tracking-widest text-xs"
                >
                  Upgrade Plan
                </Button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Security */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard className="p-8 rounded-2xl">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-400" />
                Security
              </h2>

              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/10 py-5 rounded-xl bg-transparent"
                >
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/10 py-5 rounded-xl bg-transparent"
                >
                  Two-Factor Authentication
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/10 py-5 rounded-xl text-red-400 hover:bg-red-500/10 bg-transparent"
                >
                  Delete Account
                </Button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Save Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </span>
              )}
            </Button>
          </motion.div>
        </div>
      </PageTransition>
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentPlan={merchant.planType}
      />
    </>
  )
}
