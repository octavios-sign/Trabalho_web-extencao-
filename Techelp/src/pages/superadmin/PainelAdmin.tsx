import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { api, getLoggedUser } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const PainelAdmin: React.FC = () => {
  const navigate = useNavigate();
  const loggedUser = getLoggedUser();

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [ufs, setUfs] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingUfs, setLoadingUfs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State for User
  const [userId, setUserId] = useState<string | null>(null);
  const [userNome, setUserNome] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userSenha, setUserSenha] = useState('');
  const [userTelefone, setUserTelefone] = useState('');
  const [userPerfil, setUserPerfil] = useState('CLIENTE');
  const [showUserForm, setShowUserForm] = useState(false);

  // Form State for UF
  const [ufSigla, setUfSigla] = useState('');
  const [ufNome, setUfNome] = useState('');

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await api.admin.usuarios.list();
      setUsuarios(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar usuários.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUfs = async () => {
    try {
      setLoadingUfs(true);
      const data = await api.ufs.list();
      setUfs(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar UFs.');
    } finally {
      setLoadingUfs(false);
    }
  };

  useEffect(() => {
    if (!loggedUser || loggedUser.perfil !== 'SUPERADMIN') {
      navigate('/login');
      return;
    }
    fetchUsers();
    fetchUfs();
  }, []);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNome.trim() || !userEmail.trim()) {
      alert('Nome e E-mail são obrigatórios!');
      return;
    }

    try {
      if (userId) {
        // Edit existing
        await api.admin.usuarios.update(userId, {
          nome: userNome.trim(),
          email: userEmail.trim(),
          telefone: userTelefone.trim() || undefined,
          perfil: userPerfil,
          ...(userSenha ? { senha: userSenha } : {})
        });
        alert('Usuário atualizado com sucesso no banco SQL!');
      } else {
        // Create new
        if (!userSenha) {
          alert('Senha é obrigatória para criar novo usuário!');
          return;
        }
        await api.admin.usuarios.create({
          nome: userNome.trim(),
          email: userEmail.trim(),
          senha: userSenha,
          telefone: userTelefone.trim() || undefined,
          perfil: userPerfil
        });
        alert('Usuário cadastrado com sucesso no banco SQL!');
      }

      // Reset
      setUserId(null);
      setUserNome('');
      setUserEmail('');
      setUserSenha('');
      setUserTelefone('');
      setUserPerfil('CLIENTE');
      setShowUserForm(false);
      
      fetchUsers();
    } catch (err: any) {
      alert(`Erro ao salvar usuário: ${err.message}`);
    }
  };

  const handleEditUserClick = (u: any) => {
    setUserId(u.id);
    setUserNome(u.nome);
    setUserEmail(u.email);
    setUserTelefone(u.telefone || '');
    setUserPerfil(u.perfil);
    setUserSenha(''); // Leave empty unless changing
    setShowUserForm(true);
  };

  const handleDeleteUserClick = async (id: string) => {
    if (id === loggedUser.id) {
      alert('Você não pode excluir a sua própria conta logada.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja remover este usuário permanentemente?')) return;

    try {
      await api.admin.usuarios.delete(id);
      alert('Usuário excluído com sucesso do banco relacional!');
      fetchUsers();
    } catch (err: any) {
      alert(`Erro ao excluir usuário: ${err.message}`);
    }
  };

  const handleAddUf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ufSigla.trim() || !ufNome.trim()) {
      alert('Preencha a sigla e nome da UF!');
      return;
    }

    try {
      await api.ufs.create(ufSigla.trim(), ufNome.trim());
      alert('UF inserida com sucesso no banco SQL!');
      setUfSigla('');
      setUfNome('');
      fetchUfs();
    } catch (err: any) {
      alert(`Erro ao cadastrar UF: ${err.message}`);
    }
  };

  const handleDeleteUfClick = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta UF? Cidades dependentes podem ser excluídas.')) return;

    try {
      await api.ufs.delete(id);
      alert('UF excluída com sucesso!');
      fetchUfs();
    } catch (err: any) {
      alert(`Erro ao excluir UF: ${err.message}`);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    navigate('/');
  };

  return (
    <div className="layout-wrapper">
      <Sidebar perfil="Admin" />
      <main className="main-content">
        <div className="content-area">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Painel Super Admin - Olá, {loggedUser?.nome}!</h2>
            <button className="btn-primary" onClick={handleLogout} style={{ background: '#ff6b6b', width: 'auto', padding: '6px 15px' }}>Sair</button>
          </div>
          <p>Controle administrativo total do sistema (Usuários e Estados) integrado ao Banco SQL.</p>
          
          {error && (
            <div style={{ background: '#ffe3e3', color: 'var(--primary-red)', padding: '10px', borderRadius: '4px', margin: '15px 0' }}>
              {error}
            </div>
          )}

          {/* Seção CRUD de Usuários */}
          <div className="card" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>Gerenciar Usuários (CRUD)</h3>
              <button 
                className="btn-primary" 
                style={{ width: 'auto', padding: '6px 15px' }}
                onClick={() => {
                  setUserId(null);
                  setUserNome('');
                  setUserEmail('');
                  setUserSenha('');
                  setUserTelefone('');
                  setUserPerfil('CLIENTE');
                  setShowUserForm(!showUserForm);
                }}
              >
                {showUserForm ? 'Ocultar Formulário' : 'Adicionar Usuário'}
              </button>
            </div>

            {showUserForm && (
              <form onSubmit={handleSaveUser} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #ddd' }}>
                <h4>{userId ? 'Editar Usuário' : 'Novo Usuário'}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                  <div>
                    <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>Nome:</label>
                    <input type="text" placeholder="Nome Completo" value={userNome} onChange={(e) => setUserNome(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>E-mail:</label>
                    <input type="email" placeholder="e-mail" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>Senha {userId && '(Deixe em branco para não alterar)'}:</label>
                    <input type="password" placeholder="Senha" value={userSenha} onChange={(e) => setUserSenha(e.target.value)} required={!userId} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>Telefone:</label>
                    <input type="text" placeholder="Telefone" value={userTelefone} onChange={(e) => setUserTelefone(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>Perfil de Acesso:</label>
                    <select 
                      value={userPerfil} 
                      onChange={(e) => setUserPerfil(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px', background: 'var(--bg-input)', color: 'var(--text)' }}
                    >
                      <option value="CLIENTE">CLIENTE</option>
                      <option value="TECNICO">TECNICO</option>
                      <option value="SUPERVISOR">SUPERVISOR</option>
                      <option value="SUPERADMIN">SUPERADMIN</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Salvar Usuário</button>
                  <button type="button" className="btn-primary" style={{ width: 'auto', background: '#ccc', color: '#333' }} onClick={() => setShowUserForm(false)}>Cancelar</button>
                </div>
              </form>
            )}

            {loadingUsers ? <p>Carregando usuários do SQL...</p> : (
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Telefone</th>
                    <th>Perfil</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id}>
                      <td><strong>{u.nome}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.telefone || '-'}</td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          color: u.perfil === 'SUPERADMIN' ? '#ef4444' : u.perfil === 'SUPERVISOR' ? '#f59e0b' : u.perfil === 'TECNICO' ? '#10b981' : '#0ea5e9',
                          background: u.perfil === 'SUPERADMIN' ? 'rgba(239,68,68,0.1)' : u.perfil === 'SUPERVISOR' ? 'rgba(245,158,11,0.1)' : u.perfil === 'TECNICO' ? 'rgba(16,185,129,0.1)' : 'rgba(14,165,233,0.1)'
                        }}>
                          {u.perfil}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleEditUserClick(u)} style={{ padding: '5px 10px', cursor: 'pointer', background: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', marginRight: '5px' }}>Editar</button>
                        <button onClick={() => handleDeleteUserClick(u.id)} style={{ padding: '5px 10px', cursor: 'pointer', background: 'var(--primary-red)', color: 'white', border: 'none', borderRadius: '4px' }}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Seção CRUD de UFs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
            
            <div className="card">
              <h3>Cadastrar Nova UF</h3>
              <form onSubmit={handleAddUf} style={{ marginTop: '15px' }}>
                <input 
                  type="text" 
                  placeholder="Sigla (Ex: RJ)" 
                  maxLength={2} 
                  value={ufSigla}
                  onChange={(e) => setUfSigla(e.target.value)}
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Nome Completo (Ex: Rio de Janeiro)" 
                  value={ufNome}
                  onChange={(e) => setUfNome(e.target.value)}
                  required 
                />
                <button type="submit" className="btn-primary" style={{ marginTop: '10px', width: 'auto' }}>Inserir UF no Banco</button>
              </form>
            </div>

            <div className="card">
              <h3>Gerenciar UFs no SQL</h3>
              {loadingUfs ? <p>Buscando UFs...</p> : (
                <table style={{ marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <th>Sigla</th>
                      <th>Nome do Estado</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ufs.map(uf => (
                      <tr key={uf.id}>
                        <td><strong>{uf.sigla}</strong></td>
                        <td>{uf.nome}</td>
                        <td>
                          <button 
                            onClick={() => handleDeleteUfClick(uf.id)}
                            style={{ padding: '5px 10px', cursor: 'pointer', background: 'var(--primary-red)', color: 'white', border: 'none', borderRadius: '4px' }}
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default PainelAdmin;
