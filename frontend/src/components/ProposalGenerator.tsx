'use client';

// ========== IMPORTS ==========
import React, { useState, useMemo, useEffect, useRef } from "react";
import Modal from "./Modal";
import DOMPurify from "dompurify"; // Biblioteca para sanitizar HTML e prevenir XSS
import { Settings, FileText, Eye, X, ArrowLeft, LogOut, Download, Save, RefreshCw } from "lucide-react"; // Ícones
import { saveAs } from "file-saver"; // Biblioteca para fazer download de arquivos
import { jsPDF } from "jspdf"; // Biblioteca para gerar PDF
import html2canvas from "html2canvas"; // Biblioteca para converter HTML em canvas/imagem
// ========== IMPORTS: BIBLIOTECA DOCX ==========
import { Document, Packer, Paragraph, TextRun, ImageRun, Header, Footer, AlignmentType, PageBreak, Table, TableRow, TableCell, WidthType, HeadingLevel, Spacing, SectionType } from "docx";
import { parseHtmlToDocx, createSimpleParagraph, createMixedParagraph } from "../lib/docxHelper"; // Helper para conversão HTML -> docx
import { propostasApi, Proposta } from "../lib/api"; // API para salvar/carregar propostas no backend

// ========== CONSTANTES: LISTA DE SERVIÇOS DISPONÍVEIS ==========
// Dicionário com todos os serviços/teses que podem ser incluídos na proposta
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

// ========== BASE DE DADOS: TEXTO DE CADA SERVIÇO ==========
// Contém o texto completo/descrição detalhada de cada serviço que aparece na seção "Análise da Questão"
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

// ========== INTERFACE: TIPOS DO COMPONENTE PRINCIPAL ==========
interface ProposalGeneratorProps {
  onBackToHome: () => void; // Função para voltar para a página inicial
  onLogout: () => void; // Função para fazer logout
  propostaToLoad?: string | null; // ID da proposta para carregar automaticamente (opcional)
}

// ========== COMPONENTE: BARRA LATERAL DE CONTROLES ==========
// Sidebar com todos os campos de entrada e controles para personalizar a proposta
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
  retentionPeriod,
  setRetentionPeriod,
  savedProposals,
  onLoadProposal,
  onDeleteProposal,
  onStartFromScratch,
  onImportDocx,
  onSaveProposal,
  onDownloadDocx,
  loadingDocx,
  loadingProposals,
}: any) => {
  // ========== HANDLERS: FUNÇÕES DE CONTROLE ==========

  // Alterna seleção de um serviço (marca/desmarca checkbox)
  const handleServiceChange = (serviceName: string) => {
    setServices((prev: any) => ({ ...prev, [serviceName]: !prev[serviceName] }));
  };

  // Atualiza o texto de "Cabimento" personalizado de um serviço
  const handleCabimentoChange = (serviceName: string, value: string) => {
    setCustomCabimentos((prev: any) => ({ ...prev, [serviceName]: value }));
  };

  // Atualiza o valor estimado de recuperação de um serviço (não usado no momento)
  const handleEstimateChange = (serviceName: string, value: string) => {
    setCustomEstimates((prev: any) => ({ ...prev, [serviceName]: value }));
  };

  // Faz upload de uma imagem para substituir imagens do RPPS (não usado no momento)
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

  // Atualiza campos de opções gerais (município, destinatário, data)
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Se o município for alterado, atualiza também o destinatário
    if (name === 'municipio') {
      setOptions((prev: any) => ({ ...prev, [name]: value, destinatario: value }));
    } else {
      setOptions((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  // ========== RENDERIZAÇÃO: BARRA LATERAL ==========
  return (
    <aside className="sidebar">
      {/* Cabeçalho da sidebar */}
      <div className="sidebar-header" style={{ marginBottom: '24px' }}>
        <Settings size={24} color="#227056" />
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#227056' }}>Personalizar Proposta</h2>
      </div>

      {/* Botões de ação inicial (Começar do Zero, Importar .docx) */}
      <div className="start-buttons">
        <button onClick={onStartFromScratch} className="btn primary" style={{ width: '100%' }}>
          <RefreshCw size={18} /> Começar do Zero
        </button>
        <button onClick={() => document.getElementById("import-docx-input")?.click()} className="btn secondary" style={{ width: '100%' }}>
          <FileText size={18} /> Importar .docx Modelo
        </button>
        <input id="import-docx-input" type="file" accept=".docx" style={{ display: "none" }} onChange={(e) => { const file = e.target.files?.[0]; if (file) onImportDocx(file); }} />
      </div>

      {/* Campos de entrada: Informações básicas da proposta */}
      <div className="field">
        <label>Município</label>
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

      {/* Seção: Lista de serviços/teses para incluir na proposta */}
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

      {/* Seção: Configuração dos escritórios no rodapé (RJ, DF, SP, AM) */}
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
        <input type="text" value={paymentValue} onChange={(e) => setPaymentValue(e.target.value)} placeholder="Ex: R$ 0,12 (doze centavos)" style={{ borderRadius: '8px', border: '1px solid #ccc' }} />
      </div>

      <div className="field" style={{ marginTop: '16px' }}>
        <label>Período de Retenção (Opcional)</label>
        <select
          value={retentionPeriod}
          onChange={(e) => setRetentionPeriod(Number(e.target.value))}
          style={{ borderRadius: '8px', border: '1px solid #ccc', padding: '8px', width: '100%', fontSize: '14px' }}
        >
          <option value={15}>15 dias (teste rápido)</option>
          <option value={30}>1 mês</option>
          <option value={90}>3 meses</option>
          <option value={180}>6 meses</option>
          <option value={365}>1 ano (padrão)</option>
          <option value={730}>2 anos</option>
        </select>
        <p style={{ fontSize: '11px', color: '#666', marginTop: '4px', marginBottom: '0' }}>
          Tempo que a proposta ficará salva no servidor. Se não escolher, será 1 ano.
        </p>
      </div>

      {/* Seção: Botões de ação (Salvar, Baixar DOCX) */}
      <div className="actions" style={{ marginTop: '30px' }}>
        <button className="btn primary" onClick={onSaveProposal} style={{ width: '100%', padding: '14px' }} disabled={loadingProposals}>
          {loadingProposals ? "Salvando..." : <><Save size={18} /> Salvar Proposta</>}
        </button>
        <button className="btn secondary" style={{ width: '100%', padding: '14px' }} onClick={onDownloadDocx} disabled={loadingDocx}>
          {loadingDocx ? "Gerando..." : <><Download size={18} /> Docs</>}
        </button>
      </div>

    </aside>
  );
};

// ========== COMPONENTE: DOCUMENTO DA PROPOSTA ==========
// Componente que renderiza a prévia visual completa da proposta
const ProposalDocument = ({ options, prazo, services, customCabimentos, customEstimates, rppsImage, footerOffices, paymentValue }: any) => {
  // ========== FUNÇÃO: FORMATAR DATA COM NOME DO MÊS ==========
  // Converte a data para o formato "DD de mês de YYYY" (ex: "14 de agosto de 2025")
  const formatDateWithMonthName = (dateStr: string): string => {
    if (!dateStr) {
      const today = new Date();
      const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      return `${today.getDate()} de ${months[today.getMonth()]} de ${today.getFullYear()}`;
    }

    // Se já estiver no formato "DD de mês de YYYY", retorna como está
    if (dateStr.match(/\d{1,2}\s+de\s+\w+\s+de\s+\d{4}/)) {
      return dateStr;
    }

    // Tenta extrair data no formato DD/MM/YYYY ou DD.MM.YYYY
    const dateMatch = dateStr.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]);
      const year = dateMatch[3];
      const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      if (month >= 1 && month <= 12) {
        return `${day} de ${months[month - 1]} de ${year}`;
      }
    }

    // Se não conseguir converter, retorna a data original
    return dateStr;
  };

  // ========== FUNÇÃO: FORMATAR DATA APENAS COM NÚMEROS ==========
  // Converte a data para o formato "DD/MM/YYYY" (ex: "15/10/2026")
  const formatDateNumeric = (dateStr: string): string => {
    if (!dateStr) {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // Se já estiver no formato DD/MM/YYYY ou DD.MM.YYYY, normaliza para DD/MM/YYYY
    const dateMatch = dateStr.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, '0');
      const month = dateMatch[2].padStart(2, '0');
      const year = dateMatch[3];
      return `${day}/${month}/${year}`;
    }

    // Se estiver no formato "DD de mês de YYYY", converte para DD/MM/YYYY
    const dateMatch2 = dateStr.match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/);
    if (dateMatch2) {
      const day = dateMatch2[1].padStart(2, '0');
      const months: Record<string, string> = {
        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
        'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
        'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
      };
      const month = months[dateMatch2[2].toLowerCase()] || '01';
      const year = dateMatch2[3];
      return `${day}/${month}/${year}`;
    }

    // Se não conseguir converter, retorna a data original
    return dateStr;
  };

  // ========== COMPONENTE INTERNO: RODAPÉ ==========
  // Componente que renderiza o rodapé de cada página com endereços dos escritórios
  const FooterComp = () => {
    const enabledOffices = [];
    if (footerOffices.rj.enabled) enabledOffices.push(footerOffices.rj);
    if (footerOffices.df.enabled) enabledOffices.push(footerOffices.df);
    if (footerOffices.sp.enabled) enabledOffices.push(footerOffices.sp);
    if (footerOffices.am.enabled) enabledOffices.push(footerOffices.am);

    return (
      <div className="page-footer-container" style={{ marginTop: 'auto', paddingTop: '20px', width: '100%' }}>
        {/* Container com flexbox para escritórios lado a lado */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'flex-start',
          gap: '15px',
          textAlign: 'center',
          fontSize: '10px',
          color: '#000',
          lineHeight: '1.1',
          fontFamily: "'Garamond', serif",
          marginBottom: '10px',
          flexWrap: 'wrap'
        }}>
          {enabledOffices.length > 0 ? enabledOffices.map((off: any, i: number) => (
            <div key={i} style={{
              flex: '1',
              minWidth: '150px',
              maxWidth: '200px',
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}>
              <div style={{ fontWeight: 'bold', color: '#000', marginBottom: '1px', textTransform: 'uppercase', fontSize: '9px' }}>{off.cidade}</div>
              <div style={{ fontSize: '9.9px' }}>{off.linha1}</div>
              <div style={{ fontSize: '10px' }}>{off.linha2}</div>
              <div style={{ fontSize: '10px' }}>{off.linha3}</div>
            </div>
          )) : (
            <div style={{ flex: '1', minWidth: '150px', maxWidth: '200px' }}>
              <div style={{ fontWeight: 'bold', color: '#000', marginBottom: '1px', textTransform: 'uppercase', fontSize: '9px' }}>Brasília - DF</div>
              <div style={{ fontSize: '10px' }}>SHIS QL 10, Conj. 06, Casa 19</div>
              <div style={{ fontSize: '10px' }}>Lago Sul,</div>
              <div style={{ fontSize: '10px' }}>CEP: 71630-065</div>
            </div>
          )}
        </div>
        {/* Linha horizontal e Site em caixa com bordas arredondadas */}
        <div style={{ textAlign: 'center', marginTop: '5px', width: '100%' }}>
          <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #d0d0d0', marginBottom: '5px' }} />
          <div style={{
            display: 'inline-block',
            padding: '2px 8px',
            border: '1px solid #d0d0d0',
            borderRadius: '4px',
            backgroundColor: '#ffffff',
            fontSize: '10px',
            fontWeight: 'normal',
            color: '#000000',
            fontFamily: "'Garamond', serif",
            letterSpacing: '1px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}>
            WWW.CAVALCANTE-REIS.ADV.BR
          </div>
        </div>
      </div>
    );
  };

  // ========== COMPONENTE INTERNO: PÁGINA ==========
  // Componente wrapper que cria uma página A4 com margens, logo (se não for capa) e rodapé
  const Page = ({ children, pageNumber, isCover = false, FooterComponent }: any) => {
    // Padding diferente para capa vs páginas internas
    const padding = isCover ? '20mm 20mm 20mm 20mm' : '20mm 20mm 20mm 25mm';

    return (
      <div className="pdf-page-render" data-page={pageNumber} style={{
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        margin: '0 auto',
        marginBottom: '20px',
        background: 'white',
        padding: padding,
        width: '210mm',
        height: '297mm',
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        pageBreakAfter: 'always',
        overflow: 'hidden'
      }}>
        {!isCover && (
          <div style={{ textAlign: 'center', marginBottom: '25pt', flexShrink: 0 }}>
            <img src="/logo-cavalcante-reis.png" alt="Logo" style={{ width: '145pt', height: 'auto', display: 'block', margin: '0 auto' }} crossOrigin="anonymous" onError={(e) => { console.error('Erro ao carregar logo'); }} />
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>{children}</div>
        <div style={{ marginTop: 'auto', paddingTop: '20px', flexShrink: 0 }}>
          <FooterComponent />
        </div>
      </div>
    );
  };

  const activeServices = Object.keys(services).filter(k => services[k]);

  // Função para calcular tamanho aproximado do conteúdo (removendo tags HTML)
  const getContentSize = (serviceKey: string): number => {
    const text = serviceTextDatabase[serviceKey] || "";
    // Remove tags HTML e espaços, conta caracteres
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return cleanText.length;
  };

  // Agrupa serviços em páginas: pequenos (até 800 chars) podem ficar juntos (2-3 por página), grandes (>1000) ficam sozinhos
  // Retorna um array de grupos, onde cada grupo é um array de serviços que cabe numa página
  const groupServices = (services: string[]): string[][] => {
    const groups: string[][] = [];
    const LARGE_THRESHOLD = 1000; // Seções com mais de 1000 caracteres ficam sozinhas
    const MEDIUM_THRESHOLD = 800; // Seções até 800 podem ser agrupadas

    let currentGroup: string[] = [];
    let currentGroupSize = 0;

    services.forEach((serviceKey, index) => {
      const size = getContentSize(serviceKey);

      // Seção muito grande, fica sozinha
      if (size > LARGE_THRESHOLD) {
        // Salva grupo atual se houver
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
          currentGroup = [];
          currentGroupSize = 0;
        }
        // Adiciona seção grande sozinha
        groups.push([serviceKey]);
      }
      // Seção pequena/média, pode agrupar
      else if (size <= MEDIUM_THRESHOLD) {
        // Se o grupo atual + esta seção não ultrapassar 2400 chars (limite seguro para A4) e tiver menos de 3 itens
        if (currentGroupSize + size <= 2400 && currentGroup.length < 3) {
          currentGroup.push(serviceKey);
          currentGroupSize += size;
        } else {
          // Salva grupo atual e começa novo
          if (currentGroup.length > 0) {
            groups.push([...currentGroup]);
          }
          currentGroup = [serviceKey];
          currentGroupSize = size;
        }
      }
      // Seção média-grande (entre 800-1000), pode ficar sozinha ou com uma pequena
      else {
        if (currentGroup.length === 0 || (currentGroupSize + size <= 2400 && currentGroup.length === 1)) {
          currentGroup.push(serviceKey);
          currentGroupSize += size;
        } else {
          if (currentGroup.length > 0) {
            groups.push([...currentGroup]);
          }
          currentGroup = [serviceKey];
          currentGroupSize = size;
        }
      }
    });

    // Adiciona último grupo se houver
    if (currentGroup.length > 0) {
      groups.push([...currentGroup]);
    }

    return groups;
  };

  // Separar teses: primeiras 14 vs. restantes (se houver mais de 14)
  const first14Services = activeServices.slice(0, 14);
  const additionalServices = activeServices.length > 14 ? activeServices.slice(14) : [];

  const serviceGroups = groupServices(first14Services);
  const additionalServiceGroups = additionalServices.length > 0 ? groupServices(additionalServices) : [];

  // Verificar se o texto "Além disso..." deve ser movido para antes do Tópico 2
  // Se houver mais de 2 teses OU se alguma tese tiver mais de 58 caracteres no texto de "Cabível"
  const shouldMoveAlemDissoText = activeServices.length > 2 || activeServices.some(k => {
    const cabimentoText = customCabimentos[k] || "Cabível";
    return cabimentoText.length > 58;
  });

  return (
    <div id="preview" className="preview" style={{ fontFamily: "'Garamond', serif" }}>
      {/* ========== PÁGINA 1: CAPA ========== */}
      <Page isCover={true} FooterComponent={FooterComp} data-page={1}>
        {/* Logo centralizado no topo da página */}
        <div style={{ textAlign: "center", marginTop: '20pt', marginBottom: '0' }}>
          <img src="/logo-cavalcante-reis.png" alt="Logo" style={{ width: "170pt", height: 'auto', display: 'block', margin: '0 auto' }} crossOrigin="anonymous" onError={(e) => { console.error('Erro ao carregar logo na capa'); }} />
        </div>

        {/* Container principal - alinha todo o conteúdo à direita da página */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', flex: 1, paddingTop: '80pt', paddingBottom: '80pt', paddingRight: '25mm', width: '100%' }}>
          {/* Container interno - contém as informações da capa (Proponente, Destinatário, etc.) */}
          <div style={{ textAlign: "right", width: 'auto', maxWidth: '35%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>

            {/* Linha horizontal superior (separador) - BORDA PRETA SUPERIOR GRANDE */}
            <div style={{ width: '180%', borderTop: '2pt solid #000', marginBottom: '10pt' }}></div>

            {/* Seção Proponente - Container com bordas */}
            <div style={{ width: '100%', paddingBottom: '2pt', borderBottom: '1pt solid #ddd' }}>
              <p style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', marginBottom: '5pt', fontFamily: "'Garamond', serif", textAlign: 'right', whiteSpace: 'nowrap' }}>Proponente:</p>
              <p style={{ fontSize: '13pt', color: '#000', marginBottom: '0', fontFamily: "'Garamond', serif", textAlign: 'right', whiteSpace: 'nowrap' }}>Cavalcante Reis Advogados</p>
            </div>

            {/* Seção Destinatário - Container com bordas */}
            <div style={{ width: '100%', paddingTop: '10pt', paddingBottom: '10pt', borderBottom: '1pt solid #ddd' }}>
              <p style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', marginTop: '0', marginBottom: '5pt', fontFamily: "'Garamond', serif", textAlign: 'right', whiteSpace: 'nowrap' }}>Destinatário:</p>
              <p style={{ fontSize: '13pt', color: '#000', marginBottom: '0', fontFamily: "'Garamond', serif", textAlign: 'right', whiteSpace: 'nowrap' }}>{options.destinatario || options.municipio || "[Nome do Destinatário]"}</p>
            </div>

            {/* Linha horizontal inferior (separador) - BORDA PRETA INFERIOR GRANDE */}
            <div style={{ width: '180%', borderBottom: '2pt solid #000', marginTop: '10pt', marginBottom: '10pt' }}></div>

            {/* Data da proposta (apenas números na capa) */}
            <p style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', fontFamily: "'Garamond', serif", textAlign: 'right', marginTop: '10pt', whiteSpace: 'nowrap' }}>
              {formatDateNumeric(options.data || "") || new Date().getFullYear().toString()}
            </p>
          </div>
        </div>
      </Page>

      {/* ========== PÁGINA 2: SUMÁRIO ========== */}
      <Page pageNumber={2} FooterComponent={FooterComp}>
        <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', marginBottom: '20px', marginTop: '0', fontFamily: "'Garamond', serif", textAlign: 'left', paddingLeft: '0' }}>Sumário</h1>
          <div style={{ lineHeight: '20pt', fontSize: '14px', fontFamily: "'Garamond', serif", textAlign: 'left', paddingLeft: '0' }}>
            <div style={{ marginBottom: '12px', marginTop: '0', color: '#000', paddingLeft: '45px', textIndent: '0' }}><strong>1. Objeto da Proposta</strong></div>
            <div style={{ marginBottom: '12px', marginTop: '0', color: '#000', paddingLeft: '45px', textIndent: '0' }}><strong>2. Análise da Questão</strong></div>
            <div style={{ marginBottom: '12px', marginTop: '0', color: '#000', paddingLeft: '45px', textIndent: '0' }}><strong>3. Dos Honorários, das Condições de Pagamento e Despesas</strong></div>
            <div style={{ marginBottom: '12px', marginTop: '0', color: '#000', paddingLeft: '45px', textIndent: '0' }}><strong>4. Prazo e Cronograma de Execução dos Serviços</strong></div>
            <div style={{ marginBottom: '12px', marginTop: '0', color: '#000', paddingLeft: '45px', textIndent: '0' }}><strong>5. Experiência em atuação em favor de Municípios e da Equipe Responsável</strong></div>
            <div style={{ marginBottom: '12px', marginTop: '0', color: '#000', paddingLeft: '45px', textIndent: '0' }}><strong>6. Disposições Finais</strong></div>
          </div>
        </div>
      </Page>

      <Page pageNumber={3} FooterComponent={FooterComp}>
        {/* Container centralizado com margens maiores nas laterais */}
        <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#000', borderBottom: '1px solid #000', paddingBottom: '8px', marginBottom: '20px', marginTop: '0', fontFamily: "'Garamond', serif" }}>1. Objeto da Proposta</h2>
          <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '15px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif" }}>
            É objeto do presente contrato o desenvolvimento de serviços advocatícios especializados por parte da Proponente, Cavalcante Reis Advogados, ao Aceitante, Município de <strong>{options.municipio || "[MUNICÍPIO]"}</strong>, a fim de prestação de serviços de assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico, Financeiro, Previdenciário, atuando perante o Ministério da Fazenda e os seus órgãos administrativos, em especial para alcançar o incremento de receitas, ficando responsável pelo ajuizamento, acompanhamento e eventuais intervenções de terceiro em ações de interesse do Município.
          </p>

          <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '20px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif" }}>
            A proposta inclui os seguintes objetos:
          </p>

          <table className="proposal-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '20px', marginTop: '0', fontFamily: "'Garamond', serif" }}>
            <thead>
              <tr style={{ background: '#f9f9f9' }}>
                <th style={{ border: '1px solid #000', padding: '10px', fontSize: '13px', color: '#000', textAlign: 'center', fontWeight: 'bold' }}>TESE</th>
                <th style={{ border: '1px solid #000', padding: '10px', fontSize: '13px', color: '#000', textAlign: 'center', fontWeight: 'bold' }}>CABIMENTO</th>
              </tr>
            </thead>
            <tbody>
              {activeServices.map(k => (
                <tr key={k}>
                  <td style={{ border: '1px solid #000', padding: '8px', fontSize: '13px', color: '#000' }}><strong>{allServices[k]}</strong></td>
                  <td style={{ border: '1px solid #000', padding: '8px', fontSize: '13px', textAlign: 'center', color: '#000', fontWeight: 'bold', wordWrap: 'break-word', overflowWrap: 'break-word', maxWidth: '200px' }}>{customCabimentos[k] || "Cabível"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {!shouldMoveAlemDissoText && (
            <>
              <div style={{ maxWidth: '135mm', marginTop: '-10px', margin: '0 auto', width: '100%' }}>
                <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '15px', marginTop: '-10px', marginLeft: '30px', textIndent: '-30px', color: '#000', fontFamily: "'Garamond', serif" }}>
                  Além disso, a proposta também tem como objeto:
                </p>
                <br />
                <div style={{ maxWidth: '110mm', marginTop: '-10px', margin: '0 auto', width: '100%' }}>
                  <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '15px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", paddingLeft: '20px', textIndent: '-20px' }}><strong>(i)</strong> Análise do caso concreto, com a elaboração dos estudos pertinentes ao Município de {options.municipio || "[MUNICÍPIO]"};</p>
                  <br />
                  <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '15px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", paddingLeft: '20px', textIndent: '-20px' }}><strong>(ii)</strong> Ingresso de medida administrativa perante e/ou judicial, com posterior acompanhamento do processo durante sua tramitação, com realização de defesas, diligências, manifestação em razão de intimações, produção de provas, recursos e demais atos necessários ao deslinde dos feitos;</p>
                  <br />
                  <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '15px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", paddingLeft: '20px', textIndent: '-20px' }}><strong>(iii)</strong> Atuação perante a Justiça Federal seja na condição de recorrente ou recorrido, bem como interposição de recursos ou apresentação de contrarrazões aos Tribunais Superiores, se necessário for;</p>
                  <br />
                  <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '15px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", paddingLeft: '20px', textIndent: '-20px' }}><strong>(iv)</strong> Acompanhamento processual completo, até o trânsito em Julgado da Sentença administrativa e/ou judicial;</p>
                  <br />
                  <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '0', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", paddingLeft: '20px', textIndent: '-20px' }}><strong>(v)</strong> Acompanhamento do cumprimento das medidas administrativas e/ou judiciais junto aos órgãos administrativos.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </Page>

      {/* ========== TEXTO "ALÉM DISSO..." - ANTES DO TÓPICO 2 (se necessário) ========== */}
      {/* Renderiza o texto "Além disso..." antes do Tópico 2, se houver mais de 2 teses OU se alguma tese tiver mais de 58 caracteres no texto de "Cabível" */}
      {shouldMoveAlemDissoText && (
        <Page key="alem-disso-text" pageNumber={4} FooterComponent={FooterComp}>
          {/* Container centralizado com margens maiores nas laterais */}
          <div style={{ maxWidth: '135mm', marginTop: '-10px', margin: '0 auto', width: '100%' }}>
            <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '15px', marginTop: '-10px', marginLeft: '30px', textIndent: '-30px', color: '#000', fontFamily: "'Garamond', serif" }}>
              Além disso, a proposta também tem como objeto:
            </p>
            <br />
            <div style={{ maxWidth: '110mm', marginTop: '-10px', margin: '0 auto', width: '100%' }}>
              <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '15px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", paddingLeft: '20px', textIndent: '-20px' }}><strong>(i)</strong> Análise do caso concreto, com a elaboração dos estudos pertinentes ao Município de {options.municipio || "[MUNICÍPIO]"};</p>
              <br />
              <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '15px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", paddingLeft: '20px', textIndent: '-20px' }}><strong>(ii)</strong> Ingresso de medida administrativa perante e/ou judicial, com posterior acompanhamento do processo durante sua tramitação, com realização de defesas, diligências, manifestação em razão de intimações, produção de provas, recursos e demais atos necessários ao deslinde dos feitos;</p>
              <br />
              <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '15px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", paddingLeft: '20px', textIndent: '-20px' }}><strong>(iii)</strong> Atuação perante a Justiça Federal seja na condição de recorrente ou recorrido, bem como interposição de recursos ou apresentação de contrarrazões aos Tribunais Superiores, se necessário for;</p>
              <br />
              <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '15px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", paddingLeft: '20px', textIndent: '-20px' }}><strong>(iv)</strong> Acompanhamento processual completo, até o trânsito em Julgado da Sentença administrativa e/ou judicial;</p>
              <br />
              <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '0', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", paddingLeft: '20px', textIndent: '-20px' }}><strong>(v)</strong> Acompanhamento do cumprimento das medidas administrativas e/ou judiciais junto aos órgãos administrativos.</p>
            </div>
          </div>
        </Page>
      )}

      {/* ========== TESES ADICIONAIS (após a 14ª) - ANTES DO TÓPICO 2 ========== */}
      {/* Renderiza teses adicionais (15+) antes do Tópico 2, se houver mais de 14 teses */}
      {additionalServiceGroups.map((group, groupIndex) => {
        const pageNumber = 4 + (shouldMoveAlemDissoText ? 1 : 0) + groupIndex;
        // Calcula o número da primeira seção deste grupo (começando da 15)
        let sectionStartNumber = 15;
        for (let i = 0; i < groupIndex; i++) {
          sectionStartNumber += additionalServiceGroups[i].length;
        }

        return (
          <Page key={`additional-group-${groupIndex}`} pageNumber={pageNumber} FooterComponent={FooterComp}>
            {/* Container centralizado com margens maiores nas laterais */}
            <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
              {group.map((serviceKey, itemIndex) => {
                const currentSectionNumber = sectionStartNumber + itemIndex;

                return (
                  <div key={serviceKey} style={{ marginBottom: itemIndex < group.length - 1 ? '35px' : '0' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#000', marginBottom: '10px', marginTop: itemIndex === 0 && groupIndex === 0 ? '0' : '0', fontFamily: "'Garamond', serif" }}>
                      2.{currentSectionNumber} – {allServices[serviceKey]}
                    </h3>
                    <div style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', color: '#000', fontFamily: "'Garamond', serif" }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(serviceTextDatabase[serviceKey] || "") }} />
                  </div>
                );
              })}
            </div>
          </Page>
        );
      })}

      {/* ========== PÁGINAS DINÂMICAS: ANÁLISE DA QUESTÃO (Seção 2) ========== */}
      {/* Renderiza uma página para cada grupo de serviços (primeiras 14 teses) */}
      {serviceGroups.map((group, groupIndex) => {
        const pageNumber = 4 + (shouldMoveAlemDissoText ? 1 : 0) + additionalServiceGroups.length + groupIndex;
        const isFirstGroup = groupIndex === 0;
        // Calcula o número da primeira seção deste grupo (para numeração sequencial 2.1, 2.2, etc.)
        let sectionStartNumber = 1;
        for (let i = 0; i < groupIndex; i++) {
          sectionStartNumber += serviceGroups[i].length;
        }

        return (
          <Page key={`group-${groupIndex}`} pageNumber={pageNumber} FooterComponent={FooterComp}>
            {/* Container centralizado com margens maiores nas laterais */}
            <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
              {isFirstGroup && <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', borderBottom: '1pt solid #000', paddingBottom: '8pt', marginBottom: '25pt', marginTop: '0', fontFamily: "'Garamond', serif" }}>2. Análise da Questão</h2>}
              {group.map((serviceKey, itemIndex) => {
                const currentSectionNumber = sectionStartNumber + itemIndex;
                const isFirstInGroup = itemIndex === 0 && !isFirstGroup;

                return (
                  <div key={serviceKey} style={{ marginBottom: itemIndex < group.length - 1 ? '35pt' : '0' }}>
                    <h3 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', marginBottom: '10pt', marginTop: '0', fontFamily: "'Garamond', serif" }}>
                      2.{currentSectionNumber} – {allServices[serviceKey]}
                    </h3>
                    <div style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', color: '#000', fontFamily: "'Garamond', serif" }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(serviceTextDatabase[serviceKey] || "") }} />
                  </div>
                );
              })}
            </div>
          </Page>
        );
      })}

      <Page pageNumber={4 + (shouldMoveAlemDissoText ? 1 : 0) + additionalServiceGroups.length + serviceGroups.length} FooterComponent={FooterComp}>
        {/* Container centralizado com margens maiores nas laterais */}
        <div style={{ maxWidth: '145mm', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#000', borderBottom: '1px solid #000', paddingBottom: '8px', marginBottom: '20px', marginTop: '0', fontFamily: "'Garamond', serif" }}>3. Dos Honorários, das Condições de Pagamento e Despesas</h2>

          <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '35px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif" }}>
            Os valores levantados a título de incremento são provisórios, baseados em informações preliminares, podendo, ao final, representar valores a maior ou a menor.
          </p>
          <br />
          <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '40px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif" }}>
            Considerando a necessidade de manutenção do equilíbrio econômico-financeiro do contrato administrativo, propõe o escritório CAVALCANTE REIS ADVOGADOS que esta Municipalidade pague ao Proponente da seguinte forma:
          </p>
          <br />
          <div style={{ maxWidth: '120mm', margin: '0 auto', width: '100%' }}>
            <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '15px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", paddingLeft: '30px', textIndent: '-30px' }}>
              3.1.1 <strong>Para todos os demais itens descritos nesta Proposta</strong> será efetuado o pagamento de honorários advocatícios à CAVALCANTE REIS ADVOGADOS pela execução dos serviços de recuperação de créditos, <strong><em>ad êxito</em></strong> <strong>na ordem de {paymentValue || "R$ 0,12 (doze centavos)"} para cada R$ 1,00 (um real)</strong> do montante referente ao incremento financeiro, ou seja, com base nos valores que entrarem nos cofres do CONTRATANTE;
            </p>
            <br />
            <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '15px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", paddingLeft: '30px', textIndent: '-30px' }}>
              3.1.2 Em caso de valores retroativos recuperados em favor da municipalidade, que consiste <strong>nos valores não repassados em favor do Contratante nos últimos 5 (cinco)</strong> anos (prescrição quinquenal) ou não abarcados pela prescrição, também serão cobrados honorários advocatícios na ordem <strong>de {paymentValue || "R$ 0,12 (doze centavos)"} para cada R$ 1,00 (um real) do montante recuperado aos Cofres Municipais.</strong>
            </p>
            <br />
            <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '15px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif", paddingLeft: '30px', textIndent: '-30px' }}>
              3.1.3 Sendo um contrato <strong><em>AD EXITUM,</em></strong> acaso o incremento financeiro em favor deste Município supere o valor mencionado na cláusula que trata do valor do contrato, os desembolsos não poderão ser previstos por dotação orçamentária, posto que terão origem na REDUÇÃO DE DESPESAS/INCREMENTO DE RECEITAS, como consequência da prestação dos serviços.
            </p>
          </div>
          <br />
          <br />
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#000', borderBottom: '1px solid #000', paddingBottom: '8px', marginTop: '0', marginBottom: '20px', fontFamily: "'Garamond', serif" }}>4. Prazo e Cronograma de Execução dos Serviços</h2>
          <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '0', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif" }}>
            O prazo de execução será de <strong>{prazo} (vinte e quatro) meses</strong>, podendo ser prorrogado por interesse das partes, com base no art. 107 da Lei n.º 14.133/21.
          </p>
        </div>
      </Page>

      {/* ========== PÁGINA(S): EQUIPE RESPONSÁVEL (Seção 5) ========== */}
      {/* Tópico 5 - Contém informações sobre experiência, municípios atendidos e equipe técnica */}
      {(() => {
        const basePageNumber = 4 + (shouldMoveAlemDissoText ? 1 : 0) + additionalServiceGroups.length + serviceGroups.length;
        // Lista dos profissionais que serão exibidos na seção de equipe (Yuri está na primeira página, esta lista começa com Pedro)
        const professionals = [
          {
            name: "PEDRO AFONSO FIGUEIREDO DE SOUZA",
            bio: "Graduado em Direito pela Pontifícia Universidade Católica de Minas Gerais. Especialista em Direito Penal e Processo Penal pela Academia Brasileira de Direito Constitucional. Mestre em Direito nas Relações Econômicas e Sociais pela Faculdade de Direito Milton Campos. Diretor de Comunicação e Conselheiro Consultivo, Científico e Fiscal do Instituto de Ciências Penais. Autor de artigos e capítulos de livros jurídicos. Advogado associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: pedro@cavalcantereis.adv.br)."
          },
          {
            name: "SÉRGIO RICARDO ALVES DE JESUS FILHO",
            bio: "Graduado em Direito pelo Centro Universitário de Brasília (UniCEUB). Graduando em Ciências Contábeis pelo Centro Universitário de Brasília (UniCEUB). Pós-graduando em Direito Tributário pelo Instituto Brasileiro de Ensino, Desenvolvimento e Pesquisa (IDP). Membro da Comissão de Assuntos Tributários da OAB/DF. Advogado Associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: sergio@cavalcantereis.adv.br)."
          },
          {
            name: "GABRIEL GAUDÊNCIO ZANCHETTA CALIMAN",
            bio: "Graduado em Direito pelo Centro Universitário de Brasília (UniCeub). Especialista em Gestão Pública e Tributária pelo Gran Centro Universitário. Membro da Comissão de Assuntos Tributários da OAB/DF. Advogado associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: gabrielcaliman@cavalcantereis.adv.br)."
          },
          {
            name: "FELIPE NOBREGA ROCHA",
            bio: "Graduado em Direito pela Universidade Presbiteriana Mackenzie. LLM (Master of Laws) em Direito Empresarial pela Fundação Getúlio Vargas (FGV). Mestrado Profissional em Direito pelo Instituto Brasileiro de Ensino, Desenvolvimento e Pesquisa (IDP). Advogado associado do escritório de advocacia"
          },
        ];

        return (
          <>
            {/* Página 1 do Tópico 5: Título, texto introdutório e imagens dos municípios */}
            <Page key="section5-page1" pageNumber={basePageNumber} FooterComponent={FooterComp}>
              {/* Container centralizado com margens maiores nas laterais */}
              <div style={{ maxWidth: '140mm', margin: '0 auto', width: '100%' }}>
                <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', borderBottom: '1pt solid #000', paddingBottom: '8pt', marginBottom: '15pt', marginTop: '0', fontFamily: "'Garamond', serif" }}>5. Experiência em atuação em favor de Municípios e da Equipe Responsável</h2>
                <p style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', marginBottom: '15pt', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif" }}>
                  No portfólio de serviços executados e/ou em execução, constam os seguintes Municípios contratantes:
                </p>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15pt', marginBottom: '20pt' }}>
                  <img src="/munincipios01.png" style={{ width: '300pt', height: 'auto', margin: '0 auto', display: 'block' }} alt="Municípios 1" crossOrigin="anonymous" onError={(e) => { console.error('Erro ao carregar municípios 1'); }} />
                  <img src="/Munincipios02.png" style={{ width: '300pt', height: 'auto', margin: '0 auto', display: 'block' }} alt="Municípios 2" crossOrigin="anonymous" onError={(e) => { console.error('Erro ao carregar municípios 2'); }} />
                </div>

                <p style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', marginBottom: '15pt', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif" }}>
                  Para coordenar os trabalhos de consultoria propostos neste documento, a CAVALCANTE REIS ADVOGADOS alocará os seguintes profissionais:
                </p>
                <br />
                <div style={{ maxWidth: '128mm', margin: '0 auto', width: '100%' }}>
                  <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '0', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif" }}>
                    <strong>IURI DO LAGO NOGUEIRA CAVALCANTE REIS</strong> - Doutorando em Direito e Mestre em Direito Econômico e Desenvolvimento pelo Instituto Brasileiro de Ensino, Desenvolvimento e Pesquisa (IDP/Brasília). LLM (Master of Laws) em Direito Empresarial pela Fundação Getúlio Vargas (FGV/RJ). Integrante da Comissão de Juristas do Senado Federal criada para consolidar a proposta do novo Código Comercial Brasileiro. Autor e Coautor de livros, pareceres e artigos jurídicos na área do direito público. Sócio-diretor do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º
                  </p>
                </div>
              </div>
            </Page>

            {/* Página 2 do Tópico 5: Profissionais e textos finais */}
            <Page key="section5-page2" pageNumber={basePageNumber + 1} FooterComponent={FooterComp}>
              {/* Container centralizado com margens maiores nas laterais */}
              <div style={{ maxWidth: '125mm', margin: '0 auto', width: '100%' }}>
                {/* Continuação do texto do Yuri da página anterior */}
                <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '15px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif" }}>
                  26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: iuri@cavalcantereis.adv.br).
                </p>
                <br />
                {/* TODOS os profissionais LADO A LADO */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '15px',
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                  width: '100%'
                }}>
                  {professionals.map((prof, index) => (
                    <div key={`prof-${index}`} style={{ flex: '1', minWidth: '45%', maxWidth: '48%' }}>
                      <p style={{ marginBottom: '0', marginTop: '15px', textAlign: 'justify', fontSize: '13px', lineHeight: '20pt', fontFamily: "'Garamond', serif" }}>
                        <strong>{prof.name}</strong> - {prof.bio}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Page>
          </>
        );
      })()}

      {(() => {
        // Número da página do tópico 6: basePageNumber (4 + (shouldMoveAlemDissoText ? 1 : 0) + additionalServiceGroups.length + serviceGroups.length) + 2 (duas páginas do tópico 5: imagens/texto + profissionais) = basePageNumber + 2
        const section6PageNumber = 4 + (shouldMoveAlemDissoText ? 1 : 0) + additionalServiceGroups.length + serviceGroups.length + 2;
        return (
          <Page pageNumber={section6PageNumber} FooterComponent={FooterComp}>
            {/* Container centralizado com margens maiores nas laterais */}
            {/* Advogados lado a lado (Felipe e Ryslhainy) */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '20px',
              maxWidth: '160mm',
              margin: '0 auto',
              width: '100%',
              alignItems: 'flex-start'
            }}>
              {/* Felipe - lado esquerdo */}
              <div style={{ flex: '1', minWidth: '0' }}>
                <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '15px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif" }}>
                  <strong>FELIPE NOBREGA ROCHA</strong> - CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: felipe@cavalcantereis.adv.br).
                </p>
              </div>
              {/* Ryslhainy - lado direito */}
              <div style={{ flex: '1', minWidth: '0' }}>
                <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '60px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif" }}>
                  <strong>RYSLHAINY DOS SANTOS CORDEIRO</strong> - Advogada associada do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: ryslhainy@cavalcantereis.adv.br).
                </p>
              </div>
            </div>
            <br />
            <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>              {/* Textos antes do tópico 6 */}
              <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '15px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif" }}>
                Além desses profissionais, a CAVALCANTE REIS ADVOGADOS alocará uma equipe de profissionais pertencentes ao seu quadro técnico, utilizando, também, caso necessário, o apoio técnico especializado de terceiros, pessoas físicas ou jurídicas, que deverão atuar sob sua orientação, cabendo à CAVALCANTE REIS ADVOGADOS a responsabilidade técnica pela execução das tarefas.
              </p>
              <br />
              <p style={{ textAlign: 'justify', fontSize: '13px', lineHeight: '17pt', marginBottom: '20px', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif" }}>
                Nossa contratação, portanto, devido à altíssima qualificação e experiência, aliada à singularidade do objeto da demanda, bem como os diferenciais já apresentados acima, está inserida dentre as hipóteses do art. 6°, XVIII &quot;e&quot; e art. 74, III, &quot;e&quot;, da Lei n.º 14.133/2021.
              </p>
              <br />
              <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', borderBottom: '1pt solid #000', paddingBottom: '8pt', marginBottom: '20pt', marginTop: '0', fontFamily: "'Garamond', serif" }}>6. Disposições Finais</h2>
              <p style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', marginBottom: '12pt', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif" }}>
                Nesse sentido, ficamos no aguardo da manifestação deste Município para promover os ajustes contratuais que entenderem necessários, sendo mantida a mesma forma de remuneração aqui proposta, com fundamento no art. 6º, XVIII, &quot;e&quot; e art. 74, III, &quot;e&quot;, da Lei n.º 14.133/2021.
              </p>
              <br />
              <p style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', marginBottom: '12pt', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif" }}>
                A presente proposta tem validade de 60 (sessenta) dias.
              </p>
              <br />
              <p style={{ textAlign: 'justify', fontSize: '13pt', lineHeight: '1.5', marginBottom: '20pt', marginTop: '0', color: '#000', fontFamily: "'Garamond', serif" }}>
                Sendo o que se apresenta para o momento, aguardamos posicionamento da parte de V. Exa., colocando-nos, desde já, à inteira disposição para dirimir quaisquer dúvidas eventualmente existentes.
              </p>
            </div>
            {/* Seção de fechamento: Data, Atenciosamente, Assinatura e Nome da Empresa - Centralizados e juntos */}
            <div style={{ textAlign: 'center', marginTop: '2pt', marginBottom: '0' }}>
              <p style={{ fontSize: '14pt', lineHeight: '1.5', marginBottom: '0', marginTop: '-20pt', color: '#000', paddingLeft: '200pt', textIndent: '210pt', fontFamily: "'Garamond', serif" }}>
                Brasília-DF, {formatDateWithMonthName(options.data || '')}.
              </p>
              <p style={{ fontSize: '14pt', lineHeight: '1.5', marginBottom: '0', marginTop: '-80pt', color: '#000', paddingLeft: '200pt', textIndent: '255pt', fontFamily: "'Garamond', serif" }}>
                Atenciosamente,
              </p>
              <img src="/Assinatura.png" style={{ width: '150pt', height: 'auto', marginTop: '-40pt', margin: '0 auto 0pt auto', display: 'block' }} alt="Assinatura" crossOrigin="anonymous" onError={(e) => { console.error('Erro ao carregar assinatura'); }} />
              <h1 style={{ fontWeight: 'bold', color: '#000', fontSize: '15pt', lineHeight: '1.5', marginTop: '-25pt', marginBottom: '0', fontFamily: "'Garamond', serif" }}>CAVALCANTE REIS ADVOGADOS</h1>
            </div>
          </Page>
        );
      })()}
    </div>
  );
};

// ========== COMPONENTE PRINCIPAL: GERADOR DE PROPOSTAS ==========
export default function ProposalGenerator({ onBackToHome, onLogout, propostaToLoad }: ProposalGeneratorProps) {
  // ========== ESTADOS: DADOS DA PROPOSTA ==========
  const [isLoading, setIsLoading] = useState(true); // Controla tela de loading inicial
  const [options, setOptions] = useState({ municipio: "", destinatario: "", data: "" }); // Informações básicas
  const [prazo, setPrazo] = useState("24"); // Prazo de execução em meses
  const [services, setServices] = useState<any>({}); // Serviços selecionados (objeto com chaves booleanas)
  const [customCabimentos, setCustomCabimentos] = useState<any>({}); // Textos de "Cabimento" personalizados por serviço
  const [customEstimates, setCustomEstimates] = useState<any>({}); // Estimativas personalizadas (não usado no momento)
  const [footerOffices, setFooterOffices] = useState<any>({
    rj: { enabled: true, cidade: "Rio de Janeiro - RJ", linha1: "AV. DAS AMÉRICAS, 3434 - BL 04", linha2: "Sala, 207 Barra Da Tijuca,", linha3: "CEP: 22640-102" },
    df: { enabled: true, cidade: "Brasília - DF", linha1: "SHIS QL 10, Conj. 06, Casa 19", linha2: "Lago Sul,", linha3: "CEP: 71630-065" },
    sp: { enabled: true, cidade: "São Paulo - SP", linha1: "Rua Fidêncio Ramos, 223,", linha2: "Cobertura, Vila Olimpia,", linha3: "CEP: 04551-010" },
    am: { enabled: true, cidade: "Manaus - AM", linha1: "Rua Silva Ramos, 78 - Centro", linha2: "Manaus, AM", linha3: "CEP: 69010-180" }
  }); // Configuração dos escritórios no rodapé (quais aparecem e seus endereços)
  const [rppsImage, setRppsImage] = useState<string | null>(null); // Imagem customizada para RPPS (não usado no momento)
  const [paymentValue, setPaymentValue] = useState("R$ 0,12 (doze centavos)"); // Valor dos honorários
  const [retentionPeriod, setRetentionPeriod] = useState<number>(365); // Período de retenção em dias (padrão: 1 ano = 365 dias)
  const [savedProposals, setSavedProposals] = useState<Proposta[]>([]); // Lista de propostas salvas no backend
  const [loadingPdf, setLoadingPdf] = useState(false); // Estado de loading ao gerar PDF
  const [loadingDocx, setLoadingDocx] = useState(false); // Estado de loading ao gerar DOCX
  const [loadingProposals, setLoadingProposals] = useState(false); // Estado de loading ao carregar propostas
  const containerRef = useRef<HTMLDivElement>(null); // Referência ao container principal (não usado no momento)
  const [modal, setModal] = useState<any>({ open: false, title: "", message: "", type: "info" }); // Estado do modal de notificações

  // ========== FUNÇÕES AUXILIARES: PERSISTÊNCIA ==========

  // Carrega propostas salvas do backend
  const loadSavedProposals = async () => {
    try {
      setLoadingProposals(true);
      const proposals = await propostasApi.getAll();
      setSavedProposals(proposals);
    } catch (error: any) {
      console.error('Erro ao carregar propostas:', error);
      setModal({
        open: true,
        title: "Erro",
        message: `Erro ao carregar propostas salvas: ${error.message || 'Erro desconhecido'}. Tentando usar localStorage como fallback...`,
        type: "error"
      });
      // Fallback para localStorage em caso de erro
      const saved = localStorage.getItem("savedPropostas");
      if (saved) {
        try {
          const proposals = JSON.parse(saved);
          setSavedProposals(proposals);
        } catch (e) {
          setSavedProposals([]);
        }
      }
    } finally {
      setLoadingProposals(false);
    }
  };

  // ========== EFFECT: INICIALIZAÇÃO ==========
  useEffect(() => {
    // Se houver uma proposta para carregar, carrega ela primeiro
    if (propostaToLoad) {
      const loadProposta = async () => {
        try {
          const proposta = await propostasApi.getById(propostaToLoad);
          setOptions({
            municipio: proposta.municipio || "",
            data: proposta.data || "",
            destinatario: proposta.destinatario || proposta.municipio || ""
          });
          setPrazo(proposta.prazo || "24");
          setServices(proposta.services || {});
          setCustomCabimentos(proposta.customCabimentos || {});
          setCustomEstimates(proposta.customEstimates || {});
          if (proposta.footerOffices) setFooterOffices(proposta.footerOffices);
          if (proposta.paymentValue) setPaymentValue(proposta.paymentValue);

          // Calcula o período de retenção baseado na data de expiração
          if (proposta.expiresAt) {
            const expiresAt = new Date(proposta.expiresAt);
            const now = new Date();
            const diffDays = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const periods = [15, 30, 90, 180, 365, 730];
            const closestPeriod = periods.reduce((prev, curr) =>
              Math.abs(curr - diffDays) < Math.abs(prev - diffDays) ? curr : prev
            );
            setRetentionPeriod(closestPeriod);
          }

          setModal({
            open: true,
            title: "Sucesso",
            message: "Proposta carregada com sucesso!",
            type: "success"
          });
        } catch (error: any) {
          console.error('Erro ao carregar proposta:', error);
          setModal({
            open: true,
            title: "Erro",
            message: `Erro ao carregar proposta: ${error.message || 'Erro desconhecido'}`,
            type: "error"
          });
        } finally {
          setIsLoading(false);
        }
      };
      loadProposta();
    } else {
      // Simular loading inicial
      setTimeout(() => setIsLoading(false), 800); // Simula delay de carregamento
    }
  }, [propostaToLoad]);

  // ========== HANDLER: CARREGAR PROPOSTA ==========
  // Carrega uma proposta salva e preenche o formulário
  const handleLoadProposal = async (p: Proposta) => {
    try {
      // Se a proposta não tiver todos os campos, tenta carregar do backend
      if (!p.services || !p.customCabimentos) {
        const fullProposta = await propostasApi.getById(p.id!);
        p = fullProposta;
      }

      setOptions({
        municipio: p.municipio || "",
        data: p.data || "",
        destinatario: p.destinatario || p.municipio || ""
      });
      setPrazo(p.prazo || "24");
      setServices(p.services || {});
      setCustomCabimentos(p.customCabimentos || {});
      setCustomEstimates(p.customEstimates || {});
      if (p.footerOffices) setFooterOffices(p.footerOffices);
      if (p.paymentValue) setPaymentValue(p.paymentValue);

      // Calcula o período de retenção baseado na data de expiração
      if (p.expiresAt) {
        const expiresAt = new Date(p.expiresAt);
        const now = new Date();
        const diffDays = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        // Define o período mais próximo das opções disponíveis
        const periods = [15, 30, 90, 180, 365, 730];
        const closestPeriod = periods.reduce((prev, curr) =>
          Math.abs(curr - diffDays) < Math.abs(prev - diffDays) ? curr : prev
        );
        setRetentionPeriod(closestPeriod);
      }

      setModal({
        open: true,
        title: "Sucesso",
        message: "Proposta carregada com sucesso!",
        type: "success"
      });
    } catch (error: any) {
      console.error('Erro ao carregar proposta:', error);
      setModal({
        open: true,
        title: "Erro",
        message: `Erro ao carregar proposta: ${error.message || 'Erro desconhecido'}`,
        type: "error"
      });
    }
  };

  // ========== HANDLER: DELETAR PROPOSTA ==========
  // Deleta uma proposta do backend
  const handleDeleteProposal = async (id: string) => {
    try {
      setLoadingProposals(true);
      await propostasApi.delete(id);

      // Atualiza a lista local
      setSavedProposals(savedProposals.filter(p => p.id !== id));

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
        message: `Erro ao deletar proposta: ${error.message || 'Erro desconhecido'}. Tentando deletar localmente...`,
        type: "error"
      });
      // Fallback para localStorage em caso de erro
      const saved = localStorage.getItem("savedPropostas");
      if (saved) {
        try {
          const proposals = JSON.parse(saved).filter((p: any) => p.id !== id);
          localStorage.setItem("savedPropostas", JSON.stringify(proposals));
          setSavedProposals(savedProposals.filter(p => p.id !== id));
        } catch (e) {
          // Ignora erro de localStorage
        }
      }
    } finally {
      setLoadingProposals(false);
    }
  };

  // ========== HANDLER: SALVAR PROPOSTA ==========
  // Salva a proposta atual no backend com o tempo de retenção escolhido (padrão: 1 ano)
  const handleSaveProposal = async () => {
    if (!options.municipio || !options.municipio.trim()) {
      setModal({
        open: true,
        title: "Atenção",
        message: "Por favor, preencha o nome do município antes de salvar.",
        type: "error"
      });
      return;
    }

    try {
      setLoadingProposals(true);

      // Calcula a data de expiração baseada no período de retenção escolhido
      const now = new Date();
      const expiresAtDate = new Date(now);
      expiresAtDate.setDate(expiresAtDate.getDate() + retentionPeriod);
      const expiresAt = expiresAtDate.toISOString();

      const newProp = await propostasApi.create({
        municipio: options.municipio,
        data: options.data || "",
        destinatario: options.destinatario || options.municipio,
        prazo: prazo || "24",
        services,
        customCabimentos,
        customEstimates,
        footerOffices,
        paymentValue,
        expiresAt
      });

      // Recarrega a lista de propostas
      await loadSavedProposals();

      // Mensagem personalizada baseada no período escolhido
      const periodNames: Record<number, string> = {
        15: "15 dias",
        30: "1 mês",
        90: "3 meses",
        180: "6 meses",
        365: "1 ano",
        730: "2 anos"
      };
      const periodName = periodNames[retentionPeriod] || `${retentionPeriod} dias`;

      setModal({
        open: true,
        title: "Sucesso",
        message: `Proposta salva com sucesso no servidor! Ela será mantida por ${periodName}.`,
        type: "success"
      });
    } catch (error: any) {
      console.error('Erro ao salvar proposta:', error);
      setModal({
        open: true,
        title: "Erro",
        message: `Erro ao salvar proposta: ${error.message || 'Erro desconhecido'}. Tentando salvar localmente...`,
        type: "error"
      });
      // Fallback para localStorage em caso de erro
      const fallbackProp = {
        id: Date.now().toString(),
        municipio: options.municipio,
        data: options.data,
        services,
        customCabimentos,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };
      const saved = localStorage.getItem("savedPropostas");
      const proposals = saved ? JSON.parse(saved) : [];
      proposals.push(fallbackProp);
      localStorage.setItem("savedPropostas", JSON.stringify(proposals));
      setSavedProposals([...savedProposals, fallbackProp]);
    } finally {
      setLoadingProposals(false);
    }
  };

  // ========== HANDLER: BAIXAR PDF ==========
  // ========== DESCRIÇÃO GERAL ==========
  // Esta função converte a prévia HTML do documento da proposta em um arquivo PDF
  // utilizando as bibliotecas jsPDF e html2canvas. O processo envolve:
  // 1. Validação dos campos obrigatórios (município, data, serviços selecionados)
  // 2. Aguardar carregamento completo de todas as imagens
  // 3. Captura de cada página como canvas usando html2canvas
  // 4. Conversão de cada canvas em imagem JPEG e adição ao PDF
  // 5. Geração do arquivo PDF e download automático
  // ========== DIMENSÕES E ESPECIFICAÇÕES ==========
  // - Páginas: formato A4 (210mm x 297mm)
  // - Resolução: scale 2x para melhor qualidade (794px x 1123px)
  // - Formato de imagem: JPEG com qualidade 95%
  // - Background: branco (#ffffff)
  // ========== PROCESSAMENTO DE PÁGINAS ==========
  // Cada página do documento é capturada individualmente como canvas
  // e adicionada ao PDF como imagem JPEG, garantindo fidelidade visual
  const handleDownloadPdf = async () => {
    // ========== VALIDAÇÃO: CAMPOS OBRIGATÓRIOS ==========
    // Verifica se o campo município foi preenchido
    // Se não estiver preenchido, exibe modal de erro e interrompe o processo
    if (!options.municipio || !options.municipio.trim()) {
      setModal({
        open: true,
        title: "Atenção",
        message: "Por favor, preencha o nome do município.",
        type: "error"
      });
      return;
    }

    if (!options.data || !options.data.trim()) {
      setModal({
        open: true,
        title: "Atenção",
        message: "Por favor, preencha a data da proposta.",
        type: "error"
      });
      return;
    }

    const activeServicesList = Object.keys(services).filter(k => services[k]);
    if (activeServicesList.length === 0) {
      setModal({
        open: true,
        title: "Atenção",
        message: "Por favor, selecione pelo menos uma tese/serviço.",
        type: "error"
      });
      return;
    }

    // ========== INICIALIZAÇÃO: ESTADO E CONTAINER ==========
    // Ativa o estado de loading para mostrar feedback visual ao usuário
    // Busca o elemento HTML que contém a prévia do documento (id="preview")
    // Se o container não for encontrado, exibe erro e interrompe o processo
    setLoadingPdf(true); // Ativa estado de loading
    const container = document.getElementById("preview"); // Busca o container da prévia
    if (!container) {
      setModal({
        open: true,
        title: "Erro",
        message: "Container de preview não encontrado.",
        type: "error"
      });
      setLoadingPdf(false);
      return;
    }

    try {
      // ========== FUNÇÃO AUXILIAR: AGUARDAR IMAGENS ==========
      // ========== DESCRIÇÃO ==========
      // Aguarda todas as imagens de uma página carregarem completamente antes de converter para PDF
      // Isso é crítico para garantir que todas as imagens apareçam corretamente no PDF final
      // ========== PROCESSAMENTO ==========
      // 1. Busca todas as tags <img> dentro do elemento fornecido
      // 2. Para cada imagem, verifica se já está carregada (complete && naturalHeight > 0)
      // 3. Se não estiver, força recarregamento e aguarda eventos onload/onerror
      // 4. Conta imagens carregadas e com erro separadamente
      // 5. Resolve quando todas as imagens foram processadas ou após timeout de 5 segundos
      // ========== RETORNO ==========
      // Retorna uma Promise que resolve quando todas as imagens foram processadas
      const waitForImages = (element: HTMLElement): Promise<void> => {
        return new Promise((resolve) => {
          const images = element.querySelectorAll('img');
          if (images.length === 0) {
            resolve();
            return;
          }

          let loadedCount = 0;
          let errorCount = 0;
          const totalImages = images.length;

          const checkComplete = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
              console.log(`Todas as ${totalImages} imagens carregadas (${errorCount} com erro)`);
              resolve();
            }
          };

          images.forEach((img, index) => {
            // Forçar recarregamento se necessário
            if (img.src && !img.complete) {
              const originalSrc = img.src;
              img.src = '';
              img.src = originalSrc;
            }

            if (img.complete && img.naturalHeight !== 0) {
              checkComplete();
            } else {
              img.onload = () => {
                checkComplete();
              };
              img.onerror = () => {
                console.warn(`Erro ao carregar imagem ${index + 1}:`, img.src);
                errorCount++;
                checkComplete(); // Continua mesmo se houver erro na imagem
              };
              // Se a imagem já tinha src mas não estava completa, pode já ter disparado os eventos
              if (img.src && img.complete) {
                setTimeout(checkComplete, 100);
              }
            }
          });

          // Timeout de segurança aumentado
          setTimeout(() => {
            if (loadedCount < totalImages) {
              console.warn(`Timeout: apenas ${loadedCount}/${totalImages} imagens carregadas`);
              resolve();
            }
          }, 5000);
        });
      };

      // ========== INICIALIZAÇÃO: DOCUMENTO PDF ==========
      // Cria um novo documento PDF usando jsPDF
      // Parâmetros: 'p' = portrait (retrato), 'mm' = milímetros, 'a4' = formato A4
      const pdf = new jsPDF('p', 'mm', 'a4');

      // ========== BUSCA: PÁGINAS DO DOCUMENTO ==========
      // Busca todos os elementos com classe 'pdf-page-render' que representam páginas individuais
      // Cada página será capturada e adicionada ao PDF separadamente
      const pages = container.querySelectorAll('.pdf-page-render');

      // ========== VALIDAÇÃO: PÁGINAS ENCONTRADAS ==========
      // Verifica se pelo menos uma página foi encontrada
      // Se não houver páginas, exibe erro e interrompe o processo
      if (pages.length === 0) {
        setModal({
          open: true,
          title: "Erro",
          message: "Nenhuma página encontrada para gerar o PDF.",
          type: "error"
        });
        setLoadingPdf(false);
        return;
      }

      // ========== AGUARDO: CARREGAMENTO DE IMAGENS ==========
      // Aguarda todas as imagens de todas as páginas carregarem completamente
      // Isso garante que todas as imagens estejam prontas antes de iniciar a captura
      console.log('Aguardando carregamento de imagens...');
      for (let i = 0; i < pages.length; i++) {
        await waitForImages(pages[i] as HTMLElement);
      }

      // ========== AGUARDO: RENDERIZAÇÃO COMPLETA ==========
      // Aguarda 1 segundo adicional para garantir que toda a renderização esteja completa
      // Isso inclui estilos CSS aplicados, posicionamento de elementos, etc.
      await new Promise(resolve => setTimeout(resolve, 1000));

      // ========== LOOP: PROCESSAMENTO DE CADA PÁGINA ==========
      // Itera sobre cada página do documento
      // Para cada página:
      // 1. Adiciona nova página ao PDF (exceto a primeira)
      // 2. Captura a página como canvas usando html2canvas
      // 3. Converte o canvas em imagem JPEG
      // 4. Adiciona a imagem ao PDF com dimensões A4
      for (let i = 0; i < pages.length; i++) {
        // ========== ADIÇÃO: NOVA PÁGINA NO PDF ==========
        // Adiciona uma nova página ao PDF para cada página do documento (exceto a primeira)
        // A primeira página já existe quando o PDF é criado
        if (i > 0) {
          pdf.addPage();
        }

        // ========== OBTENÇÃO: ELEMENTO DA PÁGINA ==========
        // Obtém o elemento HTML que representa a página atual
        const pageElement = pages[i] as HTMLElement;

        try {
          // ========== AJUSTE: OVERFLOW PARA CAPTURA ==========
          // Ajusta o overflow da página para 'hidden' durante a captura
          // Isso evita que elementos que ultrapassam os limites da página apareçam na captura
          // Salva o valor original para restaurar depois
          const originalOverflow = pageElement.style.overflow;
          pageElement.style.overflow = 'hidden';

          // ========== CAPTURA: PÁGINA COMO CANVAS ==========
          // Usa html2canvas para capturar a página como um elemento canvas
          // Parâmetros:
          // - scale: 2 (dobra a resolução para melhor qualidade)
          // - useCORS: true (permite carregar imagens de outros domínios)
          // - allowTaint: true (permite "contaminar" o canvas com imagens externas)
          // - logging: false (desativa logs de debug)
          // - backgroundColor: '#ffffff' (fundo branco)
          // - width/height: 794x1123px (equivalente a 210mm x 297mm em A4)
          // - windowWidth/windowHeight: define o viewport para captura
          const canvas = await html2canvas(pageElement, {
            scale: 2, // Resolução 2x para melhor qualidade
            useCORS: true, // Permite imagens de outros domínios
            allowTaint: true, // Permite "contaminar" canvas com imagens externas
            logging: false, // Desativa logs
            backgroundColor: '#ffffff', // Fundo branco
            width: 794, // 210mm em pixels (210mm * 3.779527559 = ~794px)
            height: 1123, // 297mm em pixels (297mm * 3.779527559 = ~1123px)
            windowWidth: 794, // Largura do viewport
            windowHeight: 1123, // Altura do viewport
          });

          // ========== RESTAURAÇÃO: OVERFLOW ORIGINAL ==========
          // Restaura o valor original do overflow após a captura
          pageElement.style.overflow = originalOverflow;

          // ========== CONVERSÃO: CANVAS PARA JPEG ==========
          // Converte o canvas em uma string base64 de imagem JPEG
          // Qualidade: 95% (balanço entre qualidade e tamanho do arquivo)
          const imgData = canvas.toDataURL('image/jpeg', 0.95);

          // ========== DIMENSÕES: IMAGEM NO PDF ==========
          // Define as dimensões da imagem no PDF em milímetros
          // A4: 210mm de largura x 297mm de altura
          const imgWidth = 210; // A4 width in mm
          const imgHeight = 297; // A4 height in mm (fixo)

          // ========== ADIÇÃO: IMAGEM AO PDF ==========
          // Adiciona a imagem JPEG ao PDF na posição (0, 0) com dimensões A4
          // Isso preenche toda a página com a captura
          pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        } catch (pageError) {
          // ========== TRATAMENTO: ERRO EM PÁGINA INDIVIDUAL ==========
          // Se uma página falhar, registra o erro mas continua processando as outras
          // Isso garante que o máximo de páginas possível seja incluído no PDF
          console.error(`Erro ao processar página ${i + 1}:`, pageError);
          // Continua para próxima página mesmo se uma falhar
        }
      }

      // ========== FUNÇÃO AUXILIAR: FORMATAR DATA PARA NOME DE ARQUIVO ==========
      // ========== DESCRIÇÃO ==========
      // Formata a data da proposta para ser usada no nome do arquivo PDF
      // Formato final: DD.MM.YYYY - Proposta de Serviços Advocatícios - Município de NOME - UF (êxito).pdf
      // ========== PROCESSAMENTO ==========
      // 1. Se não houver data, usa a data atual
      // 2. Tenta extrair data no formato brasileiro: "DD de mês de YYYY"
      // 3. Se não encontrar, tenta formato DD/MM/YYYY ou DD.MM.YYYY
      // 4. Converte para formato DD.MM.YYYY
      // ========== RETORNO ==========
      // Retorna string formatada como DD.MM.YYYY
      const formatDateForFilename = (dateStr: string) => {
        if (!dateStr) {
          const today = new Date();
          return `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
        }

        // Tenta extrair data no formato brasileiro: "04 de dezembro de 2025"
        const dateMatch = dateStr.match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/);
        if (dateMatch) {
          const months: Record<string, string> = {
            'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
            'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
            'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
          };
          const day = dateMatch[1].padStart(2, '0');
          const month = months[dateMatch[2].toLowerCase()] || '01';
          const year = dateMatch[3];
          return `${day}.${month}.${year}`;
        }

        // Se já estiver no formato DD/MM/YYYY ou DD.MM.YYYY
        const dateMatch2 = dateStr.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
        if (dateMatch2) {
          const day = dateMatch2[1].padStart(2, '0');
          const month = dateMatch2[2].padStart(2, '0');
          const year = dateMatch2[3];
          return `${day}.${month}.${year}`;
        }

        return dateStr.replace(/\//g, '.').replace(/\s+/g, '_');
      };

      // ========== FORMATAÇÃO: NOME DO ARQUIVO PDF ==========
      // Formata a data usando a função auxiliar
      // Obtém o nome do município (usa 'CR' como padrão se não definido)
      const filenameDate = formatDateForFilename(options.data || '');
      const municipio = options.municipio || 'CR';

      // ========== EXTRAÇÃO: NOME E UF DO MUNICÍPIO ==========
      // Extrai o nome do município e a UF se estiver no formato "Nome - UF"
      // Exemplo: "Brasília - DF" -> nomeMunicipio: "Brasília", uf: "DF"
      const municipioParts = municipio.split(' - ');
      const nomeMunicipio = municipioParts[0];
      const uf = municipioParts[1] || '';

      // ========== CONSTRUÇÃO: NOME COMPLETO DO ARQUIVO ==========
      // Constrói o nome do arquivo no formato:
      // "DD.MM.YYYY - Proposta de Serviços Advocatícios - Município de NOME - UF (êxito).pdf"
      // Se houver UF, adiciona ao nome; caso contrário, omite
      let filename = `${filenameDate} - Proposta de Serviços Advocatícios - Município de ${nomeMunicipio}`;
      if (uf) {
        filename += ` - ${uf}`;
      }
      filename += ' (êxito).pdf';

      // ========== DOWNLOAD: ARQUIVO PDF ==========
      // Salva o PDF com o nome formatado, iniciando o download automático
      pdf.save(filename);

      setModal({
        open: true,
        title: "Sucesso",
        message: "PDF gerado e baixado com sucesso!",
        type: "success"
      });
    } catch (e: any) {
      console.error('Erro ao gerar PDF:', e);
      setModal({
        open: true,
        title: "Erro",
        message: `Erro ao gerar o PDF: ${e.message || 'Erro desconhecido'}. Tente novamente.`,
        type: "error"
      });
    } finally {
      setLoadingPdf(false);
    }
  };

  // ========== HANDLER: BAIXAR DOCX ==========
  // ========== DESCRIÇÃO GERAL ==========
  // Esta função gera um arquivo DOCX (Word) profissional usando a biblioteca docx
  // O documento é construído programaticamente, garantindo fidelidade total ao formato Word
  // ========== VANTAGENS ==========
  // - Sem conversão HTML quebrada: renderização nativa do Word
  // - Rodapés e cabeçalhos reais que se repetem em todas as páginas
  // - Imagens com tamanhos precisos e qualidade preservada
  // - Formatação tipográfica profissional (Garamond, espaçamentos corretos)
  // - Performance: processamento direto sem canvas invisível ou strings gigantes
  // ========== DIMENSÕES E ESPECIFICAÇÕES (em pt para paridade com prévia) ==========
  // - Imagens de logo: 170pt de largura (capa) / 145pt (páginas internas)
  // - Imagens de municípios: 300pt de largura
  // - Imagens de assinatura: 150pt de largura
  // - Páginas: formato A4 (210mm x 297mm)
  // - Margens: 20mm superior/inferior, 25mm esquerda
  // - Fonte: Garamond, 13pt (26 meios-pontos)
  // - Line-height: 17pt
  const handleDownloadDocx = async () => {
    // ========== VALIDAÇÃO: CAMPOS OBRIGATÓRIOS ==========
    // Verifica se o campo município foi preenchido
    // Se não estiver preenchido, exibe modal de erro e interrompe o processo
    if (!options.municipio || !options.municipio.trim()) {
      setModal({
        open: true,
        title: "Atenção",
        message: "Por favor, preencha o nome do município.",
        type: "error"
      });
      return;
    }

    if (!options.data || !options.data.trim()) {
      setModal({
        open: true,
        title: "Atenção",
        message: "Por favor, preencha a data da proposta.",
        type: "error"
      });
      return;
    }

    const activeServicesList = Object.keys(services).filter(k => services[k]);
    if (activeServicesList.length === 0) {
      setModal({
        open: true,
        title: "Atenção",
        message: "Por favor, selecione pelo menos uma tese/serviço.",
        type: "error"
      });
      return;
    }

    // ========== INICIALIZAÇÃO: ESTADO ==========
    // Ativa o estado de loading para mostrar feedback visual ao usuário
    setLoadingDocx(true);

    try {
      // ========== FUNÇÕES AUXILIARES: FORMATAÇÃO DE DATA ==========
      // Funções para formatar datas (mesmas do componente ProposalDocument)
      const formatDateNumeric = (dateStr: string): string => {
        if (!dateStr) {
          const today = new Date();
          const day = String(today.getDate()).padStart(2, '0');
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const year = today.getFullYear();
          return `${day}/${month}/${year}`;
        }
        const dateMatch = dateStr.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
        if (dateMatch) {
          const day = dateMatch[1].padStart(2, '0');
          const month = dateMatch[2].padStart(2, '0');
          const year = dateMatch[3];
          return `${day}/${month}/${year}`;
        }
        const dateMatch2 = dateStr.match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/);
        if (dateMatch2) {
          const day = dateMatch2[1].padStart(2, '0');
          const months: Record<string, string> = {
            'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
            'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
            'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
          };
          const month = months[dateMatch2[2].toLowerCase()] || '01';
          const year = dateMatch2[3];
          return `${day}/${month}/${year}`;
        }
        return dateStr;
      };

      const formatDateWithMonthName = (dateStr: string): string => {
        if (!dateStr) {
          const today = new Date();
          const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
          return `${today.getDate()} de ${months[today.getMonth()]} de ${today.getFullYear()}`;
        }
        if (dateStr.match(/\d{1,2}\s+de\s+\w+\s+de\s+\d{4}/)) {
          return dateStr;
        }
        const dateMatch = dateStr.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
        if (dateMatch) {
          const day = parseInt(dateMatch[1]);
          const month = parseInt(dateMatch[2]);
          const year = dateMatch[3];
          const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
          if (month >= 1 && month <= 12) {
            return `${day} de ${months[month - 1]} de ${year}`;
          }
        }
        return dateStr;
      };

      // ========== CARREGAMENTO: IMAGENS COMO BUFFERS ==========
      // Carrega todas as imagens necessárias como ArrayBuffer
      // Isso é muito mais eficiente que converter para base64 via canvas
      const loadImageAsBuffer = async (url: string): Promise<ArrayBuffer | null> => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            console.warn(`Erro ao carregar imagem: ${url}`);
            return null;
          }
          return await response.arrayBuffer();
        } catch (error) {
          console.warn(`Erro ao carregar imagem ${url}:`, error);
          return null;
        }
      };

      // Carrega todas as imagens em paralelo
      // IMPORTANTE: Verifique se os nomes dos arquivos estão corretos na pasta /public
      const [logoBuffer, assinaturaBuffer, municipios01Buffer, municipios02Buffer] = await Promise.all([
        loadImageAsBuffer('/logo-cavalcante-reis.png'),
        loadImageAsBuffer('/Assinatura.png'),
        loadImageAsBuffer('/munincipios01.png'),
        loadImageAsBuffer('/Munincipios02.png'),
      ]);

      // Log para debug (remover em produção se necessário)
      console.log('Imagens carregadas:', {
        logo: !!logoBuffer,
        assinatura: !!assinaturaBuffer,
        municipios01: !!municipios01Buffer,
        municipios02: !!municipios02Buffer,
      });

      // ========== CONSTRUÇÃO: RODAPÉ DO DOCUMENTO ==========
      // Cria o rodapé que aparecerá em todas as páginas
      const enabledOffices = [];
      if (footerOffices.rj.enabled) enabledOffices.push(footerOffices.rj);
      if (footerOffices.df.enabled) enabledOffices.push(footerOffices.df);
      if (footerOffices.sp.enabled) enabledOffices.push(footerOffices.sp);
      if (footerOffices.am.enabled) enabledOffices.push(footerOffices.am);

      // Se não houver escritórios habilitados, usa DF como padrão
      const officesToShow = enabledOffices.length > 0 ? enabledOffices : [
        { cidade: "Brasília - DF", linha1: "SHIS QL 10, Conj. 06, Casa 19", linha2: "Lago Sul,", linha3: "CEP: 71630-065" }
      ];

      // ========== CONSTRUÇÃO: RODAPÉ DO DOCUMENTO ==========
      // Cria uma tabela para os escritórios ficarem lado a lado no rodapé
      // Segue o padrão do HTML: fonte 9-10px, centralizado, layout flexível
      const footerTableRows = [new TableRow({
        children: officesToShow.map(office =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  // Cidade em negrito, maiúsculas, 9pt (18 half-points)
                  new TextRun({
                    text: office.cidade.toUpperCase(),
                    bold: true,
                    size: 18, // 9pt (docx usa meios-pontos: 9 * 2 = 18)
                    font: "Garamond",
                    color: "000000"
                  }),
                  // Linha 1: 9.9pt (19.8 ≈ 20 half-points)
                  new TextRun({
                    text: `\n${office.linha1}`,
                    size: 20, // 10pt (9.9pt arredondado)
                    font: "Garamond",
                    color: "000000"
                  }),
                  // Linha 2: 10pt (20 half-points)
                  new TextRun({
                    text: `\n${office.linha2}`,
                    size: 20, // 10pt
                    font: "Garamond",
                    color: "000000"
                  }),
                  // Linha 3: 10pt (20 half-points)
                  new TextRun({
                    text: `\n${office.linha3}`,
                    size: 20, // 10pt
                    font: "Garamond",
                    color: "000000"
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
              }),
            ],
            width: { size: 100 / officesToShow.length, type: WidthType.PERCENTAGE },
            margins: { top: 100, bottom: 100, left: 100, right: 100 }, // Margens internas
          })
        ),
      })];

      const footerTable = new Table({
        rows: footerTableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          // Remove bordas da tabela para ficar limpo (igual ao HTML sem bordas)
          top: { size: 0, style: "none" },
          bottom: { size: 0, style: "none" },
          left: { size: 0, style: "none" },
          right: { size: 0, style: "none" },
          insideHorizontal: { size: 0, style: "none" },
          insideVertical: { size: 0, style: "none" },
        },
      });

      // Cria o footer completo com tabela de escritórios e linha com site
      const documentFooter = new Footer({
        children: [
          footerTable,
          new Paragraph({
            children: [
              new TextRun({
                text: "WWW.CAVALCANTE-REIS.ADV.BR",
                size: 20, // 10pt
                font: "Garamond",
                color: "000000", // Força cor preta
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
            border: {
              top: {
                color: "D0D0D0",
                size: 6, // Linha superior fina
                style: "single",
              },
            },
          }),
        ],
      });

      // ========== CONSTRUÇÃO: CABEÇALHOS (DIFERENTES PARA CAPA E CONTEÚDO) ==========
      // Cabeçalho da CAPA: Logo 170pt para paridade com prévia
      const headerCapa = new Header({
        children: logoBuffer ? [
          new Paragraph({
            children: [
              new ImageRun({
                data: logoBuffer,
                transformation: {
                  width: 170 * 9525, // 170pt em EMUs (paridade com prévia)
                  height: (170 * 9525) * 0.34, // Proporção aproximada
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 }, // Mais espaço após o logo grande
          }),
        ] : [
          new Paragraph({ text: "" }) // Parágrafo vazio se não houver logo
        ],
      });

      // Cabeçalho do CONTEÚDO: Logo 145pt para paridade com prévia
      const headerConteudo = new Header({
        children: logoBuffer ? [
          new Paragraph({
            children: [
              new ImageRun({
                data: logoBuffer,
                transformation: {
                  width: 145 * 9525, // 145pt em EMUs (paridade com prévia)
                  height: (145 * 9525) * 0.35, // Proporção aproximada
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }, // Espaço padrão após o logo menor
          }),
        ] : [
          new Paragraph({ text: "" }) // Parágrafo vazio se não houver logo
        ],
      });

      // ========== CONSTRUÇÃO: CONTEÚDO DO DOCUMENTO ==========
      // ========== ESTRATÉGIA: MÚLTIPLAS SEÇÕES ==========
      // Seção 1: Capa (COM cabeçalho e rodapé, igual às outras páginas)
      // Seção 2: Todo o conteúdo principal (Sumário + todas as seções)
      // O Word quebra páginas automaticamente quando o conteúdo chega no rodapé

      // ========== SEÇÃO 1: CAPA ==========
      // A capa NÃO deve ter o logo duplicado no conteúdo, pois já está no header
      const capaChildren: any[] = [];

      // Informações da capa (Proponente, Destinatário, Data) alinhadas à direita
      // O logo já aparece no cabeçalho, então não precisamos adicionar aqui
      capaChildren.push(
        new Paragraph({ text: "", spacing: { after: 600 } }), // Espaço após cabeçalho
        createSimpleParagraph("Proponente:", { bold: true, alignment: AlignmentType.RIGHT, size: 26 }),
        createSimpleParagraph("Cavalcante Reis Advogados", { alignment: AlignmentType.RIGHT, size: 26 }),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        createSimpleParagraph("Destinatário:", { bold: true, alignment: AlignmentType.RIGHT, size: 26 }),
        createSimpleParagraph(options.destinatario || options.municipio || "[Nome do Destinatário]", { alignment: AlignmentType.RIGHT, size: 26 }),
        new Paragraph({ text: "", spacing: { after: 400 } }),
        createSimpleParagraph(formatDateNumeric(options.data || "") || new Date().getFullYear().toString(), { bold: true, alignment: AlignmentType.RIGHT, size: 26 })
      );

      // ========== SEÇÃO 2: CONTEÚDO PRINCIPAL ==========
      // Array que conterá todo o conteúdo principal (Sumário + todas as seções)
      // O Word vai quebrar páginas automaticamente quando chegar no rodapé
      const conteudoPrincipal: any[] = [];

      // ========== SUMÁRIO ==========
      conteudoPrincipal.push(
        new Paragraph({
          text: "Sumário",
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 400 },
        }),
        createSimpleParagraph("1. Objeto da Proposta", { bold: true }),
        createSimpleParagraph("2. Análise da Questão", { bold: true }),
        createSimpleParagraph("3. Dos Honorários, das Condições de Pagamento e Despesas", { bold: true }),
        createSimpleParagraph("4. Prazo e Cronograma de Execução dos Serviços", { bold: true }),
        createSimpleParagraph("5. Experiência em atuação em favor de Municípios e da Equipe Responsável", { bold: true }),
        createSimpleParagraph("6. Disposições Finais", { bold: true }),
        new Paragraph({ text: "", spacing: { after: 600 } }) // Espaço após sumário
      );

      // ========== SEÇÃO 1: OBJETO DA PROPOSTA ==========
      const activeServices = Object.keys(services).filter(k => services[k]);

      conteudoPrincipal.push(
        new Paragraph({
          text: "1. Objeto da Proposta",
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 400 },
        }),
        createSimpleParagraph(
          `É objeto do presente contrato o desenvolvimento de serviços advocatícios especializados por parte da Proponente, Cavalcante Reis Advogados, ao Aceitante, Município de ${options.municipio || "[MUNICÍPIO]"}, a fim de prestação de serviços de assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico, Financeiro, Previdenciário, atuando perante o Ministério da Fazenda e os seus órgãos administrativos, em especial para alcançar o incremento de receitas, ficando responsável pelo ajuizamento, acompanhamento e eventuais intervenções de terceiro em ações de interesse do Município.`,
          { alignment: AlignmentType.JUSTIFIED }
        ),
        new Paragraph({ text: "", spacing: { after: 400 } }),
        createSimpleParagraph("A proposta inclui os seguintes objetos:", { alignment: AlignmentType.JUSTIFIED })
      );

      // ========== TABELA DE TESES ==========
      // Cria a tabela com as teses e cabimentos
      const tableRows = [
        new TableRow({
          children: [
            new TableCell({
              children: [createSimpleParagraph("TESE", { bold: true, alignment: AlignmentType.CENTER })],
              shading: { fill: "F9F9F9" },
            }),
            new TableCell({
              children: [createSimpleParagraph("CABIMENTO", { bold: true, alignment: AlignmentType.CENTER })],
              shading: { fill: "F9F9F9" },
            }),
          ],
        }),
        ...activeServices.map(serviceKey =>
          new TableRow({
            children: [
              new TableCell({
                children: [createSimpleParagraph(allServices[serviceKey], { bold: true })],
              }),
              new TableCell({
                children: [createSimpleParagraph(customCabimentos[serviceKey] || "Cabível", { bold: true, alignment: AlignmentType.CENTER })],
              }),
            ],
          })
        ),
      ];

      const tesesTable = new Table({
        rows: tableRows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        borders: {
          top: { style: "single", size: 1, color: "000000" },
          bottom: { style: "single", size: 1, color: "000000" },
          left: { style: "single", size: 1, color: "000000" },
          right: { style: "single", size: 1, color: "000000" },
          insideHorizontal: { style: "single", size: 1, color: "000000" },
          insideVertical: { style: "single", size: 1, color: "000000" },
        },
      });

      conteudoPrincipal.push(tesesTable);
      conteudoPrincipal.push(
        new Paragraph({ text: "", spacing: { after: 400 } }),
        createSimpleParagraph("Além disso, a proposta também tem como objeto:", { alignment: AlignmentType.JUSTIFIED }),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        createSimpleParagraph(`(i) Análise do caso concreto, com a elaboração dos estudos pertinentes ao Município de ${options.municipio || "[MUNICÍPIO]"};`, { alignment: AlignmentType.JUSTIFIED }),
        createSimpleParagraph("(ii) Ingresso de medida administrativa perante e/ou judicial, com posterior acompanhamento do processo durante sua tramitação, com realização de defesas, diligências, manifestação em razão de intimações, produção de provas, recursos e demais atos necessários ao deslinde dos feitos;", { alignment: AlignmentType.JUSTIFIED }),
        createSimpleParagraph("(iii) Atuação perante a Justiça Federal seja na condição de recorrente ou recorrido, bem como interposição de recursos ou apresentação de contrarrazões aos Tribunais Superiores, se necessário for;", { alignment: AlignmentType.JUSTIFIED }),
        createSimpleParagraph("(iv) Acompanhamento processual completo, até o trânsito em Julgado da Sentença administrativa e/ou judicial;", { alignment: AlignmentType.JUSTIFIED }),
        new Paragraph({ text: "", spacing: { after: 400 } }) // Espaço após seção 1
      );

      // ========== SEÇÃO 2: ANÁLISE DA QUESTÃO ==========
      conteudoPrincipal.push(
        new Paragraph({
          text: "2. Análise da Questão",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 400 },
        })
      );

      // Adiciona cada tese selecionada como uma subseção
      let sectionNumber = 1;
      activeServices.forEach((serviceKey) => {
        conteudoPrincipal.push(
          new Paragraph({
            text: `2.${sectionNumber} – ${allServices[serviceKey]}`,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 200 },
          })
        );

        // Converte o HTML da tese para parágrafos do Word
        const htmlContent = serviceTextDatabase[serviceKey] || "";
        const paragraphs = parseHtmlToDocx(htmlContent);
        conteudoPrincipal.push(...paragraphs);

        sectionNumber++;
      });

      // Espaço após seção 2 (Word quebra página automaticamente se necessário)
      conteudoPrincipal.push(new Paragraph({ text: "", spacing: { after: 400 } }));

      // ========== SEÇÃO 3: HONORÁRIOS ==========
      conteudoPrincipal.push(
        new Paragraph({
          text: "3. Dos Honorários, das Condições de Pagamento e Despesas",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 400 },
        }),
        createSimpleParagraph(
          "Os valores levantados a título de incremento são provisórios, baseados em informações preliminares, podendo, ao final, representar valores a maior ou a menor.",
          { alignment: AlignmentType.JUSTIFIED }
        ),
        new Paragraph({ text: "", spacing: { after: 400 } }),
        createSimpleParagraph(
          "Considerando a necessidade de manutenção do equilíbrio econômico-financeiro do contrato administrativo, propõe o escritório CAVALCANTE REIS ADVOGADOS que esta Municipalidade pague ao Proponente da seguinte forma:",
          { alignment: AlignmentType.JUSTIFIED }
        ),
        new Paragraph({ text: "", spacing: { after: 400 } }),
        createMixedParagraph([
          { text: "3.1.1 " },
          { text: "Para todos os demais itens descritos nesta Proposta", bold: true },
          { text: " será efetuado o pagamento de honorários advocatícios à CAVALCANTE REIS ADVOGADOS pela execução dos serviços de recuperação de créditos, " },
          { text: "ad êxito", bold: true },
          { text: ` na ordem de ${paymentValue || "R$ 0,12 (doze centavos)"} para cada R$ 1,00 (um real) do montante referente ao incremento financeiro, ou seja, com base nos valores que entrarem nos cofres do CONTRATANTE;` },
        ], { alignment: AlignmentType.JUSTIFIED }),
        createMixedParagraph([
          { text: "3.1.2 Em caso de valores retroativos recuperados em favor da municipalidade, que consiste " },
          { text: "nos valores não repassados em favor do Contratante nos últimos 5 (cinco)", bold: true },
          { text: " anos (prescrição quinquenal) ou não abarcados pela prescrição, também serão cobrados honorários advocatícios na ordem " },
          { text: `de ${paymentValue || "R$ 0,12 (doze centavos)"} para cada R$ 1,00 (um real) do montante recuperado aos Cofres Municipais.`, bold: true },
        ], { alignment: AlignmentType.JUSTIFIED }),
        createMixedParagraph([
          { text: "3.1.3 Sendo um contrato " },
          { text: "AD EXITUM,", bold: true },
          { text: " acaso o incremento financeiro em favor deste Município supere o valor mencionado na cláusula que trata do valor do contrato, os desembolsos não poderão ser previstos por dotação orçamentária, posto que terão origem na REDUÇÃO DE DESPESAS/INCREMENTO DE RECEITAS, como consequência da prestação dos serviços." },
        ], { alignment: AlignmentType.JUSTIFIED }),
        new Paragraph({ text: "", spacing: { after: 400 } }) // Espaço após seção 3
      );

      // ========== SEÇÃO 4: PRAZO ==========
      conteudoPrincipal.push(
        new Paragraph({
          text: "4. Prazo e Cronograma de Execução dos Serviços",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 400 },
        }),
        createMixedParagraph([
          { text: "O prazo de execução será de " },
          { text: `${prazo} (vinte e quatro) meses`, bold: true },
          { text: ", podendo ser prorrogado por interesse das partes, com base no art. 107 da Lei n.º 14.133/21." },
        ], { alignment: AlignmentType.JUSTIFIED }),
        new Paragraph({ text: "", spacing: { after: 400 } }) // Espaço após seção 4
      );

      // ========== SEÇÃO 5: EXPERIÊNCIA E EQUIPE ==========
      conteudoPrincipal.push(
        new Paragraph({
          text: "5. Experiência em atuação em favor de Municípios e da Equipe Responsável",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 400 },
        }),
        createSimpleParagraph(
          "No portfólio de serviços executados e/ou em execução, constam os seguintes Municípios contratantes:",
          { alignment: AlignmentType.JUSTIFIED }
        ),
        new Paragraph({ text: "", spacing: { after: 400 } })
      );

      // Adiciona imagens dos municípios (Tópico 5) - 300pt para paridade com a prévia
      if (municipios01Buffer) {
        conteudoPrincipal.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: municipios01Buffer,
                transformation: {
                  width: 300 * 9525, // 300pt em EMUs (paridade com prévia)
                  height: (300 * 9525) * 0.75, // Proporção aproximada
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
          })
        );
      } else {
        console.warn('Imagem municípios01 não foi carregada! Verifique se o arquivo /munincipios01.png existe na pasta /public');
      }

      if (municipios02Buffer) {
        conteudoPrincipal.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: municipios02Buffer,
                transformation: {
                  width: 300 * 9525, // 300pt em EMUs (paridade com prévia)
                  height: (300 * 9525) * 0.75, // Proporção aproximada
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          })
        );
      } else {
        console.warn('Imagem municípios02 não foi carregada! Verifique se o arquivo /Munincipios02.png existe na pasta /public');
      }

      conteudoPrincipal.push(
        createSimpleParagraph(
          "Para coordenar os trabalhos de consultoria propostos neste documento, a CAVALCANTE REIS ADVOGADOS alocará os seguintes profissionais:",
          { alignment: AlignmentType.JUSTIFIED }
        ),
        new Paragraph({ text: "", spacing: { after: 400 } }),
        createMixedParagraph([
          { text: "IURI DO LAGO NOGUEIRA CAVALCANTE REIS", bold: true },
          { text: " - Doutorando em Direito e Mestre em Direito Econômico e Desenvolvimento pelo Instituto Brasileiro de Ensino, Desenvolvimento e Pesquisa (IDP/Brasília). LLM (Master of Laws) em Direito Empresarial pela Fundação Getúlio Vargas (FGV/RJ). Integrante da Comissão de Juristas do Senado Federal criada para consolidar a proposta do novo Código Comercial Brasileiro. Autor e Coautor de livros, pareceres e artigos jurídicos na área do direito público. Sócio-diretor do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: iuri@cavalcantereis.adv.br)." },
        ], { alignment: AlignmentType.JUSTIFIED }),
        new Paragraph({ text: "", spacing: { after: 400 } }),
        createMixedParagraph([
          { text: "PEDRO AFONSO FIGUEIREDO DE SOUZA", bold: true },
          { text: " - Graduado em Direito pela Pontifícia Universidade Católica de Minas Gerais. Especialista em Direito Penal e Processo Penal pela Academia Brasileira de Direito Constitucional. Mestre em Direito nas Relações Econômicas e Sociais pela Faculdade de Direito Milton Campos. Diretor de Comunicação e Conselheiro Consultivo, Científico e Fiscal do Instituto de Ciências Penais. Autor de artigos e capítulos de livros jurídicos. Advogado associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: pedro@cavalcantereis.adv.br)." },
        ], { alignment: AlignmentType.JUSTIFIED }),
        createMixedParagraph([
          { text: "SÉRGIO RICARDO ALVES DE JESUS FILHO", bold: true },
          { text: " - Graduado em Direito pelo Centro Universitário de Brasília (UniCEUB). Graduando em Ciências Contábeis pelo Centro Universitário de Brasília (UniCEUB). Pós-graduando em Direito Tributário pelo Instituto Brasileiro de Ensino, Desenvolvimento e Pesquisa (IDP). Membro da Comissão de Assuntos Tributários da OAB/DF. Advogado Associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: sergio@cavalcantereis.adv.br)." },
        ], { alignment: AlignmentType.JUSTIFIED }),
        createMixedParagraph([
          { text: "GABRIEL GAUDÊNCIO ZANCHETTA CALIMAN", bold: true },
          { text: " - Graduado em Direito pelo Centro Universitário de Brasília (UniCeub). Especialista em Gestão Pública e Tributária pelo Gran Centro Universitário. Membro da Comissão de Assuntos Tributários da OAB/DF. Advogado associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: gabrielcaliman@cavalcantereis.adv.br)." },
        ], { alignment: AlignmentType.JUSTIFIED }),
        createMixedParagraph([
          { text: "FELIPE NOBREGA ROCHA", bold: true },
          { text: " - CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: felipe@cavalcantereis.adv.br)." },
        ], { alignment: AlignmentType.JUSTIFIED }),
        createMixedParagraph([
          { text: "RYSLHAINY DOS SANTOS CORDEIRO", bold: true },
          { text: " - Advogada associada do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: ryslhainy@cavalcantereis.adv.br)." },
        ], { alignment: AlignmentType.JUSTIFIED }),
        new Paragraph({ text: "", spacing: { after: 400 } }),
        createSimpleParagraph(
          "Além desses profissionais, a CAVALCANTE REIS ADVOGADOS alocará uma equipe de profissionais pertencentes ao seu quadro técnico, utilizando, também, caso necessário, o apoio técnico especializado de terceiros, pessoas físicas ou jurídicas, que deverão atuar sob sua orientação, cabendo à CAVALCANTE REIS ADVOGADOS a responsabilidade técnica pela execução das tarefas.",
          { alignment: AlignmentType.JUSTIFIED }
        ),
        new Paragraph({ text: "", spacing: { after: 400 } }),
        createSimpleParagraph(
          "Nossa contratação, portanto, devido à altíssima qualificação e experiência, aliada à singularidade do objeto da demanda, bem como os diferenciais já apresentados acima, está inserida dentre as hipóteses do art. 6°, XVIII \"e\" e art. 74, III, \"e\", da Lei n.º 14.133/2021.",
          { alignment: AlignmentType.JUSTIFIED }
        ),
        new Paragraph({ text: "", spacing: { after: 400 } }) // Espaço após seção 5
      );

      // ========== SEÇÃO 6: DISPOSIÇÕES FINAIS ==========
      conteudoPrincipal.push(
        new Paragraph({
          text: "6. Disposições Finais",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 400 },
        }),
        createSimpleParagraph(
          "Nesse sentido, ficamos no aguardo da manifestação deste Município para promover os ajustes contratuais que entenderem necessários, sendo mantida a mesma forma de remuneração aqui proposta, com fundamento no art. 6º, XVIII, \"e\" e art. 74, III, \"e\", da Lei n.º 14.133/2021.",
          { alignment: AlignmentType.JUSTIFIED }
        ),
        new Paragraph({ text: "", spacing: { after: 400 } }),
        createSimpleParagraph(
          "A presente proposta tem validade de 60 (sessenta) dias.",
          { alignment: AlignmentType.JUSTIFIED }
        ),
        new Paragraph({ text: "", spacing: { after: 400 } }),
        createSimpleParagraph(
          "Sendo o que se apresenta para o momento, aguardamos posicionamento da parte de V. Exa., colocando-nos, desde já, à inteira disposição para dirimir quaisquer dúvidas eventualmente existentes.",
          { alignment: AlignmentType.JUSTIFIED }
        ),
        new Paragraph({ text: "", spacing: { after: 800 } }),
        createSimpleParagraph(`Brasília-DF, ${formatDateWithMonthName(options.data || '')}.`, { alignment: AlignmentType.LEFT }),
        new Paragraph({ text: "", spacing: { after: 800 } }),
        createSimpleParagraph("Atenciosamente,", { alignment: AlignmentType.LEFT }),
        new Paragraph({ text: "", spacing: { after: 400 } })
      );

      // Adiciona assinatura (final do documento) - 150pt para paridade com prévia
      if (assinaturaBuffer) {
        conteudoPrincipal.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: assinaturaBuffer,
                transformation: {
                  width: 150 * 9525, // 150pt em EMUs (paridade com prévia)
                  height: (150 * 9525) * 0.3, // Proporção aproximada da assinatura
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
          })
        );
      } else {
        console.warn('Assinatura não foi carregada! Verifique se o arquivo /Assinatura.png existe na pasta /public');
      }

      conteudoPrincipal.push(
        createSimpleParagraph("CAVALCANTE REIS ADVOGADOS", { bold: true, alignment: AlignmentType.CENTER, size: 30 })
      );

      // ========== CRIAÇÃO: DOCUMENTO WORD COM MÚLTIPLAS SEÇÕES ==========
      // Cria o documento final com seções separadas para capa e conteúdo principal
      const doc = new Document({
        sections: [
          // ========== SEÇÃO 1: CAPA (COM cabeçalho GRANDE e rodapé) ==========
          {
            properties: {
              type: SectionType.NEXT_PAGE, // Garante que a próxima seção comece em nova página
              page: {
                size: {
                  orientation: "portrait",
                  width: 11906, // A4 width em twips (210mm)
                  height: 16838, // A4 height em twips (297mm)
                },
                // Margens da capa: top/bottom 2.5cm, left 3cm, right 2.5cm (1cm ≈ 567 twips)
                margin: {
                  top: 1417,   // 2.5cm (espaço para cabeçalho GRANDE)
                  right: 1417, // 2.5cm
                  bottom: 1417, // 2.5cm (reservando espaço para rodapé)
                  left: 1701,  // 3cm
                },
              },
            },
            // Cabeçalho com logo GRANDE (~220px) na capa
            headers: {
              default: headerCapa,
            },
            // Rodapé com endereços e site (igual às outras páginas)
            footers: {
              default: documentFooter,
            },
            // Conteúdo da capa
            children: capaChildren,
          },
          // ========== SEÇÃO 2: CONTEÚDO PRINCIPAL (fluxo contínuo) ==========
          // Conteúdo em sequência; o Word quebra página ao atingir a margem inferior.
          // Margem bottom maior (3cm) evita texto sobre o rodapé.
          {
            properties: {
              type: SectionType.CONTINUOUS, // Fluxo contínuo após a capa
              page: {
                size: {
                  orientation: "portrait",
                  width: 11906, // A4 (210mm)
                  height: 16838, // A4 (297mm)
                },
                // Margens: top 2.5cm (cabeçalho), bottom 3cm (protege rodapé), left 2.5cm, right 2cm
                margin: {
                  top: 1417,   // 2.5cm (cabeçalho não sobrepõe texto)
                  right: 1134, // 2cm
                  bottom: 1701, // 3cm (texto para antes de atingir o rodapé)
                  left: 1417,  // 2.5cm
                },
              },
            },
            // Cabeçalho com logo PEQUENO/PADRÃO (~100px) no conteúdo
            headers: {
              default: headerConteudo,
            },
            // Rodapé que se repete em todas as páginas desta seção (mesmo da capa)
            footers: {
              default: documentFooter,
            },
            // Todo o conteúdo principal: o Word quebra páginas automaticamente
            children: conteudoPrincipal,
          },
        ],
        styles: {
          default: {
            document: {
              run: {
                font: "Garamond",
                size: 26, // 13pt (docx usa meios-pontos: 13 * 2 = 26)
                color: "000000", // Força cor preta em todo o documento
              },
            },
          },
        },
      });

      // ========== GERAÇÃO E DOWNLOAD: DOCX ==========
      // Gera o blob do documento e faz o download
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Proposta_${options.municipio || "CR"}.docx`);

      // ========== FEEDBACK: SUCESSO ==========
      setModal({
        open: true,
        title: "Sucesso",
        message: "DOCX gerado e baixado com sucesso!",
        type: "success"
      });

    } catch (e: any) {
      // ========== TRATAMENTO: ERRO ==========
      // Em caso de erro durante o processo, registra no console e exibe modal de erro
      // Mostra mensagem de erro amigável ao usuário
      console.error('Erro ao gerar DOCX:', e);
      setModal({
        open: true,
        title: "Erro",
        message: `Erro ao gerar DOCX: ${e.message || 'Erro desconhecido'}. Tente novamente.`,
        type: "error"
      });
    } finally {
      // ========== FINALIZAÇÃO: DESATIVA LOADING ==========
      // Sempre desativa o estado de loading, independente de sucesso ou erro
      // Isso garante que o botão volte ao estado normal após o processo
      setLoadingDocx(false);
    }
  };

  // ========== RENDERIZAÇÃO: TELA DE LOADING ==========
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

      {/* Conteúdo principal: sidebar de controles + prévia da proposta */}
      <main className="main">
        <div className="desktop-layout">
          {/* Sidebar com controles de personalização */}
          <ControlsSidebar
            options={options} setOptions={setOptions}
            prazo={prazo} setPrazo={setPrazo}
            services={services} setServices={setServices}
            customCabimentos={customCabimentos} setCustomCabimentos={setCustomCabimentos}
            customEstimates={customEstimates} setCustomEstimates={setCustomEstimates}
            rppsImage={rppsImage} setRppsImage={setRppsImage}
            footerOffices={footerOffices} setFooterOffices={setFooterOffices}
            paymentValue={paymentValue} setPaymentValue={setPaymentValue}
            retentionPeriod={retentionPeriod} setRetentionPeriod={setRetentionPeriod}
            onStartFromScratch={() => { setOptions({ municipio: "", data: "", destinatario: "" }); setServices({}); }}
            onImportDocx={() => alert("Função em desenvolvimento para a nova arquitetura")}
            onSaveProposal={handleSaveProposal}
            onDownloadDocx={handleDownloadDocx}
            loadingDocx={loadingDocx}
            loadingProposals={loadingProposals}
          />
          <div className="content">
            <h2 className="preview-title">Documento da Proposta</h2>
            <ProposalDocument
              options={options} prazo={prazo} services={services}
              customCabimentos={customCabimentos} customEstimates={customEstimates}
              rppsImage={rppsImage} footerOffices={footerOffices} paymentValue={paymentValue}
            />
          </div>
        </div>

        {/* Layout mobile: mensagem para usar no desktop */}
        <div className="mobile-layout">
          <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
            Acesse pelo computador para uma melhor experiência de edição.
          </div>
        </div>

        {/* Modal de notificações (sucesso, erro, avisos) */}
        <Modal {...modal} onConfirm={() => setModal({ ...modal, open: false })} />
      </main>
    </div>
  );
}
