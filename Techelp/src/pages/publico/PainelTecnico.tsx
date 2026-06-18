import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import type { Chamado, Tecnico } from '../../types';
import { api, getLoggedUser, logout } from '../../services/api';

const PainelTecnico: React.FC = () => {
  const navigate = useNavigate();
  const user = getLoggedUser();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [tecnico, setTecnico] = useState<Tecnico | null>(null);
  const [disponivel, setDisponivel] = useState(false);

  useEffect(() => {
    if (!user || user.perfil !== 'TECNICO') {
      navigate('/login');
      return;
    }
    carregarDados();
  }, [user, navigate]);

  const carregarDados = () => {
    api.chamados?.list?.().then(setChamados).catch(() => {});
    api.tecnicos?.getProfile?.().then(setTecnico).catch(() => {});
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleToggleDisponibilidade = () => {
    api.tecnicos?.toggleDisponibilidade?.().then(() => {
      setDisponivel(!disponivel);
    }).catch(() => {});
  };

  const chamadosDisponiveis = chamados.filter(c => c.status === 'ABERTO');
  const chamadosEmAndamento = chamados.filter(c => ['ACEITO', 'EM_ANDAMENTO'].includes(c.status) && c.tecnicoId === tecnico?.id);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'grid', gridTemplateColumns: '250px 1fr' }}>
      <aside style={{ background: 'var(--card-bg)', borderRight: '1px solid var(--border)', padding: 24 }}>
        <Link to="/" className="logo" style={{ marginBottom: 32, display: 'inline-block' }}>
          <span className="logo-icon">🛡️</span>
          <span className="logo-text-tech">Tech</span><span className="logo-text-help">Help</span>
        </Link>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{user?.nome}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.email}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            ⭐ {tecnico?.ratingMedio.toFixed(1)} ({tecnico?.totalAvaliacoes})
          </div>
        </div>
        <div style={{ padding: '12px', background: 'var(--primary-glow)', borderRadius: 8, marginBottom: 32, textAlign: 'center' }}>
          <button
            onClick={handleToggleDisponibilidade}
            style={{
              background: disponivel ? '#22c55e' : '#888',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              width: '100%'
            }}
          >
            {disponivel ? '🟢 Disponível' : '⚪ Offline'}
          </button>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          <Link to="/tecnico" style={{ padding: '12px 16px', borderRadius: 8, background: 'transparent', textDecoration: 'none', fontWeight: 500 }}>
            📊 Dashboard
          </Link>
          <Link to="/tecnico/chamados" style={{ padding: '12px 16px', borderRadius: 8, background: 'transparent', textDecoration: 'none', fontWeight: 500 }}>
            📋 Chamados
          </Link>
          <Link to="/tecnico/perfil" style={{ padding: '12px 16px', borderRadius: 8, background: 'transparent', textDecoration: 'none', fontWeight: 500 }}>
            👤 Meu Perfil
          </Link>
          <Link to="/tecnico/avaliacoes" style={{ padding: '12px 16px', borderRadius: 8, background: 'transparent', textDecoration: 'none', fontWeight: 500 }}>
            ⭐ Avaliações
          </Link>
          <Link to="/tecnico/ganhos" style={{ padding: '12px 16px', borderRadius: 8, background: 'transparent', textDecoration: 'none', fontWeight: 500 }}>
            💰 Meus Ganhos
          </Link>
        </nav>
        <button onClick={handleLogout} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
          🚪 Sair
        </button>
      </aside>

      <main style={{ padding: 40 }}>
        <Routes>
          <Route path="/" element={<DashboardTecnico tecnico={tecnico} chamadosDisponiveis={chamadosDisponiveis} chamadosEmAndamento={chamadosEmAndamento} />} />
          <Route path="/chamados/*" element={<ListaChamados chamados={chamados} tecnicoId={tecnico?.id} />} />
          <Route path="/chamado/:id/*" element={<DetalhesChamado />} />
          <Route path="/perfil/*" element={<MeuPerfil tecnico={tecnico} />} />
          <Route path="/avaliacoes/*" element={<MinhasAvaliacoes tecnico={tecnico} />} />
          <Route path="/ganhos/*" element={<MeusGanhos tecnico={tecnico} />} />
        </Routes>
      </main>
    </div>
  );
};

const DashboardTecnico: React.FC<{ tecnico: Tecnico | null; chamadosDisponiveis: Chamado[]; chamadosEmAndamento: Chamado[] }> = ({ tecnico, chamadosDisponiveis, chamadosEmAndamento }) => {
  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>Dashboard</h1>
      
      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 40 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>{tecnico?.chamadosConcluidos || 0}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Chamados concluídos</div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⭐</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>{tecnico?.ratingMedio.toFixed(1) || 0}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Rating</div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔄</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>{chamadosEmAndamento.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Em andamento</div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎫</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#ec4899', marginBottom: 4 }}>{chamadosDisponiveis.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Disponíveis</div>
        </div>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Chamados Disponíveis para Você</h2>
      <div className="grid-cards">
        {chamadosDisponiveis.length > 0 ? (
          chamadosDisponiveis.map(chamado => (
            <Link to={`/tecnico/chamado/${chamado.id}`} key={chamado.id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, flex: 1 }}>{chamado.titulo}</h3>
                  <span style={{
                    background: chamado.prioridade === 'URGENTE' ? 'rgba(239,68,68,0.1)' : chamado.prioridade === 'ALTA' ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                    color: chamado.prioridade === 'URGENTE' ? '#ef4444' : chamado.prioridade === 'ALTA' ? '#f59e0b' : '#22c55e',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 600
                  }}>
                    {chamado.prioridade}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8, lineHeight: 1.5 }}>{chamado.descricao.substring(0, 80)}...</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>📂 {chamado.categoria}</span>
                  <button style={{
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 12
                  }}>
                    Aceitar
                  </button>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="card" style={{ padding: 32, textAlign: 'center', gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>😴</div>
            <p style={{ color: 'var(--text-muted)' }}>Nenhum chamado disponível no momento</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ListaChamados: React.FC<{ chamados: Chamado[]; tecnicoId?: string }> = ({ chamados, tecnicoId }) => {
  const meusChamados = chamados.filter(c => c.tecnicoId === tecnicoId);

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>Meus Chamados</h1>
      <div className="grid-cards">
        {meusChamados.length > 0 ? (
          meusChamados.map(chamado => (
            <Link to={`/tecnico/chamado/${chamado.id}`} key={chamado.id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{chamado.titulo}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>{chamado.cliente?.nome}</p>
                <span style={{
                  background: 'rgba(59,130,246,0.1)',
                  color: '#3b82f6',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600
                }}>
                  {chamado.status}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="card" style={{ padding: 32, textAlign: 'center', gridColumn: '1 / -1' }}>
            <p style={{ color: 'var(--text-muted)' }}>Você ainda não aceitou nenhum chamado</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DetalhesChamado: React.FC = () => {
  return (
    <div>
      <h1>Detalhes do Chamado</h1>
      <p>Página em desenvolvimento...</p>
    </div>
  );
};

const MeuPerfil: React.FC<{ tecnico: Tecnico | null }> = ({ tecnico }) => {
  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>Meu Perfil</h1>
      {tecnico && (
        <div className="card" style={{ maxWidth: 600, padding: 32 }}>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Especialidades</h3>
            <p style={{ color: 'var(--text-muted)' }}>{tecnico.especialidades?.join(', ')}</p>
          </div>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Experiência</h3>
            <p style={{ color: 'var(--text-muted)' }}>{tecnico.experienciaAnos} anos</p>
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Rating</h3>
            <p style={{ color: 'var(--text-muted)' }}>⭐ {tecnico.ratingMedio.toFixed(1)} ({tecnico.totalAvaliacoes} avaliações)</p>
          </div>
        </div>
      )}
    </div>
  );
};

const MinhasAvaliacoes: React.FC<{ tecnico: Tecnico | null }> = () => {
  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>Minhas Avaliações</h1>
      <p style={{ color: 'var(--text-muted)' }}>Avaliações em desenvolvimento...</p>
    </div>
  );
};

const MeusGanhos: React.FC<{ tecnico: Tecnico | null }> = () => {
  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>Meus Ganhos</h1>
      <p style={{ color: 'var(--text-muted)' }}>Ganhos em desenvolvimento...</p>
    </div>
  );
};

export default PainelTecnico;
