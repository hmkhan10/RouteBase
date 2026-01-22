"use client"

import React from "react"
import { RouteBasesProvider } from "@/components/routeBases-provider"
import { ProductDiscovery } from "@/components/product-discovery"

export default function MarketplacePage() {
  return (
    <RouteBasesProvider>
      <ProductDiscovery />
    </RouteBasesProvider>
  )
}
