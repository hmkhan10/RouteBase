"use client"

import { use, useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

interface DashboardLayoutProps {
    children: React.ReactNode
    params: Promise<{ merchant_slug: string }>
}

export default function DashboardLayout({ children, params }: DashboardLayoutProps) {
    const { merchant_slug } = use(params)
    const [merchant, setMerchant] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [viewMode, setViewMode] = useState<"ecommerce" | "saas">("ecommerce")

    useEffect(() => {
        async function fetchMerchant() {
            try {
                const merchantData = await apiClient.get<any>(`/api/merchants/${merchant_slug}`)
                setMerchant(merchantData)
                if (merchantData.planType === "SaaS-Max" || merchantData.planType === "SaaS-Pro") {
                    setViewMode("saas")
                }
            } catch (error) {
                console.error("Failed to fetch merchant for layout:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchMerchant()
    }, [merchant_slug])

    if (isLoading) {
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
                <div className="flex-1 p-10">
                    <div className="h-full w-full bg-white/5 rounded-3xl animate-pulse" />
                </div>
            </div>
        )
    }

    if (!merchant) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-[#0A0C10] flex">
            <DashboardSidebar
                merchantSlug={merchant_slug}
                planType={merchant.planType}
                businessName={merchant.store_name || merchant.businessName}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />
            <main className="ml-72 flex-1 p-10">
                {children}
            </main>
        </div>
    )
}
