'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, Save, Trash2, FileText, Calendar, FileCheck, BookOpen, Gavel, ClipboardList } from 'lucide-react';
import { propostasApi, minutasApi, Proposta, Minuta } from '../lib/api';
import Modal from './Modal';

interface SavedProposalsProps {
  onBackToHome: () => void;
  onLogout: () => void;
  onLoadProposal: (propostaId: string) => void;
}

type TabId = 'proposta' | 'minuta' | 'estudo' | 'termo' | 'parecer';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const TABS: TabConfig[] = [
  { id: 'proposta', label: 'Gerador de Proposta', icon: <FileText size={18} />, color: '#227056' },
  { id: 'minuta', label: 'Minuta', icon: <FileCheck size={18} />, color: '#1a6b8a' },
  { id: 'estudo', label: 'Estudo de Contratação', icon: <BookOpen size={18} />, color: '#7b5ea7' },
  { id: 'termo', label: 'Termo de Referência', icon: <ClipboardList size={18} />, color: '#c47c2b' },
  { id: 'parecer', label: 'Parecer Jurídico', icon: <Gavel size={18} />, color: '#b03a2e' },
];

export default function SavedProposals({ onBackToHome, onLogout, onLoadProposal }: SavedProposalsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('proposta');
  const [proposals, setProposals] = useState<Proposta[]>([]);
  const [minutas, setMinutas] = useState<Minuta[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [loadingMinutas, setLoadingMinutas] = useState(true);
  const [modal, setModal] = useState<any>({ open: false, title: '', message: '', type: 'info' });

  const loadProposals = async () => {
    try {
      setLoadingProposals(true);
      const data = await propostasApi.getAll();
      setProposals(data);
    } catch (error: any) {
      console.error('Erro ao carregar propostas:', error);
      setModal({ open: true, title: 'Erro', message: `Erro ao carregar propostas: ${error.message || 'Erro desconhecido'}`, type: 'error' });
    } finally {
      setLoadingProposals(false);
    }
  };

  const loadMinutas = async () => {
    try {
      setLoadingMinutas(true);
      const data = await minutasApi.getAll();
      setMinutas(data);
    } catch (error: any) {
      console.error('Erro ao carregar minutas:', error);
    } finally {
      setLoadingMinutas(false);
    }
  };

  useEffect(() => {
    loadProposals();
    loadMinutas();
  }, []);

  const handleDeleteProposal = async (id: string, municipio?: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a proposta de "${municipio}"?`)) return;
    try {
      await propostasApi.delete(id);
      setProposals(proposals.filter(p => p.id !== id));
      setModal({ open: true, title: 'Sucesso', message: 'Proposta deletada com sucesso!', type: 'success' });
    } catch (error: any) {
      setModal({ open: true, title: 'Erro', message: `Erro ao deletar: ${error.message || 'Erro desconhecido'}`, type: 'error' });
    }
  };

  const handleDeleteMinuta = async (id: string, municipio?: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a minuta de "${municipio}"?`)) return;
    try {
      await minutasApi.delete(id);
      setMinutas(minutas.filter(m => m.id !== id));
      setModal({ open: true, title: 'Sucesso', message: 'Minuta deletada com sucesso!', type: 'success' });
    } catch (error: any) {
      setModal({ open: true, title: 'Erro', message: `Erro ao deletar: ${error.message || 'Erro desconhecido'}`, type: 'error' });
    }
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'Data não informada';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getDaysUntilExpiry = (expiresAt?: string): number | null => {
    if (!expiresAt) return null;
    const diff = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const EmptyState = ({ label }: { label: string }) => (
    <div style={{
      textAlign: 'center',
      padding: '80px 20px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
    }}>
      <Save size={56} color="#ccc" style={{ marginBottom: '16px' }} />
      <h3 style={{ fontSize: '20px', color: '#555', marginBottom: '8px', fontWeight: '600' }}>
        Nenhum(a) {label} salvo(a)
      </h3>
      <p style={{ fontSize: '15px', color: '#999' }}>
        Os documentos que você salvar aparecerão aqui.
      </p>
    </div>
  );

  const ComingSoon = ({ label }: { label: string }) => (
    <div style={{
      textAlign: 'center',
      padding: '80px 20px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      border: '2px dashed #e0e0e0'
    }}>
      <Save size={56} color="#ddd" style={{ marginBottom: '16px' }} />
      <h3 style={{ fontSize: '20px', color: '#aaa', marginBottom: '8px', fontWeight: '600' }}>
        Nenhum(a) {label} salvo(a)
      </h3>
      <p style={{ fontSize: '14px', color: '#bbb' }}>
        A funcionalidade de salvar ainda não está disponível para este tipo de documento.
      </p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBackToHome}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', background: 'transparent',
              border: '1px solid #227056', borderRadius: '8px',
              color: '#227056', fontWeight: '600', cursor: 'pointer', fontSize: '14px'
            }}
          >
            <ArrowLeft size={18} /> Voltar para Home
          </button>
          <h1 style={{ fontSize: '22px', color: '#227056', margin: 0, fontWeight: '700' }}>
            Documentos Salvos
          </h1>
        </div>
        <button onClick={onLogout} title="Sair" style={{ background: 'transparent', border: '1px solid #ddd', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex' }}>
          <LogOut size={20} color="#227056" />
        </button>
      </header>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '0', minWidth: 'max-content' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '14px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? `3px solid ${tab.color}` : '3px solid transparent',
                color: activeTab === tab.id ? tab.color : '#666',
                fontWeight: activeTab === tab.id ? '700' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                marginBottom: '-1px'
              }}
            >
              <span style={{ color: activeTab === tab.id ? tab.color : '#999' }}>{tab.icon}</span>
              {tab.label}
              {/* Badge count */}
              {tab.id === 'proposta' && !loadingProposals && (
                <span style={{
                  background: activeTab === tab.id ? tab.color : '#e0e0e0',
                  color: activeTab === tab.id ? 'white' : '#666',
                  borderRadius: '999px', padding: '2px 8px', fontSize: '12px', fontWeight: '700', minWidth: '22px', textAlign: 'center'
                }}>{proposals.length}</span>
              )}
              {tab.id === 'minuta' && !loadingMinutas && (
                <span style={{
                  background: activeTab === tab.id ? tab.color : '#e0e0e0',
                  color: activeTab === tab.id ? 'white' : '#666',
                  borderRadius: '999px', padding: '2px 8px', fontSize: '12px', fontWeight: '700', minWidth: '22px', textAlign: 'center'
                }}>{minutas.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main style={{ padding: '32px 40px', flex: 1 }}>

        {/* === PROPOSTAS === */}
        {activeTab === 'proposta' && (
          loadingProposals ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div className="spinner"></div>
              <p style={{ marginTop: '20px', color: '#666' }}>Carregando propostas...</p>
            </div>
          ) : proposals.length === 0 ? (
            <EmptyState label="Proposta" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {proposals.map(proposta => {
                const daysUntilExpiry = getDaysUntilExpiry(proposta.expiresAt);
                return (
                  <div key={proposta.id} style={{
                    background: 'white', borderRadius: '14px', padding: '28px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '2px solid #227056',
                    display: 'flex', flexDirection: 'column', transition: 'all 0.2s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#227056', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={24} color="white" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#222', margin: '0 0 6px 0' }}>
                          {proposta.municipio || 'Sem nome'}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '13px' }}>
                          <Calendar size={14} />
                          <span>{formatDate(proposta.data)}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: 1, marginBottom: '16px' }}>
                      {proposta.prazo && (
                        <p style={{ fontSize: '13px', color: '#666', margin: '0 0 6px 0' }}>
                          <strong>Prazo:</strong> {proposta.prazo} meses
                        </p>
                      )}
                      {daysUntilExpiry !== null && (
                        <p style={{ fontSize: '13px', color: daysUntilExpiry <= 30 ? '#e74c3c' : '#666', margin: '0', fontWeight: daysUntilExpiry <= 30 ? '600' : '400' }}>
                          {daysUntilExpiry === 0 ? <strong>Expirada</strong> : <><strong>Expira em:</strong> {daysUntilExpiry} dia{daysUntilExpiry > 1 ? 's' : ''}</>}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                      <button
                        onClick={() => proposta.id && onLoadProposal(proposta.id)}
                        style={{ flex: 1, padding: '10px 16px', background: '#227056', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1a5642'}
                        onMouseLeave={e => e.currentTarget.style.background = '#227056'}
                      >
                        <FileText size={16} /> Carregar
                      </button>
                      <button
                        onClick={() => proposta.id && handleDeleteProposal(proposta.id, proposta.municipio)}
                        style={{ padding: '10px 14px', background: '#fff5f5', color: '#e74c3c', border: '2px solid #e74c3c', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#e74c3c'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; (e.currentTarget as HTMLButtonElement).style.color = '#e74c3c'; }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* === MINUTAS === */}
        {activeTab === 'minuta' && (
          loadingMinutas ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div className="spinner"></div>
              <p style={{ marginTop: '20px', color: '#666' }}>Carregando minutas...</p>
            </div>
          ) : minutas.length === 0 ? (
            <EmptyState label="Minuta" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {minutas.map(minuta => (
                <div key={minuta.id} style={{
                  background: 'white', borderRadius: '14px', padding: '28px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '2px solid #1a6b8a',
                  display: 'flex', flexDirection: 'column', transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#1a6b8a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileCheck size={24} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#222', margin: '0 0 6px 0' }}>
                        {minuta.municipio || 'Sem nome'}
                      </h3>
                      {minuta.dataAssinatura && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '13px' }}>
                          <Calendar size={14} />
                          <span>{formatDate(minuta.dataAssinatura)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ flex: 1, marginBottom: '16px' }}>
                    {minuta.prazoVigencia && (
                      <p style={{ fontSize: '13px', color: '#666', margin: '0 0 6px 0' }}>
                        <strong>Prazo de Vigência:</strong> {minuta.prazoVigencia}
                      </p>
                    )}
                    {minuta.representante && (
                      <p style={{ fontSize: '13px', color: '#666', margin: '0 0 6px 0' }}>
                        <strong>Representante:</strong> {minuta.representante}
                      </p>
                    )}
                    {minuta.valorContrato && (
                      <p style={{ fontSize: '13px', color: '#666', margin: '0' }}>
                        <strong>Valor:</strong> {minuta.valorContrato}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                    <button
                      onClick={() => minuta.id && handleDeleteMinuta(minuta.id, minuta.municipio)}
                      style={{ flex: 1, padding: '10px 16px', background: '#fff5f5', color: '#e74c3c', border: '2px solid #e74c3c', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#e74c3c'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; (e.currentTarget as HTMLButtonElement).style.color = '#e74c3c'; }}
                    >
                      <Trash2 size={16} /> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* === ESTUDO DE CONTRATAÇÃO === */}
        {activeTab === 'estudo' && <ComingSoon label="Estudo de Contratação" />}

        {/* === TERMO DE REFERÊNCIA === */}
        {activeTab === 'termo' && <ComingSoon label="Termo de Referência" />}

        {/* === PARECER JURÍDICO === */}
        {activeTab === 'parecer' && <ComingSoon label="Parecer Jurídico" />}

      </main>

      <Modal {...modal} onConfirm={() => setModal({ ...modal, open: false })} />
    </div>
  );
}
