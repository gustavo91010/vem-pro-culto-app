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

    // Tenta recuperar dados básicos salvos para evitar o "Usuario" genérico no refresh
    const savedUserJson = localStorage.getItem("auth_user_data")
    const savedUser = savedUserJson ? JSON.parse(savedUserJson) : null

    try {
      const apiUser = await getUsuarioLogado()
      const userData = {
        id: String(apiUser.id),
        name: apiUser.name || savedUser?.name || "Usuario",
        email: apiUser.email || savedUser?.email || "email@igreja.com",
        roles: (apiUser.roles?.length ? apiUser.roles : (savedUser?.roles || [])) as Role[],
        igrejasFavoritas: apiUser.igrejasFavoritas || [],
      }
      setUser(userData)
      // Atualiza o cache local
      localStorage.setItem("auth_user_data", JSON.stringify(userData))
    } catch (e) {
      if (savedUser) {
        setUser(savedUser)
      } else {
        if (token) localStorage.removeItem("vpc_token")
        localStorage.removeItem("auth_user_data")
      }
    }
  }, [])

  // Carrega o usuário do token ao iniciar (Refresh da página)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("vpc_token")
      const savedUserJson = localStorage.getItem("auth_user_data")
      
      if (token) {
        if (savedUserJson) {
          setUser(JSON.parse(savedUserJson))
        }
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
        
        if (tokenValue) {
          localStorage.setItem("vpc_token", String(tokenValue))
          
          let userData: Omit<User, "password">;
          try {
            const apiUser = await getUsuarioLogado()
            userData = {
              id: String(apiUser.id),
              name: apiUser.name || data.name || data.email?.split("@")[0] || "Usuario",
              email: apiUser.email || data.email || "email@email.com",
              roles: (apiUser.roles?.length ? apiUser.roles : roles) as Role[],
              igrejasFavoritas: apiUser.igrejasFavoritas || [],
            }
          } catch (e) {
            userData = {
              id: data.id || "1",
              name: data.name || data.email?.split("@")[0] || "Usuario",
              email: data.email || "email@email.com",
              roles: roles,
              igrejasFavoritas: data.igrejasFavoritas || [],
            }
          }
          
          setUser(userData)
          localStorage.setItem("auth_user_data", JSON.stringify(userData))
        }
        return { success: true }
      }
      return { success: false, error: "Credenciais invalidas." }
    } catch (error: any) {
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
            name: data.name || name,
            email: data.email || email,
            roles: (data.roles || []) as Role[],
          }
          setUser(userData)
          localStorage.setItem("auth_user_data", JSON.stringify(userData))
          
          const tokenValue = data.jwt 
          if (tokenValue) {
            localStorage.setItem("vpc_token", String(tokenValue))
          }
          return { success: true }
        }
        return { success: false, error: "Erro ao criar conta." }
      } catch (error: any) {
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
    localStorage.removeItem("auth_user_data")
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
