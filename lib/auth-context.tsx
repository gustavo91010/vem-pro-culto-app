"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { type User } from "./mock-data"
import { loginApi, registerApi, getUsuarioLogado } from "./api"

interface AuthContextType {
  user: Omit<User, "password"> | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAdmin: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Carrega o usuário do token ao iniciar (Refresh da página)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("vpc_token")
      // Só tenta inicializar se o token parecer um UUID (contém hífen) ou for longo o suficiente
      if (token && token.includes("-")) {
        try {
          const apiUser = await getUsuarioLogado()
          setUser({
            id: String(apiUser.id),
            name: "Usuario", 
            email: "email@igreja.com", 
            role: "user", 
          })
        } catch (e) {
          console.error("Sessão expirada ou inválida")
          localStorage.removeItem("vpc_token")
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const data = await loginApi(email, password)
      if (data) {
        // Buscamos apenas campos que de fato podem conter um UUID de acesso
        const tokenValue = data.access_token
        
        const userData: Omit<User, "password"> = {
          id: data.user?.id || data.id || "1",
          name: data.user?.name || data.nome || "Usuario",
          email: data.user?.email || data.email || email,
          role: data.user?.role || data.role || (email.includes("admin") ? "admin" : "user"),
        }
        setUser(userData)
        
        if (tokenValue && String(tokenValue).includes("-")) {
          localStorage.setItem("vpc_token", String(tokenValue))
        } else {
          console.warn("Login não retornou um UUID válido. Token não salvo.")
        }
        return { success: true }
      }
      return { success: false, error: "Credenciais invalidas." }
    } catch (error: any) {
      console.error("Erro no login:", error)
      return { success: false, error: error.message || "Erro ao conectar com o servidor." }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setIsLoading(true)
      try {
        const data = await registerApi(name, email, password)
        if (data) {
          const userData: Omit<User, "password"> = {
            id: data.user?.id || data.id || String(Date.now()),
            name: data.user?.name || data.nome || name,
            email: data.user?.email || data.email || email,
            role: "user",
          }
          setUser(userData)
          const tokenValue = data.token || data.accessToken || data.authToken
          if (tokenValue && String(tokenValue).includes("-")) {
            localStorage.setItem("vpc_token", String(tokenValue))
          }
          return { success: true }
        }
        return { success: false, error: "Erro ao criar conta." }
      } catch (error: any) {
        console.error("Erro no registro:", error)
        return { success: false, error: error.message || "Erro ao conectar com o servidor." }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("vpc_token")
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isAdmin: user?.role === "admin", isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
