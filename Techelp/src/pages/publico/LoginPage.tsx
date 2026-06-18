import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { api } from '../../services/api';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await api.auth.login(email, senha);
      
      // Redirect based on profile
      if (user.perfil === 'SUPERADMIN') {
        navigate('/admin');
      } else if (user.perfil === 'EDITOR') {
        navigate('/editor');
      } else if (user.perfil === 'AUTOR') {
        navigate('/autor');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Keep quick simulated logins for convenience, but make them call the real backend!
  const handleQuickLogin = async (emailSimulado: string) => {
    setError(null);
    setLoading(true);
    try {
      const user = await api.auth.login(emailSimulado, '123456');
      if (user.perfil === 'SUPERADMIN') navigate('/admin');
      else if (user.perfil === 'EDITOR') navigate('/editor');
      else if (user.perfil === 'AUTOR') navigate('/autor');
      else navigate('/');
    } catch (err: any) {
      setError(`Erro no Acesso Rápido: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-full">
      <Header />
      <main className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
        
        <h2 style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'normal' }}>Acesse sua Conta</h2>

        {error && (
          <div style={{
            width: '100%',
            maxWidth: '350px',
            background: '#ffe3e3',
            color: 'var(--primary-red, #ff6b6b)',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px',
            textAlign: 'center',
            fontSize: '14px',
            border: '1px solid #ffd0d0'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '350px' }}>
          <input 
            type="email" 
            placeholder="Seu e-mail:" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            disabled={loading}
          />
          <input 
            type="password" 
            placeholder="Sua senha:" 
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required 
            disabled={loading}
          />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: 'auto', padding: '10px 40px' }}
              disabled={loading}
            >
              {loading ? 'CARREGANDO...' : 'ENTRAR'}
            </button>
          </div>
        </form>

        <div style={{ width: '100%', maxWidth: '350px', display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
          <a href="#" className="link" onClick={(e) => { e.preventDefault(); alert('Em ambiente de teste, utilize as credenciais padrão: leitor@teste.com / 123456'); }}>Esqueceu a senha?</a>
        </div>

        <div style={{ width: '100%', maxWidth: '350px', textAlign: 'center', marginTop: '30px' }}>
          <p>Não tem uma conta? <Link to="/register" className="link">Registrar</Link></p>
        </div>

        {/* Acesso Rápido - Figma exibe botões verdes */}
        <div style={{ width: '100%', maxWidth: '350px', marginTop: '40px' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '15px', fontWeight: 'normal' }}>Acesso Rápido</h3>
          <button className="btn-quick" disabled={loading} onClick={() => handleQuickLogin('leitor@teste.com')}>LEITOR (João)</button>
          <button className="btn-quick" disabled={loading} onClick={() => handleQuickLogin('autor@teste.com')}>AUTOR (Maria)</button>
          <button className="btn-quick" disabled={loading} onClick={() => handleQuickLogin('editor@teste.com')}>EDITOR (Carlos)</button>
          <button className="btn-quick" disabled={loading} onClick={() => handleQuickLogin('admin@teste.com')}>ADMINISTRADOR (Ana)</button>
        </div>
        
      </main>
    </div>
  );
};

export default LoginPage;
