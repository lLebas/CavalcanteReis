import React from 'react';
import { FileText, Box, Settings, Users } from 'lucide-react';

function Home({ onNavigate }) {
  const cards = [
    {
      id: 'gerador-propostas',
      title: 'Gerador de Propostas',
      description: 'Crie propostas personalizadas para seus clientes',
      icon: FileText,
      color: '#227056',
      action: () => onNavigate('gerador-propostas')
    },
    {
      id: 'exemplo-2',
      title: 'Exemplo 2',
      description: 'Funcionalidade em desenvolvimento',
      icon: Box,
      color: '#3498db',
      action: () => alert('Em breve!')
    },
    {
      id: 'exemplo-3',
      title: 'Exemplo 3',
      description: 'Funcionalidade em desenvolvimento',
      icon: Settings,
      color: '#e74c3c',
      action: () => alert('Em breve!')
    },
    {
      id: 'exemplo-4',
      title: 'Exemplo 4',
      description: 'Funcionalidade em desenvolvimento',
      icon: Users,
      color: '#f39c12',
      action: () => alert('Em breve!')
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: "'EB Garamond', serif"
    }}>
      {/* Header */}
      <header style={{
        background: 'white',
        padding: '20px 40px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
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
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            background: '#227056',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Sair
        </button>
      </header>

      {/* Main Content */}
      <main style={{
        padding: '60px 40px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', color: '#333', margin: '0 0 12px' }}>
            Bem-vindo ao Sistema
          </h2>
          <p style={{ fontSize: '18px', color: '#666', margin: '0' }}>
            Escolha uma opção abaixo para começar
          </p>
        </div>

        {/* Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '32px',
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
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
                  minHeight: '220px'
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
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <Icon size={40} color="white" />
                </div>
                <h3 style={{
                  fontSize: '24px',
                  color: '#333',
                  margin: '0 0 12px',
                  fontWeight: '600'
                }}>
                  {card.title}
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#666',
                  margin: '0',
                  lineHeight: '1.5'
                }}>
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      <style>{`
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
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
