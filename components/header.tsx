"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Church, MapPin, LogIn, LogOut, Menu, X, User, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Links base (Inicio sempre primeiro, Mapa sempre ultimo)
  const baseLinks = [
    { href: "/", label: "Inicio", icon: Church },
    { href: "/mapa", label: "Mapa", icon: MapPin },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Church className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Vem Pro Culto
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {/* Link Inicio */}
          <Link
            href="/"
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Church className="h-4 w-4" />
            Inicio
          </Link>

          {user && (
            <>
              <Link
                href="/minhas-igrejas"
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/minhas-igrejas"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Church className="h-4 w-4" />
                Minhas Igrejas
              </Link>
              <Link
                href="/agenda"
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/agenda"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <CalendarDays className="h-4 w-4" />
                Minha Agenda
              </Link>
            </>
          )}

          {/* Link Mapa (Na direita) */}
          <Link
            href="/mapa"
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/mapa"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <MapPin className="h-4 w-4" />
            Mapa
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {user.name}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="mr-1.5 h-4 w-4" />
                Sair
              </Button>
            </div>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">
                <LogIn className="mr-1.5 h-4 w-4" />
                Entrar
              </Link>
            </Button>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === "/"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Church className="h-4 w-4" />
              Inicio
            </Link>

            {user && (
              <>
                <Link
                  href="/minhas-igrejas"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === "/minhas-igrejas"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Church className="h-4 w-4" />
                  Minhas Igrejas
                </Link>
                <Link
                  href="/agenda"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === "/agenda"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <CalendarDays className="h-4 w-4" />
                  Minha Agenda
                </Link>
              </>
            )}

            <Link
              href="/mapa"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === "/mapa"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <MapPin className="h-4 w-4" />
              Mapa
            </Link>
          </nav>

          <div className="mt-3 border-t border-border pt-3">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {user.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout()
                    setMobileOpen(false)
                  }}
                >
                  <LogOut className="mr-1.5 h-4 w-4" />
                  Sair
                </Button>
              </div>
            ) : (
              <Button
                asChild
                size="sm"
                className="w-full"
                onClick={() => setMobileOpen(false)}
              >
                <Link href="/login">
                  <LogIn className="mr-1.5 h-4 w-4" />
                  Entrar
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
