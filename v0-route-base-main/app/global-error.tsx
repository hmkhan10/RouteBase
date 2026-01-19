'use client'

import { ShieldAlert, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html lang="en" className="dark">
            <body className="bg-[#0A0C10] text-white font-sans antialiased min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-md text-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-10 h-10 text-red-400" />
                    </div>
                    <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Critical System Failure</h2>
                    <p className="text-muted-foreground mb-8">
                        A critical error occurred that could not be recovered. Please try refreshing the application.
                    </p>
                    <Button
                        onClick={() => reset()}
                        className="w-full py-6 bg-red-500 hover:bg-red-600 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Refresh Application
                    </Button>
                </div>
            </body>
        </html>
    )
}
