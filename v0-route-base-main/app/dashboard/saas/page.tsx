"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

export default function SaaSDashboardEntry() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function findSaaSMerchant() {
      try {
        const merchants = await apiClient.get<any[]>("/api/merchants/my-merchants/")
        const saasMerchant = merchants.find(m => m.planType === "SaaS-Max" || m.planType === "SaaS-Pro")
        
        if (saasMerchant) {
          router.push(`/${saasMerchant.slug}/dashboard`)
        } else {
          router.push("/dashboard") // Fallback to generic dashboard
        }
      } catch (error) {
        console.error("Failed to find SaaS merchant:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }
    findSaaSMerchant()
  }, [router])

  return <DashboardSkeleton />
}
