"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar as CalendarIcon, Clock, Church, ArrowRight, CalendarDays } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface AgendaItem {
  id: string
  name: string
  date: string
  time: string
  category: string
  churchName: string
  igrejaId: number
}

export default function AgendaPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [items, setItems] = useState<AgendaItem[]>([])
  const [selectedDateItems, setSelectedDateItems] = useState<AgendaItem[]>([])

  useEffect(() => {
    const agenda = JSON.parse(localStorage.getItem("vpc_agenda") || "[]")
    setItems(agenda)
  }, [])

  useEffect(() => {
    if (date) {
      const dateStr = date.toISOString().split("T")[0]
      const filtered = items.filter(item => item.date === dateStr)
      setSelectedDateItems(filtered)
    } else {
      setSelectedDateItems([])
    }
  }, [date, items])

  // Dias que possuem atividades (para marcar no calendario)
  const daysWithActivities = items.map(item => new Date(item.date + "T12:00:00"))

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <CalendarDays className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Minha Agenda</h1>
          <p className="text-sm text-muted-foreground">Gerencie as atividades que voce pretende participar.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[350px_1fr]">
        {/* Lado Esquerdo: Calendario */}
        <div className="flex flex-col gap-6">
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border-none"
                modifiers={{ hasActivity: daysWithActivities }}
                modifiersStyles={{
                  hasActivity: { fontWeight: "bold", textDecoration: "underline", color: "hsl(var(--primary))" }
                }}
              />
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items.length}</div>
              <p className="text-xs text-muted-foreground">atividades confirmadas no total</p>
            </CardContent>
          </Card>
        </div>

        {/* Lado Direito: Lista de Atividades do Dia */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {date ? date.toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' }) : "Selecione um dia"}
            </h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
              {selectedDateItems.length} {selectedDateItems.length === 1 ? 'atividade' : 'atividades'}
            </Badge>
          </div>

          <Separator />

          <ScrollArea className="h-[500px] pr-4">
            {selectedDateItems.length > 0 ? (
              <div className="flex flex-col gap-4">
                {selectedDateItems.map((item) => (
                  <Card key={item.id} className="group border-border bg-card hover:border-primary/30 transition-colors shadow-sm overflow-hidden">
                    <div className="flex items-stretch">
                      {/* Faixa lateral colorida por categoria (mock simples) */}
                      <div className="w-1.5 bg-primary/60" />
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <Badge variant="outline" className="mb-1 text-[10px] uppercase tracking-wider font-bold h-5">
                              {item.category}
                            </Badge>
                            <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                              {item.name}
                            </h3>
                          </div>
                          <Button size="sm" variant="ghost" className="shrink-0" asChild>
                            <Link href={`/atividade/${item.id}`}>
                              Ver <ArrowRight className="ml-1.5 h-3 w-3" />
                            </Link>
                          </Button>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary/60" />
                            {item.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <Church className="h-4 w-4 text-primary/60" />
                            {item.churchName}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-border rounded-xl bg-accent/5">
                <CalendarIcon className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <h3 className="text-muted-foreground font-medium">Nenhuma atividade para este dia</h3>
                <p className="text-xs text-muted-foreground/60 max-w-[200px] mt-1">
                  Explore igrejas e clique em "Participar" para ver suas atividades aqui.
                </p>
                <Button variant="link" size="sm" className="mt-4" asChild>
                  <Link href="/">Descobrir atividades</Link>
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
