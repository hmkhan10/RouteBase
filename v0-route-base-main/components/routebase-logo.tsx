"use client"

import { cn } from "@/lib/utils"

interface RouteBasesLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function RouteBasesLogo({ className, size = "md", showText = true }: RouteBasesLogoProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  }

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20",
          sizes[size],
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-2/3 h-2/3">
          <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" fill="rgba(255,255,255,0.2)" />
          <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {showText && (
        <span className={cn("font-black tracking-tight uppercase italic text-foreground", textSizes[size])}>
          RouteBases
        </span>
      )}
    </div>
  )
}
