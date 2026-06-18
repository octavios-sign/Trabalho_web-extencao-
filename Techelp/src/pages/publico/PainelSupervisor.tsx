import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { api, getLoggedUser, logout } from '../../services/api';

const PainelSupervisor: React.FC = () => {
  const navigate = useNavigate();
  const user = getLoggedUser();
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [chamados, setChamados] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.perfil !== 'SUPERVISOR') {
      navigate('/login');
      return;
    }
    carregarDados();
  }, [user, navigate]);

  const carregarDados = () => {
    api.tecnicos?.list?.().then(setTecnicos).catch(() => {});
    api.chamados?.list?.().then(setChamados).catch(() => {});
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          <Link to="/supervisor" style={{ padding: '12px 16px', borderRadius: 8, background: 'transparent', textDecoration: 'none', fontWeight: 500 }}>
            📊 Dashboard
          </Link>
          <Link to="/supervisor/tecnicos" style={{ padding: '12px 16px', borderRadius: 8, background: 'transparent', textDecoration: 'none', fontWeight: 500 }}>
            👨‍💻 Técnicos
          </Link>
          <Link to="/supervisor/chamados" style={{ padding: '12px 16px', borderRadius: 8, background: 'transparent', textDecoration: 'none', fontWeight: 500 }}>
            📋 Chamados
          </Link>
          <Link to="/supervisor/relatorios" style={{ padding: '12px 16px', borderRadius: 8, background: 'transparent', textDecoration: 'none', fontWeight: 500 }}>
            📈 Relatórios
          </Link>
        </nav>
        <button onClick={handleLogout} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
          🚪 Sair
        </button>
      </aside>

      <main style={{ padding: 40 }}>
        <Routes>
          <Route path="/" element={<DashboardSupervisor tecnicos={tecnicos} chamados={chamados} />} />
          <Route path="/tecnicos/*" element={<ListaTecnicos tecnicos={tecnicos} />} />
          <Route path="/chamados/*" element={<ListaChamados chamados={chamados} />} />
          <Route path="/relatorios/*" element={<Relatorios />} />
        </Routes>
      </main>
    </div>
  );
};

const DashboardSupervisor: React.FC<{ tecnicos: any[]; chamados: any[] }> = ({ tecnicos, chamados }) => {
  const tecnicosAtivos = tecnicos.filter(t => t.disponivel);

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>Dashboard do Supervisor</h1>
      
      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 40 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👨‍💻</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>{tecnicos.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Total de técnicos</div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🟢</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>{tecnicosAtivos.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Disponíveis agora</div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>{chamados.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Total de chamados</div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⭐</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>
            {(tecnicos.reduce((a, b) => a + b.ratingMedio, 0) / tecnicos.length).toFixed(1) || 0}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Rating médio</div>
        </div>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Técnicos Monitorados</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: 12, textAlign: 'left', fontWeight: 700 }}>Nome</th>
              <th style={{ padding: 12, textAlign: 'left', fontWeight: 700 }}>Rating</th>
              <th style={{ padding: 12, textAlign: 'left', fontWeight: 700 }}>Chamados</th>
              <th style={{ padding: 12, textAlign: 'left', fontWeight: 700 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {tecnicos.map(tech => (
              <tr key={tech.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: 12 }}>{tech.usuario?.nome}</td>
                <td style={{ padding: 12 }}>⭐ {tech.ratingMedio.toFixed(1)}</td>
                <td style={{ padding: 12 }}>{tech.chamadosConcluidos}</td>
                <td style={{ padding: 12 }}>
                  <span style={{
                    background: tech.disponivel ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
                    color: tech.disponivel ? '#22c55e' : 'var(--text-muted)',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600
                  }}>
                    {tech.disponivel ? '🟢 Online' : '⚪ Offline'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ListaTecnicos: React.FC<{ tecnicos: any[] }> = ({ tecnicos }) => {
  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>Gerenciar Técnicos</h1>
      <p style={{ color: 'var(--text-muted)' }}>Total de {tecnicos.length} técnicos cadastrados</p>
    </div>
  );
};

const ListaChamados: React.FC<{ chamados: any[] }> = ({ chamados }) => {
  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>Monitorar Chamados</h1>
      <p style={{ color: 'var(--text-muted)' }}>Total de {chamados.length} chamados</p>
    </div>
  );
};

const Relatorios: React.FC = () => {
  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>Relatórios</h1>
      <p style={{ color: 'var(--text-muted)' }}>Relatórios em desenvolvimento...</p>
    </div>
  );
};

export default PainelSupervisor;
