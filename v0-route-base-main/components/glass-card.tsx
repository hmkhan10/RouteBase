"use client"

import { cn } from "@/lib/utils"
import { motion, type HTMLMotionProps } from "framer-motion"
import { forwardRef } from "react"

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "elevated" | "bordered" | "sovereign" | "luminous"
  glow?: "none" | "emerald" | "blue" | "purple" | "gold" | "sovereign"
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", glow = "none", children, ...props }, ref) => {
    const variants = {
      default: "bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl",
      elevated: "bg-white/[0.05] backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl",
      bordered: "bg-white/[0.02] backdrop-blur-xl border-2 border-white/10 rounded-2xl",
      sovereign: "bg-sovereign-sun-100/5 backdrop-blur-sovereign border border-sovereign-gold-500/30 rounded-sovereign shadow-sovereign-gold transition-all duration-300 hover:shadow-sovereign-gold-lg",
      luminous: "bg-sovereign-sun-200/10 backdrop-blur-luminous border border-sovereign-gold-400/50 rounded-luminous shadow-luminous-border transition-all duration-500 hover:shadow-sovereign-gold",
    }

    const glows = {
      none: "",
      emerald: "shadow-emerald-500/10 shadow-xl border-emerald-500/20",
      blue: "shadow-blue-500/10 shadow-xl border-blue-500/20",
      purple: "shadow-purple-500/10 shadow-xl border-purple-500/20",
      gold: "shadow-sovereign-gold border-sovereign-gold-500/30",
      sovereign: "shadow-sovereign-gold border-sovereign-gold-500/40 animate-sovereign-pulse",
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "transition-all duration-300",
          variants[variant],
          glows[glow],
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          scale: variant === "sovereign" || variant === "luminous" ? 1.02 : 1,
          transition: { duration: 0.3 }
        }}
        {...props}
      >
        {children}
      </motion.div>
    )
  },
)

GlassCard.displayName = "GlassCard"
