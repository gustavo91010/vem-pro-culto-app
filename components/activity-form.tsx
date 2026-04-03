"use client"

import { useState } from "react"
import { Save, X, Calendar as CalendarIcon, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AtividadeDTO, AtividadeTipo, IgrejaApi } from "@/lib/api"

interface ActivityFormProps {
  churches: IgrejaApi[]
  initialChurchId?: number
  onSave: (data: AtividadeDTO) => void
  onCancel: () => void
}

export function ActivityForm({ churches, initialChurchId, onSave, onCancel }: ActivityFormProps) {
  const singleChurch = churches.length === 1
  const [igrejaId, setIgrejaId] = useState<string>(initialChurchId?.toString() || (singleChurch ? churches[0].id.toString() : ""))
  const [tipo, setTipo] = useState<AtividadeTipo>("CULTO")
  const [descricao, setDescricao] = useState("")
  const [data, setData] = useState("")
  const [hora, setHora] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Formata o horário para yyyy-MM-dd'T'HH:mm:ss
    const horario = `${data}T${hora}:00`

    onSave({
      igrejaId: parseInt(igrejaId),
      tipo,
      descricao,
      horario,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">
            Cadastrar Nova Atividade
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {!singleChurch && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="church">Igreja</Label>
                <Select value={igrejaId} onValueChange={setIgrejaId} required>
                  <SelectTrigger id="church" className="bg-card border-border">
                    <SelectValue placeholder="Selecione a igreja" />
                  </SelectTrigger>
                  <SelectContent>
                    {churches.map((church) => (
                      <SelectItem key={church.id} value={church.id.toString()}>
                        {church.nomeFantasia || church.nome || church.razaoSocial}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="tipo">Tipo de Atividade</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as AtividadeTipo)} required>
                <SelectTrigger id="tipo" className="bg-card border-border">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CULTO">Culto</SelectItem>
                  <SelectItem value="ATIVIDADE">Atividade</SelectItem>
                  <SelectItem value="EVANGELISMO">Evangelismo</SelectItem>
                  <SelectItem value="ACAO_SOCIAL">Ação Social</SelectItem>
                  <SelectItem value="EBD">EBD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="data">Data</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                  className="bg-card border-border pl-10"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="hora">Horário</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="hora"
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  required
                  className="bg-card border-border pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva a atividade..."
              rows={4}
              required
              className="bg-card border-border"
            />
          </div>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="mr-1.5 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="mr-1.5 h-4 w-4" />
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
