'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, Save, Trash2, FileText, Calendar, FileCheck, BookOpen, Gavel, ClipboardList } from 'lucide-react';
import {
  propostasApi, minutasApi, estudosApi, termosApi, pareceresApi,
  Proposta, Minuta, EstudoContratacao, TermoReferencia, ParecerJuridico
} from '../lib/api';
import Modal from './Modal';

interface SavedProposalsProps {
  onBackToHome: () => void;
  onLogout: () => void;
  onLoadProposal: (propostaId: string) => void;
  onLoadMinuta?: (minutaId: string) => void;
  onLoadEstudo?: (estudoId: string) => void;
  onLoadTermo?: (termoId: string) => void;
  onLoadParecer?: (parecerId: string) => void;
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

export default function SavedProposals({
  onBackToHome, onLogout, onLoadProposal,
  onLoadMinuta, onLoadEstudo, onLoadTermo, onLoadParecer
}: SavedProposalsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('proposta');
  const [proposals, setProposals] = useState<Proposta[]>([]);
  const [minutas, setMinutas] = useState<Minuta[]>([]);
  const [estudos, setEstudos] = useState<EstudoContratacao[]>([]);
  const [termos, setTermos] = useState<TermoReferencia[]>([]);
  const [pareceres, setPareceres] = useState<ParecerJuridico[]>([]);
  const [loading, setLoading] = useState({ proposta: true, minuta: true, estudo: true, termo: true, parecer: true });
  const [modal, setModal] = useState<any>({ open: false, title: '', message: '', type: 'info' });

  const setTabLoading = (tab: TabId, val: boolean) =>
    setLoading(prev => ({ ...prev, [tab]: val }));

  useEffect(() => {
    const loadAll = async () => {
      const [p, m, e, t, pa] = await Promise.allSettled([
        propostasApi.getAll(),
        minutasApi.getAll(),
        estudosApi.getAll(),
        termosApi.getAll(),
        pareceresApi.getAll(),
      ]);
      if (p.status === 'fulfilled') setProposals(p.value);
      if (m.status === 'fulfilled') setMinutas(m.value);
      if (e.status === 'fulfilled') setEstudos(e.value);
      if (t.status === 'fulfilled') setTermos(t.value);
      if (pa.status === 'fulfilled') setPareceres(pa.value);
      setLoading({ proposta: false, minuta: false, estudo: false, termo: false, parecer: false });
    };
    loadAll();
  }, []);

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

  const handleDeleteProposal = async (id: string, municipio?: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a proposta de "${municipio}"?`)) return;
    try {
      await propostasApi.delete(id);
      setProposals(proposals.filter(p => p.id !== id));
      setModal({ open: true, title: 'Sucesso', message: 'Proposta deletada com sucesso!', type: 'success' });
    } catch (error: any) {
      setModal({ open: true, title: 'Erro', message: `Erro ao deletar: ${error.message}`, type: 'error' });
    }
  };

  const handleDeleteMinuta = async (id: string, municipio?: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a minuta de "${municipio}"?`)) return;
    try {
      await minutasApi.delete(id);
      setMinutas(minutas.filter(m => m.id !== id));
      setModal({ open: true, title: 'Sucesso', message: 'Minuta deletada com sucesso!', type: 'success' });
    } catch (error: any) {
      setModal({ open: true, title: 'Erro', message: `Erro ao deletar: ${error.message}`, type: 'error' });
    }
  };

  const handleDeleteEstudo = async (id: string, municipio?: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o estudo de "${municipio}"?`)) return;
    try {
      await estudosApi.delete(id);
      setEstudos(estudos.filter(e => e.id !== id));
      setModal({ open: true, title: 'Sucesso', message: 'Estudo deletado com sucesso!', type: 'success' });
    } catch (error: any) {
      setModal({ open: true, title: 'Erro', message: `Erro ao deletar: ${error.message}`, type: 'error' });
    }
  };

  const handleDeleteTermo = async (id: string, municipio?: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o termo de "${municipio}"?`)) return;
    try {
      await termosApi.delete(id);
      setTermos(termos.filter(t => t.id !== id));
      setModal({ open: true, title: 'Sucesso', message: 'Termo deletado com sucesso!', type: 'success' });
    } catch (error: any) {
      setModal({ open: true, title: 'Erro', message: `Erro ao deletar: ${error.message}`, type: 'error' });
    }
  };

  const handleDeleteParecer = async (id: string, municipio?: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o parecer de "${municipio}"?`)) return;
    try {
      await pareceresApi.delete(id);
      setPareceres(pareceres.filter(p => p.id !== id));
      setModal({ open: true, title: 'Sucesso', message: 'Parecer deletado com sucesso!', type: 'success' });
    } catch (error: any) {
      setModal({ open: true, title: 'Erro', message: `Erro ao deletar: ${error.message}`, type: 'error' });
    }
  };

  const counts: Record<TabId, number> = {
    proposta: proposals.length,
    minuta: minutas.length,
    estudo: estudos.length,
    termo: termos.length,
    parecer: pareceres.length,
  };

  const EmptyState = ({ label }: { label: string }) => (
    <div style={{
      textAlign: 'center', padding: '80px 20px', background: 'white',
      borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
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

  const LoadingState = () => (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <div className="spinner"></div>
      <p style={{ marginTop: '20px', color: '#666' }}>Carregando...</p>
    </div>
  );

  const cardStyle = (color: string): React.CSSProperties => ({
    background: 'white', borderRadius: '14px', padding: '28px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: `2px solid ${color}`,
    display: 'flex', flexDirection: 'column', transition: 'all 0.2s'
  });

  const loadBtnStyle = (color: string): React.CSSProperties => ({
    flex: 1, padding: '10px 16px', background: color, color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
  });

  const deleteBtnStyle: React.CSSProperties = {
    padding: '10px 14px', background: '#fff5f5', color: '#e74c3c',
    border: '2px solid #e74c3c', borderRadius: '8px', cursor: 'pointer',
    display: 'flex', alignItems: 'center'
  };

  const expiryTag = (expiresAt?: string) => {
    const days = getDaysUntilExpiry(expiresAt);
    if (days === null) return null;
    return (
      <p style={{ fontSize: '13px', color: days <= 30 ? '#e74c3c' : '#666', margin: '0', fontWeight: days <= 30 ? '600' : '400' }}>
        {days === 0 ? <strong>Expirado</strong> : <><strong>Expira em:</strong> {days} dia{days > 1 ? 's' : ''}</>}
      </p>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px', position: 'sticky', top: 0, zIndex: 10
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
                padding: '14px 20px', background: 'transparent', border: 'none',
                borderBottom: activeTab === tab.id ? `3px solid ${tab.color}` : '3px solid transparent',
                color: activeTab === tab.id ? tab.color : '#666',
                fontWeight: activeTab === tab.id ? '700' : '500',
                fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                whiteSpace: 'nowrap', marginBottom: '-1px'
              }}
            >
              <span style={{ color: activeTab === tab.id ? tab.color : '#999' }}>{tab.icon}</span>
              {tab.label}
              {!loading[tab.id] && (
                <span style={{
                  background: activeTab === tab.id ? tab.color : '#e0e0e0',
                  color: activeTab === tab.id ? 'white' : '#666',
                  borderRadius: '999px', padding: '2px 8px', fontSize: '12px', fontWeight: '700', minWidth: '22px', textAlign: 'center'
                }}>{counts[tab.id]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main style={{ padding: '32px 40px', flex: 1 }}>

        {/* === PROPOSTAS === */}
        {activeTab === 'proposta' && (
          loading.proposta ? <LoadingState /> :
          proposals.length === 0 ? <EmptyState label="Proposta" /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {proposals.map(proposta => (
                <div key={proposta.id} style={cardStyle('#227056')}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#227056', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={24} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#222', margin: '0 0 6px 0' }}>{proposta.municipio || 'Sem nome'}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '13px' }}>
                        <Calendar size={14} /><span>{formatDate(proposta.data)}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1, marginBottom: '16px' }}>
                    {proposta.prazo && <p style={{ fontSize: '13px', color: '#666', margin: '0 0 6px 0' }}><strong>Prazo:</strong> {proposta.prazo} meses</p>}
                    {expiryTag(proposta.expiresAt)}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                    <button onClick={() => proposta.id && onLoadProposal(proposta.id)} style={loadBtnStyle('#227056')}
                      onMouseEnter={e => e.currentTarget.style.background = '#1a5642'}
                      onMouseLeave={e => e.currentTarget.style.background = '#227056'}
                    ><FileText size={16} /> Carregar</button>
                    <button onClick={() => proposta.id && handleDeleteProposal(proposta.id, proposta.municipio)} style={deleteBtnStyle}
                      onMouseEnter={e => { e.currentTarget.style.background = '#e74c3c'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; (e.currentTarget as HTMLButtonElement).style.color = '#e74c3c'; }}
                    ><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* === MINUTAS === */}
        {activeTab === 'minuta' && (
          loading.minuta ? <LoadingState /> :
          minutas.length === 0 ? <EmptyState label="Minuta" /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {minutas.map(minuta => (
                <div key={minuta.id} style={cardStyle('#1a6b8a')}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#1a6b8a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileCheck size={24} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#222', margin: '0 0 6px 0' }}>{minuta.municipio || 'Sem nome'}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '13px' }}>
                        <Calendar size={14} /><span>{formatDate(minuta.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1, marginBottom: '16px' }}>
                    {minuta.prazoVigencia && <p style={{ fontSize: '13px', color: '#666', margin: '0 0 6px 0' }}><strong>Prazo:</strong> {minuta.prazoVigencia}</p>}
                    {minuta.representante && <p style={{ fontSize: '13px', color: '#666', margin: '0 0 6px 0' }}><strong>Representante:</strong> {minuta.representante}</p>}
                    {minuta.valorContrato && <p style={{ fontSize: '13px', color: '#666', margin: '0' }}><strong>Valor:</strong> {minuta.valorContrato}</p>}
                    {expiryTag(minuta.expiresAt)}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                    {onLoadMinuta && (
                      <button onClick={() => minuta.id && onLoadMinuta(minuta.id)} style={loadBtnStyle('#1a6b8a')}
                        onMouseEnter={e => e.currentTarget.style.background = '#155577'}
                        onMouseLeave={e => e.currentTarget.style.background = '#1a6b8a'}
                      ><FileCheck size={16} /> Carregar</button>
                    )}
                    <button onClick={() => minuta.id && handleDeleteMinuta(minuta.id, minuta.municipio)} style={deleteBtnStyle}
                      onMouseEnter={e => { e.currentTarget.style.background = '#e74c3c'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; (e.currentTarget as HTMLButtonElement).style.color = '#e74c3c'; }}
                    ><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* === ESTUDO DE CONTRATAÇÃO === */}
        {activeTab === 'estudo' && (
          loading.estudo ? <LoadingState /> :
          estudos.length === 0 ? <EmptyState label="Estudo de Contratação" /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {estudos.map(estudo => (
                <div key={estudo.id} style={cardStyle('#7b5ea7')}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#7b5ea7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen size={24} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#222', margin: '0 0 6px 0' }}>{estudo.municipio || 'Sem nome'}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '13px' }}>
                        <Calendar size={14} /><span>{formatDate(estudo.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1, marginBottom: '16px' }}>
                    {expiryTag(estudo.expiresAt)}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                    {onLoadEstudo && (
                      <button onClick={() => estudo.id && onLoadEstudo(estudo.id)} style={loadBtnStyle('#7b5ea7')}
                        onMouseEnter={e => e.currentTarget.style.background = '#634d88'}
                        onMouseLeave={e => e.currentTarget.style.background = '#7b5ea7'}
                      ><BookOpen size={16} /> Carregar</button>
                    )}
                    <button onClick={() => estudo.id && handleDeleteEstudo(estudo.id, estudo.municipio)} style={deleteBtnStyle}
                      onMouseEnter={e => { e.currentTarget.style.background = '#e74c3c'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; (e.currentTarget as HTMLButtonElement).style.color = '#e74c3c'; }}
                    ><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* === TERMO DE REFERÊNCIA === */}
        {activeTab === 'termo' && (
          loading.termo ? <LoadingState /> :
          termos.length === 0 ? <EmptyState label="Termo de Referência" /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {termos.map(termo => (
                <div key={termo.id} style={cardStyle('#c47c2b')}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#c47c2b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ClipboardList size={24} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#222', margin: '0 0 6px 0' }}>{termo.municipio || 'Sem nome'}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '13px' }}>
                        <Calendar size={14} /><span>{formatDate(termo.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1, marginBottom: '16px' }}>
                    {expiryTag(termo.expiresAt)}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                    {onLoadTermo && (
                      <button onClick={() => termo.id && onLoadTermo(termo.id)} style={loadBtnStyle('#c47c2b')}
                        onMouseEnter={e => e.currentTarget.style.background = '#a36522'}
                        onMouseLeave={e => e.currentTarget.style.background = '#c47c2b'}
                      ><ClipboardList size={16} /> Carregar</button>
                    )}
                    <button onClick={() => termo.id && handleDeleteTermo(termo.id, termo.municipio)} style={deleteBtnStyle}
                      onMouseEnter={e => { e.currentTarget.style.background = '#e74c3c'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; (e.currentTarget as HTMLButtonElement).style.color = '#e74c3c'; }}
                    ><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* === PARECER JURÍDICO === */}
        {activeTab === 'parecer' && (
          loading.parecer ? <LoadingState /> :
          pareceres.length === 0 ? <EmptyState label="Parecer Jurídico" /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {pareceres.map(parecer => (
                <div key={parecer.id} style={cardStyle('#b03a2e')}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#b03a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Gavel size={24} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#222', margin: '0 0 6px 0' }}>{parecer.municipio || 'Sem nome'}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '13px' }}>
                        <Calendar size={14} /><span>{formatDate(parecer.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1, marginBottom: '16px' }}>
                    {expiryTag(parecer.expiresAt)}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                    {onLoadParecer && (
                      <button onClick={() => parecer.id && onLoadParecer(parecer.id)} style={loadBtnStyle('#b03a2e')}
                        onMouseEnter={e => e.currentTarget.style.background = '#922f25'}
                        onMouseLeave={e => e.currentTarget.style.background = '#b03a2e'}
                      ><Gavel size={16} /> Carregar</button>
                    )}
                    <button onClick={() => parecer.id && handleDeleteParecer(parecer.id, parecer.municipio)} style={deleteBtnStyle}
                      onMouseEnter={e => { e.currentTarget.style.background = '#e74c3c'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; (e.currentTarget as HTMLButtonElement).style.color = '#e74c3c'; }}
                    ><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

      </main>

      <Modal {...modal} onConfirm={() => setModal({ ...modal, open: false })} />
    </div>
  );
}
