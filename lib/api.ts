const API_BASE_URL = "/api/vpc";
const AUTH_API_BASE_URL = "/api/auth";
const APPLICATION_NAME = "vem-pro-culto"; 

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
      let isNotImplemented = false;
      try {
        const errorJson = await res.json();
        errorMsg = errorJson.message || errorJson.error || errorMsg;
        isNotImplemented = errorMsg === "Método ainda não implementado";
      } catch (e) { }
      
      if (!isNotImplemented) {
        console.error(`[fetchApi] Erro na API: ${errorMsg}`);
      }
      throw new Error(errorMsg);
    }

    return res.json();
  } catch (error) {
    console.error(`[fetchApi] Erro de rede/conexão em ${url}:`, error);
    throw error;
  }
}

// --- Tipos baseados na API ---

export type AtividadeTipo =
  | "CULTO"
  | "ATIVIDADE"
  | "EVANGELISMO"
  | "ACAO_SOCIAL"
  | "EBD";
export type TipoTelefone = "CELULAR" | "WHATSAPP" | "FIXO";
export type TipoRedeSocial =
  | "SITE"
  | "YOUTUBE"
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TWITTER"
  | "TIKTOK";

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
  horario: string; // ISO yyyy-MM-dd'T'HH:mm:ss
}

export interface AtividadeApi {
  id: number;
  igrejaId: number;
  nomeIgreja: string;
  tipo: string;
  descricao: string;
  horario: string; // ISO datetime
}

export interface AtividadeListApi {
  atividades: AtividadeApi[];
}

export interface IgrejaApi {
  id: number;
  nome?: string;
  nomeFantasia?: string;
  razaoSocial: string;
  email: string;
  cnpj: string;
  descricao: string;
  imagemUrl?: string;
  ativo: boolean;
  endereco: EnderecoApi;
  telefone: TelefoneApi[];
  redesSociais: RedeSocialApi[];
  // Campos legados/planos (para compatibilidade se necessário)
  latitude?: number;
  longitude?: number;
  cidade?: string;
  bairro?: string;
  site?: string;
}

export interface IgrejaResponse {
  igreja: IgrejaApi;
}

export interface IgrejaListApi {
  igrejas: IgrejaApi[];
}

// --- Atividades ---

export async function listarTodasAtividades(): Promise<AtividadeApi[]> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("vpc_token") : null;
  try {
    const data = await fetchApi<any>(
      API_BASE_URL,
      "/atividade/listar",
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    // Suporta tanto array direto quanto objeto { atividades: [] }
    return Array.isArray(data) ? data : (data.atividades || []);
  } catch (error) {
    console.error("Erro ao listar atividades, retornando lista vazia:", error);
    return [];
  }
}

export async function registrarAtividade(
  atividade: AtividadeDTO,
): Promise<AtividadeApi> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("vpc_token") : null;
  if (!token) throw new Error("Usuário não autenticado");

  return fetchApi<AtividadeApi>(API_BASE_URL, "/atividade", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(atividade),
  });
}

export async function excluirAtividade(
  igrejaId: number,
  atividadeId: number,
): Promise<void> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("vpc_token") : null;
  if (!token) throw new Error("Usuário não autenticado");

  await fetchApi<any>(
    API_BASE_URL,
    `/atividade?igrejaId=${igrejaId}&atividadeId=${atividadeId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}

export async function buscarAtividadePorId(id: number): Promise<AtividadeApi> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("vpc_token") : null;
  const data = await fetchApi<AtividadeApi>(
    API_BASE_URL,
    `/atividade/id/${id}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  return data;
}

// --- Igrejas ---

export async function listarTodasIgrejas(): Promise<IgrejaApi[]> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("vpc_token") : null;
  const cleanToken = token?.startsWith('Bearer ') ? token.substring(7) : token;

  const data = await fetchApi<any>(API_BASE_URL, "/igreja/todos", {
    method: "GET",
    headers: cleanToken ? { Authorization: cleanToken } : {},
  });
  // Suporta tanto array direto quanto objeto { igrejas: [] }
  return Array.isArray(data) ? data : (data.igrejas || []);
}

export async function listarMinhasIgrejas(
  usuarioId: number,
): Promise<IgrejaApi[]> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("vpc_token") : null;
  const cleanToken = token?.startsWith('Bearer ') ? token.substring(7) : token;

  const data = await fetchApi<any>(API_BASE_URL, `/igreja/todos?usuarioId=${usuarioId}`, {
    method: "GET",
    headers: cleanToken ? { Authorization: cleanToken } : {},
  });
  return Array.isArray(data) ? data : (data.igrejas || []);
}

export async function registrarIgreja(
  igreja: IgrejaRequest,
): Promise<IgrejaApi> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("vpc_token") : null;
  if (!token) throw new Error("Usuário não autenticado");

  const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;

  return fetchApi<IgrejaApi>(API_BASE_URL, "/igreja", {
    method: "POST",
    headers: { Authorization: cleanToken },
    body: JSON.stringify(igreja),
  });
}

export async function alternarStatusIgreja(id: number): Promise<any> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("vpc_token") : null;
  if (!token) throw new Error("Usuário não autenticado");

  const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;

  return fetchApi<any>(API_BASE_URL, `/igreja/alternar-status/${id}`, {
    method: "PATCH",
    headers: { Authorization: cleanToken },
  });
}

export async function buscarIgrejaPorId(id: number): Promise<IgrejaApi | null> {
  try {
    const data = await fetchApi<any>(
      API_BASE_URL, 
      `/igreja/id/${id}?igrejaId=${id}`
    );
    
    // O backend retorna um objeto IgrejaResponse que contém o campo 'igreja'
    return data?.igreja || data;
  } catch (error) {
    console.error(`Erro ao buscar igreja por ID ${id}:`, error);
    return null;
  }
}

export async function buscarIgrejaPorRazaoSocial(razaoSocial: string): Promise<IgrejaApi | null> {
  try {
    const encodedRazao = encodeURIComponent(razaoSocial);
    // O seu backend espera o parâmetro 'razaoSocial' como query param no endpoint específico
    const data = await fetchApi<any>(
      API_BASE_URL, 
      `/igreja/razao-social/${encodedRazao}?razaoSocial=${encodedRazao}`
    );
    
    // O backend retorna um objeto IgrejaResponse que contém o campo 'igreja'
    return data?.igreja || data;
  } catch (error) {
    console.error(`Erro ao buscar igreja por Razao Social ${razaoSocial}:`, error);
    return null;
  }
}

export async function listarCultosPorIgreja(
  igrejaId: number,
): Promise<AtividadeApi[]> {
  const todas = await listarTodasAtividades();
  return todas.filter((a) => a.igrejaId === igrejaId && a.tipo === "CULTO");
}

export async function listarAtividadesPorIgreja(
  igrejaId: number,
): Promise<AtividadeApi[]> {
  const todas = await listarTodasAtividades();
  return todas.filter((a) => a.igrejaId === igrejaId);
}

// --- Autenticação (Microserviço Auth 8082) ---

export async function loginApi(email: string, password: string) {
  // Rota do authentication-ms: /auth/signin
  return fetchApi<any>(AUTH_API_BASE_URL, "/auth/signin", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      application: APPLICATION_NAME,
    }),
  });
}

export async function registerApi(
  name: string,
  email: string,
  password: string,
) {
  // Rota do authentication-ms: /auth/signup
  // Nota: o campo no UsersRegister.java está 'aplication' (com un 'p' só)
  return fetchApi<any>(AUTH_API_BASE_URL, "/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      aplication: APPLICATION_NAME,
    }),
  });
}

// --- Usuários ---

export interface UsuarioApi {
  id: number;
  name?: string | null;
  email: string;
  roles: string[];
  authToken?: string;
  ativo?: boolean;
}

export async function getUsuarioLogado(): Promise<UsuarioApi> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("vpc_token") : null;
  if (!token) throw new Error("Usuário não autenticado");

  return fetchApi<UsuarioApi>(API_BASE_URL, `/usuarios/${token}`);
}
