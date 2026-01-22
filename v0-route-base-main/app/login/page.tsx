"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { RouteBasesLogo } from "@/components/routebase-logo"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, User, Mail, ArrowRight, CheckCircle2, Chrome, Apple, Mail as Outlook } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect')
  const planId = searchParams.get('plan')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [loginType, setLoginType] = useState<'username' | 'email'>('username')
  const [formData, setFormData] = useState({ username: "", email: "", password: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState("")

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider)
    try {
      // Use demo OAuth endpoint for now
      // In production, this would be the real OAuth endpoint
      window.location.href = `http://localhost:8001/api/users/oauth/demo/${provider}/`
    } catch (error) {
      console.error(`${provider} login failed:`, error)
      setErrors({ general: `${provider} login failed. Please try again.` })
      setSocialLoading(null)
    }
  }

  const togglePasswordVisibility = () => {
    console.log('Password visibility toggle:', showPassword, '->', !showPassword)
    setShowPassword(!showPassword)
  }

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setSuccessMessage(message)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Validate password field
    if (!formData.password) {
      setErrors({ password: 'Password is required' })
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' })
      setIsLoading(false)
      return
    }

    try {
      const loginData = loginType === 'email' 
        ? { email: formData.email, password: formData.password }
        : { username: formData.username, password: formData.password }
      
      await apiClient.login(loginData)
      
      // Redirect to intended page after successful login
      if (redirectUrl) {
        if (redirectUrl === 'setup-saas') {
          router.push('/setup-saas')
        } else if (redirectUrl === 'setup-ecommerce') {
          router.push('/setup-ecommerce')
        } else {
          router.push(`/${redirectUrl}`)
        }
      } else {
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Login failed:", error)
      
      if (error.message && error.message.includes('HTTP 401')) {
        setErrors({ general: "Invalid credentials. Please check your email/username and password." })
      } else {
        setErrors({ general: "Login failed. Please try again." })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    console.log(`Login Input changed: ${name} = ${value}`, 'formData:', formData) // Debug log
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
                <RouteBasesLogo />
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-black tracking-tight">Welcome Back</h1>
              <p className="text-muted-foreground font-medium mt-2">Enter your credentials to access your terminal.</p>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <p className="text-sm text-emerald-400 font-medium">{successMessage}</p>
                </div>
              </div>
            )}

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
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Or sign in with email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            </div>

            {/* Login Type Toggle */}
            <div className="mb-6 flex gap-2 p-1 bg-white/5 rounded-xl">
              <button
                type="button"
                onClick={() => setLoginType('username')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${
                  loginType === 'username' 
                    ? 'bg-emerald-500 text-black' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Username
              </button>
              <button
                type="button"
                onClick={() => setLoginType('email')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${
                  loginType === 'email' 
                    ? 'bg-emerald-500 text-black' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Email
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {loginType === 'username' ? (
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      name="username"
                      type="text"
                      placeholder="Enter username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="pl-12"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
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
                      required
                      className="pl-12"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      autoComplete="current-password"
                      required
                      className={`pl-12 pr-12 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
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
                    <p className="text-xs text-red-400 font-medium mt-1">{errors.password}</p>
                  )}
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
                  Forgot password?
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
                    Signing in...
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
              New user?{" "}
              <Link href="/signup" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                Create Account
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
