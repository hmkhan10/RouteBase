import type { Metadata } from "next"
import { notFound } from "next/navigation"

interface MerchantResponse {
  id: number
  slug: string
  store_name: string
  created_at: string
  updated_at: string
}

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getMerchant(slug: string): Promise<MerchantResponse | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  
  try {
    const response = await fetch(`${apiUrl}/api/merchants/${slug}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    } as RequestInit & { next?: { revalidate?: number } })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch merchant: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error fetching merchant:", error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const merchant = await getMerchant(slug)
  
  if (!merchant) {
    return {
      title: "Merchant Not Found",
    }
  }
  
  return {
    title: `${merchant.store_name} - RouteBase`,
    description: `Visit ${merchant.store_name} on RouteBase`,
  }
}

export default async function MerchantPage({ params }: PageProps) {
  const { slug } = await params
  const merchant = await getMerchant(slug)

  if (!merchant) {
    notFound()
    return // TypeScript doesn't know notFound() never returns
  }

  // TypeScript now knows merchant is not null
  const { store_name, slug: merchantSlug } = merchant

  return (
    <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-black text-white mb-4">{store_name}</h1>
        <p className="text-muted-foreground text-sm">Slug: {merchantSlug}</p>
      </div>
    </div>
  )
}
