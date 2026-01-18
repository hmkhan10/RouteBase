"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { RouteBaseLogo } from "@/components/routebase-logo"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, MessageSquare, Phone, ArrowLeft, Send } from "lucide-react"

export default function SupportPage() {
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        <h1 className="text-4xl font-black uppercase tracking-tight mb-4">Support</h1>
                        <p className="text-muted-foreground font-medium">
                            Our technical team is available 24/7 to assist with your terminal deployment and transaction monitoring.
                        </p>

                        <div className="space-y-4 mt-8">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</p>
                                    <p className="font-bold">support@routebase.pk</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone</p>
                                    <p className="font-bold">+92 300 1234567</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Live Chat</p>
                                    <p className="font-bold">Available in Dashboard</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2"
                    >
                        <GlassCard className="p-8 rounded-3xl border-white/10">
                            <h2 className="text-xl font-bold mb-6 uppercase tracking-wider">Send a Message</h2>
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                                        <Input placeholder="John Doe" className="bg-white/5 border-white/10 py-6 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                                        <Input placeholder="john@example.com" className="bg-white/5 border-white/10 py-6 rounded-xl" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject</Label>
                                    <Input placeholder="How can we help?" className="bg-white/5 border-white/10 py-6 rounded-xl" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Message</Label>
                                    <textarea
                                        className="w-full min-h-[150px] bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                        placeholder="Describe your issue in detail..."
                                    ></textarea>
                                </div>

                                <Button className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 font-bold uppercase tracking-widest rounded-xl flex items-center gap-2">
                                    Send Ticket <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
