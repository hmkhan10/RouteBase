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
import { Eye, EyeOff, Lock, User, ArrowRight } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ username: "", password: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await apiClient.login(formData)
      router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
      alert("Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden p-16 flex-col justify-between">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500 rounded-full blur-[150px] opacity-20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full blur-[150px] opacity-20" />

        <div className="relative z-10">
          <Link href="/">
            <RouteBaseLogo size="lg" />
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16"
          >
            <h2 className="text-5xl font-black text-white leading-tight uppercase tracking-tight">
              Secure Terminal
              <br />
              <span className="text-emerald-400">Access Point</span>
            </h2>
            <p className="text-muted-foreground mt-6 text-lg max-w-md font-medium leading-relaxed">
              Monitoring millions of transactions across Pakistan with bank-grade encryption.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-muted-foreground text-sm font-bold uppercase tracking-widest">
          <span>Verified</span>
          <span className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
          <span>Encrypted</span>
          <span className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
          <span>Fast</span>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <GlassCard variant="elevated" className="p-10 rounded-3xl">
            <div className="lg:hidden mb-8">
              <Link href="/">
                <RouteBaseLogo />
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-black tracking-tight">Welcome Back</h1>
              <p className="text-muted-foreground font-medium mt-2">Enter your credentials to access your terminal.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="pl-11 py-6 bg-white/5 border-white/10 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-11 pr-11 py-6 bg-white/5 border-white/10 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/20"
                  />
                  <span className="text-xs font-medium text-muted-foreground">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <p className="text-center mt-8 text-sm text-muted-foreground">
              New merchant?{" "}
              <Link href="/register" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                Register Terminal
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
    </div>
  )
}
