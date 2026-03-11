"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Shield,
  Plus,
  Edit3,
  Trash2,
  MapPin,
  Church,
  LogIn,
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
import { ChurchForm } from "@/components/church-form"
import { useAuth } from "@/lib/auth-context"
import { churches as initialChurches, type Church as ChurchType } from "@/lib/mock-data"

export default function AdminPage() {
  const { user, isAdmin } = useAuth()
  const [churchList, setChurchList] = useState<ChurchType[]>(initialChurches)
  const [editingChurch, setEditingChurch] = useState<ChurchType | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md border-border bg-card text-center">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Shield className="h-12 w-12 text-muted-foreground/40" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Acesso Restrito
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Faca login como administrador para acessar esta pagina.
              </p>
            </div>
            <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Fazer Login
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              {"Credenciais: admin@igrejas.com / admin123"}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md border-border bg-card text-center">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Shield className="h-12 w-12 text-destructive/40" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Sem Permissao
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Somente administradores podem acessar esta area.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/">Voltar para o inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSave = (data: Partial<ChurchType>) => {
    if (editingChurch) {
      setChurchList((prev) =>
        prev.map((c) =>
          c.id === editingChurch.id ? { ...c, ...data } : c
        )
      )
      setEditingChurch(null)
    } else {
      const newChurch: ChurchType = {
        id: String(Date.now()),
        name: data.name || "",
        address: data.address || "",
        city: data.city || "",
        neighborhood: data.neighborhood || "",
        phone: data.phone || "",
        email: data.email || "",
        website: data.website || "",
        description: data.description || "",
        lat: data.lat || -23.5505,
        lng: data.lng || -46.6333,
        activities: [],
        imageUrl: "",
      }
      setChurchList((prev) => [...prev, newChurch])
      setIsCreating(false)
    }
  }

  const handleDelete = (id: string) => {
    setChurchList((prev) => prev.filter((c) => c.id !== id))
  }

  if (isCreating) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ChurchForm onSave={handleSave} onCancel={() => setIsCreating(false)} />
      </div>
    )
  }

  if (editingChurch) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ChurchForm
          church={editingChurch}
          onSave={handleSave}
          onCancel={() => setEditingChurch(null)}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Painel Administrativo
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as igrejas cadastradas no sistema.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Igreja
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center gap-1 py-4">
            <span className="text-2xl font-bold text-primary">
              {churchList.length}
            </span>
            <span className="text-xs text-muted-foreground">
              Igrejas cadastradas
            </span>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center gap-1 py-4">
            <span className="text-2xl font-bold text-secondary">
              {churchList.reduce((acc, c) => acc + c.activities.length, 0)}
            </span>
            <span className="text-xs text-muted-foreground">Atividades</span>
          </CardContent>
        </Card>
        <Card className="border-border bg-card col-span-2 sm:col-span-1">
          <CardContent className="flex flex-col items-center gap-1 py-4">
            <span className="text-2xl font-bold text-accent">
              {churchList.reduce((acc, c) => acc + c.activities.filter(a => a.category === "CULTO" || a.category === "Culto").length, 0)}
            </span>
            <span className="text-xs text-muted-foreground">
              Cultos
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Church List */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Church className="h-5 w-5 text-primary" />
            Igrejas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {churchList.map((church) => (
              <div
                key={church.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {church.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {church.neighborhood}, {church.city}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-xs">
                      {church.activities.length} atividade
                      {church.activities.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingChurch(church)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span className="sr-only">Editar {church.name}</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir {church.name}</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir igreja</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir{" "}
                          <strong>{church.name}</strong>? Esta acao nao pode ser
                          desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(church.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
