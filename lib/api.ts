const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api-vpc"
const AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "/api-auth"
const APPLICATION_NAME = "vem-pro-culto" // Nome da aplicação registrado no authentication-ms

async function fetchApi<T>(baseUrl: string, path: string, options?: RequestInit): Promise<T> {
  const url = `${baseUrl}${path}`;
  
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!res.ok) {
    let errorMsg = `API error: ${res.status} ${res.statusText}`;
    try {
      const errorJson = await res.json();
      // O microserviço de auth costuma retornar o erro no campo 'message' ou 'error'
      errorMsg = errorJson.message || errorJson.error || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg)
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

export interface IgrejaApi {
  id: number
  nome: string
  endereco: string
  cidade: string
  bairro: string
  telefone: string
  email: string
  site: string
  latitude: number
  longitude: number
  descricao: string
}

export interface IgrejaListApi {
  igrejas: IgrejaApi[]
}

// --- Atividades ---

export async function listarTodasAtividades(): Promise<AtividadeApi[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem("vpc_token") : null;
  const data = await fetchApi<AtividadeListApi>(API_BASE_URL, "/atividade/todos", {
    headers: token ? { "Authorization": `Bearer ${token}` } : {}
  })
  return data.atividades
}

export async function buscarAtividadePorId(id: number): Promise<AtividadeApi> {
  const token = typeof window !== 'undefined' ? localStorage.getItem("vpc_token") : null;
  const data = await fetchApi<AtividadeApi>(API_BASE_URL, `/atividade/id/${id}`, {
    headers: token ? { "Authorization": `Bearer ${token}` } : {}
  })
  return data
}

// --- Igrejas ---

export async function listarTodasIgrejas(): Promise<IgrejaApi[]> {
  try {
    const data = await fetchApi<IgrejaListApi>(API_BASE_URL, "/igreja/todos", {
      method: "POST",
      body: JSON.stringify({}) 
    })
    return data.igrejas
  } catch (error) {
    console.warn("Erro ao buscar igrejas (tentando fallback GET):", error)
    try {
      const data = await fetchApi<IgrejaListApi>(API_BASE_URL, "/igreja/todos", {
        method: "GET"
      })
      return data.igrejas
    } catch (e) {
       console.error("Erro final ao buscar igrejas:", e)
       return []
    }
  }
}

export async function buscarIgrejaPorId(id: number): Promise<IgrejaApi> {
  const data = await fetchApi<IgrejaApi>(API_BASE_URL, `/igreja/id/${id}`)
  return data
}

export async function listarCultosPorIgreja(igrejaId: number): Promise<AtividadeApi[]> {
  const todas = await listarTodasAtividades()
  return todas.filter((a) => a.igrejaId === igrejaId && a.tipo === "CULTO")
}

export async function listarAtividadesPorIgreja(igrejaId: number): Promise<AtividadeApi[]> {
  const todas = await listarTodasAtividades()
  return todas.filter((a) => a.igrejaId === igrejaId)
}

// --- Autenticação (Microserviço Auth 8082) ---

export async function loginApi(email: string, password: string) {
  // Rota do authentication-ms: /auth/signin
  return fetchApi<any>(AUTH_API_BASE_URL, "/auth/signin", {
    method: "POST",
    body: JSON.stringify({ 
      email, 
      password, 
      application: APPLICATION_NAME 
    }),
  })
}

export async function registerApi(name: string, email: string, password: string) {
  // Rota do authentication-ms: /auth/signup
  // Nota: o campo no UsersRegister.java está 'aplication' (com um 'p' só)
  return fetchApi<any>(AUTH_API_BASE_URL, "/auth/signup", {
    method: "POST",
    body: JSON.stringify({ 
      name, 
      email, 
      password, 
      aplication: APPLICATION_NAME 
    }),
  })
}
