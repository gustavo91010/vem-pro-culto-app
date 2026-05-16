// const API_BASE_URL = "/api/vpc";
// const AUTH_API_BASE_URL = "/api/auth";
const API_BASE_URL = "/api-vpc";
const AUTH_API_BASE_URL = "/api-auth";

const APPLICATION_NAME = "vem-pro-culto";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("vpc_token");
  console.log('[getAuthToken] Token no localStorage:', token ? 'Encontrado' : 'NÃO ENCONTRADO');
  if (!token) return null;
  // Se já tiver Bearer, retorna como está. Se não, adiciona.
  // O backend geralmente espera "Bearer <token>"
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

async function fetchApi<T>(
  baseUrl: string,
  path: string,
  options?: RequestInit,
): Promise<T> {
  const isServer = typeof window === "undefined";
  const fullPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${fullPath}`;
  
  // Logando o cabeçalho Authorization (resumido) para debug
  const authHeader = (options?.headers as any)?.["Authorization"] || "Nenhum";
  const authSnippet = authHeader !== "Nenhum" ? `${authHeader.substring(0, 20)}...` : "Nenhum";

  console.log(`[fetchApi] ${isServer ? '[SERVER]' : '[CLIENT]'} Chamando: ${options?.method || "GET"} ${url} | Auth: ${authSnippet}`);

  try {
    const res = await fetch(url, {
      ...options,
      cache: 'no-store',
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    console.log(`[fetchApi] Resposta de ${url}: Status ${res.status}`);

    if (!res.ok) {
      let errorMsg = `Erro ${res.status}: ${res.statusText}`;
      
      try {
        const responseText = await res.text();
        console.log(`[fetchApi] Erro de ${url} (corpo):`, responseText);
        
        try {
          const errorJson = JSON.parse(responseText);
          
          // Tenta extrair a mensagem mais específica possível
          if (errorJson.message && typeof errorJson.message === 'string') {
            errorMsg = errorJson.message;
          } else if (errorJson.error && typeof errorJson.error === 'string') {
            errorMsg = errorJson.error;
          } else if (errorJson.details && typeof errorJson.details === 'string') {
            errorMsg = errorJson.details;
          } else if (Array.isArray(errorJson.errors) && errorJson.errors.length > 0) {
            // Caso de erros de validação do Spring (ex: @Valid)
            errorMsg = errorJson.errors.map((e: any) => e.defaultMessage || e).join(", ");
          } else if (errorJson.developerMessage && Array.isArray(errorJson.developerMessage)) {
            errorMsg = errorJson.developerMessage[0] || errorMsg;
          }
        } catch (e) {
          // Se não for JSON, usa o texto puro se existir
          if (responseText && responseText.length < 200) {
            errorMsg = responseText;
          }
        }
      } catch (e) {
        console.error('[fetchApi] Falha ao ler corpo do erro:', e);
      }
      
      throw new Error(errorMsg);
    }

    const data = await res.json();
    console.log(`[fetchApi] JSON recebido de ${url}:`, data);
    return data;
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
  igrejasFavoritas?: number[];
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

export async function atualizarAtividade(id: number, atividade: AtividadeDTO): Promise<AtividadeApi> {
  const token = getAuthToken();
  if (!token) throw new Error("Usuário não autenticado");

  return fetchApi<AtividadeApi>(API_BASE_URL, `/atividade/${id}`, {
    method: "PUT",
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
  console.log('[listarIgrejasDoUsuario] Iniciando busca com token:', token ? 'Presente' : 'Ausente');
  
  if (!token) return [];

  try {
    const data = await fetchApi<any>(API_BASE_URL, "/igreja/do-usuario", {
      headers: { Authorization: token },
    });
    console.log('[listarIgrejasDoUsuario] Dados brutos recebidos:', data);
    
    const lista = Array.isArray(data) ? data : (data.igrejas || []);
    console.log('[listarIgrejasDoUsuario] Lista final processada:', lista);
    return lista;
  } catch (error) {
    console.error('[listarIgrejasDoUsuario] Erro fatal na chamada:', error);
    return [];
  }
}

export async function registrarIgreja(igreja: IgrejaRequest): Promise<IgrejaApi> {
  const token = getAuthToken();
  if (!token) throw new Error("Usuário não autenticado");

  const data= await fetchApi<IgrejaApi>(API_BASE_URL, "/igreja", {
    method: "POST",
    headers: { Authorization: token },
    body: JSON.stringify(igreja),
  });
  console.log("registrarIgreja", data);
  
return data;
}

/**
 * Vincula ou desvincula uma igreja ao usuário logado (Favorito/Seguir).
 * @param id ID da igreja
 * @returns true se o usuário passou a seguir, false se deixou de seguir.
 */
export async function vincularIgreja(id: number): Promise<boolean> {
  const token = getAuthToken();
  if (!token) throw new Error("Usuário não autenticado");

  return fetchApi<boolean>(API_BASE_URL, `/igreja/atualizar-vinculo/${id}`, {
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
  const token = getAuthToken();
  try {
    const encodedRazao = encodeURIComponent(razaoSocial);
    const data = await fetchApi<any>(API_BASE_URL, `/igreja/razao-social/${encodedRazao}`, {
      headers: token ? { Authorization: token } : {},
    });
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

  return await fetchApi<RelacaoComIgreja[]>(API_BASE_URL, "/usuarios/relacao-igreja", {
    headers: { Authorization: token },
  });
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
  return fetchApi<any>(AUTH_API_BASE_URL, "/signin", {
    method: "POST",
    body: JSON.stringify({ email, password, application: APPLICATION_NAME }),
  });
}

export async function registerApi(name: string, email: string, password: string) {
  return fetchApi<any>(AUTH_API_BASE_URL, "/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, application: APPLICATION_NAME }),
  });
}
