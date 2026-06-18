import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1 style={{ fontSize: '72px', color: 'var(--primary-red)' }}>404</h1>
      <h2>Página não encontrada</h2>
      <p style={{ margin: '20px 0' }}>A página que você está procurando não existe ou foi removida.</p>
      <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto' }}>
        Voltar para a Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
