import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  perfil: string;
}

const Sidebar: React.FC<SidebarProps> = ({ perfil }) => {
  return (
    <div className="sidebar">
      <h3>Painel {perfil}</h3>
      <nav style={{ marginTop: '30px' }}>
        <Link to={`/${perfil.toLowerCase()}`}>Dashboard</Link>
        <Link to={`/${perfil.toLowerCase()}/noticias`}>Gerenciar Notícias</Link>
        {perfil === 'Admin' && (
          <>
            <Link to="/admin/usuarios">Usuários</Link>
            <Link to="/admin/ufs">UFs</Link>
            <Link to="/admin/cidades">Cidades</Link>
          </>
        )}
        <Link to="/" onClick={() => {
          localStorage.removeItem('techhelp_token');
          localStorage.removeItem('techhelp_user');
        }} style={{ marginTop: '40px', color: '#ff6b6b' }}>Sair</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
