import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Outfit } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"
import { PaymentProvider } from "@/lib/payment-context"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })

export const metadata: Metadata = {
  title: "RouteBase | The Financial Orchestration Layer for Pakistan",
  description: "A sophisticated financial orchestration layer engineered to catalyze economic velocity. Synthesizing high-frequency e-commerce with complex subscription logic through a unified neural infrastructure.",
  keywords: ["payments", "fintech", "pakistan", "saas", "checkout", "raast", "jazzcash", "easypaisa", "financial orchestration"],
  openGraph: {
    title: "RouteBase | Financial Orchestration Layer",
    description: "Catalyzing economic velocity through a unified neural infrastructure for E-commerce and SaaS.",
    url: "https://routebase.pk",
    siteName: "RouteBase",
    images: [
      {
        url: "/og-main.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RouteBase | Financial Orchestration Layer",
    description: "Catalyzing economic velocity through a unified neural infrastructure for E-commerce and SaaS.",
    images: ["/og-main.png"],
  },
}

export const viewport: Viewport = {
  themeColor: "#0A0C10",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased min-h-screen bg-[#0A0C10]`}>
        <AuthProvider>
          <PaymentProvider>
            {children}
          </PaymentProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
