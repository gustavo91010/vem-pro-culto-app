const API_BASE_URL = "/api/vpc";
const AUTH_API_BASE_URL = "/api/auth";
const APPLICATION_NAME = "vem-pro-culto";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("vpc_token");
  if (!token) return null;
  return token.startsWith('Bearer ') ? token.substring(7) : token;
}

async function fetchApi<T>(
  baseUrl: string,
  path: string,
  options?: RequestInit,
): Promise<T> {
  const fullPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${fullPath}`;
  console.log(`[fetchApi] Chamando: ${options?.method || "GET"} ${url}`);

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    console.log(`[fetchApi] Resposta recebida de ${url}: status ${res.status}`);

    if (!res.ok) {
      let errorMsg = `API error: ${res.status} ${res.statusText}`;
      try {
        const errorJson = await res.json();
        errorMsg = errorJson.message || errorJson.error || errorMsg;
      } catch (e) { }
      throw new Error(errorMsg);
    }

    return res.json();
  } catch (error) {
    console.error(`[fetchApi] Erro em ${url}:`, error);
    throw error;
  }
}

// --- Tipos ---

export type AtividadeTipo = "CULTO" | "ATIVIDADE" | "EVANGELISMO" | "ACAO_SOCIAL" | "EBD";
export type TipoTelefone = "CELULAR" | "WHATSAPP" | "FIXO";
export type TipoRedeSocial = "SITE" | "YOUTUBE" | "INSTAGRAM" | "FACEBOOK" | "TWITTER" | "TIKTOK";

export interface EnderecoApi {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  pais: string;
  latitude: number;
  longitude: number;
}

export interface TelefoneApi {
  numero: string;
  tipo: TipoTelefone;
}

export interface RedeSocialApi {
  url: string;
  tipo: TipoRedeSocial;
}

export interface IgrejaRequest {
  nomeFantasia: string;
  razaoSocial: string;
  email: string;
  cnpj: string;
  descricao: string;
  imagemUrl?: string;
  endereco: EnderecoApi;
  telefone: TelefoneApi[];
  redesSociais: RedeSocialApi[];
}

export interface AtividadeDTO {
  igrejaId: number;
  tipo: AtividadeTipo;
  descricao: string;
  horario: string; // ISO
}

export interface AtividadeApi {
  id: number;
  igrejaId: number;
  nomeIgreja: string;
  tipo: string;
  descricao: string;
  horario: string;
}

export interface IgrejaApi {
  id: number;
  nomeFantasia?: string;
  nome?: string;
  razaoSocial: string;
  email: string;
  cnpj: string;
  descricao: string;
  imagemUrl?: string;
  ativo: boolean;
  endereco: EnderecoApi;
  telefone: TelefoneApi[];
  redesSociais: RedeSocialApi[];
  // legados
  cidade?: string;
  bairro?: string;
  latitude?: number;
  longitude?: number;
  site?: string;
}

export interface UsuarioApi {
  id: number;
  name?: string | null;
  email: string;
  roles: string[];
  authToken?: string;
  ativo?: boolean;
}

export interface UsuarioUpdate {
  name?: string;
  email?: string;
}

export interface RelacaoComIgreja {
  igrejaId: number;
  papel: string;
}

// --- Atividades ---

export async function listarTodasAtividades(): Promise<AtividadeApi[]> {
  const token = getAuthToken();
  try {
    const data = await fetchApi<any>(API_BASE_URL, "/atividade/listar", {
      headers: token ? { Authorization: token } : {},
    });
    return Array.isArray(data) ? data : (data.atividades || []);
  } catch (error) {
    return [];
  }
}

export async function buscarAtividadePorId(id: number): Promise<AtividadeApi | null> {
  try {
    const data = await fetchApi<any>(API_BASE_URL, `/atividade/id/${id}`);
    return data?.atividade || data;
  } catch (error) {
    return null;
  }
}

export async function listarAtividadesPorIgreja(igrejaId: number): Promise<AtividadeApi[]> {
  const todas = await listarTodasAtividades();
  return todas.filter((a) => a.igrejaId === igrejaId);
}

export async function registrarAtividade(atividade: AtividadeDTO): Promise<AtividadeApi> {
  const token = getAuthToken();
  if (!token) throw new Error("Usuário não autenticado");

  return fetchApi<AtividadeApi>(API_BASE_URL, "/atividade", {
    method: "POST",
    headers: { Authorization: token },
    body: JSON.stringify(atividade),
  });
}

export async function excluirAtividade(igrejaId: number, atividadeId: number): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error("Usuário não autenticado");

  await fetchApi<void>(API_BASE_URL, `/atividade?igrejaId=${igrejaId}&atividadeId=${atividadeId}`, {
    method: "DELETE",
    headers: { Authorization: token },
  });
}

// --- Igrejas ---

export async function listarTodasIgrejas(incluirInativas = false): Promise<IgrejaApi[]> {
  const token = getAuthToken();
  const path = incluirInativas ? "/igreja/todos" : "/igreja/todos?ativo=true";
  const data = await fetchApi<any>(API_BASE_URL, path, {
    headers: token ? { Authorization: token } : {},
  });
  return Array.isArray(data) ? data : (data.igrejas || []);
}

export async function listarIgrejasDoUsuario(): Promise<IgrejaApi[]> {
  const token = getAuthToken();
  if (!token) return [];

  const data = await fetchApi<any>(API_BASE_URL, "/igreja/do-usuario", {
    headers: { Authorization: token },
  });
  return Array.isArray(data) ? data : (data.igrejas || []);
}

export async function registrarIgreja(igreja: IgrejaRequest): Promise<IgrejaApi> {
  const token = getAuthToken();
  if (!token) throw new Error("Usuário não autenticado");

  return fetchApi<IgrejaApi>(API_BASE_URL, "/igreja", {
    method: "POST",
    headers: { Authorization: token },
    body: JSON.stringify(igreja),
  });
}

export async function vincularIgreja(id: number): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error("Usuário não autenticado");

  await fetchApi<void>(API_BASE_URL, `/igreja/vincular/${id}`, {
    method: "POST",
    headers: { Authorization: token },
  });
}

export async function alternarStatusIgreja(id: number): Promise<any> {
  const token = getAuthToken();
  if (!token) throw new Error("Usuário não autenticado");

  return fetchApi<any>(API_BASE_URL, `/igreja/alternar-status/${id}`, {
    method: "PATCH",
    headers: { Authorization: token },
  });
}

export async function buscarIgrejaPorId(id: number): Promise<IgrejaApi | null> {
  try {
    const data = await fetchApi<any>(API_BASE_URL, `/igreja/id/${id}`);
    return data?.igreja || data;
  } catch (error) {
    return null;
  }
}

export async function buscarIgrejaPorRazaoSocial(razaoSocial: string): Promise<IgrejaApi | null> {
  try {
    const encodedRazao = encodeURIComponent(razaoSocial);
    const data = await fetchApi<any>(API_BASE_URL, `/igreja/razao-social/${encodedRazao}`);
    return data?.igreja || data;
  } catch (error) {
    return null;
  }
}

export async function listarCultosPorIgreja(igrejaId: number): Promise<AtividadeApi[]> {
  const todas = await listarTodasAtividades();
  return todas.filter((a) => a.igrejaId === igrejaId && a.tipo === "CULTO");
}

// --- Usuários ---

export async function getUsuarioLogado(): Promise<UsuarioApi> {
  const token = getAuthToken();
  if (!token) throw new Error("Usuário não autenticado");

  return fetchApi<UsuarioApi>(API_BASE_URL, "/usuarios/me", {
    headers: { Authorization: token },
  });
}

export async function buscarRelacoesUsuario(): Promise<RelacaoComIgreja[]> {
  const token = getAuthToken();
  if (!token) return [];

  try {
    return await fetchApi<RelacaoComIgreja[]>(API_BASE_URL, "/usuarios/relacao-igreja", {
      headers: { Authorization: token },
    });
  } catch (error) {
    return [];
  }
}

export async function atualizarUsuario(dados: UsuarioUpdate): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error("Usuário não autenticado");

  await fetchApi<void>(API_BASE_URL, "/usuarios/atualizar", {
    method: "PUT",
    headers: { Authorization: token },
    body: JSON.stringify(dados),
  });
}

// --- Auth (Microserviço) ---

export async function loginApi(email: string, password: string) {
  return fetchApi<any>(AUTH_API_BASE_URL, "/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password, application: APPLICATION_NAME }),
  });
}

export async function registerApi(name: string, email: string, password: string) {
  return fetchApi<any>(AUTH_API_BASE_URL, "/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, aplication: APPLICATION_NAME }),
  });
}
