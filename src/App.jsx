import React, { useState } from 'react';
import Login from './Login';
import Home from './Home';
import ProposalGenerator from './ProposalGenerator';
import { ArrowLeft, LogOut } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentPage === 'home') {
    return <Home onNavigate={handleNavigate} onLogout={handleLogout} />;
  }

  if (currentPage === 'gerador-propostas') {
    return (
      <div style={{ position: 'relative' }}>
        {/* Botão de Logout Global */}
        <button
          onClick={handleLogout}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#227056',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1a5642';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#227056';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Sair"
        >
          <LogOut size={22} />
        </button>

        {/* Header com botão Voltar e Título Centralizado */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleBackToHome}
            style={{
              position: 'absolute',
              left: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#227056',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1a5642';
              e.currentTarget.style.transform = 'translateX(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#227056';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <ArrowLeft size={18} />
            Voltar para Home
          </button>

          <h1 style={{
            margin: 0,
            fontSize: '24px',
            color: '#227056',
            fontWeight: '600',
            fontFamily: "'EB Garamond', serif"
          }}>
            Gerador de Propostas
          </h1>
        </div>

        <div style={{ paddingTop: '80px' }}>
          <ProposalGenerator />
        </div>
      </div>
    );
  }

  return <Home onNavigate={handleNavigate} onLogout={handleLogout} />;
}

export default App;
