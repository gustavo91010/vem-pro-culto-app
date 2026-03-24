"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, LogIn, UserPlus } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const { login, register, isLoading } = useAuth()
  const [error, setError] = useState("")

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirm, setRegConfirm] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!loginEmail || !loginPassword) {
      setError("Preencha todos os campos.")
      return
    }
    const result = await login(loginEmail, loginPassword)
    if (result.success) {
      router.push("/")
    } else {
      setError(result.error || "Erro ao fazer login.")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      setError("Preencha todos os campos.")
      return
    }
    if (regPassword !== regConfirm) {
      setError("As senhas nao coincidem.")
      return
    }
    if (regPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      return
    }
    const result = await register(regName, regEmail, regPassword)
    if (result.success) {
      router.push("/")
    } else {
      setError(result.error || "Erro ao criar conta.")
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
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Cadastrar</TabsTrigger>
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
                  disabled={isLoading}
                  className="bg-card border-border"
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
                  disabled={isLoading}
                  className="bg-card border-border"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  "Carregando..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {"Consumindo API: " + process.env.NEXT_PUBLIC_AUTH_URL}
              </p>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="reg-name">Nome completo</Label>
                <Input
                  id="reg-name"
                  type="text"
                  placeholder="Seu nome"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  disabled={isLoading}
                  className="bg-card border-border"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-card border-border"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reg-password">Senha</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Minimo 6 caracteres"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-card border-border"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reg-confirm">Confirmar senha</Label>
                <Input
                  id="reg-confirm"
                  type="password"
                  placeholder="Repita a senha"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  disabled={isLoading}
                  className="bg-card border-border"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  "Carregando..."
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Criar conta
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

  )
}
