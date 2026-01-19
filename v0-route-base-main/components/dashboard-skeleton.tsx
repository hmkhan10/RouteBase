"use client"

export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-[#0A0C10] flex">
            {/* Sidebar Skeleton */}
            <div className="w-72 border-r border-white/5 p-8 space-y-8">
                <div className="w-12 h-12 rounded-xl bg-white/5 animate-pulse" />
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>

            {/* Main Content Skeleton */}
            <main className="flex-1 p-10 space-y-8">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <div className="h-10 w-64 bg-white/5 rounded-xl animate-pulse" />
                        <div className="h-4 w-48 bg-white/5 rounded-lg animate-pulse" />
                    </div>
                    <div className="h-10 w-32 bg-white/5 rounded-xl animate-pulse" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>

                <div className="h-[400px] bg-white/5 rounded-3xl animate-pulse" />
            </main>
        </div>
    )
}
