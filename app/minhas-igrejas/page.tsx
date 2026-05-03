"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  MapPin,
  Church,
  Loader2,
  Star,
  Shield,
  Crown,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import {
  listarIgrejasDoUsuario,
  buscarRelacoesUsuario,
  alternarStatusIgreja,
  type IgrejaApi,
  type RelacaoComIgreja
} from "@/lib/api"
import { toast } from "sonner"
import { Role } from "@/lib/enums/role"

export default function MinhasIgrejasPage() {
  const { user } = useAuth()
  const [churches, setChurches] = useState<IgrejaApi[]>([])
  const [relations, setRelations] = useState<RelacaoComIgreja[]>([])
  const [loading, setLoading] = useState(true)

  // Permissões baseadas na sua regra:
  const isSuperAdmin = user?.roles?.includes(Role.ADMIN as any) || user?.roles?.includes("ROLE_ADMIN" as any)
  const isModerator = user?.roles?.includes(Role.MODERATOR as any) || user?.roles?.includes("ROLE_MODERATOR" as any)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [igrejas, relacoesUsuario] = await Promise.all([
        listarIgrejasDoUsuario(),
        buscarRelacoesUsuario(),
      ])
      setChurches(igrejas)
      setRelations(relacoesUsuario)
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
      toast.error("Erro ao carregar suas igrejas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    fetchData()
  }, [user])

  const handleToggleStatus = async (id: number) => {
    try {
      await alternarStatusIgreja(id)
      toast.success("Status atualizado!")
      fetchData()
    } catch (error: any) {
      toast.error("Erro ao alterar status: " + error.message)
    }
  }

  // IDs das igrejas onde sou DONO
  const ownedIds = new Set(
    relations
      .filter(r => r.papel?.toUpperCase().trim() === "DONO")
      .map(r => Number(r.igrejaId))
  )
  
  // IDs das igrejas FAVORITAS
  const favoriteIds = new Set(
    relations
      .filter(r => {
        const p = r.papel?.toUpperCase().trim();
        return p === "FAVORITO" || p === "SEGUIDOR";
      })
      .map(r => Number(r.igrejaId))
  )

  const ownedChurches = churches.filter(c => ownedIds.has(Number(c.id)))
  const favoriteChurches = churches.filter(c => favoriteIds.has(Number(c.id)))

  // ADMIN vê todas as igrejas do sistema
  const allChurches = isSuperAdmin ? churches : []

  const hasOwned = ownedChurches.length > 0
  const hasFavorites = favoriteChurches.length > 0
  const hasAdminCol = allChurches.length > 0

  const visibleColumns = [hasOwned, hasFavorites, hasAdminCol].filter(Boolean).length

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Minhas Igrejas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as igrejas que você administra ou segue.
          </p>
        </div>
        <Button asChild>
          <Link href="/registrar-igreja">
            <Church className="mr-2 h-4 w-4" />
            Cadastrar Igreja
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : visibleColumns === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Church className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">
              Você ainda não tem igrejas vinculadas.
            </p>
            <Button asChild variant="link" size="sm">
              <Link href="/registrar-igreja">Registrar uma igreja</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid grid-cols-1 gap-6 ${
          visibleColumns === 1 ? "md:grid-cols-1 max-w-2xl mx-auto" :
          visibleColumns === 2 ? "md:grid-cols-2" :
          "md:grid-cols-3"
        }`}>
          
          {/* Coluna Minhas Igrejas (DONO) */}
          {hasOwned && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <Crown className="h-5 w-5 text-amber-500" />
                  Minhas Igrejas ({ownedChurches.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {ownedChurches.map((church) => (
                    <div key={church.id} className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4">
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/igreja/${encodeURIComponent(church.razaoSocial)}`} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
                          <h3 className="font-semibold text-foreground truncate">
                            {church.nomeFantasia || church.nome || church.razaoSocial}
                          </h3>
                          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {church.endereco?.cidade || (church as any).cidade}
                            </span>
                          </div>
                        </Link>
                        <Badge variant="outline" className={church.ativo ? "text-green-600 border-green-600" : "text-orange-500 border-orange-500"}>
                          {church.ativo ? "Ativa" : "Pendente"}
                        </Badge>
                      </div>
                      
                      {/* Moderador ou Admin podem alterar status de suas próprias igrejas */}
                      {(isModerator || isSuperAdmin) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(church.id)}
                          className={cn(
                            "mt-2 w-full",
                            church.ativo 
                              ? "text-destructive hover:bg-destructive/10 border-destructive/20" 
                              : "text-green-600 hover:bg-green-50 border-green-600/20"
                          )}
                        >
                          {church.ativo ? (
                            <><XCircle className="mr-1.5 h-4 w-4" />Desativar</>
                          ) : (
                            <><CheckCircle className="mr-1.5 h-4 w-4" />Ativar</>
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Coluna Favoritas */}
          {hasFavorites && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Favoritas ({favoriteChurches.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {favoriteChurches.map((church) => (
                    <Link key={church.id} href={`/igreja/${encodeURIComponent(church.razaoSocial)}`}>
                      <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {church.nomeFantasia || church.nome || church.razaoSocial}
                          </h3>
                          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{church.endereco?.cidade}</span>
                          </div>
                        </div>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Coluna Super Admin (Todas as Igrejas) */}
          {hasAdminCol && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Painel Geral ({allChurches.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {allChurches.map((church) => (
                    <div key={church.id} className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
                      <Link href={`/igreja/${encodeURIComponent(church.razaoSocial)}`} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate text-sm">
                            {church.nomeFantasia || church.nome || church.razaoSocial}
                          </h3>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Badge variant="outline" className={cn("text-[10px] px-1 h-4", church.ativo ? "text-green-600 border-green-600" : "text-orange-500 border-orange-500")}>
                            {church.ativo ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(church.id)}
                        className={church.ativo ? "text-destructive" : "text-green-600"}
                      >
                        {church.ativo ? <XCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
