"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { PlanType } from "@/lib/types"
import { showDashboard } from "@/lib/mock-data"
import { LayoutDashboard, History, Settings, ExternalLink, LogOut, ChevronRight, Store, Cloud } from "lucide-react"

interface DashboardSidebarProps {
  merchantSlug: string
  planType: PlanType
  businessName: string
  viewMode?: "ecommerce" | "saas"
  onViewModeChange?: (mode: "ecommerce" | "saas") => void
  merchantLogo?: string
}

export function DashboardSidebar({
  merchantSlug,
  planType,
  businessName,
  viewMode = "ecommerce",
  onViewModeChange,
  merchantLogo,
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const hasDashboard = showDashboard(planType)

  const showViewToggle = planType === "SaaS-Max"

  const navItems = [
    ...(hasDashboard
      ? [
          {
            label: "Intelligence",
            href: `/${merchantSlug}/dashboard`,
            icon: LayoutDashboard,
          },
        ]
      : []),
    {
      label: "Transactions",
      href: `/${merchantSlug}/transactions`,
      icon: History,
    },
    {
      label: "Settings",
      href: `/${merchantSlug}/settings`,
      icon: Settings,
    },
  ]

  return (
    <aside className="w-72 glass fixed h-full z-50 flex flex-col">
      <div className="p-8">
        {merchantLogo ? (
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
            <img src={merchantLogo || "/placeholder.svg"} alt={businessName} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
            <span className="text-xl font-black text-white">{businessName.charAt(0)}</span>
          </div>
        )}
        <h2 className="font-bold mt-3 truncate">{businessName}</h2>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">
            {planType}
          </span>
        </div>
      </div>

      {showViewToggle && onViewModeChange && (
        <div className="px-4 mb-4">
          <div className="p-1 rounded-xl bg-white/5 flex">
            <button
              onClick={() => onViewModeChange("ecommerce")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                viewMode === "ecommerce"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Store className="w-3 h-3" />
              E-com
            </button>
            <button
              onClick={() => onViewModeChange("saas")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                viewMode === "saas" ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Cloud className="w-3 h-3" />
              SaaS
            </button>
          </div>
        </div>
      )}

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 py-4 px-5 rounded-xl transition-all group",
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-400"
                  : "opacity-60 hover:opacity-100 hover:bg-white/5",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-bold flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          )
        })}

        <Link
          href={`/${merchantSlug}`}
          target="_blank"
          className="flex items-center gap-4 py-4 px-5 rounded-xl transition-all opacity-60 hover:opacity-100 hover:bg-white/5"
        >
          <ExternalLink className="w-5 h-5" />
          <span className="font-bold flex-1">View Checkout</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="glass rounded-xl p-4 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Checkout URL</p>
          <p className="font-mono text-sm truncate text-emerald-400">routebase.pk/{merchantSlug}</p>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-3 py-3 px-4 rounded-xl transition-all opacity-60 hover:opacity-100 hover:bg-white/5 text-red-400"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-bold text-sm">Sign Out</span>
        </Link>
      </div>
    </aside>
  )
}
