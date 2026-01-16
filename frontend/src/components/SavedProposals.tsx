'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, Save, Trash2, FileText, Calendar } from 'lucide-react';
import { propostasApi, Proposta } from '../lib/api';
import Modal from './Modal';

interface SavedProposalsProps {
  onBackToHome: () => void;
  onLogout: () => void;
  onLoadProposal: (propostaId: string) => void; // Função para carregar proposta no gerador
}

export default function SavedProposals({ onBackToHome, onLogout, onLoadProposal }: SavedProposalsProps) {
  const [proposals, setProposals] = useState<Proposta[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<any>({ open: false, title: "", message: "", type: "info" });

  // Carrega todas as propostas salvas
  const loadProposals = async () => {
    try {
      setLoading(true);
      const data = await propostasApi.getAll();
      setProposals(data);
    } catch (error: any) {
      console.error('Erro ao carregar propostas:', error);
      setModal({
        open: true,
        title: "Erro",
        message: `Erro ao carregar propostas: ${error.message || 'Erro desconhecido'}`,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  // Deleta uma proposta
  const handleDelete = async (id: string) => {
    try {
      await propostasApi.delete(id);
      setProposals(proposals.filter(p => p.id !== id));
      setModal({
        open: true,
        title: "Sucesso",
        message: "Proposta deletada com sucesso!",
        type: "success"
      });
    } catch (error: any) {
      console.error('Erro ao deletar proposta:', error);
      setModal({
        open: true,
        title: "Erro",
        message: `Erro ao deletar proposta: ${error.message || 'Erro desconhecido'}`,
        type: "error"
      });
    }
  };

  // Calcula dias até expiração
  const getDaysUntilExpiry = (expiresAt?: string): number | null => {
    if (!expiresAt) return null;
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diff = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Formata data para exibição
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'Data não informada';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="app light" style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Header */}
      <header className="header" style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div className="left">
          <button onClick={onBackToHome} className="btn secondary" style={{ padding: '8px 12px' }}>
            <ArrowLeft size={18} /> Voltar para Home
          </button>
          <h1 style={{ fontSize: '24px', color: '#227056', margin: 0 }}>Propostas Salvas</h1>
        </div>
        <button onClick={onLogout} className="theme-btn" title="Sair">
          <LogOut size={20} color="#227056" />
        </button>
      </header>

      {/* Main Content */}
      <main style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '20px', fontSize: '16px', color: '#666' }}>Carregando propostas...</p>
          </div>
        ) : proposals.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}>
            <Save size={64} color="#ccc" style={{ marginBottom: '20px' }} />
            <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '12px' }}>Nenhuma proposta salva</h2>
            <p style={{ fontSize: '16px', color: '#666' }}>
              As propostas que você salvar aparecerão aqui.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
            marginTop: '20px'
          }}>
            {proposals.map((proposta) => {
              const daysUntilExpiry = getDaysUntilExpiry(proposta.expiresAt);

              return (
                <div
                  key={proposta.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    border: `3px solid #227056`,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '280px'
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
                  {/* Ícone e Título */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      background: '#227056',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FileText size={28} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '22px',
                        fontWeight: '600',
                        color: '#333',
                        margin: '0 0 8px 0',
                        lineHeight: '1.3'
                      }}>
                        {proposta.municipio || 'Sem nome'}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '14px' }}>
                        <Calendar size={16} />
                        <span>{formatDate(proposta.data)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Informações adicionais */}
                  <div style={{ flex: 1, marginBottom: '20px' }}>
                    {proposta.data && (
                      <p style={{ fontSize: '14px', color: '#666', margin: '0 0 8px 0' }}>
                        <strong>Data da Proposta:</strong> {proposta.data}
                      </p>
                    )}
                    {proposta.prazo && (
                      <p style={{ fontSize: '14px', color: '#666', margin: '0 0 8px 0' }}>
                        <strong>Prazo:</strong> {proposta.prazo} meses
                      </p>
                    )}
                    {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                      <p style={{
                        fontSize: '14px',
                        color: daysUntilExpiry <= 30 ? '#e74c3c' : '#666',
                        margin: '0',
                        fontWeight: daysUntilExpiry <= 30 ? '600' : '400'
                      }}>
                        <strong>Expira em:</strong> {daysUntilExpiry} dia{daysUntilExpiry > 1 ? 's' : ''}
                      </p>
                    )}
                    {daysUntilExpiry === 0 && (
                      <p style={{ fontSize: '14px', color: '#e74c3c', margin: '0', fontWeight: '600' }}>
                        <strong>Expirada</strong>
                      </p>
                    )}
                  </div>

                  {/* Botões de ação */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                    <button
                      onClick={() => {
                        if (proposta.id) {
                          onLoadProposal(proposta.id);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '12px 24px',
                        background: '#227056',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1a5642';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#227056';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <FileText size={18} />
                      Carregar
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Tem certeza que deseja excluir a proposta de "${proposta.municipio}"?`)) {
                          if (proposta.id) {
                            handleDelete(proposta.id);
                          }
                        }
                      }}
                      style={{
                        padding: '12px 20px',
                        background: '#f5f5f5',
                        color: '#e74c3c',
                        border: '2px solid #e74c3c',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e74c3c';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f5f5f5';
                        e.currentTarget.style.color = '#e74c3c';
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de notificações */}
      <Modal {...modal} onConfirm={() => setModal({ ...modal, open: false })} />
    </div>
  );
}
