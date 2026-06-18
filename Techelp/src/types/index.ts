export type Perfil = 'CLIENTE' | 'TECNICO' | 'SUPERVISOR' | 'SUPERADMIN';
export type StatusChamado = 'ABERTO' | 'ACEITO' | 'EM_ANDAMENTO' | 'RESOLVIDO' | 'FECHADO' | 'CANCELADO';
export type PrioridadeChamado = 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE';

export interface UF {
  id: string;
  sigla: string;
  nome: string;
}

export interface Cidade {
  id: string;
  ufId: string;
  nome: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  perfil: Perfil;
  ufId?: string;
  cidadeId?: string;
  dataCriacao: string;
}

export interface Tecnico {
  id: string;
  usuarioId: string;
  usuario?: Usuario;
  documento: string;
  documentoValidado: boolean;
  experienciaAnos: number;
  taxaComissao: number;
  descricao?: string;
  fotoUrl?: string;
  ratingMedio: number;
  totalAvaliacoes: number;
  chamadosConcluidos: number;
  disponivel: boolean;
  especialidades: string[];
  dataCriacao: string;
}

export interface Chamado {
  id: string;
  clienteId: string;
  cliente?: Usuario;
  tecnicoId?: string;
  tecnico?: Tecnico;
  categoria: string;
  titulo: string;
  descricao: string;
  prioridade: PrioridadeChamado;
  status: StatusChamado;
  tempoEstimadoHoras?: number;
  valorProposto?: number;
  dataCriacao: string;
  dataInicio?: string;
  dataConclusao?: string;
}

export interface MensagemChat {
  id: string;
  chamadoId: string;
  usuarioId: string;
  usuario?: Usuario;
  conteudo: string;
  tipoAnexo?: string;
  urlAnexo?: string;
  dataEnvio: string;
  lida: boolean;
}

export interface Avaliacao {
  id: string;
  chamadoId: string;
  clienteId: string;
  tecnicoId: string;
  rating: number;
  comentario?: string;
  dataCriacao: string;
}

export interface EspecialidadeTecnico {
  id: string;
  tecnicoId: string;
  categoria: string;
  prioridade: number;
}

export interface DisponibilidadeTecnico {
  id: string;
  tecnicoId: string;
  diaSemana: string;
  horaInicio: string;
  horaFim: string;
  ativo: boolean;
}
