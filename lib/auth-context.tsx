"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { fetchAuthApi } from "./api"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string, otherFields?: Record<string, any>) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // Recupera token do localStorage ao carregar
  useEffect(() => {
    const savedToken = localStorage.getItem('vpc_token')
    const savedUser = localStorage.getItem('vpc_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await fetchAuthApi<{ token: string, user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      })

      if (data.token) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('vpc_token', data.token)
        localStorage.setItem('vpc_user', JSON.stringify(data.user))
        return { success: true }
      }
      return { success: false, error: "Token não recebido do servidor." }
    } catch (err: any) {
      return { success: false, error: err.message || "Erro ao realizar login." }
    }
  }, [])

  const register = useCallback(
    async (name: string, email: string, password: string, otherFields?: Record<string, any>) => {
      try {
        await fetchAuthApi("/users", {
          method: "POST",
          body: JSON.stringify({
            name,
            email,
            password,
            otherFields: {
               ...otherFields,
               appId: "VPC" // Identificador para o vpc-api no SQS
            }
          })
        })
        // Opcional: Logar automaticamente após registro ou redirecionar para login
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message || "Erro ao realizar cadastro." }
      }
    },
    []
  )

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('vpc_token')
    localStorage.removeItem('vpc_user')
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isAdmin: user?.role === "ADMIN" }}
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
