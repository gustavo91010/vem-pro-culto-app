"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { IgrejaApi } from "@/lib/api"
import { LocateFixed } from "lucide-react"
import { Button } from "./ui/button"

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
  const markersLayerRef = useRef<L.LayerGroup | null>(null)

  const handleLocateMe = () => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], 15)
        }
      },
      (error) => {
        console.error("Erro ao obter localização:", error)
      }
    )
  }

  // Inicialização do Mapa
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const focusChurch = focusChurchId
      ? churches.find((c) => c.id === focusChurchId)
      : null

    const centerLat = focusChurch?.endereco?.latitude || focusChurch?.latitude || -23.5505;
    const centerLng = focusChurch?.endereco?.longitude || focusChurch?.longitude || -46.6333;

    const center: [number, number] = [centerLat, centerLng];
    const zoom = focusChurch ? 15 : 11

    const map = L.map(containerRef.current, { zoomControl: false }).setView(center, zoom)
    mapRef.current = map

    L.control.zoom({ position: 'topright' }).addTo(map)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    markersLayerRef.current = L.layerGroup().addTo(map)

    if (!focusChurchId) {
      handleLocateMe()
    }

    return () => {
      map.remove()
      mapRef.current = null
      markersLayerRef.current = null
    }
  }, []) // Inicializa apenas uma vez

  // Atualizar marcadores e foco
  useEffect(() => {
    const map = mapRef.current
    const markersLayer = markersLayerRef.current
    if (!map || !markersLayer) return

    markersLayer.clearLayers()

    churches
      .filter((c) => (c.endereco?.latitude || c.latitude) && (c.endereco?.longitude || c.longitude))
      .forEach((church) => {
        const lat = church.endereco?.latitude || church.latitude || 0;
        const lng = church.endereco?.longitude || church.longitude || 0;
        const nome = church.nomeFantasia || church.nome || church.razaoSocial;
        const logradouro = church.endereco?.logradouro || church.endereco || "";
        
        const marker = L.marker([lat, lng], { icon: defaultIcon })
        marker.bindPopup(
          `<div>
            <strong>${nome}</strong>
            <p>${logradouro}</p>
            <a href="/igreja/${encodeURIComponent(church.razaoSocial)}">Ver detalhes</a>
          </div>`
        )
        markersLayer.addLayer(marker)
      })

    if (focusChurchId) {
      const focusChurch = churches.find((c) => c.id === focusChurchId)
      if (focusChurch) {
        const flatLat = focusChurch.endereco?.latitude || focusChurch.latitude || 0;
        const flatLng = focusChurch.endereco?.longitude || focusChurch.longitude || 0;
        map.flyTo([flatLat, flatLng], 15)
      }
    }
  }, [churches, focusChurchId])

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full rounded-lg" />
      <div className="absolute bottom-24 right-4 z-[5000]">
        <Button
          onClick={handleLocateMe}
          className="h-12 w-12 rounded-full shadow-2xl bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-white flex items-center justify-center transition-all active:scale-95"
          size="icon"
          title="Minha Localização"
        >
          <LocateFixed className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
