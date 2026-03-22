"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import Link from "next/link"
import "leaflet/dist/leaflet.css"
import type { IgrejaApi } from "@/lib/api"

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface Props {
  churches: IgrejaApi[]
  focusChurchId?: number | null
}

export default function MapView({ churches, focusChurchId }: Props) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const focusChurch = focusChurchId
      ? churches.find((c) => c.id === focusChurchId)
      : null

    const center: [number, number] = focusChurch
      ? [focusChurch.latitude, focusChurch.longitude]
      : [-23.5505, -46.6333]

    const zoom = focusChurch ? 15 : 11

    const map = L.map(containerRef.current).setView(center, zoom)
    mapRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map)

    churches
      .filter((c) => c.latitude && c.longitude)
      .forEach((church) => {
        const marker = L.marker([church.latitude, church.longitude], { icon: defaultIcon }).addTo(map)
        marker.bindPopup(
          `<div>
            <strong>${church.nome}</strong>
            <p>${church.endereco}</p>
            <a href="/igreja/${church.id}">Ver detalhes</a>
          </div>`
        )
      })

    if (focusChurch) {
      map.flyTo([focusChurch.latitude, focusChurch.longitude], 15)
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [churches, focusChurchId])

  return <div ref={containerRef} className="h-full w-full rounded-lg" />
}
