import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { api } from '../../services/api';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      await api.auth.register({
        nome,
        email,
        senha,
        telefone: telefone || undefined
      });

      setSuccess('Cadastro realizado com sucesso! Redirecionando para login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-full">
      <Header />
      <main className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
        
        <h2 style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'normal' }}>Crie sua conta</h2>

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

        {success && (
          <div style={{
            width: '100%',
            maxWidth: '350px',
            background: '#e3ffe3',
            color: '#2b8a3e',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px',
            textAlign: 'center',
            fontSize: '14px',
            border: '1px solid #d0ffd0'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ width: '100%', maxWidth: '350px' }}>
          <input 
            type="text" 
            placeholder="Seu nome" 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required 
            disabled={loading}
          />
          <input 
            type="email" 
            placeholder="Seu e-mail" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            disabled={loading}
          />
          <input 
            type="password" 
            placeholder="Crie uma senha" 
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required 
            disabled={loading}
          />
          <input 
            type="password" 
            placeholder="Confirme uma senha" 
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required 
            disabled={loading}
          />
          <input 
            type="tel" 
            placeholder="Telefone (Opcional)" 
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            disabled={loading}
          />
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: 'auto', padding: '10px 40px' }}
              disabled={loading}
            >
              {loading ? 'REGISTRANDO...' : 'Registrar'}
            </button>
          </div>
        </form>

        <div style={{ width: '100%', maxWidth: '350px', textAlign: 'center', marginTop: '30px' }}>
          <p>Já tem uma conta? <Link to="/login" className="link">Fazer Login</Link></p>
        </div>

      </main>
    </div>
  );
};

export default RegisterPage;
