'use client';

import { useState } from 'react';
import Login from '@/components/Login';
import Home from '@/components/Home';
import ProposalGenerator from '@/components/ProposalGenerator';
import SavedProposals from '@/components/SavedProposals';
import MinutaGenerator from '@/components/MinutaGenerator';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [propostaToLoad, setPropostaToLoad] = useState<string | null>(null); // ID da proposta para carregar

  const handleLogin = () => {
    setIsNavigating(true);
    setTimeout(() => {
      setIsAuthenticated(true);
      setCurrentPage('home');
      setIsNavigating(false);
    }, 800);
  };

  const handleLogout = () => {
    setIsNavigating(true);
    setTimeout(() => {
      setIsAuthenticated(false);
      setCurrentPage('login');
      setIsNavigating(false);
    }, 600);
  };

  const handleNavigate = (page: string) => {
    setIsNavigating(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsNavigating(false);
    }, 800);
  };

  if (isNavigating) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p style={{ fontSize: '18px', fontWeight: '500' }}>Processando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentPage === 'home') {
    return <Home onNavigate={handleNavigate} onLogout={handleLogout} />;
  }

  if (currentPage === 'gerador-propostas') {
    return (
      <ProposalGenerator
        onBackToHome={() => {
          setPropostaToLoad(null);
          handleNavigate('home');
        }}
        onLogout={handleLogout}
        propostaToLoad={propostaToLoad}
      />
    );
  }

  if (currentPage === 'propostas-salvas') {
    return (
      <SavedProposals
        onBackToHome={() => handleNavigate('home')}
        onLogout={handleLogout}
        onLoadProposal={(propostaId: string) => {
          setPropostaToLoad(propostaId);
          handleNavigate('gerador-propostas');
        }}
      />
    );
  }

  if (currentPage === 'gerador-minuta') {
    return (
      <MinutaGenerator
        onBackToHome={() => handleNavigate('home')}
        onLogout={handleLogout}
      />
    );
  }

  return <Home onNavigate={handleNavigate} onLogout={handleLogout} />;
}

