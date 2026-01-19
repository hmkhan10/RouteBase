"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { RouteBaseLogo } from "@/components/routebase-logo"
import { ShieldAlert, RefreshCcw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <GlassCard className="p-12 rounded-3xl border-white/5 relative overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-500/10 blur-[100px] rounded-full" />

                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                                <ShieldAlert className="w-10 h-10 text-red-400" />
                            </div>

                            <h1 className="text-3xl font-black mb-2 uppercase tracking-tight">System Breach</h1>
                            <h2 className="text-sm font-bold mb-6 text-red-400 uppercase tracking-widest">Internal Server Error</h2>

                            <p className="text-muted-foreground text-sm mb-8">
                                The terminal encountered an unexpected exception. Our engineers have been notified of this node failure.
                            </p>

                            <div className="space-y-3">
                                <Button
                                    onClick={() => reset()}
                                    className="w-full bg-white text-black hover:bg-white/90 font-bold uppercase tracking-widest py-6 rounded-xl"
                                >
                                    <RefreshCcw className="w-4 h-4 mr-2" />
                                    Reboot Terminal
                                </Button>

                                <Link href="/">
                                    <Button
                                        variant="ghost"
                                        className="w-full text-muted-foreground hover:text-white font-bold uppercase tracking-widest text-xs"
                                    >
                                        <Home className="w-4 h-4 mr-2" />
                                        Return to Base
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </GlassCard>

                    <div className="mt-12 flex justify-center">
                        <RouteBaseLogo size="sm" />
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
