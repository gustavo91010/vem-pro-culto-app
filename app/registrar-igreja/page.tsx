"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Church, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChurchForm } from "@/components/church-form"
import { registrarIgreja, type IgrejaRequest } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function RegistrarIgrejaPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Church className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-2xl font-bold">Acesso Necessário</h2>
        <p className="mt-2 text-muted-foreground">
          Você precisa estar logado para cadastrar uma igreja.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Ir para Login
        </button>
      </div>
    )
  }

  const handleSave = async (data: IgrejaRequest) => {
    setIsSubmitting(true)
    try {
      const igreja_registrada = await registrarIgreja(data)
      
      toast.success("Igreja cadastrada com sucesso! Nossa equipe irá revisar os dados.")
      router.push("/minhas-igrejas") 
    } catch (error: any) {
      toast.error("Erro ao cadastrar: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Cadastre sua Igreja
        </h1>
        <p className="mt-2 text-muted-foreground">
          Junte-se à nossa plataforma e ajude as pessoas a encontrarem seus cultos e atividades.
        </p>
      </div>

      <div className="grid gap-8">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-primary">
              <ShieldCheck className="h-4 w-4" />
              Processo de Verificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              Após o cadastro, sua igreja passará por uma breve revisão manual antes de ficar visível no mapa público. 
              Isso garante a segurança e a veracidade das informações para todos os usuários.
            </CardDescription>
          </CardContent>
        </Card>

        <ChurchForm 
          onSave={handleSave} 
          onCancel={() => router.back()} 
        />
      </div>
    </div>
  )
}
