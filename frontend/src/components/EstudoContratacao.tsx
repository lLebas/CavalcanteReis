'use client';

import React, { useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { downloadEstudoContratacao } from '@/lib/estudoGenerator';

interface EstudoContratacaoProps {
  onBack: () => void;
}

const DOC_MODEL = {
  introducao: `O presente documento caracteriza importante etapa da fase de planejamento para a contratação de serviços jurídicos especializados na propositura de demandas judiciais e/ou administrativas visando o estudo, levantamento, questionamento processual, redução das despesas correntes e incremento das receitas provenientes das cobranças realizadas indevidas.

A contratação está autorizada pela autoridade máxima (Prefeito Municipal) e pelos ordenadores de despesas responsáveis pelas contratações.

Trata-se de serviços de advocacia especializados em ações judiciais de natureza altamente complexa, que demandam conhecimentos e habilidades específicas dos profissionais da área jurídica.`,

  necessidade: `A solicitação de contratação dos serviços justifica-se pela necessidade de melhorar a arrecadação municipal através da propositura de demandas judiciais e/ou administrativas, nas diversas áreas de atuação especializada, em especial:

• Revisar os parcelamentos previdenciários visando a redução do montante;
• Prospectar e quantificar ativos ocultos decorrentes do recolhimento de contribuições previdenciárias;
• Folha de pagamento, recuperação de verbas indenizatórias e contribuições previdenciárias;
• Auditoria e consultoria do pagamento de energia elétrica;
• ICMS Energia Elétrica - Recuperação de créditos do imposto sobre serviços de qualquer natureza (ISSQN);
• Compensação financeira pela exploração mineral (CFEM);
• Rata-feira, revisão e recuperação dos valores repassados a menor da União (FPM);
• Acompanhamento e intervenções de terceiro em ações judiciais e administrativas de interesse do município.`,

  objetivos: `Os objetivos da contratação são:

1. Incrementar as receitas municipais através da recuperação de valores devidos e não recebidos;
2. Reduzir despesas correntes mediante revisão e questionamento de cobranças indevidas;
3. Garantir assessoria técnica especializada em áreas complexas do direito público, tributário e financeiro;
4. Proporcionar ao município acesso a profissionais com notória especialização nas áreas de atuação necessárias.`,

  viabilidade: `Esta equipe de planejamento declara viável esta contratação. 

Os requisitos listados atendem adequadamente às demandas formuladas, os custos previstos são compatíveis com os valores de mercado e condizentes com a modalidade de remuneração por êxito, e os riscos identificados são administráveis.

A contratação se enquadra nos termos do art. 74, inciso III, alínea "e" da Lei Federal n.º 14.133/21, que permite a inexigibilidade de licitação para serviços técnicos especializados de advocacia.`
};

export default function EstudoContratacao({ onBack }: EstudoContratacaoProps) {
  const [formData, setFormData] = useState({
    municipio: 'BARROCAS/BA',
    processo: '000/2025',
    data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
    introducao: DOC_MODEL.introducao,
    necessidade: DOC_MODEL.necessidade,
    objetivos: DOC_MODEL.objetivos,
    viabilidade: DOC_MODEL.viabilidade
  });

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadEstudoContratacao({
        municipio: formData.municipio,
        processo: formData.processo,
        data: formData.data,
        introducao: formData.introducao,
        necessidade: formData.necessidade,
        objetivos: formData.objetivos,
        viabilidade: formData.viabilidade,
      });
      alert('Documento gerado e baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      alert('Erro ao gerar documento. Tente novamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border-b border-neutral-300 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
          <div className="h-6 w-px bg-neutral-300" />
          <h1 className="text-xl font-black text-neutral-800 uppercase tracking-tight">
            Estudo de Contratação
          </h1>
        </div>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          {isDownloading ? 'Gerando...' : 'Baixar DOCX'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor Lateral */}
        <div className="w-96 bg-white border-r border-neutral-300 p-6 overflow-y-auto">
          <h2 className="text-xs font-black text-emerald-600 uppercase mb-6 tracking-widest">
            Dados do Documento
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">
                Município
              </label>
              <input
                type="text"
                className="w-full p-3 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.municipio}
                onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">
                Processo Administrativo
              </label>
              <input
                type="text"
                className="w-full p-3 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.processo}
                onChange={(e) => setFormData({ ...formData, processo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">
                1. Introdução
              </label>
              <textarea
                className="w-full p-3 border border-neutral-300 rounded-lg text-sm h-32 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.introducao}
                onChange={(e) => setFormData({ ...formData, introducao: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">
                2. Descrição da Necessidade
              </label>
              <textarea
                className="w-full p-3 border border-neutral-300 rounded-lg text-sm h-48 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.necessidade}
                onChange={(e) => setFormData({ ...formData, necessidade: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">
                3. Objetivos
              </label>
              <textarea
                className="w-full p-3 border border-neutral-300 rounded-lg text-sm h-40 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.objetivos}
                onChange={(e) => setFormData({ ...formData, objetivos: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">
                4. Declaração de Viabilidade
              </label>
              <textarea
                className="w-full p-3 border border-neutral-300 rounded-lg text-sm h-40 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.viabilidade}
                onChange={(e) => setFormData({ ...formData, viabilidade: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Preview A4 */}
        <div className="flex-1 p-10 overflow-y-auto bg-neutral-300 flex flex-col items-center">
          <div className="pdf-page-render" style={{
            boxShadow: '0 0 20px rgba(0,0,0,0.1)',
            margin: '0 auto',
            marginBottom: '20px',
            background: 'white',
            padding: '20mm 25mm 30mm 25mm',
            width: '210mm',
            minHeight: '297mm',
            position: 'relative',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            pageBreakAfter: 'always',
            overflow: 'visible'
          }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '25pt', flexShrink: 0 }}>
              <img
                src="/logo-cavalcante-reis.png"
                alt="Logo Cavalcante Reis"
                style={{ width: '145pt', height: 'auto', display: 'block', margin: '0 auto' }}
                crossOrigin="anonymous"
              />
            </div>

            {/* Conteúdo */}
            <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%', flex: 1 }}>
              {/* Título */}
              <h1 style={{ fontSize: '14pt', fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: '20px', marginTop: '0', fontFamily: "'Garamond', serif", textDecoration: 'underline', textTransform: 'uppercase' }}>
                Estudo de Viabilidade de Contratação
              </h1>

              {/* Identificação */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11pt', fontWeight: 'bold', color: '#000', fontFamily: "'Garamond', serif", margin: '0 0 4px 0' }}>Município: {formData.municipio}</p>
                <p style={{ fontSize: '11pt', fontWeight: 'bold', color: '#000', fontFamily: "'Garamond', serif", margin: '0 0 4px 0' }}>Processo Administrativo: {formData.processo}</p>
                <p style={{ fontSize: '11pt', fontWeight: 'bold', color: '#000', fontFamily: "'Garamond', serif", margin: '0' }}>Data: {formData.data}</p>
              </div>

              {/* 1. Introdução */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', borderBottom: '1pt solid #000', paddingBottom: '8px', marginBottom: '15px', marginTop: '0', fontFamily: "'Garamond', serif" }}>
                  1. INTRODUÇÃO
                </h2>
                <p style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', marginBottom: '0', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", whiteSpace: 'pre-line' }}>
                  {formData.introducao}
                </p>
              </div>

              {/* 2. Descrição da Necessidade */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', borderBottom: '1pt solid #000', paddingBottom: '8px', marginBottom: '15px', marginTop: '0', fontFamily: "'Garamond', serif" }}>
                  2. DESCRIÇÃO DA NECESSIDADE
                </h2>
                <p style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', marginBottom: '0', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", whiteSpace: 'pre-line' }}>
                  {formData.necessidade}
                </p>
              </div>

              {/* 3. Objetivos */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', borderBottom: '1pt solid #000', paddingBottom: '8px', marginBottom: '15px', marginTop: '0', fontFamily: "'Garamond', serif" }}>
                  3. OBJETIVOS
                </h2>
                <p style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', marginBottom: '0', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", whiteSpace: 'pre-line' }}>
                  {formData.objetivos}
                </p>
              </div>

              {/* 4. Declaração de Viabilidade */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', borderBottom: '1pt solid #000', paddingBottom: '8px', marginBottom: '15px', marginTop: '0', fontFamily: "'Garamond', serif" }}>
                  4. DECLARAÇÃO DE VIABILIDADE
                </h2>
                <p style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', marginBottom: '0', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", whiteSpace: 'pre-line' }}>
                  {formData.viabilidade}
                </p>
              </div>
            </div>

            {/* Rodapé */}
            <div className="page-footer-container">
              <div className="footer-cities-line">
                <span>Rio de Janeiro - RJ</span>
                <span>Brasília - DF</span>
                <span>Manaus - AM</span>
              </div>
              <p style={{ fontSize: '8pt', color: '#aaa', marginTop: '4px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>WWW.CAVALCANTEREIS.ADV.BR</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
