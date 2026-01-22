"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { RouteBasesLogo } from "@/components/routebase-logo"
import { Home, Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <GlassCard className="p-12 rounded-3xl border-white/5 relative overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[100px] rounded-full" />

                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/10">
                                <Search className="w-10 h-10 text-emerald-400" />
                            </div>

                            <h1 className="text-6xl font-black mb-2 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">404</h1>
                            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest">Route Not Found</h2>
                            <p className="text-muted-foreground text-sm mb-8">
                                The terminal you're looking for doesn't exist or has been moved to a different node.
                            </p>

                            <div className="space-y-3">
                                <Link href="/">
                                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 font-bold uppercase tracking-widest py-6 rounded-xl">
                                        <Home className="w-4 h-4 mr-2" />
                                        Back to Base
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    onClick={() => window.history.back()}
                                    className="w-full text-muted-foreground hover:text-white font-bold uppercase tracking-widest text-xs"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Previous Node
                                </Button>
                            </div>
                        </div>
                    </GlassCard>

                    <div className="mt-12 flex justify-center">
                        <RouteBasesLogo size="sm" />
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
