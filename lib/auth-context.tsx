"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { type User } from "./mock-data"
import { loginApi, registerApi, getUsuarioLogado } from "./api"
import { Role } from "@/lib/enums/role"

interface AuthContextType {
  user: Omit<User, "password"> | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAdmin: boolean
  isModerator: boolean
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
            name: apiUser.name || "Usuario",
            email: apiUser.email || "email@igreja.com",
            roles: (apiUser.roles || []) as Role[],
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
        const roles = (data.roles || []) as Role[]
        console.log("roles ", roles)
        const userData: Omit<User, "password"> = {
          id: data.id || "1",
          name: data.name || data.email.split("@")[0] || "Usuario",
          email: data.email || "email@email.com",
          roles: roles
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
            id: data.id,
            name: data.name,
            email: data.email,
            roles: (data.roles || []) as Role[],
          }
          setUser(userData)
          const tokenValue = data.access_token
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

  const isAdmin = !!user?.roles?.some((r) => r === Role.ADMIN || r === Role.MODERATOR)
  const isModerator = !!user?.roles?.includes(Role.MODERATOR)

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isAdmin, isModerator, isLoading }}
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
