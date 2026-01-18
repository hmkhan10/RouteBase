import type React from "react"
import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "RouteBase | Enterprise Payment Infrastructure",
  description: "The enterprise standard for high-volume transactions. Deploy secure payment terminals in seconds.",
  generator: "RouteBase",
  keywords: ["payments", "fintech", "Pakistan", "PKR", "merchant", "ecommerce", "SaaS"],
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
      <body className={`${plusJakarta.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-[#0A0C10]`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
