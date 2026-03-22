"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { listarTodasIgrejas, type IgrejaApi } from "@/lib/api"

const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
})

export default function MapPage() {
  const [churches, setChurches] = useState<IgrejaApi[]>([])

  useEffect(() => {
    listarTodasIgrejas().then(setChurches).catch(console.error)
  }, [])

  return (
    <div className="h-screen w-full">
      <MapView churches={churches} />
    </div>
  )
}
