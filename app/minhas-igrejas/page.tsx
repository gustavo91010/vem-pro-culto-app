"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Plus,
  MapPin,
  Church,
  Calendar,
  Clock,
  Loader2,
  Trash2,
  Edit3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
...
import { useAuth } from "@/lib/auth-context"
import { 
  listarIgrejasDoUsuario, 
  buscarRelacoesUsuario,
  listarTodasAtividades, 
  registrarAtividade, 
  excluirAtividade,
  type IgrejaApi,
  type AtividadeApi,
  type AtividadeDTO,
  type RelacaoComIgreja
} from "@/lib/api"
import { toast } from "sonner"
export default function MinhasIgrejasPage() {
  const { user } = useAuth()
  const [churchList, setChurchList] = useState<IgrejaApi[]>([])
  const [relations, setRelations] = useState<RelacaoComIgreja[]>([])
  const [activityList, setActivityList] = useState<AtividadeApi[]>([])
  const [isCreatingActivity, setIsCreatingActivity] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [minhasIgrejas, relacoesUsuario, todasAtividades] = await Promise.all([
        listarIgrejasDoUsuario(),
        buscarRelacoesUsuario(),
        listarTodasAtividades()
      ])
      
      setChurchList(minhasIgrejas)
      setRelations(relacoesUsuario)
      
      // Filtra atividades que pertencem às igrejas do usuário
      const minhasIgrejasIds = minhasIgrejas.map(i => i.id)
      const minhasAtividades = todasAtividades.filter(a => minhasIgrejasIds.includes(a.igrejaId))
      
      setActivityList(minhasAtividades)
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
      toast.error("Erro ao carregar suas igrejas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  // Helpers to split churches
  const ownedChurches = churchList.filter(c => 
    relations.some(r => r.igrejaId === c.id && r.papel === "DONO")
  )
  const favoriteChurches = churchList.filter(c => 
    relations.some(r => r.igrejaId === c.id && (r.papel === "FAVORITO" || r.papel === "SEGUIDOR"))
  )

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md border-border bg-card text-center">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Church className="h-12 w-12 text-muted-foreground/40" />
            <h2 className="text-xl font-semibold text-foreground">Acesso Necessário</h2>
            <p className="text-sm text-muted-foreground">Faça login para gerenciar suas igrejas.</p>
            <Button asChild><Link href="/login">Fazer Login</Link></Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSaveActivity = async (data: AtividadeDTO) => {
    try {
      await registrarAtividade(data)
      toast.success("Atividade registrada com sucesso!")
      setIsCreatingActivity(false)
      fetchData()
    } catch (error: any) {
      toast.error("Erro ao registrar atividade: " + error.message)
    }
  }

  const handleDeleteActivity = async (igrejaId: number, atividadeId: number) => {
    try {
      await excluirAtividade(igrejaId, atividadeId)
      toast.success("Atividade excluída!")
      fetchData()
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message)
    }
  }

  if (isCreatingActivity) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ActivityForm 
          churches={churchList} 
          onSave={handleSaveActivity} 
          onCancel={() => setIsCreatingActivity(false)} 
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Minhas Igrejas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie suas igrejas e atividades.</p>
        </div>
        <Button onClick={() => setIsCreatingActivity(true)} disabled={churchList.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Atividade
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="churches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="churches">Igrejas</TabsTrigger>
            <TabsTrigger value="activities">Atividades</TabsTrigger>
          </TabsList>

          <TabsContent value="churches">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                    <Church className="h-5 w-5 text-primary" />
                    Minhas Igrejas ({ownedChurches.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    {ownedChurches.map((church) => (
                      <div key={church.id} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground truncate">{church.nomeFantasia || church.nome || church.razaoSocial}</h3>
                            {!church.ativo && <Badge variant="outline" className="text-orange-500 border-orange-500">Pendente</Badge>}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{church.endereco?.bairro || (church as any).bairro}, {church.endereco?.cidade || (church as any).cidade}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {ownedChurches.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground text-sm">Você ainda não registrou igrejas.</p>
                        <Button asChild variant="link" size="sm" className="mt-2">
                          <Link href="/registrar-igreja">Registrar agora</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                    <Shield className="h-5 w-5 text-secondary" />
                    Igrejas que Sigo ({favoriteChurches.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    {favoriteChurches.map((church) => (
                      <div key={church.id} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{church.nomeFantasia || church.nome || church.razaoSocial}</h3>
                          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{church.endereco?.bairro || (church as any).bairro}, {church.endereco?.cidade || (church as any).cidade}</span>
                          </div>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/igreja/id/${church.id}`}>Ver</Link>
                        </Button>
                      </div>
                    ))}
                    {favoriteChurches.length === 0 && (
                      <p className="text-center py-8 text-muted-foreground text-sm">Você não favoritou nenhuma igreja ainda.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activities">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <Calendar className="h-5 w-5 text-secondary" />
                  Minhas Atividades ({activityList.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {activityList.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate">{activity.descricao}</h3>
                          <Badge variant="secondary" className="text-[10px]">{activity.tipo}</Badge>
                        </div>
                        <p className="text-xs text-primary font-medium mt-0.5">{activity.nomeIgreja}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(activity.horario).toLocaleDateString()}</div>
                          <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(activity.horario).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir atividade</AlertDialogTitle>
                              <AlertDialogDescription>Tem certeza que deseja excluir esta atividade?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteActivity(activity.igrejaId, activity.id)} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                  {activityList.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground">Nenhuma atividade cadastrada para suas igrejas.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
