"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

export default function MerchantDashboardEntry() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function findMerchant() {
            try {
                const merchants = await apiClient.get<any[]>("/api/merchants/my-merchants/")
                if (merchants && merchants.length > 0) {
                    // Redirect to the first merchant's dashboard
                    router.push(`/${merchants[0].slug}/dashboard`)
                } else {
                    // No merchant found, maybe redirect to registration or show a message
                    router.push("/register")
                }
            } catch (error) {
                console.error("Failed to find merchant:", error)
                router.push("/login")
            } finally {
                setIsLoading(false)
            }
        }
        findMerchant()
    }, [router])

    return <DashboardSkeleton />
}
