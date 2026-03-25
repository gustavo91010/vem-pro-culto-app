"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Clock, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Church } from "@/lib/mock-data"
import { listarCultosPorIgreja, type AtividadeApi } from "@/lib/api"

interface ChurchCardProps {
  church: Church
}

export function ChurchCard({ church }: ChurchCardProps) {
  const [proximoCulto, setProximoCulto] = useState<AtividadeApi | null>(null)
  const [totalCultos, setTotalCultos] = useState(0)

  useEffect(() => {
    listarCultosPorIgreja(Number(church.id))
      .then((cultos) => {
        setTotalCultos(cultos.length)
        const now = new Date()
        const proximo = cultos
          .filter((c) => new Date(c.horario) >= now)
          .sort((a, b) => new Date(a.horario).getTime() - new Date(b.horario).getTime())[0]
        if (proximo) setProximoCulto(proximo)
      })
      .catch(() => {})
  }, [church.id])

  return (
    <Link href={`/igreja/${encodeURIComponent(church.razaoSocial)}`} className="group block">
      <Card className="h-full overflow-hidden border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-lg">
        {/* Church Image */}
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={church.imageUrl}
            alt={`Foto da ${church.name}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-base font-semibold leading-tight text-white drop-shadow-md text-balance">
              {church.name}
            </h3>
          </div>
        </div>

        <CardContent className="flex flex-col gap-2.5 p-4">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
            <span className="line-clamp-1">
              {church.neighborhood} - {church.city}
            </span>
            <ArrowRight className="mt-0.5 ml-auto h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
          </div>

          {proximoCulto && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0 text-secondary" />
              <span className="line-clamp-1">
                {proximoCulto.descricao}:{" "}
                {new Date(proximoCulto.horario).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}{" "}
                as {new Date(proximoCulto.horario).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {church.activities.slice(0, 2).map((activity) => (
              <Badge
                key={activity.id}
                variant="secondary"
                className="bg-accent/10 text-accent font-medium text-xs"
              >
                {activity.category}
              </Badge>
            ))}
            {totalCultos > 0 && (
              <Badge
                variant="outline"
                className="text-xs font-medium"
              >
                {totalCultos} culto{totalCultos > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
