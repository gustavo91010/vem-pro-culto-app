"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, LogIn, UserPlus, Loader2 } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const { login, register } = useAuth()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirm, setRegConfirm] = useState("")
  
  // Novos campos para otherFields
  const [regPhone, setRegPhone] = useState("")
  const [regCpf, setRegCpf] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!loginEmail || !loginPassword) {
      setError("Preencha todos os campos.")
      return
    }

    setIsLoading(true)
    try {
      const result = await login(loginEmail, loginPassword)
      if (result.success) {
        router.push("/")
      } else {
        setError(result.error || "Erro ao fazer login.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      setError("Preencha todos os campos obrigatórios.")
      return
    }
    if (regPassword !== regConfirm) {
      setError("As senhas não coincidem.")
      return
    }
    if (regPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    setIsLoading(true)
    try {
      // Passando campos extras no otherFields
      const otherFields = {
        phone: regPhone,
        cpf: regCpf
      }
      
      const result = await register(regName, regEmail, regPassword, otherFields)
      if (result.success) {
        // Após registro, tenta fazer login automático ou avisa o usuário
        const loginResult = await login(regEmail, regPassword)
        if (loginResult.success) {
          router.push("/")
        } else {
          setError("Conta criada com sucesso! Por favor, faça login.")
        }
      } else {
        setError(result.error || "Erro ao criar conta.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-border bg-card shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">
          Bem-vindo
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Entre na sua conta ou crie uma nova para acessar todas as funcionalidades.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" disabled={isLoading}>Entrar</TabsTrigger>
            <TabsTrigger value="register" disabled={isLoading}>Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="bg-card border-border"
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Sua senha"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-card border-border"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                Entrar
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="reg-name">Nome completo *</Label>
                <Input
                  id="reg-name"
                  type="text"
                  placeholder="Seu nome"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="bg-card border-border"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reg-cpf">CPF (Opcional)</Label>
                  <Input
                    id="reg-cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={regCpf}
                    onChange={(e) => setRegCpf(e.target.value)}
                    className="bg-card border-border"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reg-phone">Telefone (Opcional)</Label>
                  <Input
                    id="reg-phone"
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="bg-card border-border"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reg-email">Email *</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="bg-card border-border"
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reg-password">Senha *</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Minimo 6 caracteres"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="bg-card border-border"
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reg-confirm">Confirmar senha *</Label>
                <Input
                  id="reg-confirm"
                  type="password"
                  placeholder="Repita a senha"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  className="bg-card border-border"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Criar conta
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
