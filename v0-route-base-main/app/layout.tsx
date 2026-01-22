import type React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import { PaymentProvider } from "@/lib/payment-context"
import { AuthProvider } from "@/lib/auth-context"

export const metadata: Metadata = {
  title: "RouteBases | The Financial Orchestration Layer for Pakistan",
  description: "A sophisticated financial orchestration layer engineered to catalyze economic velocity. Synthesizing high-frequency e-commerce with complex subscription logic through a unified neural infrastructure.",
  keywords: ["payments", "fintech", "pakistan", "saas", "checkout", "raast", "jazzcash", "easypaisa", "financial orchestration"],
  icons: {
    icon: "/routebasee.svg",
    shortcut: "/routebasee.svg",
    apple: "/routebasee.svg",
  },
  openGraph: {
    title: "RouteBases | Financial Orchestration Layer",
    description: "Catalyzing economic velocity through a unified neural infrastructure for E-commerce and SaaS.",
    url: "https://routebase.pk",
    siteName: "RouteBases",
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
    title: "RouteBases | Financial Orchestration Layer",
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
      <body className="font-sans antialiased min-h-screen bg-[#0A0C10]">
        <AuthProvider>
          <PaymentProvider>
            {children}
          </PaymentProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
