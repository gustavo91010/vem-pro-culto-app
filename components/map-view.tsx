"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, ExternalLink } from "lucide-react"
import type { Church } from "@/lib/mock-data"
import "leaflet/dist/leaflet.css"

// Fix default marker icons for Leaflet in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = defaultIcon

function FlyToChurch({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 15, { duration: 1.5 })
    }
  }, [lat, lng, map])
  return null
}

interface MapViewProps {
  churches: Church[]
  focusChurchId?: string | null
}

export function MapView({ churches, focusChurchId }: MapViewProps) {
  const focusChurch = focusChurchId
    ? churches.find((c) => c.id === focusChurchId)
    : null

  const center: [number, number] = focusChurch
    ? [focusChurch.lat, focusChurch.lng]
    : [-23.5505, -46.6333]

  const zoom = focusChurch ? 15 : 11

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full rounded-lg"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {focusChurch && (
        <FlyToChurch lat={focusChurch.lat} lng={focusChurch.lng} />
      )}

      {churches.map((church) => (
        <Marker key={church.id} position={[church.lat, church.lng]}>
          <Popup>
            <div className="flex flex-col gap-2 p-1 min-w-[200px]">
              <h3 className="font-semibold text-sm leading-tight">
                {church.name}
              </h3>
              <div className="flex items-start gap-1.5 text-xs text-gray-600">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                <span>
                  {church.address}, {church.neighborhood}
                </span>
              </div>
              {church.activities[0] && (
                <p className="text-xs text-gray-500">
                  {church.activities[0].name}
                </p>
              )}
              <Button asChild size="sm" className="mt-1 w-full h-7 text-xs">
                <Link href={`/igreja/${church.id}`}>
                  Ver detalhes
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
