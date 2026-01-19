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
  title: "RouteBase | Pakistan's Dual-Vertical Payment Platform",
  description: "Whether you sell products or subscriptions, RouteBase powers your payments with instant settlements, real-time analytics, and custom branded checkouts.",
  keywords: ["payments", "fintech", "pakistan", "saas", "checkout", "raast", "jazzcash", "easypaisa"],
  openGraph: {
    title: "RouteBase | Dual-Vertical Payment Platform",
    description: "Instant settlements and custom branded checkouts for Pakistan.",
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
    title: "RouteBase | Dual-Vertical Payment Platform",
    description: "Instant settlements and custom branded checkouts for Pakistan.",
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
