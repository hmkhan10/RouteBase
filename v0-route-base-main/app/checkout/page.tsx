"use client"

import React from "react"
import { RouteBasesProvider } from "@/components/routeBases-provider"
import { CheckoutPage } from "@/components/checkout-page"

export default function CheckoutPageWrapper() {
  return (
    <RouteBasesProvider>
      <CheckoutPage />
    </RouteBasesProvider>
  )
}
