import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getLoggedUser } from '../../services/api';
import type { Tecnico } from '../../types';

const HomePage: React.FC = () => {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const loggedUser = getLoggedUser();

  useEffect(() => {
    api.tecnicos?.list?.().then(setTecnicos).catch(() => {});
  }, []);

  const categorias = [
    { id: 'redes', nome: 'Redes', icone: '🌐', descricao: 'Configuração e troubleshooting de redes' },
    { id: 'seguranca', nome: 'Segurança', icone: '🔒', descricao: 'Segurança, antivírus e proteção' },
    { id: 'hardware', nome: 'Hardware', icone: '💻', descricao: 'Problemas com computadores e periféricos' },
    { id: 'software', nome: 'Software', icone: '⚙️', descricao: 'Instalação e suporte de aplicativos' },
    { id: 'backup', nome: 'Backup', icone: '💾', descricao: 'Backup e recuperação de dados' },
    { id: 'impressoras', nome: 'Impressoras', icone: '🖨️', descricao: 'Instalação e configuração de impressoras' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header>
        <Link to="/" className="logo">
          <span className="logo-icon">🛡️</span>
          <span className="logo-text-tech">Tech</span><span className="logo-text-help">Help</span>
        </Link>
        <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {loggedUser ? (
            <>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Olá, {loggedUser.nome.split(' ')[0]}</span>
              <Link to={`/${loggedUser.perfil.toLowerCase()}`} className="btn-primary" style={{ width: 'auto', padding: '8px 20px', fontSize: 14 }}>
                Meu Painel
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Entrar</Link>
              <Link to="/register" className="btn-primary" style={{ width: 'auto', padding: '8px 20px', fontSize: 14 }}>Cadastrar</Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section style={{ padding: '80px 24px', textAlign: 'center', background: 'linear-gradient(180deg, rgba(14,165,233,0.08) 0%, transparent 100%)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 24, border: '1px solid rgba(14,165,233,0.3)' }}>
            ⚡ Suporte Técnico Sob Demanda
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            Problemas de TI?<br />
            <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Conecte com um técnico
            </span>
            {' '}em segundos
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 40, maxWidth: 520, margin: '0 auto 40px' }}>
            Escolha entre centenas de técnicos especializados. Avaliados por clientes. Disponível 24/7.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={loggedUser?.perfil === 'CLIENTE' ? '/cliente/abrir-chamado' : '/register'} className="btn-primary" style={{ width: 'auto', padding: '14px 36px', fontSize: 16 }}>
              {loggedUser?.perfil === 'CLIENTE' ? '🎫 Abrir Chamado' : '🚀 Começar Agora'}
            </Link>
            <Link to="/login" className="btn-ghost" style={{ padding: '14px 36px', fontSize: 16 }}>
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 24px 64px', maxWidth: 900, margin: '0 auto' }}>
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          {[['⚡','< 2 min','Tempo médio de resposta'],['✅','98%','Chamados resolvidos'],['🏆','500+','Técnicos verificados']].map(([icon, val, label]) => (
            <div key={label} className="card" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', marginBottom: 4 }}>{val}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categorias */}
      <section style={{ padding: '0 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Áreas de Especialidade</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 40 }}>Encontre um técnico especializado na sua área</p>
        <div className="grid-cards">
          {categorias.map(cat => (
            <Link to={loggedUser?.perfil === 'CLIENTE' ? `/cliente/tecnicos?categoria=${cat.id}` : '/register'} key={cat.id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{cat.icone}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{cat.nome}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>{cat.descricao}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Técnicos em destaque */}
      {tecnicos.length > 0 && (
        <section style={{ padding: '0 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Técnicos Disponíveis</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 40 }}>Melhor avaliados e prontos para atender</p>
          <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {tecnicos.slice(0, 6).map(tech => (
              <Link to={loggedUser?.perfil === 'CLIENTE' ? `/cliente/tecnico/${tech.id}` : '/register'} key={tech.id} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: 48, marginBottom: 12, textAlign: 'center' }}>👨‍💻</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{tech.usuario?.nome}</h3>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 12, alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>⭐ {tech.ratingMedio.toFixed(1)}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({tech.totalAvaliacoes})</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 }}>
                    {tech.especialidades?.join(', ')}
                  </p>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                    {tech.experienciaAnos} anos de experiência
                  </div>
                  <div style={{ 
                    display: 'inline-block', 
                    background: tech.disponivel ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
                    color: tech.disponivel ? '#22c55e' : 'var(--text-muted)',
                    padding: '4px 12px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {tech.disponivel ? '🟢 Disponível' : '⚪ Offline'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section style={{ padding: '64px 24px', background: 'rgba(30,41,59,0.5)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 48 }}>Como funciona?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
            {[
              ['1', '📝', 'Descreva seu problema', 'Abra um chamado detalhando o que precisa'],
              ['2', '👨‍💻', 'Escolha um técnico', 'Veja avaliações e experiência antes de escolher'],
              ['3', '✅', 'Problema resolvido', 'Acompanhe em tempo real via chat até a solução'],
            ].map(([n, icon, title, desc]) => (
              <div key={n} style={{ padding: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-glow)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>{n}</div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Pronto para começar?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 16 }}>Crie sua conta gratuitamente. Para cliente ou técnico.</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register?role=cliente" className="btn-primary" style={{ width: 'auto', padding: '16px 48px', fontSize: 17, display: 'inline-block' }}>
            Sou Cliente →
          </Link>
          <Link to="/register?role=tecnico" className="btn-primary" style={{ width: 'auto', padding: '16px 48px', fontSize: 17, display: 'inline-block' }}>
            Sou Técnico →
          </Link>
        </div>
      </section>

      <footer>© 2026 TechHelp · Suporte Técnico Sob Demanda</footer>
    </div>
  );
};

export default HomePage;
