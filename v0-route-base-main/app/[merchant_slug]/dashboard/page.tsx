"use client"

import { use, useState, useEffect } from "react"
import { notFound, redirect } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { EcommerceDashboard } from "@/components/ecommerce-dashboard"
import { SaaSDashboard } from "@/components/saas-dashboard"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { PageTransition } from "@/components/page-transition"
import { GlassCard } from "@/components/glass-card"

interface DashboardPageProps {
  params: Promise<{ merchant_slug: string }>
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0C10] flex">
      <div className="w-72 border-r border-white/5 p-6 space-y-6">
        <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      </div>
      <main className="flex-1 p-10 space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-10 w-64 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-[400px] bg-white/5 rounded-3xl animate-pulse" />
      </main>
    </div>
  )
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { merchant_slug } = use(params)
  const [merchant, setMerchant] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"ecommerce" | "saas">("ecommerce")

  useEffect(() => {
    async function fetchData() {
      try {
        const merchantData = await apiClient.get<any>(`/api/merchants/${merchant_slug}`)
        setMerchant(merchantData)

        const isSaaS = merchantData.planType === "SaaS-Max" || merchantData.planType === "SaaS-Pro"
        if (isSaaS) {
          setViewMode("saas")
          const saasMetrics = await apiClient.getSaaSMetrics(merchant_slug)
          setMetrics(saasMetrics)
        } else {
          const ecommerceMetrics = await apiClient.getEcommerceMetrics(merchant_slug)
          setMetrics(ecommerceMetrics)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [merchant_slug])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!merchant) {
    notFound()
  }

  const showSaaS = (merchant.planType === "SaaS-Max" || merchant.planType === "SaaS-Pro") && viewMode === "saas"

  return (
    <PageTransition>
      {showSaaS ? (
        <SaaSDashboard merchant={merchant} metrics={metrics} />
      ) : (
        <EcommerceDashboard merchant={merchant} metrics={metrics} />
      )}
    </PageTransition>
  )
}
