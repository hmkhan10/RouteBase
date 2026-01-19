import type { Metadata, ResolvingMetadata } from "next"
import type { ReactNode } from "react"
import { notFound } from "next/navigation"
import { getMerchant } from "@/lib/mock-data"

interface MerchantLayoutProps {
  children: ReactNode
  params: Promise<{ merchant_slug: string }>
}

export async function generateMetadata(
  { params }: MerchantLayoutProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { merchant_slug } = await params
  const merchant = getMerchant(merchant_slug)

  if (!merchant) {
    return {
      title: "Merchant Not Found | RouteBase",
    }
  }

  return {
    title: `${merchant.businessName} | RouteBase Checkout`,
    description: merchant.description || `Securely pay to ${merchant.businessName} via RouteBase.`,
    openGraph: {
      title: merchant.businessName,
      description: merchant.description,
      images: [merchant.logoUrl || "/og-image.png"],
    },
  }
}

export default async function MerchantLayout({ children, params }: MerchantLayoutProps) {
  const { merchant_slug } = await params
  const merchant = getMerchant(merchant_slug)

  if (!merchant) {
    notFound()
  }

  return <>{children}</>
}
