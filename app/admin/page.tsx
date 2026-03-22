"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Shield,
  Plus,
  Edit3,
  Trash2,
  MapPin,
  Church,
  LogIn,
  Calendar,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
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
import { ChurchForm } from "@/components/church-form"
import { ActivityForm } from "@/components/activity-form"
import { useAuth } from "@/lib/auth-context"
import { 
  listarTodasIgrejas, 
  listarTodasAtividades, 
  registrarIgreja, 
  registrarAtividade, 
  excluirAtividade,
  alternarStatusIgreja,
  type IgrejaApi,
  type AtividadeApi,
  type IgrejaRequest,
  type AtividadeDTO
} from "@/lib/api"
import { toast } from "sonner"

export default function AdminPage() {
  const { user, isAdmin } = useAuth()
  const [churchList, setChurchList] = useState<IgrejaApi[]>([])
  const [activityList, setActivityList] = useState<AtividadeApi[]>([])
  const [isCreatingChurch, setIsCreatingChurch] = useState(false)
  const [isCreatingActivity, setIsCreatingActivity] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [igrejas, atividades] = await Promise.all([
        listarTodasIgrejas(),
        listarTodasAtividades(),
      ])
      setChurchList(igrejas)
      setActivityList(atividades)
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
      toast.error("Erro ao carregar dados da API")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && isAdmin) {
      fetchData()
    }
  }, [user, isAdmin])

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md border-border bg-card text-center">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Shield className="h-12 w-12 text-muted-foreground/40" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">Acesso Restrito</h2>
              <p className="mt-1 text-sm text-muted-foreground">Faça login como administrador.</p>
            </div>
            <Button asChild><Link href="/login">Fazer Login</Link></Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md border-border bg-card text-center text-destructive">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Shield className="h-12 w-12" />
            <h2 className="text-xl font-bold">Sem Permissão</h2>
            <Button asChild variant="outline"><Link href="/">Voltar</Link></Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSaveChurch = async (data: IgrejaRequest) => {
    try {
      await registrarIgreja(data)
      toast.success("Igreja registrada com sucesso!")
      setIsCreatingChurch(false)
      fetchData()
    } catch (error: any) {
      toast.error("Erro ao registrar: " + error.message)
    }
  }

  const handleToggleStatus = async (id: number) => {
    try {
      await alternarStatusIgreja(id)
      toast.success("Status atualizado!")
      fetchData()
    } catch (error: any) {
      toast.error("Erro ao alterar status: " + error.message)
    }
  }

  const handleSaveActivity = async (data: AtividadeDTO) => {
    try {
      await registrarAtividade(data)
      toast.success("Atividade registrada!")
      setIsCreatingActivity(false)
      fetchData()
    } catch (error: any) {
      toast.error("Erro ao registrar: " + error.message)
    }
  }

  const handleDeleteActivity = async (igrejaId: number, atividadeId: number) => {
    try {
      await excluirAtividade(igrejaId, atividadeId)
      toast.success("Excluída!")
      fetchData()
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message)
    }
  }

  if (isCreatingChurch) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ChurchForm onSave={handleSaveChurch} onCancel={() => setIsCreatingChurch(false)} />
      </div>
    )
  }

  if (isCreatingActivity) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ActivityForm churches={churchList} onSave={handleSaveActivity} onCancel={() => setIsCreatingActivity(false)} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie igrejas e atividades.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCreatingActivity(true)}>Nova Atividade</Button>
          <Button onClick={() => setIsCreatingChurch(true)}>Nova Igreja</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>
      ) : (
        <Tabs defaultValue="churches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="churches">Igrejas</TabsTrigger>
            <TabsTrigger value="activities">Atividades</TabsTrigger>
          </TabsList>

          <TabsContent value="churches">
            <Card>
              <CardHeader><CardTitle>Igrejas Cadastradas ({churchList.length})</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-3">
                {churchList.map((church) => (
                  <div key={church.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{church.nome}</h3>
                        <Badge variant={church.ativo ? "secondary" : "outline"} className={church.ativo ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                          {church.ativo ? "Ativa" : "Pendente"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{church.bairro}, {church.cidade}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleToggleStatus(church.id)}>
                        {church.ativo ? <XCircle className="mr-1 h-4 w-4" /> : <CheckCircle className="mr-1 h-4 w-4" />}
                        {church.ativo ? "Desativar" : "Aprovar"}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities">
            <Card>
              <CardHeader><CardTitle>Atividades ({activityList.length})</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-3">
                {activityList.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{activity.descricao}</h3>
                        <Badge variant="secondary">{activity.tipo}</Badge>
                      </div>
                      <p className="text-xs font-medium text-primary">{activity.nomeIgreja}</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Excluir?</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Não</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteActivity(activity.igrejaId, activity.id)} className="bg-destructive">Sim</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
