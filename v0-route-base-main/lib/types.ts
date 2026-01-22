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
  category?: string
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

export interface CartItem extends CheckoutItem {
  merchantId: string
  imageUrl?: string
}

export interface InventoryLevels {
  [productId: string]: number
}

export interface OrderHistory {
  id: string
  items: CartItem[]
  totalAmount: number
  status: "pending" | "confirmed" | "failed"
  createdAt: Date
  shippingAddress?: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
  }
}

export interface RouteBasesState {
  cartItems: CartItem[]
  inventoryLevels: InventoryLevels
  orderHistory: OrderHistory[]
  isCheckingOut: boolean
}

export type RouteBasesAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "START_CHECKOUT" }
  | { type: "END_CHECKOUT" }
  | { type: "CONFIRM_ORDER"; payload: OrderHistory }
  | { type: "LOAD_STATE"; payload: RouteBasesState }
  | { type: "SET_INVENTORY"; payload: InventoryLevels }

export interface ProductFilters {
  searchQuery: string
  priceRange: [number, number]
  category: string
  inStockOnly: boolean
}
