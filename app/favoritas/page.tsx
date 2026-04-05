"use client"

import { useEffect, useState } from "react"
import { Church, Star, Search, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ChurchCard } from "@/components/church-card"
import { type IgrejaApi, listarTodasIgrejas } from "@/lib/api"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Church as ChurchType } from "@/lib/mock-data"

function mapIgrejaToChurch(i: IgrejaApi): ChurchType {
  return {
    id: String(i.id),
    name: i.nomeFantasia || i.nome || i.razaoSocial,
    razaoSocial: i.razaoSocial,
    address: (i as any).endereco?.logradouro || i.endereco || "",
    city: (i as any).endereco?.cidade || i.cidade || "",
    neighborhood: (i as any).endereco?.bairro || i.bairro || "",
    phone: (i as any).telefone?.[0]?.numero || i.telefone || "",
    email: i.email,
    website: (i as any).redesSociais?.[0]?.url || i.site || "",
    lat: (i as any).endereco?.latitude || i.latitude || 0,
    lng: (i as any).endereco?.longitude || i.longitude || 0,
    description: i.descricao,
    imageUrl: i.imagemUrl || "/images/churches/default.svg",
    activities: [],
  }
}

export default function FavoritasPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [favoritas, setFavoritas] = useState<ChurchType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFavoritas() {
      if (!user || !user.igrejasFavoritas) return
      
      try {
        setLoading(true)
        const todas = await listarTodasIgrejas()
        const favs = todas
          .filter(i => user.igrejasFavoritas?.includes(i.id))
          .map(mapIgrejaToChurch)
        setFavoritas(favs)
      } catch (error) {
        console.error("Erro ao carregar favoritas:", error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      loadFavoritas()
    }
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando suas igrejas favoritas...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-6 rounded-full bg-muted p-6">
          <Star className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold">Acesse sua conta</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Voce precisa estar logado para ver e gerenciar suas igrejas favoritas.
        </p>
        <Button asChild className="mt-8">
          <Link href="/login">Entrar agora</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Igrejas Favoritas</h1>
          <p className="text-muted-foreground">
            Acompanhe as atividades das igrejas que voce mais gosta.
          </p>
        </div>
      </div>

      {favoritas.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favoritas.map((igreja) => (
            <ChurchCard key={igreja.id} church={igreja} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Nenhuma favorita ainda</h3>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Explore o mapa ou a lista de igrejas e clique na estrela para favoritar suas igrejas preferidas.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/mapa">Explorar Mapa</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
