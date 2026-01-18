"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { RouteBaseLogo } from "@/components/routebase-logo"
import { GlassCard } from "@/components/glass-card"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
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
                        <h1 className="text-4xl font-black uppercase tracking-tight mb-8">Privacy Policy</h1>

                        <div className="space-y-8 text-muted-foreground leading-relaxed">
                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">1. Information Collection</h2>
                                <p>
                                    We collect information from you when you register on our site, place an order, subscribe to our newsletter or fill out a form. When ordering or registering on our site, as appropriate, you may be asked to enter your: name, e-mail address, mailing address or phone number.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">2. Information Usage</h2>
                                <p>
                                    Any of the information we collect from you may be used in one of the following ways: to personalize your experience, to improve our website, to improve customer service, to process transactions, or to send periodic emails.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">3. Information Protection</h2>
                                <p>
                                    We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">4. Cookies</h2>
                                <p>
                                    We use cookies to help us remember and process the items in your shopping cart, understand and save your preferences for future visits and compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">5. Third Party Disclosure</h2>
                                <p>
                                    We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
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
