'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
                    <div className="w-full max-w-md space-y-4 text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Critical Error</h2>
                        <p className="text-gray-600">
                            A critical system error occurred. Please refresh the page.
                        </p>
                        <button
                            onClick={() => reset()}
                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    )
}
