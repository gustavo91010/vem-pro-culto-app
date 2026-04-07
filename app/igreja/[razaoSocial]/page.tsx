"use client"

import { use, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
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
  Plus,
  Trash2,
  Pencil,
  AlertTriangle,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ActivityCard } from "@/components/activity-card"
import { ActivityForm } from "@/components/activity-form"
import { type Church as ChurchType, type Activity } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import {
  listarTodasAtividades,
  buscarIgrejaPorRazaoSocial,
  registrarAtividade,
  atualizarAtividade,
  excluirAtividade,
  vincularIgreja,
  buscarRelacoesUsuario,
  type AtividadeApi,
  type AtividadeDTO,
  type IgrejaApi,
} from "@/lib/api"
import { toast } from "sonner"

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
    name: i.nomeFantasia || i.nome || i.razaoSocial,
    razaoSocial: i.razaoSocial,
    address: (i as any).endereco?.logradouro || (i.endereco as any)?.logradouro || (i as any).endereco || "",
    city: (i as any).endereco?.cidade || (i.endereco as any)?.cidade || (i as any).city || "",
    neighborhood: (i as any).endereco?.bairro || (i.endereco as any)?.bairro || (i as any).neighborhood || "",
    phone: (i as any).telefone?.[0]?.numero || (i as any).telefone || "",
    email: i.email,
    website: (i as any).redesSociais?.[0]?.url || (i as any).site || "",
    lat: (i as any).endereco?.latitude || i.latitude || 0,
    lng: (i as any).endereco?.longitude || i.longitude || 0,
    description: i.descricao,
    imageUrl: i.imagemUrl || "/images/churches/default.svg",
    activities: [],
  }
}

export default function ChurchProfilePage({
  params,
}: {
  params: Promise<{ razaoSocial: string }>
}) {
  const { razaoSocial: encodedRazaoSocial } = use(params)
  const { user, refreshUserData, isModerator } = useAuth()
  const [church, setChurch] = useState<ChurchType | null>(null)
  const [igrejaApi, setIgrejaApi] = useState<IgrejaApi | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [cultos, setCultos] = useState<AtividadeApi[]>([])
  const [atividades, setAtividades] = useState<AtividadeApi[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingActivity, setIsCreatingActivity] = useState(false)
  const [editingActivity, setEditingActivity] = useState<AtividadeApi | null>(null)
  const [loadingFollow, setLoadingFollow] = useState(false)

  // Reatividade direta: verifica se o ID da igreja está nas favoritas do usuário logado
  const isFavorite = !!igrejaApi && (user?.igrejasFavoritas?.includes(igrejaApi.id) ?? false)

  const fetchActivities = (igrejaId: number) => {
    // Busca todas uma unica vez e filtra localmente
    listarTodasAtividades()
      .then((todas) => {
        const daIgreja = todas.filter(a => a.igrejaId === igrejaId);
        
        // Filtrar cultos futuros
        const now = new Date()
        const cultosFiltrados = daIgreja
          .filter((a) => a.tipo === "CULTO" && new Date(a.horario) >= now)
          .sort((a, b) => new Date(a.horario).getTime() - new Date(b.horario).getTime())
        setCultos(cultosFiltrados)

        // Outras atividades
        const outras = daIgreja
          .filter((a) => a.tipo !== "CULTO")
          .sort((a, b) => new Date(a.horario).getTime() - new Date(b.horario).getTime())
        setAtividades(outras)
      })
      .catch((err) => {
        console.error("Erro ao buscar atividades:", err)
      })
  }

  useEffect(() => {
    const razaoSocial = decodeURIComponent(encodedRazaoSocial)

    buscarIgrejaPorRazaoSocial(razaoSocial)
      .then(async (i) => {
        if (i) {
          setChurch(mapIgrejaToChurch(i))
          setIgrejaApi(i)
          
          const igrejaIdNumerico = i.id
          if (igrejaIdNumerico) {
            fetchActivities(igrejaIdNumerico)
            
            // Verifica se o usuario e dono ou moderador
            if (isModerator) {
              setIsOwner(true)
            } else if (user) {
              buscarRelacoesUsuario().then(relacoes => {
                const souDono = relacoes.some(r => r.igrejaId === igrejaIdNumerico && r.papel === "DONO")
                setIsOwner(souDono)
              })
            }
          }
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar igreja da API:", err)
      })
      .finally(() => setIsLoading(false))
  }, [encodedRazaoSocial, user, isModerator])

  const handleFollow = async () => {
    if (!user) {
      toast.error("Faca login para seguir esta igreja")
      return
    }
    if (!igrejaApi) return

    setLoadingFollow(true)
    try {
      const seguiu = await vincularIgreja(igrejaApi.id)
      
      if (seguiu) {
        toast.success("Voce agora segue esta igreja!")
      } else {
        toast.success("Voce deixou de seguir esta igreja.")
      }
      
      // Atualiza lista global de favoritas
      await refreshUserData()
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar favorito")
    } finally {
      setLoadingFollow(false)
    }
  }

  const handleSaveActivity = async (data: AtividadeDTO) => {
    try {
      if (editingActivity) {
        await atualizarAtividade(editingActivity.id, data)
        toast.success("Atividade atualizada com sucesso!")
      } else {
        await registrarAtividade(data)
        toast.success("Atividade registrada com sucesso!")
      }
      setIsCreatingActivity(false)
      setEditingActivity(null)
      if (igrejaApi) fetchActivities(igrejaApi.id)
    } catch (error: any) {
      toast.error("Erro ao salvar atividade: " + error.message)
    }
  }

  const handleDeleteActivity = async (atividadeId: number) => {
    if (!igrejaApi) return
    try {
      await excluirAtividade(igrejaApi.id, atividadeId)
      toast.success("Atividade excluida!")
      fetchActivities(igrejaApi.id)
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message)
    }
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>
  }

  if (!church) {
    notFound()
  }

  if ((isCreatingActivity || editingActivity) && igrejaApi) {
    // Para edição, precisamos dos dados originais da AtividadeApi
    let initialData: AtividadeApi | undefined = undefined;
    if (editingActivity) {
      initialData = editingActivity;
    }

    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ActivityForm
          churches={[igrejaApi]}
          initialData={initialData}
          onSave={handleSaveActivity}
          onCancel={() => {
            setIsCreatingActivity(false)
            setEditingActivity(null)
          }}
        />
      </div>
    )
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

      {igrejaApi && !igrejaApi.ativo && (
        <Alert variant="destructive" className="mb-6 bg-destructive/10 text-destructive border-destructive/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Igreja Desativada</AlertTitle>
          <AlertDescription>
            Esta igreja esta desativada e nao aparece nas buscas publicas. Apenas voce pode ver esta pagina.
          </AlertDescription>
        </Alert>
      )}

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
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-start gap-2 text-white/80">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="text-sm sm:text-base drop-shadow">
                  {church.address}, {church.neighborhood} - {church.city}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={`ml-4 rounded-full h-10 px-4 bg-black/20 backdrop-blur-sm hover:bg-black/40 border border-white/10 ${isFavorite ? 'text-red-500' : 'text-white'}`}
                onClick={handleFollow}
                disabled={loadingFollow}
              >
                <Heart className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Seguindo' : 'Seguir'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* About */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Sobre a Igreja</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {church.description || "Sem descricao disponivel."}
            </p>
          </section>

          <Separator />

          {/* Activities / Cultos */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-secondary" />
                <h2 className="text-xl font-semibold">Programacao</h2>
              </div>
              {isOwner && (
                <Button size="sm" onClick={() => setIsCreatingActivity(true)}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Nova Atividade
                </Button>
              )}
            </div>

            {cultos.length > 0 ? (
              <div className="grid gap-3 mb-6">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Proximos Cultos</h3>
                {cultos.map((culto) => (
                  <Card key={culto.id} className="bg-accent/5 border-accent/20">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{culto.descricao}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(culto.horario).toLocaleDateString("pt-BR", { weekday: 'long', day: '2-digit', month: 'long' })} as {new Date(culto.horario).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      {isOwner && (
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => setEditingActivity(culto)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir atividade?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acao nao pode ser desfeita. Isso removera permanentemente a atividade da programacao.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteActivity(culto.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm italic mb-6">Nenhum culto programado.</p>
            )}

            {atividades.length > 0 && (
              <div className="grid gap-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Outras Atividades</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {atividades.map((apiActivity) => (
                    <div key={apiActivity.id} className="relative group">
                      <ActivityCard activity={mapAtividadeToActivity(apiActivity)} />
                      {isOwner && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="h-8 w-8 rounded-full shadow-md bg-white opacity-50 cursor-not-allowed border-none"
                            onClick={() => toast.info("Edicao de atividades disponivel em breve!")}
                            title="Edicao em breve"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md bg-white hover:bg-destructive hover:text-white border-none">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir atividade?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Deseja remover "{apiActivity.descricao}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteActivity(apiActivity.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Sidebar */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Contato</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {church.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span>{church.phone}</span>
                </div>
              )}
              {church.email && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="truncate">{church.email}</span>
                </div>
              )}
              {church.website && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Globe className="h-4 w-4" />
                  </div>
                  <a
                    href={church.website.startsWith('http') ? church.website : `https://${church.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate inline-flex items-center gap-1"
                  >
                    Visitar site
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Localizacao</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                <Image
                  src={`https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400&h=400&auto=format&fit=crop`}
                  alt="Mapa estatico"
                  width={400}
                  height={400}
                  className="object-cover grayscale opacity-50"
                />
                <div className="absolute flex flex-col items-center">
                  <MapPin className="h-8 w-8 text-primary animate-bounce" />
                  <Badge variant="secondary" className="mt-2 bg-white/90 backdrop-blur shadow-sm">
                    {church.neighborhood}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${church.lat},${church.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Como chegar
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

