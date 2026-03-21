"use client"

import { use, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Calendar,
  Heart,
  ArrowLeft,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ActivityCard } from "@/components/activity-card"
import { getChurchById as getMockChurchById, type Church as ChurchType } from "@/lib/mock-data"
import { listarCultosPorIgreja, listarAtividadesPorIgreja, buscarIgrejaPorId, type AtividadeApi, type IgrejaApi } from "@/lib/api"
import type { Activity } from "@/lib/mock-data"

function mapAtividadeToActivity(a: AtividadeApi): Activity & { churchName?: string } {
  const horario = new Date(a.horario)
  return {
    id: String(a.id),
    churchId: String(a.igrejaId),
    name: a.descricao,
    description: a.descricao,
    date: horario.toISOString().split("T")[0],
    time: horario.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    category: a.tipo,
  }
}

function mapIgrejaToChurch(i: IgrejaApi): ChurchType {
  return {
    id: String(i.id),
    name: i.nome,
    address: i.endereco,
    city: i.cidade,
    neighborhood: i.bairro,
    phone: i.telefone,
    email: i.email,
    website: i.site,
    lat: i.latitude,
    lng: i.longitude,
    description: i.descricao,
    imageUrl: "/images/churches/default.jpg",
    activities: [],
  }
}

export default function ChurchProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [church, setChurch] = useState<ChurchType | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [cultos, setCultos] = useState<AtividadeApi[]>([])
  const [atividades, setAtividades] = useState<(Activity & { churchName?: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const igrejaId = Number(id)
    
    // Busca apenas da API
    buscarIgrejaPorId(igrejaId)
      .then((i) => {
        if (i) {
          setChurch(mapIgrejaToChurch(i))
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar igreja da API:", err)
      })
      .finally(() => setIsLoading(false))

    listarCultosPorIgreja(igrejaId)
      .then((c) => {
        const now = new Date()
        setCultos(c.filter((culto) => new Date(culto.horario) >= now)
          .sort((a, b) => new Date(a.horario).getTime() - new Date(b.horario).getTime()))
      })
      .catch(() => {})

    listarAtividadesPorIgreja(igrejaId)
      .then((a) => {
        const now = new Date()
        const mapped = a
          .filter((at) => at.tipo !== "CULTO")
          .map(mapAtividadeToActivity)
          // .filter((at) => new Date(at.date) >= now) // Removido para teste
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        setAtividades(mapped)
      })
      .catch(() => {})
  }, [id])

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>
  }

  if (!church) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back Button */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para lista
      </Link>

      {/* Hero with Image */}
      <div className="relative mb-8 overflow-hidden rounded-xl">
        <div className="relative h-56 sm:h-72 lg:h-80">
          <Image
            src={church.imageUrl}
            alt={`Foto da ${church.name}`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 sm:px-10 sm:pb-8">
            <h1 className="text-2xl font-bold text-white sm:text-3xl text-balance drop-shadow-lg">
              {church.name}
            </h1>
            <div className="mt-2 flex items-start gap-2 text-white/80">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-sm sm:text-base drop-shadow">
                {church.address}, {church.neighborhood} - {church.city}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant={isFavorite ? "secondary" : "outline"}
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
                className={
                  isFavorite
                    ? "bg-secondary text-secondary-foreground"
                    : "border-white/40 text-white hover:bg-white/15"
                }
              >
                <Heart
                  className={`mr-1.5 h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                />
                {isFavorite ? "Favoritada" : "Favoritar"}
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-white/40 text-white hover:bg-white/15"
              >
                <Link href={`/mapa?church=${church.id}`}>
                  <MapPin className="mr-1.5 h-4 w-4" />
                  Ver no mapa
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mb-8 leading-relaxed text-muted-foreground">{church.description}</p>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cultos */}
        <Card className="lg:col-span-2 border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <Clock className="h-5 w-5 text-primary" />
              Proximos Cultos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cultos.length > 0 ? (
              <div className="flex flex-col gap-2">
                {cultos.map((culto) => {
                  const horario = new Date(culto.horario)
                  return (
                    <div
                      key={culto.id}
                      className="flex items-center justify-between rounded-lg bg-muted px-4 py-2.5"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {culto.descricao}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {horario.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {horario.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum culto agendado no momento.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <Phone className="h-5 w-5 text-primary" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm text-foreground">{church.phone}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm text-foreground break-all">
                  {church.email}
                </span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                <a
                  href={`https://${church.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {church.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activities (non-CULTO) */}
      {atividades.length > 0 && (
        <section className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-secondary" />
            <h2 className="text-xl font-semibold text-foreground">Atividades</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {atividades.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
