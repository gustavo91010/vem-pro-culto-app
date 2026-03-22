const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084";
const AUTH_API_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8082";
const APPLICATION_NAME = "vem-pro-culto"; // Nome da aplicação registrado no authentication-ms

async function fetchApi<T>(
  baseUrl: string,
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${baseUrl}${path}`;
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
      console.error(`[fetchApi] Erro na API: ${errorMsg}`);
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
  nome: string;
  endereco: string;
  cidade: string;
  bairro: string;
  telefone: string;
  email: string;
  site: string;
  latitude: number;
  longitude: number;
  descricao: string;
}

export interface IgrejaListApi {
  igrejas: IgrejaApi[];
}

// --- Atividades ---

export async function listarTodasAtividades(): Promise<AtividadeApi[]> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("vpc_token") : null;
  const data = await fetchApi<AtividadeListApi>(
    API_BASE_URL,
    "/atividade/listar",
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  return data.atividades;
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
  const data= await fetchApi<IgrejaListApi>(API_BASE_URL, "/igreja/todos", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return data.igrejas
}

export async function listarMinhasIgrejas(
  usuarioId: number,
): Promise<IgrejaApi[]> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("vpc_token") : null;

  const data = await fetchApi<IgrejaListApi>(API_BASE_URL, "/igreja/todos", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify({ usuarioId }),
  });
  return data.igrejas;
}

export async function registrarIgreja(
  igreja: IgrejaRequest,
): Promise<IgrejaApi> {
  console.log("[registrarIgreja] Iniciando...");
  const token =
    typeof window !== "undefined" ? localStorage.getItem("vpc_token") : null;
  console.log("[registrarIgreja] Token encontrado:", token ? "Sim" : "Não");

  if (!token) {
    console.error(
      "[registrarIgreja] Erro: Token não encontrado no localStorage",
    );
    throw new Error("Usuário não autenticado");
  }

  console.log(
    "[registrarIgreja] Disparando fetchApi para /igreja com token:",
    token,
  );
  return fetchApi<IgrejaApi>(API_BASE_URL, "/igreja", {
    method: "POST",
    headers: { Authorization: token },
    body: JSON.stringify(igreja),
  });
}

export async function alternarStatusIgreja(id: number): Promise<any> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("vpc_token") : null;
  if (!token) throw new Error("Usuário não autenticado");

  return fetchApi<any>(API_BASE_URL, `/igreja/alternar-status/${id}`, {
    method: "PATCH",
    headers: { Authorization: token },
  });
}

export async function buscarIgrejaPorId(id: number): Promise<IgrejaApi> {
  const data = await fetchApi<IgrejaApi>(API_BASE_URL, `/igreja/id/${id}`);
  return data;
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
  authToken: string;
  ativo: boolean;
  // ... outros campos se necessário
}

export async function getUsuarioLogado(): Promise<UsuarioApi> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("vpc_token") : null;
  if (!token) throw new Error("Usuário não autenticado");

  return fetchApi<UsuarioApi>(API_BASE_URL, `/usuarios/${token}`);
}
