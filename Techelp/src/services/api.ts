const API_URL = 'http://localhost:5000/api';

export function getToken(): string | null { return localStorage.getItem('techhelp_token'); }
export function saveSession(token: string, usuario: any) {
  localStorage.setItem('techhelp_token', token);
  localStorage.setItem('techhelp_user', JSON.stringify(usuario));
}
export function clearSession() {
  localStorage.removeItem('techhelp_token');
  localStorage.removeItem('techhelp_user');
}
export const logout = clearSession;
export function getLoggedUser(): any | null {
  try { return JSON.parse(localStorage.getItem('techhelp_user') || 'null'); } catch { return null; }
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: any = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    let msg = 'Erro na requisição.';
    try { msg = (await response.json()).message || msg; } catch {}
    throw new Error(msg);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  auth: {
    login: async (email: string, senha: string) => {
      const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) });
      saveSession(data.token, data.usuario);
      return data.usuario;
    },
    register: async (userData: { nome: string; email: string; senha: string; telefone?: string }) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    logout: clearSession,
    me: () => request('/auth/me'),
  },

  categorias: {
    list: (): Promise<any[]> => request('/categorias'),
    create: (data: { nome: string; descricao?: string; icone?: string }) =>
      request('/admin/categorias', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/admin/categorias/${id}`, { method: 'DELETE' }),
  },

  chamados: {
    list: (): Promise<any[]> => request('/chamados'),
    get: (id: string): Promise<any> => request(`/chamados/${id}`),
    create: (data: { titulo: string; descricao: string; categoria_id: string; prioridade?: string }) =>
      request('/chamados', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { status?: string; tecnico_id?: string; prioridade?: string }) =>
      request(`/chamados/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/chamados/${id}`, { method: 'DELETE' }),
  },

  mensagens: {
    create: (chamadoId: string, conteudo: string) =>
      request(`/chamados/${chamadoId}/mensagens`, { method: 'POST', body: JSON.stringify({ conteudo }) }),
    delete: (id: string) => request(`/mensagens/${id}`, { method: 'DELETE' }),
  },

  ufs: {
    list: (): Promise<any[]> => request('/ufs'),
    create: (sigla: string, nome: string) =>
      request('/admin/ufs', { method: 'POST', body: JSON.stringify({ sigla, nome }) }),
    delete: (id: string) => request(`/admin/ufs/${id}`, { method: 'DELETE' }),
  },

  admin: {
    usuarios: {
      list: (): Promise<any[]> => request('/admin/usuarios'),
      create: (data: any) => request('/admin/usuarios', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request(`/admin/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) => request(`/admin/usuarios/${id}`, { method: 'DELETE' }),
    },
  },

  tecnicos: {
    list: (): Promise<any[]> => request('/tecnicos'),
    getProfile: (): Promise<any> => request('/tecnicos/profile'),
    toggleDisponibilidade: (): Promise<any> => request('/tecnicos/toggle-disponibilidade', { method: 'POST' }),
  },

  pagamentos: {
    listarMetodos: (): Promise<any[]> => request('/pagamentos/metodos'),
    adicionarMetodo: (data: { tipo: string; detalhes: any }) =>
      request('/pagamentos/metodos', { method: 'POST', body: JSON.stringify(data) }),
    removerMetodo: (id: string) =>
      request(`/pagamentos/metodos/${id}`, { method: 'DELETE' }),
    definirPadrao: (id: string) =>
      request(`/pagamentos/metodos/${id}/padrao`, { method: 'PUT' }),
  },
};
