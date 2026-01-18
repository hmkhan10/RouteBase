export type PlanType = "Basic" | "SaaS-Pro" | "Ecommerce-Pro" | "SaaS-Max"

export interface Merchant {
  id: string
  slug: string
  businessName: string
  description?: string
  logoUrl?: string
  brandColor: string
  planType: PlanType
  email: string
  phone?: string
  websiteUrl?: string
  createdAt: Date
}

export interface Product {
  id: string
  merchantId: string
  name: string
  price: number
  imageUrl?: string
  description?: string
  stock: number
}

export interface Transaction {
  id: string
  merchantId: string
  amount: number
  fee: number
  netAmount: number
  customerName: string
  customerEmail?: string
  status: "pending" | "verified" | "failed"
  paymentMethod: string
  createdAt: Date
  transactionId?: string
}

export interface CheckoutItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export interface DashboardMetrics {
  totalVolume: number
  merchantProfit: number
  totalFees: number
  transactionCount: number
  chartData: { date: string; amount: number }[]
}

export interface SaaSMetrics extends DashboardMetrics {
  activeSubscribers: number
  churnRate: number
  mrr: number
  arr: number
  retentionRate: number
}
