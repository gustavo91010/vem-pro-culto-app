"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { users, type User } from "./mock-data"

interface AuthContextType {
  user: Omit<User, "password"> | null
  login: (email: string, password: string) => { success: boolean; error?: string }
  register: (name: string, email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null)

  const login = useCallback((email: string, password: string) => {
    const found = users.find(
      (u) => u.email === email && u.password === password
    )
    if (found) {
      const { password: _, ...safeUser } = found
      setUser(safeUser)
      return { success: true }
    }
    return { success: false, error: "Email ou senha incorretos." }
  }, [])

  const register = useCallback(
    (name: string, email: string, _password: string) => {
      const exists = users.find((u) => u.email === email)
      if (exists) {
        return { success: false, error: "Este email ja esta cadastrado." }
      }
      const newUser: Omit<User, "password"> = {
        id: String(Date.now()),
        name,
        email,
        role: "user",
      }
      setUser(newUser)
      return { success: true }
    },
    []
  )

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isAdmin: user?.role === "admin" }}
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
