"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { RouteBaseLogo } from "@/components/routebase-logo"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export default function ResetPasswordConfirmPage() {
    const params = useParams()
    const router = useRouter()
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setIsLoading(true)
        try {
            const response = await apiClient.confirmPasswordReset({
                uidb64: params.uid,
                token: params.token,
                new_password: password
            })

            if (response.success) {
                setIsSubmitted(true)
            } else {
                setError(response.message || "Failed to reset password. Link may be invalid or expired.")
            }
        } catch (err: any) {
            setError("An unexpected error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6">
            <div className="absolute inset-0 mesh-gradient opacity-30" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <Link href="/">
                        <RouteBaseLogo className="justify-center mb-6" />
                    </Link>
                </div>

                <GlassCard className="p-10 rounded-3xl border-white/10">
                    {!isSubmitted ? (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl font-black tracking-tight uppercase">Set New Password</h1>
                                <p className="text-muted-foreground font-medium mt-2">
                                    Please enter your new password below.
                                </p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm font-medium"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-11 py-6 bg-white/5 border-white/10 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        Confirm New Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-11 py-6 bg-white/5 border-white/10 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 group"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Updating...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Update Password
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-4"
                        >
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-6">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Password Updated</h2>
                            <p className="text-muted-foreground font-medium mb-8">
                                Your password has been successfully reset. You can now sign in with your new credentials.
                            </p>
                            <Button
                                asChild
                                className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20"
                            >
                                <Link href="/login">Sign In Now</Link>
                            </Button>
                        </motion.div>
                    )}

                    <div className="mt-8 pt-8 border-t border-white/10 text-center">
                        <Link
                            href="/login"
                            className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Sign In
                        </Link>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    )
}
