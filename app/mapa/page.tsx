"use client"

import dynamic from "next/dynamic"
import { use, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { churches } from "@/lib/mock-data"
import { Loader2 } from "lucide-react"

const MapView = dynamic(() => import("@/components/map-view").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-muted rounded-lg">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm">Carregando mapa...</span>
      </div>
    </div>
  ),
})

function MapContent() {
  const searchParams = useSearchParams()
  const churchId = searchParams.get("church")

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Mapa de Igrejas
          </h1>
          <p className="text-sm text-muted-foreground">
            {churches.length} igrejas encontradas
          </p>
        </div>
      </div>
      <div className="flex-1">
        <MapView churches={churches} focusChurchId={churchId} />
      </div>
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <MapContent />
    </Suspense>
  )
}
