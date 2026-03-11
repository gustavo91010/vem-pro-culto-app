"use client"

import { use, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Calendar,
  Clock,
  Church,
  ArrowLeft,
  UserPlus,
  CalendarPlus,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getActivityById, getChurchById } from "@/lib/mock-data"
import { buscarAtividadePorId, type AtividadeApi } from "@/lib/api"

const categoryImages: Record<string, string> = {
  evento: "/images/activities/evento.jpg",
  jovens: "/images/activities/jovens.jpg",
  estudo: "/images/activities/estudo.jpg",
  musica: "/images/activities/musica.jpg",
  social: "/images/activities/social.jpg",
  saude: "/images/activities/saude.jpg",
  criancas: "/images/activities/criancas.jpg",
}

function getCategoryImage(category: string): string {
  const key = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  return categoryImages[key] || categoryImages.evento
}

export default function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [isParticipating, setIsParticipating] = useState(false)
  const [apiData, setApiData] = useState<AtividadeApi | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buscarAtividadePorId(Number(id))
      .then(setApiData)
      .catch((err) => console.error("Erro ao buscar atividade:", err))
      .finally(() => setLoading(false))
  }, [id])

  // Fallback para mock enquanto igrejas não estão integradas
  const mockData = getActivityById(id)

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center text-muted-foreground">
        Carregando...
      </div>
    )
  }

  // Usa dados da API se disponível, senão fallback para mock
  const activity = apiData
    ? {
        id: String(apiData.id),
        churchId: String(apiData.igrejaId),
        name: apiData.descricao,
        description: apiData.descricao,
        date: new Date(apiData.horario).toISOString().split("T")[0],
        time: new Date(apiData.horario).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        category: apiData.tipo,
      }
    : mockData
      ? { ...mockData, church: undefined }
      : null

  // Igreja: ainda usa mock por enquanto
  const church = apiData
    ? getChurchById(String(apiData.igrejaId))
    : mockData?.church

  if (!activity) {
    notFound()
  }

  const dateObj = new Date(activity.date + "T00:00:00")
  const formattedDate = dateObj.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  const handleAddToCalendar = () => {
    const startDate = new Date(`${activity.date}T${activity.time}:00`)
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000)

    const formatICS = (d: Date) =>
      d
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "")

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${formatICS(startDate)}`,
      `DTEND:${formatICS(endDate)}`,
      `SUMMARY:${activity.name}`,
      `DESCRIPTION:${activity.description}`,
      `LOCATION:${church ? `${church.address}, ${church.neighborhood} - ${church.city}` : ""}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n")

    const blob = new Blob([icsContent], { type: "text/calendar" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${activity.name}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {church ? (
        <Link
          href={`/igreja/${church.id}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para {church.name}
        </Link>
      ) : (
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      )}

      <Card className="overflow-hidden border-border bg-card">
        {/* Activity Image Banner */}
        <div className="relative h-48 sm:h-56 w-full">
          <Image
            src={getCategoryImage(activity.category)}
            alt={`Imagem de ${activity.category}`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />
          <Badge className="absolute top-4 right-4 bg-secondary/90 text-secondary-foreground border-0 font-medium shadow-sm">
            {activity.category}
          </Badge>
          <div className="absolute bottom-4 left-5 right-5 sm:left-8 sm:right-8">
            <h1 className="text-2xl font-bold text-white text-balance drop-shadow-lg">
              {activity.name}
            </h1>
          </div>
        </div>

        <CardContent className="flex flex-col gap-6 p-6 sm:p-8">

          <Separator />

          {/* Details */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <Clock className="h-5 w-5 text-primary" />
              <span>{activity.time}</span>
            </div>
            {church && (
              <>
                <div className="flex items-center gap-3">
                  <Church className="h-5 w-5 text-primary" />
                  <Link
                    href={`/igreja/${church.id}`}
                    className="text-primary hover:underline"
                  >
                    {church.name}
                  </Link>
                </div>
                <div className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary/60" />
                  <span>
                    {church.address}, {church.neighborhood} - {church.city}
                  </span>
                </div>
              </>
            )}
            {!church && apiData?.nomeIgreja && (
              <div className="flex items-center gap-3">
                <Church className="h-5 w-5 text-primary" />
                <span>{apiData.nomeIgreja}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="mb-2 font-semibold text-foreground">Descricao</h2>
            <p className="leading-relaxed text-muted-foreground">
              {activity.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={() => setIsParticipating(!isParticipating)}
              variant={isParticipating ? "secondary" : "default"}
              className={
                isParticipating
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : ""
              }
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {isParticipating ? "Participando" : "Participar"}
            </Button>
            <Button variant="outline" onClick={handleAddToCalendar}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Adicionar ao calendario
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
