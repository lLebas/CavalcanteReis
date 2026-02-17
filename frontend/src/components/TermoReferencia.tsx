'use client';

import React, { useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { downloadTermoReferencia } from '@/lib/termoGenerator';

interface TermoReferenciaProps {
  onBack: () => void;
}

const DOC_MODEL = {
  objeto: `É objeto do presente contrato o desenvolvimento de serviços advocatícios especializados de prestação de serviços de assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico e Financeiro, em especial para alcançar o incremento de receitas, dentre elas:

• Revisar os parcelamentos previdenciários visando a redução do montante;
• Prospectar e quantificar ativos ocultos decorrentes do recolhimento de contribuições previdenciárias a maior;
• Folha de pagamento, recuperação de verbas indenizatórias e contribuições previdenciárias;
• Auditoria e consultoria do pagamento de energia elétrica;
• ICMS Energia Elétrica - Recuperação de créditos do imposto sobre serviços;
• Compensação financeira pela exploração mineral (CFEM);
• Rata-feira, revisão e recuperação dos valores repassados a menor da União (FPM);
• Acompanhamento e intervenções de terceiro em ações judiciais e administrativas de interesse do município.`,

  fundamentacao: `Será procedida a contratação por meio de INEXIGIBILIDADE DE LICITAÇÃO, realizada com base no art. 74, inciso III, alínea "e", da Lei Federal n.º 14.133/21.

A natureza singular dos serviços advocatícios especializados e a notória especialização do escritório contratado justificam a inexigibilidade, uma vez que tais serviços demandam conhecimentos técnicos específicos e comprovada expertise nas áreas de atuação necessárias.`,

  obrigacoes: `São obrigações da CONTRATADA:

a) Prestar os serviços advocatícios especializados objeto deste Termo;
b) Manter sigilo absoluto sobre todas as informações obtidas em decorrência da execução dos serviços;
c) Responsabilizar-se integralmente pelos serviços contratados;
d) Apresentar relatórios periódicos sobre o andamento dos trabalhos;
e) Manter os profissionais devidamente habilitados e regularizados junto à OAB.

São obrigações do CONTRATANTE:

a) Fornecer todas as informações e documentos necessários à execução dos serviços;
b) Efetuar o pagamento nas condições estabelecidas;
c) Fiscalizar a execução do contrato;
d) Prestar os esclarecimentos que venham a ser solicitados pela CONTRATADA.`,

  prazo: `O prazo de vigência do presente contrato será de 12 (doze) meses, contados da data de sua assinatura, podendo ser prorrogado mediante termo aditivo, nos termos da legislação vigente.`,

  pagamento: `A remuneração pelos serviços prestados será realizada mediante percentual de êxito sobre os valores efetivamente recuperados ou economizados em favor do Município, conforme percentuais estabelecidos no contrato principal.

O pagamento será efetuado após a efetiva recuperação dos valores ou economia comprovada, mediante apresentação de relatório detalhado e nota fiscal.`
};

export default function TermoReferencia({ onBack }: TermoReferenciaProps) {
  const [formData, setFormData] = useState({
    municipio: 'BARROCAS/BA',
    processo: '000/2025',
    data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
    objeto: DOC_MODEL.objeto,
    fundamentacao: DOC_MODEL.fundamentacao,
    obrigacoes: DOC_MODEL.obrigacoes,
    prazo: DOC_MODEL.prazo,
    pagamento: DOC_MODEL.pagamento
  });

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadTermoReferencia({
        municipio: formData.municipio,
        processo: formData.processo,
        data: formData.data,
        objeto: formData.objeto,
        fundamentacao: formData.fundamentacao,
        obrigacoes: formData.obrigacoes,
        prazo: formData.prazo,
        pagamento: formData.pagamento,
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
            Termo de Referência
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
                1. Do Objeto
              </label>
              <textarea
                className="w-full p-3 border border-neutral-300 rounded-lg text-sm h-48 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.objeto}
                onChange={(e) => setFormData({ ...formData, objeto: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">
                2. Fundamentação Legal
              </label>
              <textarea
                className="w-full p-3 border border-neutral-300 rounded-lg text-sm h-32 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.fundamentacao}
                onChange={(e) => setFormData({ ...formData, fundamentacao: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">
                3. Das Obrigações
              </label>
              <textarea
                className="w-full p-3 border border-neutral-300 rounded-lg text-sm h-48 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.obrigacoes}
                onChange={(e) => setFormData({ ...formData, obrigacoes: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">
                4. Do Prazo de Vigência
              </label>
              <textarea
                className="w-full p-3 border border-neutral-300 rounded-lg text-sm h-24 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.prazo}
                onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">
                5. Do Pagamento
              </label>
              <textarea
                className="w-full p-3 border border-neutral-300 rounded-lg text-sm h-32 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.pagamento}
                onChange={(e) => setFormData({ ...formData, pagamento: e.target.value })}
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
                Termo de Referência - Inexigibilidade de Licitação
              </h1>

              {/* Identificação */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11pt', fontWeight: 'bold', color: '#000', fontFamily: "'Garamond', serif", margin: '0 0 4px 0' }}>Município: {formData.municipio}</p>
                <p style={{ fontSize: '11pt', fontWeight: 'bold', color: '#000', fontFamily: "'Garamond', serif", margin: '0 0 4px 0' }}>Processo Administrativo: {formData.processo}</p>
                <p style={{ fontSize: '11pt', fontWeight: 'bold', color: '#000', fontFamily: "'Garamond', serif", margin: '0' }}>Data: {formData.data}</p>
              </div>

              {/* 1. Do Objeto */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', borderBottom: '1pt solid #000', paddingBottom: '8px', marginBottom: '15px', marginTop: '0', fontFamily: "'Garamond', serif" }}>
                  1. DO OBJETO
                </h2>
                <p style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', marginBottom: '0', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", whiteSpace: 'pre-line' }}>
                  {formData.objeto}
                </p>
              </div>

              {/* 2. Fundamentação Legal */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', borderBottom: '1pt solid #000', paddingBottom: '8px', marginBottom: '15px', marginTop: '0', fontFamily: "'Garamond', serif" }}>
                  2. DA FUNDAMENTAÇÃO LEGAL
                </h2>
                <p style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', marginBottom: '0', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", whiteSpace: 'pre-line' }}>
                  {formData.fundamentacao}
                </p>
              </div>

              {/* 3. Das Obrigações */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', borderBottom: '1pt solid #000', paddingBottom: '8px', marginBottom: '15px', marginTop: '0', fontFamily: "'Garamond', serif" }}>
                  3. DAS OBRIGAÇÕES
                </h2>
                <p style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', marginBottom: '0', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", whiteSpace: 'pre-line' }}>
                  {formData.obrigacoes}
                </p>
              </div>

              {/* 4. Do Prazo */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', borderBottom: '1pt solid #000', paddingBottom: '8px', marginBottom: '15px', marginTop: '0', fontFamily: "'Garamond', serif" }}>
                  4. DO PRAZO DE VIGÊNCIA
                </h2>
                <p style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', marginBottom: '0', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", whiteSpace: 'pre-line' }}>
                  {formData.prazo}
                </p>
              </div>

              {/* 5. Do Pagamento */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', borderBottom: '1pt solid #000', paddingBottom: '8px', marginBottom: '15px', marginTop: '0', fontFamily: "'Garamond', serif" }}>
                  5. DO PAGAMENTO
                </h2>
                <p style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', marginBottom: '0', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", whiteSpace: 'pre-line' }}>
                  {formData.pagamento}
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
