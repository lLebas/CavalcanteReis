import React, { useState } from 'react';
import Login from './Login';
import Home from './Home';
import ProposalGenerator from './ProposalGenerator';
import { ArrowLeft, LogOut } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleLogin = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsAuthenticated(true);
      setCurrentPage('home');
      setIsTransitioning(false);
    }, 400);
  };

  const handleLogout = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsAuthenticated(false);
      setCurrentPage('login');
      setIsTransitioning(false);
    }, 400);
  };

  const handleNavigate = (page) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsTransitioning(false);
    }, 400);
  };

  const handleBackToHome = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage('home');
      setIsTransitioning(false);
    }, 400);
  };

  if (!isAuthenticated) {
    return (
      <>
        {isTransitioning && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #227056 0%, #1a5642 100%)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <div style={{
              textAlign: 'center',
              color: 'white',
              position: 'relative'
            }}>
              {/* Logo Animado */}
              <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 30px',
                position: 'relative',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                {/* Círculo externo girando */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  borderTopColor: 'white',
                  borderRightColor: 'white',
                  animation: 'spin 2s linear infinite'
                }}></div>

                {/* Círculo do meio girando na direção oposta */}
                <div style={{
                  position: 'absolute',
                  width: '85%',
                  height: '85%',
                  top: '7.5%',
                  left: '7.5%',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  borderBottomColor: 'white',
                  borderLeftColor: 'white',
                  animation: 'spinReverse 1.5s linear infinite'
                }}></div>

                {/* Ícone central - Balança da Justiça */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '48px',
                  animation: 'float 3s ease-in-out infinite'
                }}>⚖️</div>
              </div>

              {/* Texto com efeito de digitação */}
              <p style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '10px',
                letterSpacing: '1px',
                fontFamily: "'EB Garamond', serif"
              }}>Carregando</p>

              {/* Pontos animados */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '15px'
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out',
                  animationDelay: '0s'
                }}></div>
                <div style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out',
                  animationDelay: '0.2s'
                }}></div>
                <div style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out',
                  animationDelay: '0.4s'
                }}></div>
              </div>
            </div>
          </div>
        )}
        <div style={{
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.3s ease-in-out'
        }}>
          <Login onLogin={handleLogin} />
        </div>
      </>
    );
  }

  if (currentPage === 'home') {
    return (
      <>
        {isTransitioning && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #227056 0%, #1a5642 100%)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <div style={{
              textAlign: 'center',
              color: 'white',
              position: 'relative'
            }}>
              {/* Logo Animado */}
              <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 30px',
                position: 'relative',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                {/* Círculo externo girando */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  borderTopColor: 'white',
                  borderRightColor: 'white',
                  animation: 'spin 2s linear infinite'
                }}></div>

                {/* Círculo do meio girando na direção oposta */}
                <div style={{
                  position: 'absolute',
                  width: '85%',
                  height: '85%',
                  top: '7.5%',
                  left: '7.5%',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  borderBottomColor: 'white',
                  borderLeftColor: 'white',
                  animation: 'spinReverse 1.5s linear infinite'
                }}></div>

                {/* Ícone central - Balança da Justiça */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '48px',
                  animation: 'float 3s ease-in-out infinite'
                }}>⚖️</div>
              </div>

              {/* Texto com efeito de digitação */}
              <p style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '10px',
                letterSpacing: '1px',
                fontFamily: "'EB Garamond', serif"
              }}>Carregando</p>

              {/* Pontos animados */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '15px'
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out',
                  animationDelay: '0s'
                }}></div>
                <div style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out',
                  animationDelay: '0.2s'
                }}></div>
                <div style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out',
                  animationDelay: '0.4s'
                }}></div>
              </div>
            </div>
          </div>
        )}
        <div style={{
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.3s ease-in-out'
        }}>
          <Home onNavigate={handleNavigate} onLogout={handleLogout} />
        </div>
      </>
    );
  }

  if (currentPage === 'gerador-propostas') {
    return (
      <>
        {isTransitioning && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #227056 0%, #1a5642 100%)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <div style={{
              textAlign: 'center',
              color: 'white',
              position: 'relative'
            }}>
              {/* Logo Animado */}
              <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 30px',
                position: 'relative',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                {/* Círculo externo girando */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  borderTopColor: 'white',
                  borderRightColor: 'white',
                  animation: 'spin 2s linear infinite'
                }}></div>

                {/* Círculo do meio girando na direção oposta */}
                <div style={{
                  position: 'absolute',
                  width: '85%',
                  height: '85%',
                  top: '7.5%',
                  left: '7.5%',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  borderBottomColor: 'white',
                  borderLeftColor: 'white',
                  animation: 'spinReverse 1.5s linear infinite'
                }}></div>

                {/* Ícone central - Balança da Justiça */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '48px',
                  animation: 'float 3s ease-in-out infinite'
                }}>⚖️</div>
              </div>

              {/* Texto com efeito de digitação */}
              <p style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '10px',
                letterSpacing: '1px',
                fontFamily: "'EB Garamond', serif"
              }}>Carregando</p>

              {/* Pontos animados */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '15px'
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out',
                  animationDelay: '0s'
                }}></div>
                <div style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out',
                  animationDelay: '0.2s'
                }}></div>
                <div style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out',
                  animationDelay: '0.4s'
                }}></div>
              </div>
            </div>
          </div>
        )}
        <div style={{
          position: 'relative',
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.3s ease-in-out'
        }}>
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

            {/* Botão de Logout na barra superior */}
            <button
              onClick={handleLogout}
              style={{
                position: 'absolute',
                right: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#227056',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
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
              <LogOut size={20} />
            </button>
          </div>

          <div style={{ paddingTop: '80px' }}>
            <ProposalGenerator />
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          @keyframes spinReverse {
            0% {
              transform: rotate(360deg);
            }
            100% {
              transform: rotate(0deg);
            }
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.9;
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translate(-50%, -50%) translateY(0px);
            }
            50% {
              transform: translate(-50%, -50%) translateY(-10px);
            }
          }

          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
              opacity: 0.5;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </>
    );
  }

  return <Home onNavigate={handleNavigate} onLogout={handleLogout} />;
}

export default App;
