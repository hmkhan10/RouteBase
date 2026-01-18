"use client"

import { use, useState } from "react"
import { notFound, redirect } from "next/navigation"
import { getMerchant, getEcommerceMetrics, getSaaSMetrics, showDashboard } from "@/lib/mock-data"
import { EcommerceDashboard } from "@/components/ecommerce-dashboard"
import { SaaSDashboard } from "@/components/saas-dashboard"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { PageTransition } from "@/components/page-transition"

interface DashboardPageProps {
  params: Promise<{ merchant_slug: string }>
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { merchant_slug } = use(params)
  const merchant = getMerchant(merchant_slug)

  const [viewMode, setViewMode] = useState<"ecommerce" | "saas">(
    merchant?.planType === "SaaS-Max" ? "saas" : "ecommerce",
  )

  if (!merchant) {
    notFound()
  }

  // Check if merchant has dashboard access
  if (!showDashboard(merchant.planType)) {
    redirect(`/${merchant_slug}/transactions`)
  }

  const showSaaS = merchant.planType === "SaaS-Max" && viewMode === "saas"
  const metrics = showSaaS ? getSaaSMetrics(merchant.id) : getEcommerceMetrics(merchant.id)

  return (
    <div className="min-h-screen bg-[#0A0C10] flex">
      <DashboardSidebar
        merchantSlug={merchant_slug}
        planType={merchant.planType}
        businessName={merchant.businessName}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <main className="ml-72 flex-1 p-10">
        <PageTransition>
          {showSaaS ? (
            <SaaSDashboard merchant={merchant} metrics={metrics as ReturnType<typeof getSaaSMetrics>} />
          ) : (
            <EcommerceDashboard merchant={merchant} metrics={metrics} />
          )}
        </PageTransition>
      </main>
    </div>
  )
}
