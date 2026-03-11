const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

// --- Tipos baseados na API ---

export interface AtividadeApi {
  id: number
  igrejaId: number
  nomeIgreja: string
  tipo: string
  descricao: string
  horario: string // ISO datetime
}

export interface AtividadeListApi {
  atividades: AtividadeApi[]
}

// --- Atividades ---

export async function listarTodasAtividades(): Promise<AtividadeApi[]> {
  const data = await fetchApi<AtividadeListApi>("/atividade/listar")
  return data.atividades
}

export async function buscarAtividadePorId(id: number): Promise<AtividadeApi> {
  const data = await fetchApi<AtividadeApi>(`/atividade/id/${id}`)
  return data
}

export async function listarAtividadesPorTipo(tipo: string): Promise<AtividadeApi[]> {
  const todas = await listarTodasAtividades()
  return todas.filter((a) => a.tipo === tipo)
}

export async function listarCultosPorIgreja(igrejaId: number): Promise<AtividadeApi[]> {
  const todas = await listarTodasAtividades()
  return todas.filter((a) => a.igrejaId === igrejaId && a.tipo === "CULTO")
}

export async function listarAtividadesPorIgreja(igrejaId: number): Promise<AtividadeApi[]> {
  const todas = await listarTodasAtividades()
  return todas.filter((a) => a.igrejaId === igrejaId)
}
