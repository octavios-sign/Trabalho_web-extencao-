import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="logo">
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg className="logo-icon" viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <h1 style={{ marginLeft: '10px', fontSize: '32px' }}>
          <span className="logo-text-tech">Tech</span><span className="logo-text-help">Help</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;
