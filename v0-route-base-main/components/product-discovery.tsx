"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useRouteBases } from "@/components/routeBases-provider"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Search, Filter, ShoppingCart, Package, AlertCircle } from "lucide-react"
import type { Product, ProductFilters } from "@/lib/types"

const mockProducts: Product[] = [
  {
    id: "prod-1",
    merchantId: "merchant-1",
    name: "Premium Wireless Headphones",
    price: 12999,
    imageUrl: "/api/placeholder/300/200",
    description: "High-quality wireless headphones with noise cancellation",
    stock: 10,
    category: "Electronics"
  },
  {
    id: "prod-2",
    merchantId: "merchant-1",
    name: "Smart Watch Pro",
    price: 24999,
    imageUrl: "/api/placeholder/300/200",
    description: "Advanced fitness tracking and health monitoring",
    stock: 5,
    category: "Electronics"
  },
  {
    id: "prod-3",
    merchantId: "merchant-2",
    name: "Laptop Stand Aluminum",
    price: 3999,
    imageUrl: "/api/placeholder/300/200",
    description: "Ergonomic aluminum laptop stand",
    stock: 0,
    category: "Office"
  },
  {
    id: "prod-4",
    merchantId: "merchant-2",
    name: "Mechanical Keyboard RGB",
    price: 8999,
    imageUrl: "/api/placeholder/300/200",
    description: "Gaming mechanical keyboard with RGB lighting",
    stock: 15,
    category: "Gaming"
  },
  {
    id: "prod-5",
    merchantId: "merchant-3",
    name: "Wireless Mouse",
    price: 2499,
    imageUrl: "/api/placeholder/300/200",
    description: "Ergonomic wireless mouse with precision tracking",
    stock: 2,
    category: "Accessories"
  }
]

const categories = ["All", "Electronics", "Accessories", "Gaming", "Office"]

export const ProductDiscovery: React.FC = () => {
  const { state, addItem, getStockLevel, isItemInStock } = useRouteBases()
  const [filters, setFilters] = useState<ProductFilters>({
    searchQuery: "",
    priceRange: [0, 30000],
    category: "All",
    inStockOnly: false
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                           product.description?.toLowerCase().includes(filters.searchQuery.toLowerCase())
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      const matchesCategory = filters.category === "All" || product.category === filters.category
      const matchesStock = !filters.inStockOnly || isItemInStock(product.id)
      
      return matchesSearch && matchesPrice && matchesCategory && matchesStock
    })
  }, [filters, isItemInStock])

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      merchantId: product.merchantId,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl
    })
  }

  const getStockBadge = (productId: string, stock: number) => {
    if (stock === 0) {
      return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-500/20 text-red-400 border-red-500/20">Sold Out</span>
    }
    if (stock <= 2) {
      return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-500/20 text-yellow-400 border-yellow-500/20">Only {stock} Left</span>
    }
    return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border-emerald-500/20">In Stock</span>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Product Discovery</h1>
          <p className="text-muted-foreground">Find the perfect products for your needs</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`${isFilterOpen ? "block" : "hidden"} lg:block lg:w-80`}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="lg:hidden"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-sm font-medium mb-3 block">Category</div>
                  <Select value={filters.category} onValueChange={(value: string) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="text-sm font-medium mb-3 block">
                    Price Range: Rs. {filters.priceRange[0].toLocaleString()} - Rs. {filters.priceRange[1].toLocaleString()}
                  </div>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="30000"
                      step="500"
                      value={filters.priceRange[0]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, priceRange: [parseInt(e.target.value), prev.priceRange[1]] }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <input
                      type="range"
                      min="0"
                      max="30000"
                      step="500"
                      value={filters.priceRange[1]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], parseInt(e.target.value)] }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">In Stock Only</div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={filters.inStockOnly}
                    onClick={() => setFilters(prev => ({ ...prev, inStockOnly: !prev.inStockOnly }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      filters.inStockOnly ? 'bg-emerald-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        filters.inStockOnly ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setFilters({
                    searchQuery: "",
                    priceRange: [0, 30000],
                    category: "All",
                    inStockOnly: false
                  })}
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={filters.searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
                </p>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Cart: {state.cartItems.reduce((total, item) => total + item.quantity, 0)} items
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <GlassCard className="overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                    <div className="aspect-video bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                      <Package className="w-12 h-12 text-muted-foreground" />
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg group-hover:text-emerald-400 transition-colors">
                          {product.name}
                        </h3>
                        {getStockBadge(product.id, getStockLevel(product.id))}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-black">Rs. {product.price.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {getStockLevel(product.id)} in stock
                          </p>
                        </div>
                        
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={!isItemInStock(product.id)}
                          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          size="sm"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                      
                      {!isItemInStock(product.id) && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-yellow-400">
                          <AlertCircle className="w-3 h-3" />
                          <span>This item is currently out of stock</span>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
                <Button
                  onClick={() => setFilters({
                    searchQuery: "",
                    priceRange: [0, 30000],
                    category: "All",
                    inStockOnly: false
                  })}
                  variant="outline"
                >
                  Clear All Filters
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
