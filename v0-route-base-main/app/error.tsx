'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/glass-card'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0C10] p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <GlassCard variant="elevated" className="p-10 rounded-3xl text-center border-red-500/20">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-10 h-10 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">System Error</h2>
                    <p className="text-muted-foreground mb-8">
                        An unexpected error has occurred. Our engineers have been notified.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => reset()}
                            className="w-full py-6 bg-red-500 hover:bg-red-600 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Try again
                        </Button>
                        <Button
                            onClick={() => window.location.href = '/'}
                            variant="outline"
                            className="w-full py-6 border-white/10 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Go Home
                        </Button>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    )
}
