"use client"

import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CATEGORIES = [
  { value: "CULTO", label: "Culto" },
  { value: "ATIVIDADE", label: "Atividade" },
  { value: "EVANGELISMO", label: "Evangelismo" },
  { value: "ACAO_SOCIAL", label: "Acao Social" },
  { value: "EBD", label: "EBD" },
]

interface SearchFiltersProps {
  query: string
  onQueryChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
}

export function SearchFilters({
  query,
  onQueryChange,
  category,
  onCategoryChange,
}: SearchFiltersProps) {
  const hasFilters = query || category

  const clearAll = () => {
    onQueryChange("")
    onCategoryChange("")
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, cidade ou bairro..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />

        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  )
}
