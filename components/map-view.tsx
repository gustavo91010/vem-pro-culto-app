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

    const centerLat = focusChurch?.endereco?.latitude || focusChurch?.latitude || -23.5505;
    const centerLng = focusChurch?.endereco?.longitude || focusChurch?.longitude || -46.6333;

    const center: [number, number] = [centerLat, centerLng];

    const zoom = focusChurch ? 15 : 11

    const map = L.map(containerRef.current).setView(center, zoom)
    mapRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map)

    churches
      .filter((c) => (c.endereco?.latitude || c.latitude) && (c.endereco?.longitude || c.longitude))
      .forEach((church) => {
        const lat = church.endereco?.latitude || church.latitude || 0;
        const lng = church.endereco?.longitude || church.longitude || 0;
        const nome = church.nomeFantasia || church.nome || church.razaoSocial;
        const logradouro = church.endereco?.logradouro || church.endereco || "";
        
        const marker = L.marker([lat, lng], { icon: defaultIcon }).addTo(map)
        marker.bindPopup(
          `<div>
            <strong>${nome}</strong>
            <p>${logradouro}</p>
            <a href="/igreja/${encodeURIComponent(church.razaoSocial)}">Ver detalhes</a>
          </div>`
        )
      })

    if (focusChurch) {
      const flatLat = focusChurch.endereco?.latitude || focusChurch.latitude || 0;
      const flatLng = focusChurch.endereco?.longitude || focusChurch.longitude || 0;
      map.flyTo([flatLat, flatLng], 15)
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [churches, focusChurchId])

  return <div ref={containerRef} className="h-full w-full rounded-lg" />
}
