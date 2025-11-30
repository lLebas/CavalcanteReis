import React, { useState, useEffect } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    document.title = 'Login - Sistema Cavalcante Reis';
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação de credenciais
    if (!email || !password) {
      setErrorMessage('Por favor, preencha email e senha');
      setShowError(true);
      return;
    }

    // Verificar se o email está correto
    if (email !== 'cavalcantereis@gmail.com') {
      setErrorMessage('Email incorreto. Verifique suas credenciais.');
      setShowError(true);
      return;
    }

    // Verificar se a senha está correta
    if (password !== 'Reisadvogados') {
      setErrorMessage('Senha incorreta. Verifique suas credenciais.');
      setShowError(true);
      return;
    }

    // Login bem-sucedido
    onLogin();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #227056 0%, #1a5642 100%)',
      fontFamily: "'EB Garamond', serif"
    }}>
      {/* Modal de Erro */}
      {showError && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(34, 112, 86, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.3)',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #227056 0%, #1a5642 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <AlertCircle size={36} color="white" />
            </div>
            <h2 style={{
              margin: '0 0 12px',
              fontSize: '22px',
              color: '#227056',
              fontWeight: '600'
            }}>
              Erro de Autenticação
            </h2>
            <p style={{
              margin: '0 0 24px',
              fontSize: '16px',
              color: '#666',
              lineHeight: '1.5'
            }}>
              {errorMessage}
            </p>
            <button
              onClick={() => setShowError(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #227056 0%, #1a5642 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(34, 112, 86, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      <div style={{
        background: 'white',
        padding: '48px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '420px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src="/logo-cavalcante-reis.png"
            alt="Cavalcante Reis Advogados"
            style={{ width: '200px', height: 'auto', margin: '0 auto 16px' }}
          />
          <h1 style={{ margin: '0', fontSize: '28px', color: '#227056' }}>
            Bem-vindo
          </h1>
          <p style={{ margin: '8px 0 0', color: '#666', fontSize: '16px' }}>
            Faça login para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@gmail.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#227056'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingRight: '45px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#227056'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#227056'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: '#227056',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#1a5642'}
            onMouseLeave={(e) => e.target.style.background = '#227056'}
          >
            Entrar
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#999', fontSize: '13px' }}>
          © 2025 Cavalcante Reis Advogados
        </p>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default Login;
