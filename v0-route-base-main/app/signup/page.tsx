"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { RouteBasesLogo } from "@/components/routebase-logo"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, CheckCircle2, Chrome, Apple, Mail as Outlook } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [formData, setFormData] = useState({ 
    username: "",
    email: "", 
    password: "",
    confirm_password: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider)
    try {
      // Redirect to backend OAuth endpoint
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth/${provider}/`
    } catch (error) {
      console.error(`${provider} login failed:`, error)
      setErrors({ general: `${provider} login failed. Please try again.` })
      setSocialLoading(null)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)

    try {
      const response = await apiClient.userRegister({
        username: formData.username,
        email: formData.email,
        password: formData.password
      })
      
      if (response) {
        // After successful registration, redirect to plan selection
        router.push('/pricing')
      }
    } catch (error: any) {
      console.error("Signup failed:", error)
      
      // Handle backend validation errors
      if (error.message && error.message.includes('HTTP 400')) {
        setErrors({ general: "User with this email or username already exists" })
      } else {
        setErrors({ general: "Registration failed. Please try again." })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    console.log(`Input changed: ${name} = ${value}`, 'formData:', formData) // Debug log
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
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
            <RouteBasesLogo size="lg" />
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16"
          >
            <h2 className="text-5xl font-black text-white leading-tight uppercase tracking-tight">
              Join RouteBase
              <br />
              <span className="text-emerald-400">Today</span>
            </h2>
            <p className="text-muted-foreground mt-6 text-lg max-w-md font-medium leading-relaxed">
              Create your account and start processing payments with Pakistan's leading fintech platform.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-muted-foreground text-sm font-bold uppercase tracking-widest">
          <span>Secure</span>
          <span className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
          <span>Fast</span>
          <span className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
          <span>Reliable</span>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
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
                <RouteBasesLogo />
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-black tracking-tight">Create Account</h1>
              <p className="text-muted-foreground font-medium mt-2">Join thousands of merchants on RouteBase.</p>
            </div>

            {errors.general && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400 font-medium">{errors.general}</p>
              </div>
            )}

            {/* Social Login Options */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Or continue with</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('google')}
                  disabled={socialLoading !== null}
                  className="py-3 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl"
                >
                  {socialLoading === 'google' ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Chrome className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('apple')}
                  disabled={socialLoading !== null}
                  className="py-3 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl"
                >
                  {socialLoading === 'apple' ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Apple className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('microsoft')}
                  disabled={socialLoading !== null}
                  className="py-3 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl"
                >
                  {socialLoading === 'microsoft' ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Outlook className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Or sign up with email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`pl-11 py-6 bg-white/5 border-white/10 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-white ${errors.username ? 'border-red-500/50' : ''}`}
                    required
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-red-400 font-medium">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-11 py-6 bg-white/5 border-white/10 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-white ${errors.email ? 'border-red-500/50' : ''}`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400 font-medium">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-11 pr-11 py-6 bg-white/5 border-white/10 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-white ${errors.password ? 'border-red-500/50' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 font-medium">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className={`pl-11 pr-11 py-6 bg-white/5 border-white/10 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-white ${errors.confirm_password ? 'border-red-500/50' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-xs text-red-400 font-medium">{errors.confirm_password}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <p className="text-center mt-8 text-sm text-muted-foreground">
              Already have an account?{" "}
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
    </div>
  )
}
