'use client';

import React, { useState, useMemo, useEffect, useRef } from "react";
import Modal from "./Modal";
import DOMPurify from "dompurify";
import { Settings, FileText, Eye, X, ArrowLeft, LogOut, Download, Save, RefreshCw } from "lucide-react";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const allServices: Record<string, string> = {
  folhaPagamento: "Folha de pagamento, recuperação de verbas indenizatórias e contribuições previdenciárias",
  pasep: "Recuperação/Compensação PASEP",
  rpps: "RPPS – Regime Próprio de Previdência Social",
  cfem: "Compensação (Recursos Minerais - CFEM)",
  cfurh: "Compensação (Recursos Hídricos - CFURH)",
  tabelaSUS: "Tabela do SUS – Aplicação da Tabela TUNEP, ou o IVR, ou outra tabela que venha a ser utilizada pela ANS",
  fundef: "Recuperação dos valores repassados à menor pela União Federal a título de FUNDEF",
  fundeb: "Recuperação dos valores repassado à menor pela União Federal a título de FUNDEB. Reajuste do Valor Mínimo Anual por Aluno – VMAA",
  energiaEletrica: "Auditoria e Consultoria no pagamento das faturas de energia elétrica",
  royaltiesOleoGas: "Royalties (Óleo, Xisto e Gás)",
  repassesFPM: "Repasses de Recursos do FPM (IPI/IR)",
  revisaoParcelamento: "Revisão dos Parcelamentos Previdenciários",
  issqn: "Recuperação de Créditos de ISSQN",
  servicosTecnicos: "Serviços Técnicos (DF)",
  demaisTeses: "Demais teses",
};

const serviceTextDatabase: Record<string, string> = {
  pasep: `
<p style="margin: 2px 0; text-align: justify;">No julgamento do IRDR, ficou estabelecido que a Constituição Federal, através do 
art. 158, inciso I, que define o direito do Ente municipal ao produto da arrecadação 
do imposto de renda retido na fonte.</p>
<p style="margin: 2px 0; text-align: justify;">No julgamento no STF, foi negado provimento ao Recurso Extraordinário da União 
para estabelecer a seguinte tese em sede de repercussão geral:</p>
<p style="margin: 2px 0; text-align: justify;">Pertence ao Município, aos Estados e ao Distrito Federal a titularidade das 
receitas arrecadadas a título de imposto de renda retido na fonte incidente sobre 
valores pagos por eles, suas autarquias e fundações a pessoas físicas ou jurídicas 
contratadas para a prestação de bens ou serviços, conforme disposto nos arts. 
158, I, e 157, I, da Constituição Federal.</p>
<p style="margin: 2px 0; text-align: justify;">Portanto, é direito de os Estados e Municípios se apropriarem do IRRF sobre seus 
pagamentos, o STF determinou que as regras aplicáveis a tais entes fossem aquelas 
previstas na legislação editada para os órgãos e entidades da União. Um detalhe ainda 
não comentado diz respeito ao histórico processual após as decisões de outubro de 
2021.</p>
<p style="margin: 2px 0; text-align: justify;">Tanto na ação que tratou do direito dos Municípios (RE nº 1.293.453/RS), como 
também naquela que discutiu a mesma tese em prol dos Estados (ACO nº 2.897/AL), 
houve a oposição de Embargos de Declaração por parte da União.</p>
<p style="margin: 2px 0; text-align: justify;">Apesar do uso de argumentos razoáveis em relação ao pedido de modulação dos 
efeitos, os ministros do STF não levaram em conta qualquer consideração nesse 
sentido e, ao negar acolhimento aos Embargos de Declaração, afastou qualquer 
possibilidade de aplicação restrita do julgado. Inclusive, a leitura da decisão aponta e 
existência de um único parágrafo fundamentando a negativa, cuja redação afirma:</p>
<p style="margin: 2px 0; text-align: justify;">“Relativamente ao pedido de modulação dos efeitos do julgado, não merece ser 
atendido, pois não se encontram presentes os requisitos do § 3º do art. 927 do 
Código de Processo Civil de 2015”.</p>
<p style="margin: 2px 0; text-align: justify;">Entretanto, isso não afasta a legitimidade dos entes federativos, os quais devem se 
pautar nas regras a serem adotadas a partir dos julgados do STF para apurar os valores 
que se deixou de arrecadar, buscando inclusive ferramentas e profissionais que 
possuam a expertise necessária para tanto, inclusive para otimizar o processo de 
apuração da quantia com o uso de tecnologia que reduza a análise manual das 
informações.</p>
<p style="margin: 2px 0; text-align: justify;">Em relação ao objeto desta (Recuperação/ compensação IR) o valor estimado de 
recuperação da receita é de {{impostoRenda_estimate}}.</p>
  `,
  rpps: `
    <p>A Portaria 15.829/20 da Secretaria Especial de Previdência e Trabalho, que veio para
regulamentar a operacionalização da compensação financeira entre o Regime Geral 
de Previdência e os Regimes Próprios de Previdência da União, Estados, DF e
Municípios e destes entre si.</p>
<p>Devemos, antes de tudo, entender o contexto e porque foi necessária a edição de uma
portaria para regulamentar a operacionalização da compensação.</p>
<p>Desde o ano 2000 a operacionalização de COMPREV ocorre entre RGPS e RPPS. O
Decreto de 2019 veio no intuito de trazer necessários e importantes avanços para
melhor operacionalizar essa compensação e regulamentar e efetivamente executar a
operacionalização entre regimes próprios, já prevista, mesmo que de forma tímida
desde 1999, porém, sem regulamentação específica, o que impossibilitava a efetiva
operação.</p>
<p>Ainda, vale ressaltar, as normas da Portaria da MPS 6.209/00 são aplicadas às
compensações e continuam em vigor, tendo em vista que um dos objetivos da
Portaria 15.829/20 foi o de manter as disposições até que ocorra a transição e
adaptações dos sistemas trazidos pelo Decreto 10.188/19, naquilo, é claro, que não
conflitar com este e a Lei 9.796/99.</p>
<p>A operacionalização, como se sabe, é efetuada através do sistema COMPREV. Não
se nega que o sistema nasceu, para a época, muito moderno, evitando o uso de papel
e o trânsito de documentos entre os entes, por exemplo. Contudo, após 20 anos,
muitos avanços tecnológicos surgiram, levando a necessidade de uma adequação e
melhoria nesse sistema.</p>
<p>Portanto, em 2019 a legislação de COMPREV sofreu diversas mudanças
significativas, como as que enumeraremos e explicaremos brevemente abaixo.</p>
<p>Cabe frisar que a presente proposta de serviços de assessoria é motivada pela
necessidade da contratação para assessorar os servidores no que tange os
procedimentos administrativos para prevenir possíveis inconsistências que ensejem
problemas junto aos órgãos de controles atuando de forma preventiva e aplicando,
por meio da capacitação, as orientações sobre as medidas legais e cabíveis quanto às matérias envolvidas.</p>
<p>Por oportuno, a seguir colaciona-se quadro técnico ilustrativo:</p>
<div class="image-placeholder"></div>
<p>Em relação ao objeto desta (INSS – RPPS) o valor estimado de recuperação da 
receita é de {{rpps_estimate}}.</p>
  `,
  folhaPagamento: `
    <p>Realização de auditoria das folhas de pagamento referentes ao Regime Geral, bem como das GFIPS e tabela de incidências do INSS.</p>
    <p>Há muito se discute acerca da correta base de cálculo das contribuições previdenciárias, especialmente porque há conflitos entre a legislação infraconstitucional e as diretrizes da Constituição Federal.</p>
    <p>Em aspectos gerais, nota-se que alguns elements são destacados pelos entendimentos jurisprudenciais e pela doutrina, como requisitos a serem observados para definir se um determinado valor deve ou não compor a base de incidência da exação.</p>
    <p>Tais elementos são: a contraprestabilidade, a habitualidade e o princípio da contrapartida, a partir dos quais sedimentou-se entendimento pela exclusão de algumas rubricas da base de cálculo das contribuições previdenciárias, como é o caso do salário maternidade, dos quinze primeiros dias que antecedem o auxílio doença/acidente, do aviso prévio indenizado, dentre outros.</p>
    <p>Não obstante, a própria legislação prevê que diversas rubricas não integram a base de incidência das contribuições previdenciárias, como se observa do Art. 28, §9°, da Lei 8.212/91.</p>
    <p>Além disso, vale destacar que a reforma trabalhista (2017) assentou que outras verbas, como diárias e alimentação (inclusive via tickets, cartões ou cesta básica) igualmente não devem sofrer a incidência do tributo em questão.</p>
    <p>Sucede-se que o exame e adequação da base de cálculo das contribuições previdenciárias competem ao contribuinte, de modo que, apurando-se valores indevidamente pagos, fará jus ao direito de compensação.</p>
    <p>A compensação é um direito subjetivo do contribuinte, com expressa previsão legal. Neste sentido, é o que determina o artigo 74 da Lei 9.430/1996.</p>
    <p>Como determina o parágrafo 2º do Art. 74 da Lei 9.430/1996 (acima colacionado) a homologação da compensação se dá em caráter ulterior, inexistindo normativo que exija procedimento prévio.</p>
    <p>Isso significa dizer que a Receita Federal pode fiscalizar as contribuições realizadas pelo contribuinte, homologando-as ou não. Caso transcorra cinco anos sem fiscalização, tem-se a chamada homologação tácita.</p>
    <p>Por tais razões, é importante o trabalho que determina a origem do crédito, consubstanciada no levantamento de valores indevidamente pagos, com indicação de cálculo e fundamentação.</p>
    <p>Por fim, ressaltamos que, no caso de glosa de compensações, prestamos assessoria e consultoria tanto na fase administrativa quanto na judicial, se houver.</p>
  `,
  cfem: `
    <p>A Compensação Financeira pela Exploração de Recursos Minerais (CFEM) é uma contraprestação paga à União, Estados, Distrito Federal e Municípios pela utilização econômica dos recursos minerais em seus respectivos territórios.</p>
    <p>A tese consiste na recuperação dos valores não repassados ou repassados a menor aos Municípios, referentes à CFEM, em decorrência de equívocos no cálculo da distribuição da compensação, bem como a cobrança de débitos de empresas exploradoras que não realizaram o pagamento ou o fizeram em valor inferior ao devido.</p>
  `,
  cfurh: `
    <p>A Compensação Financeira pela Utilização de Recursos Hídricos (CFURH) destina-se a compensar os entes federativos (União, Estados e Municípios) pelo aproveitamento de recursos hídricos para fins de geração de energia elétrica.</p>
    <p>A tese consiste na recuperação de valores devidos aos Municípios que são afetados por usinas hidrelétricas, seja pela área alagada, seja pela localização da usina, e que não receberam a devida compensação ou a receberam em valor inferior ao legalmente estabelecido.</p>
  `,
  tabelaSUS: `
    <p>A ação discute aspectos do FUNDEB, especificamente os valores equivocados de 
cotas por aluno que foram fixados pela União e o montante da complementação de 
recursos repassados desde a sua criação em 2007.</p>
<p>Desde a criação do FUNDEB a complementação dos recursos a cargo da União, 
conforme artigo 4º da Lei nº 11.494/2007, vem sendo realizada de forma equivocada 
em grave prejuízo à educação do Município.</p>
<p>Nesse contexto, a falta de complementação da União nos valores propostos pela 
CF/88 trouxe danos a várias comunidades, com reflexo principalmente para suas 
crianças e adolescentes que são, em última análise, a própria sociedade brasileira em 
construção.</p>
<p>Isso porque, a falta de recursos conforme determina a Lei no setor da educação gera 
desigualdades sociais, atraso no desenvolvimento do país, ignorância e favorece a 
marginalização das pessoas. O clichê da educação ser a única solução para um país, 
ao que parece, não ecoou para a União.</p>
<p>Nesse sentido, existe a necessidade de se reaver os valores repassados à menor pela 
União Federal, sendo condenada a pagar a diferença do valor anual mínimo por aluno 
nacionalmente definido para as séries iniciais do ensino fundamental urbano e para 
todas as demais categorias estudantis a ela atreladas pelas ponderações legais, relativos 
aos últimos cinco anos, respeitando-se a prescrição quinquenal, e por todos os anos 
em que persistir e repercutir a ilegalidade, a ser apurado em sede de liquidação de 
sentença, caso a parte contrária não apresente os dados consolidados.</p>
  `,
  fundef: `
<p>Na vigência da Lei n°9.424/96, instituidora do Fundo de Manutenção e Desenvolvimento do Ensino Fundamental e de Valorização do Magistério — FUNDEF, a União descumpriu preceito contido no art. 6°, § 1° desta lei, no que diz respeito ao respectivo repasse que deveria ser atribuído às municipalidades.</p>
<p>Tal fato se deu com a utilização de critérios distintos do previsto em lei quando do cálculo do Valor Mínimo Anual por Aluno — VMAA a ser praticado e que serviria de parâmetro para chegar ao valor que a União deveria transferir a título de complementação ao FUNDEF de cada ente que não atingisse, com recursos próprios, o valor considerado necessário à implementação das metas para desenvolvimento da educação fundamental.</p>
<p>A matéria cognitiva (de mérito) necessária ao reconhecimento do direito aos Municípios prejudicados por tal prática, que já chegou a ser resolvida de forma definitiva em diversas ações ordinárias ajuizadas individualmente pelos entes municipais de todo o território brasileiro, reconhecendo a defasagem na metodologia de cálculo aplicada pela União Federal, causando diversos prejuízos às educações municipais.</p>
  `,
  fundeb: `
    <p>A ação discute aspectos do FUNDEB, especificamente os valores equivocados de cotas por aluno que foram fixados pela União e o montante da complementação de recursos repassados desde a sua criação em 2007.</p>
    <p>Desde a criação do FUNDEB a complementação dos recursos a cargo da União, conforme artigo 4º da Lei nº 11.494/2007, vem sendo realizada de forma equivocada em grave prejuízo à educação do Município.</p>
    <p>Nesse contexto, a falta de complementação da União nos valores propostos pela CF/88 trouxe danos a várias comunidades, com reflexo principalmente para suas crianças e adolescentes que são, em última análise, a própria sociedade brasileira em construção.</p>
    <p>Isso porque, a falta de recursos conforme determina a Lei no setor da educação gera desigualdades sociais, atraso no desenvolvimento do país, ignorância e favorece a marginalização das pessoas. O clichê da educação ser a única solução para um país, ao que parece, não ecoou para a União.</p>
    <p>Nesse sentido, existe a necessidade de se reaver os valores repassados à menor pela União Federal, sendo condenada a pagar a diferença do valor anual mínimo por aluno nacionalmente definido para as séries iniciais do ensino fundamental urbano e para todas as demais categorias estudantis a ela atreladas pelas ponderações legais, relativos aos últimos cinco anos, respeitando-se a prescrição quinquenal, e por todos os anos em que persistir e repercutir a ilegalidade, a ser apurado em sede de liquidação de sentença, caso a parte contrária não apresente os dados consolidados.</p>
  `,
  energiaEletrica: `
    <p>A execução de serviços técnicos especializados de auditoria e consultoria energética.</p>
    <p>Os serviços propostos são consistentes no levantamento de dados, preparação, 
encaminhamento e acompanhamento da recuperação financeira dos valores pagos ou 
cobrados indevidamente à Concessionária/Distribuidora de energia elétrica do 
Estado.</p>
    <p>Com a realização da auditoria e demais serviços técnicos especializados, o município, 
por intermédio da Proponente, e, ainda, através de pleitos administrativos ou judiciais:</p>
    <p>a) Promoverá a revisão de toda classificação dos lançamentos das cobranças nas 
faturas de energia elétrica;</p>
    <p>b) Identificará as falhas na classificação tarifária;</p>
    <p>c) Apurará os valores realmente devidos a título de consumo de energia elétrica;</p>
    <p>d) Recuperará os valores atinente aos indébitos identificados;</p>
    <p>e) Reduzirá o valor das faturas futuras de energia elétrica;</p>
    <p>f) Estabelecerá os mecanismos de auditoria permanente, de forma a não sofrer 
mais qualquer tipo de lenão ao seu direito de consumidor de energia elétrica;</p>
    <p>g) Elaborará estudos e levantamentos para propor o incremento na arrecadação 
da CIP/COSIP;</p>
    <p>h) Auditará o lançamento e arrecadação da CIP/COSIP - Contribuição para 
Custeio da Iluminação Pública de forma a coibir a Distribuidora de 
lançamentos errados e consequentemente arrecadação e repasse com erro, 
analisará a lei municipal de criação do referido tributo e fará propostas de 
mudanças com uma tributação justa e suficiente para custear todas as despesas 
com iluminação pública;</p>
    <p>i) Verificação de todos os tributos devidos e relacionados as operações de 
energia elétrica da Distribuidora do Estado com relação ao município.</p>
  `,
  royaltiesOleoGas: `
    <p>Os Royalties são uma compensação financeira devida pelas empresas que exploram petróleo e gás natural em território nacional, destinada aos Estados e Municípios produtores ou afetados pela atividade.</p>
    <p>A tese que se apresenta tem por objetivo ajuizar as competentes ações judiciais visando o recálculo dos valores pagos a título de Royalties, com base na legislação vigente, para que os Municípios recebam os valores corretos que lhes são devidos, bem como a recuperação dos valores pagos a menor nos últimos 05 (cinco) anos.</p>
  `,
  repassesFPM: `
    <p>Análise dos repasses do Fundo de Participação dos Municípios (FPM) com o objetivo de verificar a correta base de cálculo utilizada pela União, especificamente no que tange à exclusão de incentivos fiscais (IPI e IR) da base de cálculo.</p>
    <p>O FPM é um fundo constitucional composto por percentuais da arrecadação do Imposto de Renda (IR) e do Imposto sobre Produtos Industrializados (IPI). Ocorre que a União, ao conceder benefícios e incentivos fiscais, reduz artificialmente a base de cálculo do FPM, repassando valores a menor aos Municípios.</p>
    <p>A tese consiste na recuperação judicial dos valores que deixaram de ser repassados ao Município em decorrência da dedução desses incentivos fiscais da base de cálculo do FPM.</p>
  `,
  revisaoParcelamento: `
    <p>Auditoria e revisão dos parcelamentos previdenciários firmados entre o Município e a Receita Federal do Brasil, com o objetivo de identificar a aplicação de juros e multas ilegais ou inconstitucionais.</p>
    <p>Muitos parcelamentos contêm encargos abusivos, como a aplicação da taxa SELIC de forma capitalizada, multas em percentuais confiscatórios e a incidência de juros sobre multas.</p>
    <p>A tese consiste na revisão judicial desses contratos de parcelamento para expurgar as ilegalidades, recalcular o saldo devedor e, se for o caso, reaver valores pagos indevidamente.</p>
  `,
  issqn: `
    <p>Recuperação de créditos de ISSQN (Imposto Sobre Serviços de Qualquer Natureza) não repassados ou repassados a menor ao Município, especialmente de instituições financeiras (bancos), operadoras de cartão de crédito, planos de saúde e empresas de leasing.</p>
    <p>Muitas dessas empresas possuem complexas estruturas operacionais e, por vezes, declaram o ISSQN em domicílios fiscais diversos, em vez do local onde o serviço é efetivamente prestado, causando prejuízo à arrecadação municipal.</p>
    <p>A tese consiste na atuação junto a essas instituições para garantir o correto recolhimento do ISSQN em favor do Município, bem como a recuperação dos valores não pagos nos últimos 05 (cinco) anos.</p>
  `,
  servicosTecnicos: `
    <p>O desenvolvimento de todos os atos necessários, administrativos e judiciais, em qualquer instância, serviços técnicos especializados de assessoria e consultoria jurídica na área de Direito Financeiro, Econômico, Administrativo e Tributário perante os Tribunais Superiores no Distrito Federal.</p>
    <p>Atuação em processos estratégicos de interesse do Município que tramitam em Brasília-DF, perante o Supremo Tribunal Federal (STF), Superior Tribunal de Justiça (STJ), Tribunal de Contas da União (TCU) e demais órgãos federais, garantindo um acompanhamento processual célere e especializado.</p>
  `,
  demaisTeses: `
    <p>Demais teses consiste na prestação de serviços de assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico, Financeiro, previdenciário e Minerário, atuando perante o Ministério da Fazenda e os seus órgãos administrativos.</p>
  `,
};

interface ProposalGeneratorProps {
  onBackToHome: () => void;
  onLogout: () => void;
}

const ControlsSidebar = ({
  options,
  setOptions,
  prazo,
  setPrazo,
  services,
  setServices,
  customCabimentos,
  setCustomCabimentos,
  customEstimates,
  setCustomEstimates,
  rppsImage,
  setRppsImage,
  footerOffices,
  setFooterOffices,
  paymentValue,
  setPaymentValue,
  savedProposals,
  onLoadProposal,
  onDeleteProposal,
  onStartFromScratch,
  onImportDocx,
  onSaveProposal,
  onDownloadDocx,
  onDownloadPdf,
  loadingPdf,
  loadingDocx,
}: any) => {

  const handleServiceChange = (serviceName: string) => {
    setServices((prev: any) => ({ ...prev, [serviceName]: !prev[serviceName] }));
  };

  const handleCabimentoChange = (serviceName: string, value: string) => {
    setCustomCabimentos((prev: any) => ({ ...prev, [serviceName]: value }));
  };

  const handleEstimateChange = (serviceName: string, value: string) => {
    setCustomEstimates((prev: any) => ({ ...prev, [serviceName]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRppsImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOptions((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header" style={{ marginBottom: '24px' }}>
        <Settings size={24} color="#227056" />
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#227056' }}>Personalizar Proposta</h2>
      </div>

      <div className="start-buttons">
        <button onClick={onStartFromScratch} className="btn primary" style={{ width: '100%' }}>
          <RefreshCw size={18} /> Começar do Zero
        </button>
        <button onClick={() => document.getElementById("import-docx-input")?.click()} className="btn secondary" style={{ width: '100%' }}>
          <FileText size={18} /> Importar .docx Modelo
        </button>
        <input id="import-docx-input" type="file" accept=".docx" style={{ display: "none" }} onChange={(e) => { const file = e.target.files?.[0]; if (file) onImportDocx(file); }} />
      </div>

      <div className="field">
        <label>Município Destinatário</label>
        <input name="municipio" value={options.municipio} onChange={handleOptionChange} placeholder="Nome do Município" style={{ borderRadius: '8px', border: '1px solid #ccc' }} />
      </div>

      <div className="field">
        <label>Data da Proposta</label>
        <input name="data" value={options.data} onChange={handleOptionChange} placeholder="Ex: 18 de dezembro de 2025" style={{ borderRadius: '8px', border: '1px solid #ccc' }} />
      </div>

      <div className="field">
        <label>Prazo de Execução (meses)</label>
        <input name="prazo" value={prazo} onChange={(e) => setPrazo(e.target.value)} placeholder="24" style={{ borderRadius: '8px', border: '1px solid #ccc' }} />
      </div>

      <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #eee' }} />

      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Serviços (Seções)</h3>
      <div className="start-buttons" style={{ flexDirection: 'row', gap: '8px', marginBottom: '16px' }}>
        <button className="btn-small load" style={{ flex: 1, padding: '8px' }} onClick={() => setServices(Object.keys(allServices).reduce((acc: any, key) => { acc[key] = true; return acc; }, {}))}>Selecionar Todos</button>
        <button className="btn-small delete" style={{ flex: 1, padding: '8px', background: '#f5f5f5', color: '#666', border: '1px solid #ddd' }} onClick={() => setServices(Object.keys(allServices).reduce((acc: any, key) => { acc[key] = false; return acc; }, {}))}>Desmarcar</button>
      </div>

      <div className="services" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
        {Object.entries(allServices).map(([key, label]) => (
          <div key={key} style={{ marginBottom: "10px", padding: '8px', borderRadius: '6px', border: '1px solid #f0f0f0', background: services[key] ? '#f9fbf9' : 'transparent' }}>
            <label className="service-item" style={{ margin: 0, fontWeight: services[key] ? '600' : '400' }}>
              <input type="checkbox" checked={!!services[key]} onChange={() => handleServiceChange(key)} style={{ accentColor: '#227056' }} />
              <span style={{ fontSize: '13px' }}>{label}</span>
            </label>
            {services[key] && (
              <div style={{ marginLeft: "28px", marginTop: "8px" }}>
                <input
                  type="text"
                  value={customCabimentos[key] || ""}
                  onChange={(e) => handleCabimentoChange(key, e.target.value)}
                  placeholder="Cabimento/Perspectiva"
                  style={{ width: "100%", padding: "8px 10px", fontSize: "12px", border: "1px solid #ddd", borderRadius: "6px", background: 'white' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #eee' }} />

      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Informações do Rodapé</h3>
      <div className="services" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {(['rj', 'df', 'sp', 'am'] as const).map(loc => (
          <label key={loc} className="service-item" style={{ fontSize: '12px', border: '1px solid #eee', padding: '6px', borderRadius: '6px' }}>
            <input type="checkbox" checked={footerOffices[loc].enabled} onChange={() => setFooterOffices({ ...footerOffices, [loc]: { ...footerOffices[loc], enabled: !footerOffices[loc].enabled } })} style={{ accentColor: '#227056' }} />
            <span>{loc.toUpperCase()}</span>
          </label>
        ))}
      </div>

      <div className="field" style={{ marginTop: '20px' }}>
        <label>Valor do Pagamento</label>
        <input type="text" value={paymentValue} onChange={(e) => setPaymentValue(e.target.value)} placeholder="Ex: R$ 0,20 (vinte centavos)" style={{ borderRadius: '8px', border: '1px solid #ccc' }} />
      </div>

      <div className="actions" style={{ marginTop: '30px' }}>
        <button className="btn primary" onClick={onSaveProposal} style={{ width: '100%', padding: '14px' }}>
          <Save size={18} /> Salvar Proposta
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn secondary" style={{ flex: 1, fontSize: '13px' }} onClick={onDownloadDocx} disabled={loadingDocx}>
            {loadingDocx ? "Gerando..." : <><Download size={18} /> .docx</>}
          </button>
          <button className="btn secondary" style={{ flex: 1, fontSize: '13px' }} onClick={onDownloadPdf} disabled={loadingPdf}>
            {loadingPdf ? "Gerando..." : <><Download size={18} /> PDF</>}
          </button>
        </div>
      </div>

      <div className="saved-proposals">
        <h3>Propostas Salvas</h3>
        <div className="proposals-list">
          {savedProposals.length === 0 ? <p style={{ fontSize: '13px', color: '#999' }}>Nenhuma proposta salva.</p> :
            savedProposals.map((p: any) => (
              <div key={p.id} className="proposal-item">
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{p.municipio || "Sem nome"}</div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{p.data}</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => onLoadProposal(p)} className="btn-small load">Carregar</button>
                  <button onClick={() => onDeleteProposal(p.id)} className="btn-small delete">Excluir</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </aside>
  );
};

const ProposalDocument = ({ options, prazo, services, customCabimentos, customEstimates, rppsImage, footerOffices, paymentValue }: any) => {
  const FooterComp = () => {
    const enabledOffices = [];
    if (footerOffices.rj.enabled) enabledOffices.push(footerOffices.rj);
    if (footerOffices.df.enabled) enabledOffices.push(footerOffices.df);
    if (footerOffices.sp.enabled) enabledOffices.push(footerOffices.sp);
    if (footerOffices.am.enabled) enabledOffices.push(footerOffices.am);

    return (
      <div className="page-footer-container" style={{ marginTop: 'auto', paddingTop: '20px' }}>
        <div className="regua-decorativa" style={{ height: '1px', background: '#ccc', marginBottom: '15px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${enabledOffices.length}, 1fr)`, gap: '15px', textAlign: 'center', fontSize: '8px', color: '#555', lineHeight: '1.3' }}>
          {enabledOffices.map((off, i) => (
            <div key={i}>
              <div style={{ fontWeight: 'bold', color: '#000', marginBottom: '2px', textTransform: 'uppercase' }}>{off.cidade.split(' - ')[0]}</div>
              <div>{off.linha1}</div>
              <div>{off.linha2}</div>
              <div>{off.linha3}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '9px', letterSpacing: '2px', fontWeight: 'bold', color: '#227056', textTransform: 'uppercase' }}>
          www.cavalcantereis.adv.br
        </div>
      </div>
    );
  };

  const Page = ({ children, pageNumber, isCover = false, FooterComponent }: any) => (
    <div className="pdf-page-render" data-page={pageNumber} style={{
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      margin: '0 auto 30px',
      background: 'white',
      padding: '20mm 20mm 15mm 25mm'
    }}>
      {!isCover && (
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <img src="/logo-cavalcante-reis.png" alt="Logo" style={{ width: '130px' }} />
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
      <div style={{ marginTop: '20px' }}>
        <FooterComponent />
      </div>
      {pageNumber && (
        <div style={{
          position: 'absolute',
          bottom: '10mm',
          right: '15mm',
          fontSize: '10px',
          fontWeight: 'bold',
          color: '#333',
          borderTop: '1px solid #eee',
          paddingTop: '5px'
        }}>
          Página | {pageNumber}
        </div>
      )}
    </div>
  );

  const activeServices = Object.keys(services).filter(k => services[k]);

  return (
    <div id="preview" className="preview" style={{ fontFamily: "'EB Garamond', serif" }}>
      <Page isCover={true} FooterComponent={FooterComp} data-page={1}>
        <div style={{ textAlign: "center", marginTop: '60px' }}>
          <img src="/logo-cavalcante-reis.png" alt="Logo" style={{ width: "200px" }} />
        </div>
        <div style={{ marginTop: '120px', textAlign: "right", borderRight: '4px solid #227056', paddingRight: '25px', maxWidth: '80%', marginLeft: 'auto' }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Proponente:</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#227056' }}>Cavalcante Reis Advogados</p>

          <p style={{ fontSize: '14px', color: '#666', marginTop: '30px', marginBottom: '5px' }}>Destinatário:</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>Prefeitura Municipal de {options.municipio || "[Nome do Município]"}</p>

          <div style={{ marginTop: '60px' }}>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#227056' }}>{options.data || "2025"}</p>
          </div>
        </div>
      </Page>

      <Page pageNumber={2} FooterComponent={FooterComp}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#227056', borderBottom: '2px solid #227056', paddingBottom: '10px', marginBottom: '40px', textAlign: 'center' }}>SUMÁRIO</h2>
        <div style={{ lineHeight: '3', fontSize: '15px', maxWidth: '85%', margin: '0 auto' }}>
          {[
            { t: "1. Objeto da Proposta", p: 3 },
            { t: "2. Análise da Questão", p: 4 },
            { t: "3. Dos Honorários e Condições", p: 4 + activeServices.length },
            { t: "4. Prazo e Cronograma de Execução", p: 4 + activeServices.length },
            { t: "5. Experiência e Equipe Responsável", p: 5 + activeServices.length },
            { t: "6. Disposições Finais", p: 6 + activeServices.length }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <strong style={{ whiteSpace: 'nowrap' }}>{item.t}</strong>
              <div style={{ flex: 1, borderBottom: '1px dotted #aaa', height: '1px' }}></div>
              <span style={{ fontWeight: 'bold', color: '#227056' }}>Pág. {String(item.p).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </Page>

      <Page pageNumber={3} FooterComponent={FooterComp}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#227056', borderBottom: '2px solid #227056', paddingBottom: '8px', marginBottom: '20px' }}>1. Objeto da Proposta</h2>
        <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' }}>
          É objeto da presente proposta o desenvolvimento de serviços advocatícios especializados por parte da Proponente ao Aceitante, Município de <strong>{options.municipio || "[MUNICÍPIO]"}</strong>, visando a prestação de assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico, Financeiro e Previdenciário.
        </p>
        <table className="proposal-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #227056' }}>
          <thead>
            <tr style={{ background: '#f0f7f4' }}>
              <th style={{ border: '1px solid #227056', padding: '10px', fontSize: '12px', color: '#227056' }}>TESE / SERVIÇO</th>
              <th style={{ border: '1px solid #227056', padding: '10px', fontSize: '12px', color: '#227056', textAlign: 'center' }}>CABIMENTO</th>
            </tr>
          </thead>
          <tbody>
            {activeServices.map(k => (
              <tr key={k}>
                <td style={{ border: '1px solid #227056', padding: '8px', fontSize: '11px' }}><strong>{allServices[k]}</strong></td>
                <td style={{ border: '1px solid #227056', padding: '8px', fontSize: '11px', textAlign: 'center' }}>{customCabimentos[k] || "Cabível"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Page>

      {activeServices.map((k, i) => (
        <Page key={k} pageNumber={4 + i} FooterComponent={FooterComp}>
          {i === 0 && <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#227056', borderBottom: '2px solid #227056', paddingBottom: '8px', marginBottom: '25px' }}>2. Análise da Questão</h2>}
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#227056', marginBottom: '15px', background: '#f9f9f9', padding: '8px', borderLeft: '4px solid #227056' }}>
            2.{i + 1} – {allServices[k]}
          </h3>
          <div style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '1.6', color: '#333' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(serviceTextDatabase[k] || "") }} />
        </Page>
      ))}

      <Page pageNumber={4 + activeServices.length} FooterComponent={FooterComp}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#227056', borderBottom: '2px solid #227056', paddingBottom: '8px', marginBottom: '20px' }}>3. Honorários e Condições de Pagamento</h2>
        <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '1.6' }}>
          Pelos serviços prestados, o Município pagará à Proponente, a título de honorários ad exitum, o valor de <strong>{paymentValue}</strong> por cada economia efetivamente recuperada ou compensada.
        </p>

        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#227056', borderBottom: '2px solid #227056', paddingBottom: '8px', marginTop: '40px', marginBottom: '20px' }}>4. Prazo e Cronograma de Execução</h2>
        <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '1.6' }}>
          O prazo estimado para a execução total dos serviços objeto desta proposta é de <strong>{prazo} meses</strong>, contados a partir da assinatura do contrato.
        </p>
      </Page>

      <Page pageNumber={5 + activeServices.length} FooterComponent={FooterComp}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#227056', borderBottom: '2px solid #227056', paddingBottom: '8px', marginBottom: '30px' }}>5. Experiência e Equipe Responsável</h2>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
            <img src="/munincipios01.png" style={{ width: '100%', height: 'auto' }} alt="Experiência 1" />
          </div>
          <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
            <img src="/Munincipios02.png" style={{ width: '100%', height: 'auto' }} alt="Experiência 2" />
          </div>
        </div>
      </Page>

      <Page pageNumber={6 + activeServices.length} FooterComponent={FooterComp}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#227056', borderBottom: '2px solid #227056', paddingBottom: '8px', marginBottom: '40px' }}>6. Disposições Finais</h2>
        <p style={{ textAlign: 'center', fontSize: '14px', marginBottom: '60px' }}>Brasília-DF, {options.data || new Date().toLocaleDateString('pt-BR')}.</p>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '14px', marginBottom: '10px' }}>Atenciosamente,</p>
          <img src="/Assinatura.png" style={{ width: '180px', margin: '10px auto' }} alt="Assinatura" />
          <h3 style={{ fontWeight: 'bold', color: '#227056', fontSize: '16px', marginTop: '10px' }}>CAVALCANTE REIS ADVOGADOS</h3>
        </div>
      </Page>
    </div>
  );
};

export default function ProposalGenerator({ onBackToHome, onLogout }: ProposalGeneratorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [options, setOptions] = useState({ municipio: "", destinatario: "", data: "" });
  const [prazo, setPrazo] = useState("24");
  const [services, setServices] = useState<any>({});
  const [customCabimentos, setCustomCabimentos] = useState<any>({});
  const [customEstimates, setCustomEstimates] = useState<any>({});
  const [footerOffices, setFooterOffices] = useState<any>({
    rj: { enabled: true, cidade: "Rio de Janeiro - RJ", linha1: "AV. DAS AMÉRICAS, 3434 - BL 04", linha2: "Sala, 207 Barra Da Tijuca,", linha3: "CEP: 22640-102" },
    df: { enabled: true, cidade: "Brasília - DF", linha1: "SHIS QL 10, Conj. 06, Casa 19", linha2: "Lago Sul,", linha3: "CEP: 71630-065" },
    sp: { enabled: true, cidade: "São Paulo - SP", linha1: "Rua Fidêncio Ramos, 223,", linha2: "Cobertura, Vila Olimpia,", linha3: "CEP: 04551-010" },
    am: { enabled: true, cidade: "Manaus - AM", linha1: "Rua Silva Ramos, 78 - Centro", linha2: "Manaus, AM", linha3: "CEP: 69010-180" }
  });
  const [rppsImage, setRppsImage] = useState<string | null>(null);
  const [paymentValue, setPaymentValue] = useState("R$ 0,20 (vinte centavos)");
  const [savedProposals, setSavedProposals] = useState<any[]>([]);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingDocx, setLoadingDocx] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState<any>({ open: false, title: "", message: "", type: "info" });

  useEffect(() => {
    // Simular loading inicial
    setTimeout(() => setIsLoading(false), 800);

    // Carregar propostas salvas
    const saved = localStorage.getItem("savedPropostas");
    if (saved) setSavedProposals(JSON.parse(saved));
  }, []);

  const handleSaveProposal = () => {
    const newProp = { id: Date.now(), municipio: options.municipio, data: options.data, services, customCabimentos, createdAt: new Date().toISOString() };
    const updated = [...savedProposals, newProp];
    setSavedProposals(updated);
    localStorage.setItem("savedPropostas", JSON.stringify(updated));
    setModal({ open: true, title: "Sucesso", message: "Proposta salva localmente!", type: "success" });
  };

  const handleDownloadPdf = async () => {
    setLoadingPdf(true);
    const container = document.getElementById("preview");
    if (!container) return;
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pages = container.querySelectorAll('.pdf-page-render');
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();
        const canvas = await html2canvas(pages[i] as HTMLElement, { scale: 2 });
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 297);
      }
      pdf.save(`Proposta_${options.municipio || "CR"}.pdf`);
    } catch (e) {
      console.error(e);
    }
    setLoadingPdf(false);
  };

  const handleDownloadDocx = async () => {
    setLoadingDocx(true);
    try {
      const payload = {
        municipio: options.municipio,
        data: options.data,
        prazo,
        paymentValue,
        services: Object.keys(services).filter(k => services[k]).map(k => ({
          label: allServices[k],
          content: serviceTextDatabase[k],
          cabimento: customCabimentos[k] || "Cabível"
        })),
        footerOffices
      };
      const response = await fetch("http://localhost:3001/documents/generate-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const blob = await response.blob();
      saveAs(blob, `Proposta_${options.municipio || "CR"}.docx`);
    } catch (e) {
      console.error(e);
      setModal({ open: true, title: "Erro", message: "Erro ao conectar com o backend.", type: "error" });
    }
    setLoadingDocx(false);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando Gerador de Propostas...</p>
      </div>
    );
  }

  return (
    <div className="app light">
      <header className="header">
        <div className="left">
          <button onClick={onBackToHome} className="btn secondary" style={{ padding: '8px 12px' }}>
            <ArrowLeft size={18} /> Voltar para Home
          </button>
          <h1>Gerador de Propostas</h1>
        </div>
        <button onClick={onLogout} className="theme-btn" title="Sair">
          <LogOut size={20} color="#227056" />
        </button>
      </header>

      <main className="main">
        <div className="desktop-layout">
          <ControlsSidebar
            options={options} setOptions={setOptions}
            prazo={prazo} setPrazo={setPrazo}
            services={services} setServices={setServices}
            customCabimentos={customCabimentos} setCustomCabimentos={setCustomCabimentos}
            customEstimates={customEstimates} setCustomEstimates={setCustomEstimates}
            rppsImage={rppsImage} setRppsImage={setRppsImage}
            footerOffices={footerOffices} setFooterOffices={setFooterOffices}
            paymentValue={paymentValue} setPaymentValue={setPaymentValue}
            savedProposals={savedProposals}
            onLoadProposal={(p: any) => { setOptions({ municipio: p.municipio, data: p.data, destinatario: "" }); setServices(p.services); setCustomCabimentos(p.customCabimentos || {}); }}
            onDeleteProposal={(id: any) => { const up = savedProposals.filter(x => x.id !== id); setSavedProposals(up); localStorage.setItem("savedPropostas", JSON.stringify(up)); }}
            onStartFromScratch={() => { setOptions({ municipio: "", data: "", destinatario: "" }); setServices({}); }}
            onImportDocx={() => alert("Função em desenvolvimento para a nova arquitetura")}
            onSaveProposal={handleSaveProposal}
            onDownloadDocx={handleDownloadDocx}
            onDownloadPdf={handleDownloadPdf}
            loadingPdf={loadingPdf}
            loadingDocx={loadingDocx}
          />
          <div className="content">
            <h2 className="preview-title">Prévia da Proposta</h2>
            <ProposalDocument
              options={options} prazo={prazo} services={services}
              customCabimentos={customCabimentos} customEstimates={customEstimates}
              rppsImage={rppsImage} footerOffices={footerOffices} paymentValue={paymentValue}
            />
          </div>
        </div>

        <div className="mobile-layout">
          <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
            Acesse pelo computador para uma melhor experiência de edição.
          </div>
        </div>

        <Modal {...modal} onConfirm={() => setModal({ ...modal, open: false })} />
      </main>
    </div>
  );
}
