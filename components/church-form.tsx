"use client"

import { useState } from "react"
import { Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Church } from "@/lib/mock-data"

interface ChurchFormProps {
  church?: Church
  onSave: (data: Partial<Church>) => void
  onCancel: () => void
}

export function ChurchForm({ church, onSave, onCancel }: ChurchFormProps) {
  const [name, setName] = useState(church?.name || "")
  const [address, setAddress] = useState(church?.address || "")
  const [city, setCity] = useState(church?.city || "")
  const [neighborhood, setNeighborhood] = useState(church?.neighborhood || "")
  const [phone, setPhone] = useState(church?.phone || "")
  const [email, setEmail] = useState(church?.email || "")
  const [website, setWebsite] = useState(church?.website || "")
  const [description, setDescription] = useState(church?.description || "")
  const [lat, setLat] = useState(church?.lat?.toString() || "-23.5505")
  const [lng, setLng] = useState(church?.lng?.toString() || "-46.6333")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      address,
      city,
      neighborhood,
      phone,
      email,
      website,
      description,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">
            {church ? "Editar Igreja" : "Cadastrar Nova Igreja"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="name">Nome da Igreja</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo da igreja"
                required
                className="bg-card border-border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Endereco</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, numero"
                required
                className="bg-card border-border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Bairro"
                required
                className="bg-card border-border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Cidade"
                required
                className="bg-card border-border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 0000-0000"
                className="bg-card border-border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@igreja.com"
                className="bg-card border-border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="www.igreja.com"
                className="bg-card border-border"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="bg-card border-border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="bg-card border-border"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a igreja..."
              rows={4}
              className="bg-card border-border"
            />
          </div>

          <Separator />

          {/* Actions */}
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
