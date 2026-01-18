import type { ReactNode } from "react"
import { notFound } from "next/navigation"
import { getMerchant } from "@/lib/mock-data"

interface MerchantLayoutProps {
  children: ReactNode
  params: Promise<{ merchant_slug: string }>
}

export default async function MerchantLayout({ children, params }: MerchantLayoutProps) {
  const { merchant_slug } = await params
  const merchant = getMerchant(merchant_slug)

  if (!merchant) {
    notFound()
  }

  return <>{children}</>
}
