"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { RouteBaseLogo } from "@/components/routebase-logo"
import { GlassCard } from "@/components/glass-card"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#0A0C10] text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <Link href="/">
                        <RouteBaseLogo />
                    </Link>
                    <Link href="/login" className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <GlassCard className="p-8 md:p-12 rounded-3xl border-white/10">
                        <h1 className="text-4xl font-black uppercase tracking-tight mb-8">Terms of Service</h1>

                        <div className="space-y-8 text-muted-foreground leading-relaxed">
                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">1. Acceptance of Terms</h2>
                                <p>
                                    By accessing and using RouteBase, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">2. Use License</h2>
                                <p>
                                    Permission is granted to temporarily download one copy of the materials (information or software) on RouteBase's website for personal, non-commercial transitory viewing only.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">3. Disclaimer</h2>
                                <p>
                                    The materials on RouteBase's website are provided on an 'as is' basis. RouteBase makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">4. Limitations</h2>
                                <p>
                                    In no event shall RouteBase or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on RouteBase's website.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">5. Governing Law</h2>
                                <p>
                                    These terms and conditions are governed by and construed in accordance with the laws of Pakistan and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                                </p>
                            </section>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/10 text-center">
                            <p className="text-sm text-muted-foreground">
                                Last updated: January 19, 2026
                            </p>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    )
}
