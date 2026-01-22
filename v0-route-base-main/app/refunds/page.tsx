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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, RefreshCw, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface Refund {
  id: string
  order_id: string
  amount: string
  reason: string
  status: string
  refund_id: string
  processor: string
  refund_method: string
  created_at: string
  completed_at?: string
  admin_notes?: string
}

export default function RefundsPage() {
  const router = useRouter()
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    order_id: "",
    amount: "",
    reason: "",
    refund_method: "ORIGINAL"
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRefunds()
  }, [])

  const fetchRefunds = async () => {
    try {
      const response = await apiClient.get('/api/refunds/list/')
      if (response.success) {
        setRefunds(response.refunds)
      }
    } catch (error) {
      console.error('Failed to fetch refunds:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await apiClient.post('/api/refunds/', formData)
      if (response.success) {
        setFormData({ order_id: "", amount: "", reason: "", refund_method: "ORIGINAL" })
        setShowCreateForm(false)
        await fetchRefunds()
      }
    } catch (error: any) {
      console.error('Failed to create refund:', error)
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
                <DollarSign className="w-4 h-4 mr-2" />
                New Refund
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Refund Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GlassCard variant="elevated" className="p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Create New Refund</h2>
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
                    <Label htmlFor="order_id">Order ID</Label>
                    <Input
                      id="order_id"
                      value={formData.order_id}
                      onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                      placeholder="Enter order ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (PKR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="Enter refund amount"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refund_method">Refund Method</Label>
                  <Select value={formData.refund_method} onValueChange={(value) => setFormData({ ...formData, refund_method: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select refund method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ORIGINAL">Original Payment Method</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="JAZZCASH">JazzCash</SelectItem>
                      <SelectItem value="EASYPAYSA">EasyPaisa</SelectItem>
                      <SelectItem value="RAAST">Raast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Refund</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Enter reason for refund"
                    rows={3}
                    required
                  />
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
                    "Create Refund"
                  )}
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {/* Refunds List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Refunds History</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchRefunds}
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
          ) : refunds.length === 0 ? (
            <GlassCard variant="elevated" className="p-8 rounded-2xl text-center">
              <p className="text-muted-foreground">No refunds found</p>
            </GlassCard>
          ) : (
            <div className="grid gap-4">
              {refunds.map((refund) => (
                <GlassCard key={refund.id} variant="elevated" className="p-6 rounded-2xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(refund.status)}>
                          {getStatusIcon(refund.status)}
                          <span className="ml-2">{refund.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Refund ID: {refund.refund_id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Order ID: {refund.order_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-400">
                        PKR {refund.amount}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Method</p>
                      <p className="text-sm">{refund.refund_method.replace('_', ' ')}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Processor</p>
                      <p className="text-sm">{refund.processor}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reason</p>
                      <p className="text-sm">{refund.reason}</p>
                    </div>

                    {refund.admin_notes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Admin Notes</p>
                        <p className="text-sm">{refund.admin_notes}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p className="font-medium">Created</p>
                        <p>{new Date(refund.created_at).toLocaleDateString()}</p>
                      </div>
                      {refund.completed_at && (
                        <div>
                          <p className="font-medium">Completed</p>
                          <p>{new Date(refund.completed_at).toLocaleDateString()}</p>
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
