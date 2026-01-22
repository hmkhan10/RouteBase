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
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, RefreshCw, Globe, Clock, CheckCircle, XCircle, AlertCircle, Zap, Copy, Eye, EyeOff } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface WebhookConfig {
  webhook_url: string
  webhook_secret: string
  events: string[]
  is_active: boolean
  allowed_ips: string[]
}

interface WebhookLog {
  id: string
  event_type: string
  url: string
  status: string
  response_status: number
  response_time_ms: number
  attempt_count: number
  created_at: string
  delivered_at?: string
  next_retry_at?: string
}

export default function WebhooksPage() {
  const router = useRouter()
  const [config, setConfig] = useState<WebhookConfig | null>(null)
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showConfigForm, setShowConfigForm] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [showTestForm, setShowTestForm] = useState(false)
  const [formData, setFormData] = useState({
    webhook_url: "",
    events: ["payment.completed"],
    allowed_ips: [] as string[]
  })
  const [testData, setTestData] = useState({
    event_type: "payment.completed",
    payload: '{"order_id": "123", "amount": "1000.00"}'
  })
  const [submitting, setSubmitting] = useState(false)

  const availableEvents = [
    "payment.completed",
    "payment.failed",
    "refund.processed",
    "refund.failed",
    "payout.created",
    "payout.completed",
    "payout.failed"
  ]

  useEffect(() => {
    fetchWebhookConfig()
    fetchWebhookLogs()
  }, [])

  const fetchWebhookConfig = async () => {
    try {
      const response = await apiClient.get('/api/webhooks/')
      if (response.success) {
        setConfig(response)
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Failed to fetch webhook config:', error)
      }
    }
  }

  const fetchWebhookLogs = async () => {
    try {
      const response = await apiClient.get('/api/webhooks/logs/')
      if (response.success) {
        setLogs(response.logs)
      }
    } catch (error) {
      console.error('Failed to fetch webhook logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await apiClient.post('/api/webhooks/', formData)
      if (response.success) {
        setConfig(response)
        setFormData({ webhook_url: "", events: ["payment.completed"], allowed_ips: [] })
        setShowConfigForm(false)
      }
    } catch (error: any) {
      console.error('Failed to configure webhook:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = JSON.parse(testData.payload)
      const response = await apiClient.post('/api/webhooks/trigger/', {
        event_type: testData.event_type,
        payload
      })
      if (response.success) {
        setTestData({ event_type: "payment.completed", payload: '{"order_id": "123", "amount": "1000.00"}' })
        setShowTestForm(false)
        await fetchWebhookLogs()
      }
    } catch (error: any) {
      console.error('Failed to trigger webhook:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'RETRYING':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'FAILED':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4" />
      case 'RETRYING':
        return <Clock className="w-4 h-4" />
      case 'FAILED':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
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
              {!config && (
                <Button
                  onClick={() => setShowConfigForm(true)}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Configure Webhook
                </Button>
              )}
              {config && (
                <Button
                  onClick={() => setShowTestForm(!showTestForm)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Test Webhook
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Configuration */}
        {config && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GlassCard variant="elevated" className="p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Webhook Configuration</h2>
                <div className="flex items-center gap-2">
                  <Badge className={config.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}>
                    {config.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfigForm(true)}
                  >
                    Edit
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Webhook URL</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={config.webhook_url}
                      readOnly
                      className="bg-black/20"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(config.webhook_url)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Webhook Secret</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={config.webhook_secret}
                      type={showSecret ? "text" : "password"}
                      readOnly
                      className="bg-black/20"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(config.webhook_secret)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Subscribed Events</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {config.events.map((event) => (
                      <Badge key={event} variant="secondary">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>

                {config.allowed_ips.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Allowed IPs</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {config.allowed_ips.map((ip) => (
                        <Badge key={ip} variant="outline">
                          {ip}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Configure Webhook Form */}
        {showConfigForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GlassCard variant="elevated" className="p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {config ? 'Update Webhook' : 'Configure Webhook'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfigForm(false)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook_url">Webhook URL</Label>
                  <Input
                    id="webhook_url"
                    type="url"
                    value={formData.webhook_url}
                    onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                    placeholder="https://your-domain.com/webhook"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subscribed Events</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableEvents.map((event) => (
                      <div key={event} className="flex items-center space-x-2">
                        <Switch
                          id={event}
                          checked={formData.events.includes(event)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                events: [...formData.events, event]
                              })
                            } else {
                              setFormData({
                                ...formData,
                                events: formData.events.filter(e => e !== event)
                              })
                            }
                          }}
                        />
                        <Label htmlFor={event} className="text-sm">{event}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allowed_ips">Allowed IPs (Optional)</Label>
                  <Input
                    id="allowed_ips"
                    value={formData.allowed_ips.join(', ')}
                    onChange={(e) => setFormData({
                      ...formData,
                      allowed_ips: e.target.value.split(',').map(ip => ip.trim()).filter(Boolean)
                    })}
                    placeholder="192.168.1.1, 10.0.0.1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of allowed IP addresses. Leave empty to allow all.
                  </p>
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
                    config ? 'Update Webhook' : 'Configure Webhook'
                  )}
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {/* Test Webhook Form */}
        {showTestForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GlassCard variant="elevated" className="p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Test Webhook</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTestForm(false)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleTest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event_type">Event Type</Label>
                  <Select value={testData.event_type} onValueChange={(value) => setTestData({ ...testData, event_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEvents.map((event) => (
                        <SelectItem key={event} value={event}>{event}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payload">Payload (JSON)</Label>
                  <Textarea
                    id="payload"
                    value={testData.payload}
                    onChange={(e) => setTestData({ ...testData, payload: e.target.value })}
                    placeholder='{"order_id": "123", "amount": "1000.00"}'
                    rows={4}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Triggering...
                    </span>
                  ) : (
                    "Trigger Webhook"
                  )}
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {/* Webhook Logs */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Webhook Delivery Logs</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchWebhookLogs}
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
          ) : logs.length === 0 ? (
            <GlassCard variant="elevated" className="p-8 rounded-2xl text-center">
              <p className="text-muted-foreground">No webhook logs found</p>
            </GlassCard>
          ) : (
            <div className="grid gap-4">
              {logs.map((log) => (
                <GlassCard key={log.id} variant="elevated" className="p-6 rounded-2xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(log.status)}>
                          {getStatusIcon(log.status)}
                          <span className="ml-2">{log.status}</span>
                        </Badge>
                        {log.attempt_count > 1 && (
                          <Badge variant="outline">
                            Attempt {log.attempt_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Event: {log.event_type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        URL: {log.url}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {log.response_status ? `HTTP ${log.response_status}` : 'Pending'}
                      </p>
                      {log.response_time_ms && (
                        <p className="text-xs text-muted-foreground">
                          {log.response_time_ms}ms
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p className="font-medium">Created</p>
                      <p>{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                    {log.delivered_at && (
                      <div>
                        <p className="font-medium">Delivered</p>
                        <p>{new Date(log.delivered_at).toLocaleString()}</p>
                      </div>
                    )}
                    {log.next_retry_at && (
                      <div>
                        <p className="font-medium">Next Retry</p>
                        <p>{new Date(log.next_retry_at).toLocaleString()}</p>
                      </div>
                    )}
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
