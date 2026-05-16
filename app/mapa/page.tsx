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
    listarTodasIgrejas()
      .then((data) => {
        if (data) {
          setChurches(data.filter((i) => i.ativo))
        }
      })
      .catch(console.error)
  }, [])

  return (
    <div className="h-[calc(100vh-64px)] w-full">
      <MapView churches={churches} />
    </div>
  )
}
