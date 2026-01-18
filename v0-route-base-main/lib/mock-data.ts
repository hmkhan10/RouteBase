import type { Merchant, Transaction, Product, DashboardMetrics, SaaSMetrics, PlanType } from "./types"

// Mock merchants database
export const merchants: Record<string, Merchant> = {
  techflow: {
    id: "1",
    slug: "techflow",
    businessName: "TechFlow Solutions",
    description: "Premium Software Development",
    brandColor: "#3B82F6",
    planType: "Ecommerce-Pro",
    email: "contact@techflow.pk",
    phone: "+92 300 1234567",
    websiteUrl: "https://techflow.pk",
    createdAt: new Date("2024-01-15"),
  },
  cloudnine: {
    id: "2",
    slug: "cloudnine",
    businessName: "CloudNine SaaS",
    description: "Enterprise Cloud Platform",
    brandColor: "#8B5CF6",
    planType: "SaaS-Max",
    email: "hello@cloudnine.pk",
    createdAt: new Date("2024-02-20"),
  },
  quickstore: {
    id: "3",
    slug: "quickstore",
    businessName: "QuickStore",
    description: "Fast Retail Solutions",
    brandColor: "#10B981",
    planType: "Basic",
    email: "sales@quickstore.pk",
    createdAt: new Date("2024-03-10"),
  },
  protools: {
    id: "4",
    slug: "protools",
    businessName: "ProTools Digital",
    description: "Digital Marketing Agency",
    brandColor: "#F59E0B",
    planType: "SaaS-Pro",
    email: "info@protools.pk",
    createdAt: new Date("2024-04-05"),
  },
}

export const products: Record<string, Product[]> = {
  techflow: [
    {
      id: "p1",
      merchantId: "1",
      name: "Website Development",
      price: 150000,
      stock: 10,
      description: "Custom website development package",
    },
    {
      id: "p2",
      merchantId: "1",
      name: "Mobile App",
      price: 250000,
      stock: 5,
      description: "Cross-platform mobile application",
    },
    {
      id: "p3",
      merchantId: "1",
      name: "SEO Package",
      price: 45000,
      stock: 20,
      description: "Complete SEO optimization",
    },
  ],
  cloudnine: [
    { id: "p4", merchantId: "2", name: "Starter Plan", price: 9999, stock: 999, description: "Monthly subscription" },
    { id: "p5", merchantId: "2", name: "Pro Plan", price: 29999, stock: 999, description: "Monthly subscription" },
    {
      id: "p6",
      merchantId: "2",
      name: "Enterprise Plan",
      price: 99999,
      stock: 999,
      description: "Monthly subscription",
    },
  ],
}

export const transactions: Transaction[] = [
  {
    id: "tx1",
    merchantId: "1",
    amount: 150000,
    fee: 4500,
    netAmount: 145500,
    customerName: "Ahmed Khan",
    status: "verified",
    paymentMethod: "Raast",
    createdAt: new Date("2025-01-15"),
    transactionId: "RB-78234",
  },
  {
    id: "tx2",
    merchantId: "1",
    amount: 45000,
    fee: 1350,
    netAmount: 43650,
    customerName: "Sara Ali",
    status: "verified",
    paymentMethod: "JazzCash",
    createdAt: new Date("2025-01-14"),
    transactionId: "RB-78235",
  },
  {
    id: "tx3",
    merchantId: "1",
    amount: 250000,
    fee: 7500,
    netAmount: 242500,
    customerName: "Tech Corp",
    status: "pending",
    paymentMethod: "Bank Transfer",
    createdAt: new Date("2025-01-13"),
    transactionId: "RB-78236",
  },
  {
    id: "tx4",
    merchantId: "2",
    amount: 29999,
    fee: 900,
    netAmount: 29099,
    customerName: "StartupXYZ",
    status: "verified",
    paymentMethod: "Raast",
    createdAt: new Date("2025-01-15"),
    transactionId: "RB-78237",
  },
  {
    id: "tx5",
    merchantId: "2",
    amount: 99999,
    fee: 3000,
    netAmount: 96999,
    customerName: "BigEnterprise",
    status: "verified",
    paymentMethod: "Bank Transfer",
    createdAt: new Date("2025-01-12"),
    transactionId: "RB-78238",
  },
]

export function getMerchant(slug: string): Merchant | null {
  return merchants[slug] || null
}

export function getMerchantProducts(slug: string): Product[] {
  return products[slug] || []
}

export function getMerchantTransactions(merchantId: string): Transaction[] {
  return transactions.filter((tx) => tx.merchantId === merchantId)
}

export function getEcommerceMetrics(merchantId: string): DashboardMetrics {
  const txs = getMerchantTransactions(merchantId)
  const totalVolume = txs.reduce((sum, tx) => sum + tx.amount, 0)
  const totalFees = txs.reduce((sum, tx) => sum + tx.fee, 0)

  return {
    totalVolume,
    merchantProfit: totalVolume - totalFees,
    totalFees,
    transactionCount: txs.length,
    chartData: [
      { date: "Jan 10", amount: 125000 },
      { date: "Jan 11", amount: 180000 },
      { date: "Jan 12", amount: 250000 },
      { date: "Jan 13", amount: 195000 },
      { date: "Jan 14", amount: 285000 },
      { date: "Jan 15", amount: 320000 },
      { date: "Jan 16", amount: 445000 },
    ],
  }
}

export function getSaaSMetrics(merchantId: string): SaaSMetrics {
  const base = getEcommerceMetrics(merchantId)
  return {
    ...base,
    activeSubscribers: 847,
    churnRate: 2.4,
    mrr: 2540000,
    arr: 30480000,
    retentionRate: 97.6,
  }
}

export function showDashboard(planType: PlanType): boolean {
  return planType === "Ecommerce-Pro" || planType === "SaaS-Max"
}
