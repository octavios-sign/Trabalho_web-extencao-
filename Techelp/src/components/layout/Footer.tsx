import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{ textAlign: 'center', marginTop: 'auto' }}>
      <p>&copy; {new Date().getFullYear()} Portal de Notícias Institucional - Todos os direitos reservados.</p>
    </footer>
  );
};

export default Footer;
