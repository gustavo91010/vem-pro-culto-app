"use client"

import { useState, useEffect } from "react"
import { Save, X, Loader2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { IgrejaRequest, IgrejaApi } from "@/lib/api"
import { toast } from "sonner"

interface ChurchFormProps {
  church?: IgrejaApi
  onSave: (data: IgrejaRequest) => void
  onCancel: () => void
}

export function ChurchForm({ church, onSave, onCancel }: ChurchFormProps) {
  const [nomeFantasia, setNomeFantasia] = useState(church?.nome || "")
  const [razaoSocial, setRazaoSocial] = useState(church?.nome || "")
  const [cnpj, setCnpj] = useState("")
  const [email, setEmail] = useState(church?.email || "")
  const [cep, setCep] = useState(church?.endereco?.cep || "")
  const [logradouro, setLogradouro] = useState(church?.endereco?.logradouro || "")
  const [numero, setNumero] = useState(church?.endereco?.numero || "")
  const [city, setCity] = useState(church?.endereco?.cidade || church?.cidade || "")
  const [neighborhood, setNeighborhood] = useState(church?.endereco?.bairro || church?.bairro || "")
  const [phone, setPhone] = useState(church?.telefone?.[0]?.numero || "")
  const [website, setWebsite] = useState(church?.redesSociais?.[0]?.url || church?.site || "")
  const [description, setDescription] = useState(church?.descricao || "")
  const [loadingCep, setLoadingCep] = useState(false)

  // Busca endereço pelo CEP automaticamente
  useEffect(() => {
    const cleanCep = cep.replace(/\D/g, "")
    if (cleanCep.length === 8) {
      handleCepSearch(cleanCep)
    }
  }, [cep])

  const handleCepSearch = async (val: string) => {
    setLoadingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${val}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setLogradouro(data.logradouro)
        setNeighborhood(data.bairro)
        setCity(data.localidade)
        toast.success("Endereço preenchido pelo CEP")
      } else {
        toast.error("CEP não encontrado")
      }
    } catch (err) {
      toast.error("Erro ao buscar CEP")
    } finally {
      setLoadingCep(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Iniciando submissão do formulário...")
    toast.info("Processando cadastro da igreja...")

    // Remove pontos, traços e barras para enviar apenas números
    const cleanCnpj = (cnpj || "00000000000000").replace(/\D/g, "")
    const cleanCep = (cep || "00000000").replace(/\D/g, "")

    const request: IgrejaRequest = {
      nomeFantasia,
      razaoSocial: razaoSocial || nomeFantasia,
      email,
      cnpj: cleanCnpj,
      descricao: description,
      endereco: {
        logradouro,
        numero: numero || "S/N",
        bairro: neighborhood,
        cidade: city,
        estado: "SP",
        cep: cleanCep,
        pais: "Brasil",
        latitude: -23.5505,
        longitude: -46.6333,
      },
      telefone: phone ? [{ numero: phone.replace(/\D/g, ""), tipo: "FIXO" }] : [],
      redesSociais: website ? [{ url: website, tipo: "SITE" }] : [],
    }

    console.log("Dados enviados (limpos):", request)
    onSave(request)
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nomeFantasia">Nome Fantasia *</Label>
              <Input
                id="nomeFantasia"
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                placeholder="Nome da igreja"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@igreja.com"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="razaoSocial">Razão Social</Label>
              <Input
                id="razaoSocial"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                placeholder="Razão social registrada"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>

          <Separator />
          
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cep">CEP *</Label>
              <div className="relative">
                <Input
                  id="cep"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  required
                />
                {loadingCep && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="logradouro">Logradouro *</Label>
              <Input
                id="logradouro"
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
                placeholder="Rua, Avenida, etc"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="123"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input
                id="neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Bairro"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Cidade"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 0000-0000"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="www.igreja.com"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a igreja..."
              rows={3}
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
              Salvar Igreja
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
