'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Box, Save, Users, LogOut, Sparkles, X, FileCheck, Scale } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Home({ onNavigate, onLogout }: HomeProps) {
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  useEffect(() => {
    document.title = 'Home - Sistema Cavalcante Reis';
  }, []);

  const cards = [
    {
      id: 'dashboard',
      title: '📊 Dashboard de Documentos',
      description: 'Visualize e gerencie todos os documentos salvos',
      icon: Save,
      color: '#e74c3c',
      action: () => window.location.href = '/dashboard',
    },
    {
      id: 'gerador-propostas',
      title: 'Gerador de Propostas',
      description: 'Crie propostas personalizadas para seus clientes',
      icon: FileText,
      color: '#227056',
      action: () => onNavigate('gerador-propostas'),
    },
    {
      id: 'gerador-minuta',
      title: 'Minuta de Contrato',
      description: 'Documento principal com ementa e qualificação editável',
      icon: FileText,
      color: '#1e3a5f',
      action: () => onNavigate('gerador-minuta'),
    },
    {
      id: 'estudo-contratacao',
      title: 'Estudo de Contratação',
      description: 'Planejamento e justificativa de viabilidade técnica',
      icon: FileCheck,
      color: '#3498db',
      action: () => onNavigate('estudo-contratacao'),
    },
    {
      id: 'termo-referencia',
      title: 'Termo de Referência',
      description: 'Especificação do objeto e fundamentação (Lei 14.133)',
      icon: Box,
      color: '#f39c12',
      action: () => onNavigate('termo-referencia'),
    },
    {
      id: 'parecer-juridico',
      title: 'Parecer Jurídico',
      description: 'Análise legal e conclusão pela inexigibilidade',
      icon: Scale,
      color: '#9b59b6',
      action: () => onNavigate('parecer-juridico'),
    },
    {
      id: 'propostas-salvas',
      title: 'Propostas Salvas',
      description: 'Visualize e gerencie suas propostas salvas',
      icon: Save,
      color: '#2ecc71',
      action: () => onNavigate('propostas-salvas'),
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        fontFamily: "'EB Garamond', serif",
      }}
    >
      {/* Modal "Em Breve" */}
      {showComingSoonModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '450px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              position: 'relative',
              animation: 'slideUp 0.4s ease',
              textAlign: 'center',
            }}
          >
            <button
              onClick={() => setShowComingSoonModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#999',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#227056')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#999')}
            >
              <X size={24} />
            </button>

            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #227056 0%, #3498db 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                animation: 'pulse 2s ease infinite',
              }}
            >
              <Sparkles size={50} color="white" />
            </div>

            <h2
              style={{
                fontSize: '28px',
                color: '#227056',
                margin: '0 0 16px',
                fontWeight: '600',
              }}
            >
              Em Breve!
            </h2>

            <p
              style={{
                fontSize: '18px',
                color: '#666',
                lineHeight: '1.6',
                margin: '0 0 24px',
              }}
            >
              <strong style={{ color: '#227056' }}>Novas funções</strong> e{' '}
              <strong style={{ color: '#3498db' }}>geradores incríveis</strong> estão a caminho!
            </p>

            <p
              style={{
                fontSize: '16px',
                color: '#999',
                margin: '0 0 32px',
              }}
            >
              Fique atento às atualizações do sistema.
            </p>

            <button
              onClick={() => setShowComingSoonModal(false)}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #227056 0%, #1a5642 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(34, 112, 86, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 112, 86, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 112, 86, 0.3)';
              }}
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header
        style={{
          background: 'white',
          padding: '20px 40px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src="/logo-cavalcante-reis.png"
            alt="Cavalcante Reis Advogados"
            style={{ height: '50px', width: 'auto' }}
          />
          <div>
            <h1 style={{ margin: '0', fontSize: '24px', color: '#227056' }}>
              Cavalcante Reis Advogados
            </h1>
            <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
              Sistema de Gestão
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: '#227056',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1a5642';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#227056';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <LogOut size={18} />
          Sair
        </button>
      </header>

      {/* Main Content */}
      <main
        style={{
          padding: '60px 40px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', color: '#333', margin: '0 0 12px' }}>
            Bem-vindo ao Sistema
          </h2>
          <p style={{ fontSize: '18px', color: '#666', margin: '0' }}>
            Escolha uma opção abaixo para começar
          </p>
        </div>

        {/* Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '32px',
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '0 20px',
          }}
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={card.action}
                style={{
                  background: 'white',
                  padding: '40px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: `3px solid ${card.color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  minHeight: '220px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <Icon size={40} color="white" />
                </div>
                <h3
                  style={{
                    fontSize: '24px',
                    color: '#333',
                    margin: '0 0 12px',
                    fontWeight: '600',
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontSize: '16px',
                    color: '#666',
                    margin: '0',
                    lineHeight: '1.5',
                  }}
                >
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        @media (max-width: 768px) {
          main {
            padding: 40px 20px !important;
          }
          h2 {
            font-size: 28px !important;
          }
          p {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

