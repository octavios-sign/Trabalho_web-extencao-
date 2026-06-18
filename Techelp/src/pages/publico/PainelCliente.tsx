import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import type { Chamado } from '../../types';
import { api, getLoggedUser, logout } from '../../services/api';

const PainelCliente: React.FC = () => {
  const navigate = useNavigate();
  const user = getLoggedUser();
  const [chamados, setChamados] = useState<Chamado[]>([]);

  useEffect(() => {
    if (!user || user.perfil !== 'CLIENTE') {
      navigate('/login');
      return;
    }
    carregarChamados();
  }, [user, navigate]);

  const carregarChamados = () => {
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
          <Link to="/cliente" style={{ padding: '12px 16px', borderRadius: 8, background: 'transparent', textDecoration: 'none', fontWeight: 500 }}>
            📊 Dashboard
          </Link>
          <Link to="/cliente/abrir-chamado" style={{ padding: '12px 16px', borderRadius: 8, background: 'transparent', textDecoration: 'none', fontWeight: 500 }}>
            ➕ Abrir Chamado
          </Link>
          <Link to="/cliente/tecnicos" style={{ padding: '12px 16px', borderRadius: 8, background: 'transparent', textDecoration: 'none', fontWeight: 500 }}>
            👨‍💻 Técnicos
          </Link>
          <Link to="/cliente/avaliacoes" style={{ padding: '12px 16px', borderRadius: 8, background: 'transparent', textDecoration: 'none', fontWeight: 500 }}>
            ⭐ Avaliações
          </Link>
          <Link to="/cliente/pagamento" style={{ padding: '12px 16px', borderRadius: 8, background: 'transparent', textDecoration: 'none', fontWeight: 500 }}>
            💳 Pagamento
          </Link>
        </nav>
        <button onClick={handleLogout} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
          🚪 Sair
        </button>
      </aside>

      <main style={{ padding: 40 }}>
        <Routes>
          <Route path="/" element={<DashboardCliente chamados={chamados} onChamadosUpdate={carregarChamados} />} />
          <Route path="/abrir-chamado/*" element={<AbrirChamado onSuccess={carregarChamados} />} />
          <Route path="/tecnicos/*" element={<ListaTecnicos />} />
          <Route path="/tecnico/:id" element={<DetalheTecnico />} />
          <Route path="/chamado/:id/*" element={<DetalhesChamado chamados={chamados} />} />
          <Route path="/avaliacoes/*" element={<MinhasAvaliacoes />} />
          <Route path="/pagamento" element={<MetodosPagamento />} />
          <Route path="/sucesso-pagamento" element={<SucessoPagamento />} />
        </Routes>
      </main>
    </div>
  );
};

const DashboardCliente: React.FC<{ chamados: Chamado[]; onChamadosUpdate: () => void }> = ({ chamados }) => {
  const chamadosAbertos = chamados.filter(c => ['ABERTO', 'ACEITO', 'EM_ANDAMENTO'].includes(c.status));
  const chamadosFechados = chamados.filter(c => ['RESOLVIDO', 'FECHADO', 'CANCELADO'].includes(c.status));

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>Dashboard</h1>
      
      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 40 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>{chamados.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Total de chamados</div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔄</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>{chamadosAbertos.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Em andamento</div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>{chamadosFechados.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Resolvidos</div>
        </div>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Chamados Abertos</h2>
      <div className="grid-cards">
        {chamadosAbertos.length > 0 ? (
          chamadosAbertos.map(chamado => (
            <Link to={`/cliente/chamado/${chamado.id}`} key={chamado.id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, flex: 1 }}>{chamado.titulo}</h3>
                  <span style={{ 
                    background: chamado.status === 'EM_ANDAMENTO' ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.1)',
                    color: chamado.status === 'EM_ANDAMENTO' ? '#3b82f6' : '#22c55e',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600
                  }}>
                    {chamado.status === 'EM_ANDAMENTO' ? '🔵 Em andamento' : '🟢 Aberto'}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>{chamado.descricao.substring(0, 100)}...</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>{chamado.categoria}</span>
                  <span>{new Date(chamado.dataCriacao).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="card" style={{ padding: 32, textAlign: 'center', gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p style={{ color: 'var(--text-muted)' }}>Nenhum chamado aberto</p>
            <Link to="/cliente/abrir-chamado" className="btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>
              Abrir um novo chamado
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const AbrirChamado: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria_id: '',
    prioridade: 'NORMAL'
  });
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    api.categorias?.list?.().then(list => {
      setCategorias(list);
      if (list && list.length > 0) {
        setFormData(f => ({ ...f, categoria_id: list[0].id }));
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoria_id) {
      setStatusMsg('Selecione uma categoria.');
      return;
    }
    api.chamados?.create?.(formData).then(() => {
      onSuccess();
      setStatusMsg('Chamado aberto com sucesso!');
      setFormData(f => ({ ...f, titulo: '', descricao: '' }));
    }).catch((err) => {
      setStatusMsg(err.message || 'Erro ao abrir chamado.');
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>Abrir Novo Chamado</h1>
      <div className="card" style={{ maxWidth: 600, padding: 32 }}>
        {statusMsg && (
          <div style={{
            background: statusMsg.includes('sucesso') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            color: statusMsg.includes('sucesso') ? '#10b981' : '#ef4444',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 14,
            fontWeight: 600,
            border: statusMsg.includes('sucesso') ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)'
          }}>
            {statusMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Título</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              placeholder="Descreva brevemente seu problema"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--input-bg)', color: 'var(--text)' }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Descrição Detalhada</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Conte-nos todos os detalhes do seu problema"
              rows={6}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--input-bg)', color: 'var(--text)', fontFamily: 'inherit' }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Categoria</label>
            <select
              value={formData.categoria_id}
              onChange={(e) => setFormData({...formData, categoria_id: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--input-bg)', color: 'var(--text)' }}
            >
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icone} {cat.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Prioridade</label>
            <select
              value={formData.prioridade}
              onChange={(e) => setFormData({...formData, prioridade: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--input-bg)', color: 'var(--text)' }}
            >
              <option value="BAIXA">Baixa</option>
              <option value="NORMAL">Normal</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>
            Abrir Chamado
          </button>
        </form>
      </div>
    </div>
  );
};

const ListaTecnicos: React.FC = () => {
  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>Técnicos Disponíveis</h1>
      <p style={{ color: 'var(--text-muted)' }}>Lista de técnicos em desenvolvimento...</p>
    </div>
  );
};

const DetalheTecnico: React.FC = () => {
  return (
    <div>
      <h1>Detalhes do Técnico</h1>
      <p>Página em desenvolvimento...</p>
    </div>
  );
};

const DetalhesChamado: React.FC<{ chamados: Chamado[] }> = () => {
  return (
    <div>
      <h1>Detalhes do Chamado</h1>
      <p>Página em desenvolvimento...</p>
    </div>
  );
};

const MinhasAvaliacoes: React.FC = () => {
  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>Minhas Avaliações</h1>
      <p style={{ color: 'var(--text-muted)' }}>Você ainda não fez nenhuma avaliação</p>
    </div>
  );
};

const MetodosPagamento: React.FC = () => {
  const [metodos, setMetodos] = useState<any[]>([]);
  const [tipo, setTipo] = useState<'CARTAO' | 'PIX'>('CARTAO');
  const [loading, setLoading] = useState(true);
  
  // Card Form State
  const [numero, setNumero] = useState('');
  const [nome, setNome] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [bandeira, setBandeira] = useState('Visa');

  // Pix Form State
  const [pixChave, setPixChave] = useState('');

  const [statusMsg, setStatusMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    carregarMetodos();
  }, []);

  const carregarMetodos = () => {
    setLoading(true);
    api.pagamentos.listarMetodos()
      .then(setMetodos)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleAddMetodo = (e: React.FormEvent) => {
    e.preventDefault();
    let detalhes = {};

    if (tipo === 'CARTAO') {
      if (numero.replace(/\s/g, '').length < 16) {
        setStatusMsg('Número de cartão inválido.');
        return;
      }
      if (!validade.includes('/')) {
        setStatusMsg('Validade inválida (use MM/AA).');
        return;
      }
      detalhes = {
        numero: `**** **** **** ${numero.replace(/\s/g, '').slice(-4)}`,
        nome,
        validade,
        bandeira
      };
    } else {
      if (!pixChave) {
        setStatusMsg('Digite a chave Pix.');
        return;
      }
      detalhes = {
        chave: pixChave
      };
    }

    api.pagamentos.adicionarMetodo({ tipo, detalhes })
      .then(() => {
        setStatusMsg('Método de pagamento adicionado!');
        // Reset forms
        setNumero('');
        setNome('');
        setValidade('');
        setCvv('');
        setPixChave('');
        carregarMetodos();
      })
      .catch((err: any) => {
        setStatusMsg(err.message || 'Erro ao adicionar método.');
      });
  };

  const handleRemover = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Excluir este método de pagamento?')) return;
    api.pagamentos.removerMetodo(id)
      .then(() => {
        carregarMetodos();
      })
      .catch(() => {});
  };

  const handleDefinirPadrao = (id: string) => {
    api.pagamentos.definirPadrao(id)
      .then(() => {
        carregarMetodos();
      })
      .catch(() => {});
  };

  const handleSimularCompra = () => {
    if (metodos.length === 0) {
      alert('Por favor, adicione um método de pagamento antes de simular a compra.');
      return;
    }
    window.location.href = 'https://app.abacatepay.com/pay/bill_65uEcCLeccMgHWGShzzz5C0m';
  };

  // Formatting helpers
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];

    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4));
    }

    return parts.join(' ');
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Métodos de Pagamento</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 40 }}>Gerencie seus cartões e realize pagamentos de planos ou chamados.</p>

      {statusMsg && (
        <div style={{
          background: statusMsg.includes('adicionado') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: statusMsg.includes('adicionado') ? '#10b981' : '#ef4444',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 24,
          fontSize: 14,
          fontWeight: 600,
          border: statusMsg.includes('adicionado') ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)'
        }}>
          {statusMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        {/* Left Side: Saved Methods */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Métodos Salvos</h2>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Buscando formas de pagamento...</p>
          ) : metodos.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {metodos.map(m => {
                const isCard = m.tipo === 'CARTAO';
                const bgGradient = m.padrao 
                  ? 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)' 
                  : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)';
                const borderColor = m.padrao ? 'var(--primary)' : 'var(--border)';

                return (
                  <div 
                    key={m.id} 
                    onClick={() => handleDefinirPadrao(m.id)}
                    style={{
                      background: bgGradient,
                      border: `2px solid ${borderColor}`,
                      borderRadius: 16,
                      padding: 24,
                      position: 'relative',
                      cursor: 'pointer',
                      boxShadow: m.padrao ? '0 10px 25px rgba(14,165,233,0.2)' : 'var(--shadow)',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: 180,
                      color: 'white'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 }}>
                          {isCard ? `Cartão ${m.detalhes.bandeira}` : 'PIX'}
                        </span>
                        {m.padrao && (
                          <span style={{ marginLeft: 8, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700 }}>
                            Padrão
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => handleRemover(m.id, e)}
                        style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 16 }}
                        title="Remover método"
                      >
                        🗑️
                      </button>
                    </div>

                    <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: 2, fontFamily: 'monospace', margin: '20px 0' }}>
                      {isCard ? m.detalhes.numero : m.detalhes.chave}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
                      <div>
                        <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>Titular</div>
                        <div>{isCard ? m.detalhes.nome : 'Chave Pix'}</div>
                      </div>
                      {isCard && (
                        <div>
                          <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>Validade</div>
                          <div>{m.detalhes.validade}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 40, borderStyle: 'dashed' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
              <p style={{ color: 'var(--text-muted)' }}>Você ainda não cadastrou nenhum método de pagamento.</p>
            </div>
          )}

          {/* Checkout Section */}
          {metodos.length > 0 && (
            <div className="card" style={{ marginTop: 32, background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                🥑 Pagar com AbacatePay
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Contrate o <strong>Plano TechHelp Pro</strong> através da plataforma integrada do AbacatePay.
              </p>
              <button onClick={handleSimularCompra} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#10b981' }}>
                🥑 Pagar no AbacatePay (R$ 49,90)
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Add New Method Form */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Adicionar Método</h2>
          <div className="card" style={{ padding: 32 }}>
            <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 8, padding: 4, marginBottom: 24 }}>
              <button 
                type="button"
                onClick={() => setTipo('CARTAO')}
                style={{
                  flex: 1, padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  background: tipo === 'CARTAO' ? 'var(--bg-card)' : 'transparent',
                  color: tipo === 'CARTAO' ? 'var(--text)' : 'var(--text-muted)'
                }}
              >
                💳 Cartão de Crédito
              </button>
              <button 
                type="button"
                onClick={() => setTipo('PIX')}
                style={{
                  flex: 1, padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  background: tipo === 'PIX' ? 'var(--bg-card)' : 'transparent',
                  color: tipo === 'PIX' ? 'var(--text)' : 'var(--text-muted)'
                }}
              >
                📱 Pix
              </button>
            </div>

            <form onSubmit={handleAddMetodo} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {tipo === 'CARTAO' ? (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Bandeira</label>
                    <select value={bandeira} onChange={(e) => setBandeira(e.target.value)}>
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Elo">Elo</option>
                      <option value="American Express">American Express</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Nome no Cartão</label>
                    <input 
                      type="text" 
                      placeholder="Ex: JOÃO DA SILVA" 
                      value={nome}
                      onChange={(e) => setNome(e.target.value.toUpperCase())}
                      required 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Número do Cartão</label>
                    <input 
                      type="text" 
                      maxLength={19}
                      placeholder="0000 0000 0000 0000" 
                      value={numero}
                      onChange={(e) => setNumero(formatCardNumber(e.target.value))}
                      required 
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Validade</label>
                      <input 
                        type="text" 
                        maxLength={5}
                        placeholder="MM/AA" 
                        value={validade}
                        onChange={(e) => setValidade(formatExpiry(e.target.value))}
                        required 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>CVV</label>
                      <input 
                        type="password" 
                        maxLength={4}
                        placeholder="123" 
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                        required 
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Chave Pix (CPF, E-mail ou Telefone)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: pix@techhelp.com.br" 
                    value={pixChave}
                    onChange={(e) => setPixChave(e.target.value)}
                    required 
                  />
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ marginTop: 12 }}>
                Salvar Método de Pagamento
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const SucessoPagamento: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
      <div className="card" style={{ padding: 48, boxShadow: '0 20px 50px rgba(16,185,129,0.15)', borderColor: 'var(--success)' }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🎉</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--success)', marginBottom: 16 }}>
          Obrigado pela sua compra!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          Seu pagamento foi processado com sucesso. O plano TechHelp Pro já está ativo na sua conta! Agora você tem prioridade máxima no atendimento e acesso aos técnicos mais bem avaliados do mercado.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={() => navigate('/cliente')} className="btn-primary">
            Ir para o Dashboard
          </button>
          <button onClick={() => navigate('/cliente/abrir-chamado')} className="btn-ghost" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
            Abrir um Chamado com Prioridade
          </button>
        </div>
      </div>
    </div>
  );
};

export default PainelCliente;
