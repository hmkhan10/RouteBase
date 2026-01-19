"use client"

import { use, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { notFound } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageTransition } from "@/components/page-transition"
import { Search, Printer, CheckCircle2, Clock, XCircle } from "lucide-react"

interface TransactionsPageProps {
  params: Promise<{ merchant_slug: string }>
}

export default function TransactionsPage({ params }: TransactionsPageProps) {
  const { merchant_slug } = use(params)
  const [merchant, setMerchant] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "verified" | "pending">("all")

  useEffect(() => {
    async function fetchData() {
      try {
        const merchantData = await apiClient.get<any>(`/api/merchants/${merchant_slug}`)
        setMerchant(merchantData)

        try {
          const txData = await apiClient.get<any[]>(`/api/transactions/${merchant_slug}`)
          setTransactions(txData)
        } catch (e) {
          console.warn("Transactions API not found, using empty list")
          setTransactions([])
        }
      } catch (error) {
        console.error("Failed to fetch merchant for transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [merchant_slug])

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-10 w-48 bg-white/5 rounded" />
        <div className="h-64 bg-white/5 rounded-2xl" />
      </div>
    )
  }

  if (!merchant) {
    notFound()
  }

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === "all" || tx.status === filter
    return matchesSearch && matchesFilter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      case "pending":
      case "processing":
        return <Clock className="w-4 h-4 text-yellow-400" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
      case "completed":
        return "text-emerald-400 bg-emerald-500/10"
      case "pending":
      case "processing":
        return "text-yellow-400 bg-yellow-500/10"
      case "failed":
        return "text-red-400 bg-red-500/10"
      default:
        return ""
    }
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <header className="flex justify-between items-start">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black uppercase tracking-tight"
            >
              Transaction Ledger
            </motion.h1>
            <p className="text-muted-foreground mt-1">Complete payment history for {merchant.businessName || merchant.store_name}</p>
          </div>
          <Button
            variant="outline"
            className="border-white/10 font-bold uppercase tracking-widest text-xs bg-transparent"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Logs
          </Button>
        </header>

        {/* Filters */}
        <GlassCard className="p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-white/5 border-white/10 rounded-xl"
            />
          </div>

          <div className="flex gap-2">
            {(["all", "verified", "pending"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(f)}
                className={`text-[10px] font-bold uppercase tracking-widest ${filter === f ? "bg-emerald-500 text-black" : ""
                  }`}
              >
                {f === "all" ? "All Time" : f}
              </Button>
            ))}
          </div>
        </GlassCard>

        {/* Transactions Table */}
        <GlassCard className="rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Reference / Gateway ID
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, i) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-emerald-400">#{tx.id}</span>
                          <span className="text-[10px] text-muted-foreground">{tx.transactionId || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-medium">{tx.customerName}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold uppercase">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-bold">Rs. {tx.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(tx.status)}`}
                        >
                          {getStatusIcon(tx.status)}
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString("en-PK", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="text-muted-foreground">
                        <Search className="w-10 h-10 mx-auto mb-4 opacity-20" />
                        <p className="font-bold uppercase text-xs tracking-widest">No matching records</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  )
}
