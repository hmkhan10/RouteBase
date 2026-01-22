"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { RouteBasesLogo } from "@/components/routebase-logo"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, RefreshCw, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, TrendingDown, BanknoteIcon } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface Payout {
  id: string
  amount: string
  net_amount: string
  platform_fee: string
  tax_withheld: string
  status: string
  payout_method: string
  payout_id: string
  period_start: string
  period_end: string
  created_at: string
  completed_at?: string
  bank_reference?: string
}

export default function PayoutsPage() {
  const router = useRouter()
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    payout_method: "BANK_TRANSFER"
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPayouts()
  }, [])

  const fetchPayouts = async () => {
    try {
      const response = await apiClient.get('/api/payouts/list/')
      if (response.success) {
        setPayouts(response.payouts)
      }
    } catch (error) {
      console.error('Failed to fetch payouts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await apiClient.post('/api/payouts/', formData)
      if (response.success) {
        setFormData({ amount: "", payout_method: "BANK_TRANSFER" })
        setShowCreateForm(false)
        await fetchPayouts()
      }
    } catch (error: any) {
      console.error('Failed to create payout:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'PROCESSING':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'FAILED':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />
      case 'PROCESSING':
        return <Clock className="w-4 h-4" />
      case 'FAILED':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const totalGross = payouts.reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const totalNet = payouts.reduce((sum, p) => sum + parseFloat(p.net_amount), 0)
  const totalFees = payouts.reduce((sum, p) => sum + parseFloat(p.platform_fee), 0)
  const totalTax = payouts.reduce((sum, p) => sum + parseFloat(p.tax_withheld), 0)

  return (
    <div className="min-h-screen bg-[#0A0C10]">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <RouteBasesLogo size="sm" />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <BanknoteIcon className="w-4 h-4 mr-2" />
                Request Payout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GlassCard variant="elevated" className="p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Gross</p>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              PKR {totalGross.toFixed(2)}
            </p>
          </GlassCard>

          <GlassCard variant="elevated" className="p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Net</p>
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">
              PKR {totalNet.toFixed(2)}
            </p>
          </GlassCard>

          <GlassCard variant="elevated" className="p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Platform Fees</p>
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">
              PKR {totalFees.toFixed(2)}
            </p>
          </GlassCard>

          <GlassCard variant="elevated" className="p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Tax Withheld</p>
              <AlertCircle className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400">
              PKR {totalTax.toFixed(2)}
            </p>
          </GlassCard>
        </div>

        {/* Create Payout Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GlassCard variant="elevated" className="p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Request Payout</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (PKR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="1000"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="Enter amount (min: PKR 1000)"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payout_method">Payout Method</Label>
                    <Select value={formData.payout_method} onValueChange={(value) => setFormData({ ...formData, payout_method: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payout method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                        <SelectItem value="JAZZCASH">JazzCash</SelectItem>
                        <SelectItem value="EASYPAYSA">EasyPaisa</SelectItem>
                        <SelectItem value="RAAST">Raast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-sm text-yellow-400">
                    <strong>Fee Structure:</strong>
                  </p>
                  <ul className="text-sm text-yellow-400 mt-2 space-y-1">
                    <li>• Platform Fee: 3% of gross amount</li>
                    <li>• Tax Withholding: 5% of gross amount</li>
                    <li>• Minimum payout amount: PKR 1,000</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Request Payout"
                  )}
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {/* Payouts List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Payouts History</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchPayouts}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            </div>
          ) : payouts.length === 0 ? (
            <GlassCard variant="elevated" className="p-8 rounded-2xl text-center">
              <p className="text-muted-foreground">No payouts found</p>
            </GlassCard>
          ) : (
            <div className="grid gap-4">
              {payouts.map((payout) => (
                <GlassCard key={payout.id} variant="elevated" className="p-6 rounded-2xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(payout.status)}>
                          {getStatusIcon(payout.status)}
                          <span className="ml-2">{payout.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Payout ID: {payout.payout_id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Period: {new Date(payout.period_start).toLocaleDateString()} - {new Date(payout.period_end).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div>
                        <p className="text-sm text-muted-foreground line-through">PKR {payout.amount}</p>
                        <p className="text-lg font-bold text-emerald-400">PKR {payout.net_amount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Method</p>
                      <p className="text-sm">{payout.payout_method.replace('_', ' ')}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Platform Fee</p>
                        <p className="text-red-400">PKR {payout.platform_fee}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Tax Withheld</p>
                        <p className="text-yellow-400">PKR {payout.tax_withheld}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Net Amount</p>
                        <p className="text-emerald-400">PKR {payout.net_amount}</p>
                      </div>
                    </div>

                    {payout.bank_reference && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Bank Reference</p>
                        <p className="text-sm">{payout.bank_reference}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p className="font-medium">Created</p>
                        <p>{new Date(payout.created_at).toLocaleDateString()}</p>
                      </div>
                      {payout.completed_at && (
                        <div>
                          <p className="font-medium">Completed</p>
                          <p>{new Date(payout.completed_at).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
