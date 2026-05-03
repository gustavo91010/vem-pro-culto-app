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
  refreshUserData: () => Promise<void>
  isAdmin: boolean
  isModerator: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUserData = useCallback(async () => {
    const token = localStorage.getItem("vpc_token")
    if (!token) return

    try {
      const apiUser = await getUsuarioLogado()
      setUser({
        id: String(apiUser.id),
        name: apiUser.name || "Usuario",
        email: apiUser.email || "email@igreja.com",
        roles: (apiUser.roles || []) as Role[],
        igrejasFavoritas: apiUser.igrejasFavoritas || [],
      })
    } catch (e) {
      console.error("Sessão expirada ou erro ao carregar usuário")
      // Se der erro 401 ou similar, limpamos o token para nao ficar tentando
      if (token) localStorage.removeItem("vpc_token")
    }
  }, [])

  // Carrega o usuário do token ao iniciar (Refresh da página)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("vpc_token")
      if (token) {
        await refreshUserData()
      }
      setIsLoading(false)
    }
    initAuth()
  }, [refreshUserData])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const data = await loginApi(email, password)
      if (data) {
        const tokenValue = data.jwt || data.access_token
        const roles = (data.roles || []) as Role[]
        console.log(data)
        console.log("roles ", roles)
        if (tokenValue) {
          localStorage.setItem("vpc_token", String(tokenValue))
          
          // Busca perfil completo (incluindo favoritas) logo após login
          try {
            const apiUser = await getUsuarioLogado()
            const userData: Omit<User, "password"> = {
              id: String(apiUser.id),
              name: apiUser.name || data.name || data.email.split("@")[0] || "Usuario",
              email: apiUser.email || data.email || "email@email.com",
              roles: (apiUser.roles || roles) as Role[],
              igrejasFavoritas: apiUser.igrejasFavoritas || [],
            }
            setUser(userData)
          } catch (e) {
            // Fallback se o /me falhar logo apos o login
            const userData: Omit<User, "password"> = {
              id: data.id || "1",
              name: data.name || data.email.split("@")[0] || "Usuario",
              email: data.email || "email@email.com",
              roles: roles,
              igrejasFavoritas: data.igrejasFavoritas || [],
            }
            setUser(userData)
          }
        } else {
          console.warn("Login não retornou um token válido. Token não salvo.")
          const userData: Omit<User, "password"> = {
            id: data.id || "1",
            name: data.name || data.email.split("@")[0] || "Usuario",
            email: data.email || "email@email.com",
            roles: roles,
            igrejasFavoritas: data.igrejasFavoritas || [],
          }
          setUser(userData)
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
          // const tokenValue = data.jwt || data.access_token
          const tokenValue = data.jwt 
          if (tokenValue) {
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

  const isAdmin = !!user?.roles?.some((r: any) => 
    r === Role.ADMIN || r === "ROLE_ADMIN" || 
    r === Role.MODERATOR || r === "ROLE_MODERATOR"
  )
  const isModerator = !!user?.roles?.some((r: any) => 
    r === Role.MODERATOR || r === "ROLE_MODERATOR"
  )

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, refreshUserData, isAdmin, isModerator, isLoading }}
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
