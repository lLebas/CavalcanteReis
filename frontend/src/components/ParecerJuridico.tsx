'use client';

import React, { useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { downloadParecerJuridico } from '@/lib/parecerGenerator';

interface ParecerJuridicoProps {
  onBack: () => void;
}

const DOC_MODEL = {
  ementa: `PARECER JURÍDICO. CONTRATO OBJETIVANDO O DESENVOLVIMENTO DE SERVIÇOS ADVOCATÍCIOS ESPECIALIZADOS DE PRESTAÇÃO DE SERVIÇOS DE ASSESSORIA TÉCNICA E JURÍDICA NAS ÁREAS DE DIREITO PÚBLICO, TRIBUTÁRIO, ECONÔMICO E FINANCEIRO. LEI 14.133/2021. INEXIGIBILIDADE. ART. 74, III, "E".`,

  relatorio: `Trata-se de análise da viabilidade jurídica para contratação, mediante inexigibilidade de licitação, de serviços advocatícios especializados para assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico e Financeiro.

A contratação visa ao incremento de receitas municipais através da propositura de demandas judiciais e administrativas, bem como a redução de despesas correntes mediante revisão de parcelamentos e recuperação de valores pagos indevidamente.

O Município busca contratar o ESCRITÓRIO DE ADVOCACIA CAVALCANTE REIS ADVOGADOS, que possui notória especialização nas áreas objeto da contratação.`,

  fundamentacao: `A Lei Federal n.º 14.133/2021 (Nova Lei de Licitações e Contratos) estabelece em seu art. 74, inciso III, alínea "e", a possibilidade de contratação direta por inexigibilidade de licitação para serviços técnicos especializados de advocacia.

O dispositivo legal dispõe:

"Art. 74. É inexigível a licitação quando inviável a competição, em especial nos casos de:
III - contratação dos seguintes serviços técnicos especializados de natureza singular, com profissionais ou empresas de notória especialização:
e) serviços de advocacia;"

A natureza singular dos serviços advocatícios reside na expertise específica requerida para as demandas municipais, que envolvem conhecimentos técnicos altamente especializados em áreas complexas do direito público, tributário e financeiro.

A notória especialização do escritório contratado é demonstrada através de:

a) Comprovada atuação em casos similares de grande complexidade;
b) Reconhecimento no mercado jurídico nas áreas de atuação necessárias;
c) Qualificação técnica dos profissionais que compõem o escritório;
d) Histórico de êxito em demandas de natureza semelhante.`,

  analise: `A contratação proposta atende aos requisitos legais e aos princípios da Administração Pública, especialmente:

LEGALIDADE: A contratação encontra amparo no art. 74, III, "e" da Lei 14.133/2021, que expressamente autoriza a inexigibilidade para serviços advocatícios especializados.

ECONOMICIDADE: A remuneração por êxito garante que o Município somente arcará com custos em caso de efetivo resultado positivo, minimizando riscos financeiros.

EFICIÊNCIA: A contratação de profissionais especializados possibilita maior celeridade e qualidade na recuperação de valores e na redução de despesas.

INTERESSE PÚBLICO: O incremento de receitas e a redução de gastos impactam diretamente na capacidade de investimento público e na prestação de serviços à população.`,

  conclusao: `Diante do exposto, opinamos pela plena possibilidade técnica e jurídica de afastamento da licitação por inexigibilidade, objetivando a contratação da empresa CAVALCANTE REIS SOCIEDADE DE ADVOGADOS.

A contratação está em conformidade com o art. 74, inciso III, alínea "e" da Lei Federal n.º 14.133/2021, atendendo aos requisitos de natureza singular dos serviços e notória especialização do contratado.

Recomenda-se a formalização do processo administrativo com a devida justificativa de preços e a publicação dos atos na forma da lei.

É o parecer, s.m.j.`
};

export default function ParecerJuridico({ onBack }: ParecerJuridicoProps) {
  const [formData, setFormData] = useState({
    municipio: 'BARROCAS/BA',
    processo: '000/2025',
    data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
    ementa: DOC_MODEL.ementa,
    relatorio: DOC_MODEL.relatorio,
    fundamentacao: DOC_MODEL.fundamentacao,
    analise: DOC_MODEL.analise,
    conclusao: DOC_MODEL.conclusao
  });

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadParecerJuridico({
        municipio: formData.municipio,
        processo: formData.processo,
        data: formData.data,
        ementa: formData.ementa,
        relatorio: formData.relatorio,
        fundamentacao: formData.fundamentacao,
        analise: formData.analise,
        conclusao: formData.conclusao,
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
            Parecer Jurídico
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
                Ementa
              </label>
              <textarea
                className="w-full p-3 border border-neutral-300 rounded-lg text-sm h-24 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.ementa}
                onChange={(e) => setFormData({ ...formData, ementa: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">
                I. Relatório
              </label>
              <textarea
                className="w-full p-3 border border-neutral-300 rounded-lg text-sm h-40 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.relatorio}
                onChange={(e) => setFormData({ ...formData, relatorio: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">
                II. Fundamentação Legal
              </label>
              <textarea
                className="w-full p-3 border border-neutral-300 rounded-lg text-sm h-48 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.fundamentacao}
                onChange={(e) => setFormData({ ...formData, fundamentacao: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">
                III. Análise
              </label>
              <textarea
                className="w-full p-3 border border-neutral-300 rounded-lg text-sm h-48 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.analise}
                onChange={(e) => setFormData({ ...formData, analise: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">
                IV. Conclusão
              </label>
              <textarea
                className="w-full p-3 border border-neutral-300 rounded-lg text-sm h-40 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.conclusao}
                onChange={(e) => setFormData({ ...formData, conclusao: e.target.value })}
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
              {/* Ementa à Direita */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <div style={{ width: '55%', borderBottom: '1pt solid #000', fontWeight: 'bold', fontStyle: 'italic', fontSize: '10pt', textTransform: 'uppercase', paddingBottom: '8px', fontFamily: "'Garamond', serif", color: '#000' }}>
                  {formData.ementa}
                </div>
              </div>

              {/* Título */}
              <h1 style={{ fontSize: '14pt', fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: '20px', marginTop: '0', fontFamily: "'Garamond', serif", textTransform: 'uppercase' }}>
                Parecer Jurídico
              </h1>

              {/* Identificação */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11pt', fontWeight: 'bold', color: '#000', fontFamily: "'Garamond', serif", margin: '0 0 4px 0' }}>Município: {formData.municipio}</p>
                <p style={{ fontSize: '11pt', fontWeight: 'bold', color: '#000', fontFamily: "'Garamond', serif", margin: '0 0 4px 0' }}>Processo Administrativo: {formData.processo}</p>
                <p style={{ fontSize: '11pt', fontWeight: 'bold', color: '#000', fontFamily: "'Garamond', serif", margin: '0' }}>Data: {formData.data}</p>
              </div>

              {/* I. Relatório */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', borderBottom: '1pt solid #000', paddingBottom: '8px', marginBottom: '15px', marginTop: '0', fontFamily: "'Garamond', serif" }}>
                  I. RELATÓRIO
                </h2>
                <p style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', marginBottom: '0', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", whiteSpace: 'pre-line' }}>
                  {formData.relatorio}
                </p>
              </div>

              {/* II. Fundamentação */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', borderBottom: '1pt solid #000', paddingBottom: '8px', marginBottom: '15px', marginTop: '0', fontFamily: "'Garamond', serif" }}>
                  II. FUNDAMENTAÇÃO LEGAL
                </h2>
                <p style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', marginBottom: '0', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", whiteSpace: 'pre-line' }}>
                  {formData.fundamentacao}
                </p>
              </div>

              {/* III. Análise */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', borderBottom: '1pt solid #000', paddingBottom: '8px', marginBottom: '15px', marginTop: '0', fontFamily: "'Garamond', serif" }}>
                  III. ANÁLISE
                </h2>
                <p style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', marginBottom: '0', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", whiteSpace: 'pre-line' }}>
                  {formData.analise}
                </p>
              </div>

              {/* IV. Conclusão */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', borderBottom: '1pt solid #000', paddingBottom: '8px', marginBottom: '15px', marginTop: '0', fontFamily: "'Garamond', serif" }}>
                  IV. CONCLUSÃO
                </h2>
                <p style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', marginBottom: '0', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", whiteSpace: 'pre-line' }}>
                  {formData.conclusao}
                </p>
              </div>

              {/* Assinatura */}
              <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <div style={{ borderTop: '1pt solid #000', width: '160px', margin: '0 auto', paddingTop: '8px' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '11pt', color: '#000', fontFamily: "'Garamond', serif", margin: '0 0 4px 0' }}>CAVALCANTE REIS ADVOGADOS</p>
                  <p style={{ fontSize: '10pt', color: '#000', fontFamily: "'Garamond', serif", margin: '0' }}>OAB/DF 35.075</p>
                </div>
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
