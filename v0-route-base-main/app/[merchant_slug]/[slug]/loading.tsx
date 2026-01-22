import { RouteBasesLogo } from "@/components/routebase-logo"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center justify-center p-4">
      <div className="animate-pulse flex flex-col items-center gap-6">
        <RouteBasesLogo size="lg" />
        <div className="space-y-3 text-center">
          <div className="h-8 w-64 bg-white/5 rounded-xl mx-auto" />
          <div className="h-4 w-48 bg-white/5 rounded-lg mx-auto" />
        </div>
      </div>
    </div>
  )
}
