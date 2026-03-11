"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Church, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChurchCard } from "@/components/church-card"
import { ActivityCard } from "@/components/activity-card"
import { SearchFilters } from "@/components/search-filters"
import { searchChurches } from "@/lib/mock-data"
import { listarTodasAtividades, type AtividadeApi } from "@/lib/api"
import type { Activity } from "@/lib/mock-data"

function mapAtividadeToActivity(a: AtividadeApi): Activity & { churchName: string } {
  const horario = new Date(a.horario)
  return {
    id: String(a.id),
    churchId: String(a.igrejaId),
    name: a.descricao,
    description: a.descricao,
    date: horario.toISOString().split("T")[0],
    time: horario.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    category: a.tipo,
    churchName: a.nomeIgreja,
  }
}

export default function HomePage() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const [upcomingActivities, setUpcomingActivities] = useState<(Activity & { churchName: string })[]>([])

  const filteredChurches = useMemo(
    () =>
      searchChurches(query, {
        category: category || undefined,
      }),
    [query, category]
  )

  useEffect(() => {
    listarTodasAtividades()
      .then((atividades) => {
        const now = new Date()
        const mapped = atividades
          .map(mapAtividadeToActivity)
          .filter((a) => new Date(a.date) >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 4)
        setUpcomingActivities(mapped)
      })
      .catch((err) => {
        console.error("Erro ao buscar atividades:", err)
      })
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero Section */}
      <section className="relative mb-10 overflow-hidden rounded-2xl">
        <div className="relative h-64 sm:h-80 lg:h-96">
          <Image
            src="/images/hero-banner.jpg"
            alt="Vista aerea de igrejas na cidade"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-foreground/10" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl text-balance drop-shadow-lg">
              Encontre sua igreja
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg text-pretty drop-shadow">
              Descubra igrejas, horarios de cultos e atividades perto de voce em
              Sao Paulo e Rio de Janeiro.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button asChild size="lg" className="shadow-lg">
                <Link href="/mapa">
                  <MapPin className="mr-2 h-4 w-4" />
                  Ver no mapa
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="mb-8">
        <SearchFilters
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
        />
      </section>

      {/* Church Grid */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Church className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Igrejas{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({filteredChurches.length} encontrada
              {filteredChurches.length !== 1 ? "s" : ""})
            </span>
          </h2>
        </div>

        {filteredChurches.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredChurches.map((church) => (
              <ChurchCard key={church.id} church={church} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card px-6 py-12 text-center">
            <Church className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-muted-foreground">
              Nenhuma igreja encontrada com os filtros selecionados.
            </p>
          </div>
        )}
      </section>

      {/* Upcoming Activities */}
      {upcomingActivities.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-secondary" />
            <h2 className="text-xl font-semibold text-foreground">
              Proximas atividades
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {upcomingActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
