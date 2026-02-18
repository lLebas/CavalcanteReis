'use client';

import { useState } from 'react';
import Login from '@/components/Login';
import Home from '@/components/Home';
import ProposalGenerator from '@/components/ProposalGenerator';
import SavedProposals from '@/components/SavedProposals';
import MinutaGenerator from '@/components/MinutaGenerator';
import EstudoContratacao from '@/components/EstudoContratacao';
import TermoReferencia from '@/components/TermoReferencia';
import ParecerJuridico from '@/components/ParecerJuridico';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [propostaToLoad, setPropostaToLoad] = useState<string | null>(null);
  const [minutaToLoad, setMinutaToLoad] = useState<string | null>(null);
  const [estudoToLoad, setEstudoToLoad] = useState<string | null>(null);
  const [termoToLoad, setTermoToLoad] = useState<string | null>(null);
  const [parecerToLoad, setParecerToLoad] = useState<string | null>(null);

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
        onLoadProposal={(id: string) => {
          setPropostaToLoad(id);
          handleNavigate('gerador-propostas');
        }}
        onLoadMinuta={(id: string) => {
          setMinutaToLoad(id);
          handleNavigate('gerador-minuta');
        }}
        onLoadEstudo={(id: string) => {
          setEstudoToLoad(id);
          handleNavigate('estudo-contratacao');
        }}
        onLoadTermo={(id: string) => {
          setTermoToLoad(id);
          handleNavigate('termo-referencia');
        }}
        onLoadParecer={(id: string) => {
          setParecerToLoad(id);
          handleNavigate('parecer-juridico');
        }}
      />
    );
  }

  if (currentPage === 'gerador-minuta') {
    return (
      <MinutaGenerator
        onBackToHome={() => {
          setMinutaToLoad(null);
          handleNavigate('home');
        }}
        onLogout={handleLogout}
        onSave={() => handleNavigate('propostas-salvas')}
      />
    );
  }

  if (currentPage === 'estudo-contratacao') {
    return (
      <EstudoContratacao
        onBack={() => {
          setEstudoToLoad(null);
          handleNavigate('home');
        }}
        onLogout={handleLogout}
        onSave={() => handleNavigate('propostas-salvas')}
        documentId={estudoToLoad}
      />
    );
  }

  if (currentPage === 'termo-referencia') {
    return (
      <TermoReferencia
        onBack={() => {
          setTermoToLoad(null);
          handleNavigate('home');
        }}
        onSave={() => handleNavigate('propostas-salvas')}
        documentId={termoToLoad}
      />
    );
  }

  if (currentPage === 'parecer-juridico') {
    return (
      <ParecerJuridico
        onBack={() => {
          setParecerToLoad(null);
          handleNavigate('home');
        }}
        onSave={() => handleNavigate('propostas-salvas')}
        documentId={parecerToLoad}
      />
    );
  }

  return <Home onNavigate={handleNavigate} onLogout={handleLogout} />;
}
