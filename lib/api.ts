// URLs dos backends
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_URL || "http://20.246.66.131:8082"
const VPC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://20.246.66.131:8084"

// Função base para chamadas ao VPC-API (inclui o token automaticamente)
async function fetchVpcApi<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vpc_token') : null;

  const res = await fetch(`${VPC_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    throw new Error(`VPC API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

// Função base para chamadas ao Authentication-MS
export async function fetchAuthApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${AUTH_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Auth API error: ${res.status}`);
  }

  return res.json()
}

// --- Interfaces ---

export interface AtividadeApi {
  id: number
  igrejaId: number
  nomeIgreja: string
  tipo: string
  descricao: string
  horario: string
}

export interface IgrejaApi {
  id: number
  nome: string
  endereco: string
  cidade: string
  uf: string
  telefone?: string
}

export interface UsuarioVpcApi {
  id: string
  nome: string
  email: string
  cpf?: string
  telefone?: string
}

// --- Atividades ---

export async function listarTodasAtividades(): Promise<AtividadeApi[]> {
  return fetchVpcApi<AtividadeApi[]>("/atividade/listar")
}

export async function buscarAtividadePorId(id: number): Promise<AtividadeApi> {
  return fetchVpcApi<AtividadeApi>(`/atividade/id/${id}`)
}

// --- Igrejas ---

export async function listarIgrejas(): Promise<IgrejaApi[]> {
  return fetchVpcApi<IgrejaApi[]>("/igreja/listar")
}

export async function buscarIgrejaPorId(id: number): Promise<IgrejaApi> {
  return fetchVpcApi<IgrejaApi>(`/igreja/id/${id}`)
}

export async function criarIgreja(dados: Partial<IgrejaApi>): Promise<IgrejaApi> {
  return fetchVpcApi<IgrejaApi>("/igreja/salvar", {
    method: "POST",
    body: JSON.stringify(dados)
  })
}

// --- Usuário (Dados no VPC-API) ---

export async function getPerfilUsuario(): Promise<UsuarioVpcApi> {
  return fetchVpcApi<UsuarioVpcApi>("/usuario/perfil")
}
