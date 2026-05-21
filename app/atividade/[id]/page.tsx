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
import { getActivityById, getChurchById as getMockChurchById, type Church as ChurchType } from "@/lib/mock-data"
import { buscarAtividadePorId, buscarIgrejaPorId, type AtividadeApi, type IgrejaApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { getChurchImageUrl, getActivityImageUrl } from "@/lib/utils"
import { toast } from "sonner"

function mapIgrejaToChurch(i: IgrejaApi): ChurchType {
  return {
    id: String(i.id),
    name: i.nomeFantasia || i.nome || i.razaoSocial,
    razaoSocial: i.razaoSocial,
    address: (i as any).endereco?.logradouro || i.endereco,
    city: (i as any).endereco?.cidade || i.cidade,
    neighborhood: (i as any).endereco?.bairro || i.bairro,
    phone: (i as any).telefone?.[0]?.numero || i.telefone,
    email: i.email,
    website: (i as any).redesSociais?.[0]?.url || i.site,
    lat: (i as any).endereco?.latitude || i.latitude,
    lng: (i as any).endereco?.longitude || i.longitude,
    description: i.descricao,
    imageUrl: getChurchImageUrl(i.imagemUrl, i.id),
    activities: [],
  }
}

export default function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { user } = useAuth()
  const [isParticipating, setIsParticipating] = useState(false)
  const [apiData, setApiData] = useState<AtividadeApi | null>(null)
  const [church, setChurch] = useState<ChurchType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verifica participacao local
    const agenda = JSON.parse(localStorage.getItem("vpc_agenda") || "[]")
    setIsParticipating(agenda.some((a: any) => a.id === id))

    buscarAtividadePorId(Number(id))
      .then((data) => {
        setApiData(data)
        if (data && data.igrejaId) {
          buscarIgrejaPorId(data.igrejaId)
            .then((i) => {
              // Só define a igreja se ela estiver ativa
              if (i && i.ativo) {
                setChurch(mapIgrejaToChurch(i))
              } else {
                // Se a igreja não estiver ativa, não devemos mostrar a atividade
                setApiData(null)
              }
            })
            .catch((err) => {
              setApiData(null)
            })
        }
      })
      .catch((err) => console.error("Erro ao buscar atividade:", err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center text-muted-foreground">
        Carregando...
      </div>
    )
  }

  // Usa apenas dados da API
  if (!apiData) {
    notFound()
  }

  const handleParticipation = () => {
    if (!user) {
      toast.error("Faca login para participar das atividades")
      return
    }

    const newStatus = !isParticipating
    setIsParticipating(newStatus)
    
    const agenda = JSON.parse(localStorage.getItem("vpc_agenda") || "[]")
    
    if (newStatus) {
      // Adiciona a agenda local
      const item = {
        id: String(apiData.id),
        name: apiData.descricao,
        date: apiData.horario.split("T")[0],
        time: new Date(apiData.horario).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        category: apiData.tipo,
        churchName: apiData.nomeIgreja,
        igrejaId: apiData.igrejaId
      }
      agenda.push(item)
    } else {
      // Remove da agenda local
      const filtered = agenda.filter((a: any) => a.id !== id)
      localStorage.setItem("vpc_agenda", JSON.stringify(filtered))
      return
    }
    
    localStorage.setItem("vpc_agenda", JSON.stringify(agenda))
  }

  const activity = {
    id: String(apiData.id),
    churchId: String(apiData.igrejaId),
    name: apiData.descricao,
    description: apiData.descricao,
    date: new Date(apiData.horario).toISOString().split("T")[0],
    time: new Date(apiData.horario).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    category: apiData.tipo,
  }

  const finalChurch = church

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
    if (!activity) return

    // Formata datas para o Google Calendar (YYYYMMDDTHHmmSSZ)
    const startDate = new Date(`${activity.date}T${activity.time}:00`)
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // +2 horas por padrão

    const formatGCalDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

    const gCalUrl = new URL("https://www.google.com/calendar/render")
    gCalUrl.searchParams.append("action", "TEMPLATE")
    gCalUrl.searchParams.append("text", activity.name)
    gCalUrl.searchParams.append("details", activity.description)
    if (finalChurch) {
      gCalUrl.searchParams.append("location", `${finalChurch.address}, ${finalChurch.neighborhood} - ${finalChurch.city}`)
    }
    gCalUrl.searchParams.append("dates", `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`)

    window.open(gCalUrl.toString(), "_blank")
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {finalChurch ? (
        <Link
          href={`/igreja/${encodeURIComponent(finalChurch.razaoSocial)}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para {finalChurch.name}
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
            src={getActivityImageUrl(activity.category)}
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
            {finalChurch && (
              <>
                <div className="flex items-center gap-3">
                  <Church className="h-5 w-5 text-primary" />
                  <Link
                    href={`/igreja/${encodeURIComponent(finalChurch.razaoSocial)}`}
                    className="text-primary hover:underline"
                  >
                    {finalChurch.name}
                  </Link>
                </div>
                <div className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary/60" />
                  <span>
                    {finalChurch.address}, {finalChurch.neighborhood} - {finalChurch.city}
                  </span>
                </div>
              </>
            )}
            {!finalChurch && apiData?.nomeIgreja && (
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
          {user ? (
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                onClick={handleParticipation}
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
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-accent/5 p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Faca login para participar desta atividade e adicionar ao seu calendario.
              </p>
              <Button asChild size="sm">
                <Link href="/login">Fazer Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
