"use client"

import Link from "next/link"
import { RouteBaseLogo } from "./routebase-logo"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-6xl z-50 px-6 py-4 flex items-center justify-between glass rounded-full"
    >
      <Link href="/">
        <RouteBaseLogo size="sm" />
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <Link
          href="/"
          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          Home
        </Link>
        <Link
          href="/pricing"
          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          Pricing
        </Link>
        <Link
          href="/docs"
          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          Docs
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest">
            Sign In
          </Button>
        </Link>
        <Link href="/register">
          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-[10px] font-bold uppercase tracking-widest px-6 rounded-full shadow-lg shadow-emerald-500/20"
          >
            Get Started
          </Button>
        </Link>
      </div>
    </motion.nav>
  )
}
