"use client"

import { cn } from "@/lib/utils"
import { motion, type HTMLMotionProps } from "framer-motion"
import { forwardRef } from "react"

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "elevated" | "bordered"
  glow?: "none" | "emerald" | "blue" | "purple"
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", glow = "none", children, ...props }, ref) => {
    const variants = {
      default: "bg-white/[0.03] backdrop-blur-xl border border-white/10",
      elevated: "bg-white/[0.05] backdrop-blur-2xl border border-white/10 shadow-2xl",
      bordered: "bg-white/[0.02] backdrop-blur-xl border-2 border-white/10",
    }

    const glows = {
      none: "",
      emerald: "shadow-emerald-500/10 shadow-xl border-emerald-500/20",
      blue: "shadow-blue-500/10 shadow-xl border-blue-500/20",
      purple: "shadow-purple-500/10 shadow-xl border-purple-500/20",
    }

    return (
      <motion.div
        ref={ref}
        className={cn("rounded-2xl transition-all duration-300", variants[variant], glows[glow], className)}
        {...props}
      >
        {children}
      </motion.div>
    )
  },
)

GlassCard.displayName = "GlassCard"
