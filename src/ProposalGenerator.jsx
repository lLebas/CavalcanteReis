import React, { useState, useMemo, useEffect } from "react";
import Modal from "./Modal";
import DOMPurify from "dompurify";
import { Clipboard, Settings, FileText, Eye, X } from "lucide-react";
import { saveAs } from "file-saver";
import mammoth from "mammoth";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, ImageRun, Footer } from "docx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Paleta baseada nas imagens enviadas
const colors = {
  light: {
    background: '#fef6e4',
    headline: '#001858',
    paragraph: '#172c66',
    button: '#f582ae',
    buttonText: '#001858',
    stroke: '#001858',
    main: '#f3d2c1',
    highlight: '#fef6e4',
    secondary: '#8bd3dd',
    tertiary: '#f582ae',
    docBg: '#ffffff',
    docText: '#000000',
    sidebarBg: '#ffffff',
    sidebarBorder: '#e0e0e0',
    tableBorder: '#000000', // Alterado para preto para melhor visibilidade e consistência.
    tableHeaderBg: '#f0f0f0',
    buttonSecondary: '#8bd3dd', // Botão secundário (PDF)
  }
};

// --- Serviços disponíveis e seus nomes completos ---
const allServices = {
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

// --- Banco de textos oficiais de cada serviço (HTML) ---
const serviceTextDatabase = {
  pasep: `
<p style="margin: 2px 0; text-align: justify;">No julgamento do IRDR, ficou estabelecido que a Constituição Federal, através do 
art. 158, inciso I, que define o direito do Ente municipal ao produto da arrecadação 
8 -
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
por meio da capacitação, as orientações sobre as medidas legais e cabíveis quanto às matériias envolvidas.</p>
<p>Por oportuno, a seguir colaciona-se quadro técnico ilustrativo:</p>
<div class="image-placeholder"></div>
<p>Em relação ao objeto desta (INSS – RPPS) o valor estimado de recuperação da 
receita é de {{rpps_estimate}}.</p>
  `,
  folhaPagamento: `
    <p>Realização de auditoria das folhas de pagamento referentes ao Regime Geral, bem como das GFIPS e tabela de incidências do INSS.</p>
    <p>Há muito se discute acerca da correta base de cálculo das contribuições previdenciárias, especialmente porque há conflitos entre a legislação infraconstitucional e as diretrizes da Constituição Federal.</p>
    <p>Em aspectos gerais, nota-se que alguns elementos são destacados pelos entendimentos jurisprudenciais e pela doutrina, como requisitos a serem observados para definir se um determinado valor deve ou não compor a base de incidência da exação.</p>
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
mais qualquer tipo de lesão ao seu direito de consumidor de energia elétrica;</p>
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

const ControlsSidebar = ({
  theme,
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
}) => {
  const themeColors = colors[theme];

  const handleServiceChange = (serviceName) => {
    setServices((prev) => ({ ...prev, [serviceName]: !prev[serviceName] }));
  };

  const handleCabimentoChange = (serviceName, value) => {
    const sanitizedValue = value
      .replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove scripts
      .replace(/<[^>]+>/g, "") // Remove tags HTML
      .trim();
    setCustomCabimentos((prev) => ({ ...prev, [serviceName]: sanitizedValue }));
  };

  const handleEstimateChange = (serviceName, value) => {
    setCustomEstimates((prev) => ({ ...prev, [serviceName]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRppsImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    // Sanitizar entrada para prevenir XSS
    const sanitizedValue = value
      .replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove scripts
      .replace(/<[^>]+>/g, ""); // Remove tags HTML
    setOptions((prev) => ({ ...prev, [name]: sanitizedValue }));
  };

  const handleDateChange = (e) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.length > 8) {
      input = input.slice(0, 8);
    }

    let formattedInput = '';
    if (input.length > 4) {
      formattedInput = `${input.slice(0, 2)}/${input.slice(2, 4)}/${input.slice(4)}`;
    } else if (input.length > 2) {
      formattedInput = `${input.slice(0, 2)}/${input.slice(2)}`;
    } else {
      formattedInput = input;
    }

    setOptions((prev) => ({ ...prev, data: formattedInput }));
  };

  return (
    <aside
      className="sidebar"
      style={{ backgroundColor: themeColors.sidebarBg, borderColor: themeColors.sidebarBorder }}>
      <div className="sidebar-header">
        <Settings />
        <h2>Personalizar Proposta</h2>
      </div>

      {/* Botões de Início */}
      <div className="start-buttons" style={{ marginTop: "16px", marginBottom: "16px" }}>
        <button
          onClick={onStartFromScratch}
          className="btn"
          style={{
            width: "100%",
            marginBottom: "8px",
            background: "var(--button)",
            color: "var(--button-text)",
          }}>
          Começar do Zero
        </button>
        <button
          onClick={() => document.getElementById("import-docx-input").click()}
          className="btn"
          style={{
            width: "100%",
            background: "var(--surface)",
            border: "2px solid var(--button)",
            color: "var(--headline)",
          }}>
          📄 Importar .docx Modelo
        </button>
        <input
          id="import-docx-input"
          type="file"
          accept=".docx"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImportDocx(file);
          }}
        />
      </div>

      <hr />

      <div className="field">
        <label>Município Destinatário</label>
        <input
          name="municipio"
          value={options.municipio}
          onChange={handleOptionChange}
          maxLength={100}
          placeholder="Nome do Município"
        />
      </div>

      <div className="field">
        <label>Data da Proposta</label>
        <input
          name="data"
          value={options.data}
          onChange={handleDateChange}
          maxLength={10}
          placeholder="DD/MM/AAAA"
        />
      </div>

      <div className="field">
        <label>Prazo de Execução</label>
        <input
          name="prazo"
          value={prazo}
          onChange={(e) => setPrazo(e.target.value)}
          maxLength={100}
          placeholder="24 (vinte e quatro)"
        />
      </div>

      <hr />

      <h3>Serviços (Seções)</h3>

      {/* Botões Selecionar/Desmarcar Todos */}
      <div style={{ display: "flex", gap: "8px", margin: "16px 0" }}>
        <button
          className="btn"
          style={{ flex: 1, background: "var(--button)", color: "var(--button-text)" }}
          onClick={() =>
            setServices(
              Object.keys(allServices).reduce((acc, key) => {
                acc[key] = true;
                return acc;
              }, {})
            )
          }>
          Selecionar Todos
        </button>
        <button
          className="btn"
          style={{ flex: 1, background: "var(--surface)", border: "2px solid var(--stroke)", color: "var(--headline)" }}
          onClick={() =>
            setServices(
              Object.keys(allServices).reduce((acc, key) => {
                acc[key] = false;
                return acc;
              }, {})
            )
          }>
          Desmarcar Todos
        </button>
      </div>

      <div className="services">
        {Object.entries(allServices).map(([key, label]) => {
          const hasCabivel = customCabimentos.hasOwnProperty(key);
          return (
            <div key={key} style={{ marginBottom: "12px" }}>
              <label className="service-item">
                <input type="checkbox" checked={!!services[key]} onChange={() => handleServiceChange(key)} />
                <span>{label}</span>
              </label>
              {hasCabivel && services[key] && (
                <div style={{ marginLeft: "24px", marginTop: "4px" }}>
                  <input
                    type="text"
                    value={customCabimentos[key] || ""}
                    onChange={(e) => handleCabimentoChange(key, e.target.value)}
                    placeholder="Cabimento/Perspectiva"
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      fontSize: "13px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              )}
              {key === 'rpps' && services[key] && (
                <div style={{ marginLeft: "24px", marginTop: "4px" }}>
                  <label style={{ fontSize: '12px' }}>Valor Estimado</label>
                  <input
                    type="text"
                    value={customEstimates.rpps}
                    onChange={(e) => handleEstimateChange('rpps', e.target.value)}
                    placeholder="Valor estimado"
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      fontSize: "13px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              )}
              {key === 'rpps' && services[key] && (
                <div style={{ marginLeft: "24px", marginTop: "4px" }}>
                  <label style={{ fontSize: '12px' }}>Imagem</label>
                  <input
                    type="file"
                    id="rpps-image-input"
                    style={{ display: 'none' }}
                    accept="image/png, image/jpeg"
                    onChange={handleImageUpload}
                  />
                  <button
                    onClick={() => document.getElementById('rpps-image-input').click()}
                    className="btn"
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    Anexar Imagem
                  </button>
                  {rppsImage && <img src={rppsImage} alt="Preview" style={{ width: '100%', marginTop: '8px' }} />}
                </div>
              )}
              {key === 'impostoRenda' && services[key] && (
                <div style={{ marginLeft: "24px", marginTop: "4px" }}>
                  <label style={{ fontSize: '12px' }}>Valor Estimado</label>
                  <input
                    type="text"
                    value={customEstimates.impostoRenda}
                    onChange={(e) => handleEstimateChange('impostoRenda', e.target.value)}
                    placeholder="Valor estimado"
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      fontSize: "13px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <hr />

      <h3>Informações do Rodapé</h3>
      <div className="services">
        <div style={{ marginBottom: "12px" }}>
          <label className="service-item">
            <input
              type="checkbox"
              checked={footerOffices.rj.enabled}
              onChange={() => setFooterOffices({ ...footerOffices, rj: { ...footerOffices.rj, enabled: !footerOffices.rj.enabled } })}
            />
            <span>Rio de Janeiro - RJ</span>
          </label>
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label className="service-item">
            <input
              type="checkbox"
              checked={footerOffices.df.enabled}
              onChange={() => setFooterOffices({ ...footerOffices, df: { ...footerOffices.df, enabled: !footerOffices.df.enabled } })}
            />
            <span>Brasília - DF</span>
          </label>
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label className="service-item">
            <input
              type="checkbox"
              checked={footerOffices.sp.enabled}
              onChange={() => setFooterOffices({ ...footerOffices, sp: { ...footerOffices.sp, enabled: !footerOffices.sp.enabled } })}
            />
            <span>São Paulo - SP</span>
          </label>
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label className="service-item">
            <input
              type="checkbox"
              checked={footerOffices.am.enabled}
              onChange={() => setFooterOffices({ ...footerOffices, am: { ...footerOffices.am, enabled: !footerOffices.am.enabled } })}
            />
            <span>Manaus - AM</span>
          </label>
        </div>
      </div>

      <hr />

      {/* Pagamento e Despesas */}
      <div className="service-section">
        <h3 style={{ marginBottom: "12px", fontSize: "14px" }}>Pagamento e Despesas</h3>
        <div className="service-item">
          <label style={{ display: "block", marginBottom: "8px", fontSize: "13px" }}>Valor do Pagamento:</label>
          <input
            type="text"
            value={paymentValue}
            onChange={(e) => setPaymentValue(e.target.value)}
            placeholder="Ex: R$ 0,20 (vinte centavos)"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "13px"
            }}
          />
        </div>
      </div>

      <hr />

      <div className="actions">
        <button
          id="save-proposal"
          className="btn primary"
          style={{ width: "100%", marginBottom: "8px" }}
          onClick={onSaveProposal}>
          💾 Salvar Proposta
        </button>
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <button
            id="download-docx"
            className="btn primary"
            style={{ flex: 1, marginBottom: "8px" }}
            onClick={onDownloadDocx}
            disabled={loadingDocx}>
            {loadingDocx ? "⏳ Gerando..." : "⬇️ Baixar .docx"}
          </button>
          <button
            id="download-pdf"
            className="btn primary"
            style={{ flex: 1, marginBottom: "8px" }}
            onClick={onDownloadPdf}
            disabled={loadingPdf}>
            {loadingPdf ? "⏳ Gerando..." : "⬇️ Baixar PDF"}
          </button>
        </div>
      </div>

      <hr style={{ margin: "24px 0" }} />

      {/* Propostas Salvas */}
      <div className="saved-proposals">
        <h3 style={{ marginBottom: "30px", fontSize: "16px" }}>Propostas Salvas</h3>
        {savedProposals.length === 0 ? (
          <p style={{ color: themeColors.paragraph, fontSize: "14px", fontStyle: "italic" }}>
            Nenhuma proposta salva ainda.
          </p>
        ) : (
          <div className="proposals-list">
            {savedProposals.map((proposal) => {
              // Calcular dias restantes
              const daysRemaining = proposal.expiresAt
                ? Math.ceil((proposal.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))
                : null;

              const isExpiringSoon = daysRemaining && daysRemaining <= 3;
              const isExpired = daysRemaining && daysRemaining <= 0;

              // Formatar data de expiração em dd/mm/aaaa
              const expirationDate = proposal.expiresAt
                ? new Date(proposal.expiresAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
                : null;

              // Determinar a cor de fundo base
              const baseColor = isExpired ? "#ffebee" : themeColors.docBg;

              return (
                <div
                  key={proposal.id}
                  className="proposal-item"
                  data-expired={isExpired}
                  style={{
                    padding: "16px",
                    borderRadius: "4px",
                    marginBottom: "15px",
                    border: `1px solid ${isExpiringSoon ? "#ff9800" : themeColors.sidebarBorder}`,
                    backgroundColor: baseColor,
                    opacity: isExpired ? 0.7 : 1,
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: "block", marginBottom: "4px", fontSize: "14px" }}>
                        {proposal.municipio}
                      </strong>
                      <small style={{ color: themeColors.paragraph, fontSize: "11px", display: "block" }}>
                        {proposal.data}
                      </small>
                      {expirationDate && (
                        <small
                          style={{
                            color: isExpired ? "#c62828" : isExpiringSoon ? "#f57c00" : "#555",
                            fontSize: "12px",
                            display: "block",
                            marginTop: "4px",
                            fontWeight: isExpiringSoon ? "bold" : "600",
                          }}>
                          {isExpired ? `⚠️ Expirada dia: ${expirationDate}` : `⏰ Expira dia: ${expirationDate}`}
                        </small>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => onLoadProposal(proposal)}
                        className="btn-small"
                        style={{ padding: "4px 8px", fontSize: "11px" }}
                        disabled={isExpired}>
                        Carregar
                      </button>
                      <button
                        onClick={() => onDeleteProposal(proposal.id)}
                        className="btn-small"
                        style={{ padding: "4px 8px", fontSize: "11px", backgroundColor: "#dc3545", color: "white" }}>
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

const ProposalDocument = ({ theme, options, prazo, services, customCabimentos, customEstimates, rppsImage, footerOffices, paymentValue }) => {
  const themeColors = colors[theme];

  // Função para formatar data com nome do mês por extenso
  const formatDateWithMonthName = (dateString) => {
    if (!dateString) return "17 de janeiro de 2025";

    const monthNames = {
      "01": "janeiro", "02": "fevereiro", "03": "março", "04": "abril",
      "05": "maio", "06": "junho", "07": "julho", "08": "agosto",
      "09": "setembro", "10": "outubro", "11": "novembro", "12": "dezembro"
    };

    // Tentar detectar o formato da data (dd/mm/yyyy ou mm/dd/yyyy)
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      const monthName = monthNames[month] || monthNames[parts[0]];
      return `${day} de ${monthName} de ${year}`;
    }

    return dateString;
  };

  const Footer = () => {
    // Filtrar apenas os escritórios habilitados
    const enabledOffices = [];
    if (footerOffices.rj.enabled) enabledOffices.push(footerOffices.rj);
    if (footerOffices.df.enabled) enabledOffices.push(footerOffices.df);
    if (footerOffices.sp.enabled) enabledOffices.push(footerOffices.sp);
    if (footerOffices.am.enabled) enabledOffices.push(footerOffices.am);

    return (
      <div style={{
        marginTop: '18px',
        fontSize: '10px',
        color: '#555',
        fontFamily: "'EB Garamond', serif",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        paddingTop: '8px'
      }}>
        <div style={{ paddingTop: '6px', marginBottom: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', textAlign: 'center' }}>
            {enabledOffices.map((office, index) => (
              <div key={index}>
                <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '1.2px', fontSize: '10px', color: '#000000' }}>{office.cidade}</p>
                <p style={{ margin: 0, lineHeight: '1.3', fontSize: '9px', color: '#000000' }}>{office.linha1}</p>
                <p style={{ margin: 0, lineHeight: '1.3', fontSize: '9px', color: '#000000' }}>{office.linha2}</p>
                <p style={{ margin: 0, lineHeight: '1.3', fontSize: '9px', color: '#000000' }}>{office.linha3}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          marginLeft: '-20mm',
          marginRight: '-20mm',
          padding: '8px 10px',
          textAlign: 'center'
        }}>
          <p style={{
            margin: 0,
            letterSpacing: '1.1px',
            fontWeight: 'bold',
            fontSize: '10px',
            border: '1px solid #eee2e2c2',
            borderRadius: '10px',
            padding: '1px 200px',
            display: 'inline-block',
            color: '#686666ff'
          }}>w w w . c a v a l c a n t e r e i s . a d v . b r</p>
        </div>
      </div>
    );
  };

  // Helper para renderizar serviços como componentes React

  // Contador para numeração dinâmica dos serviços na seção 2
  let serviceCounter = 0;

  // Helper para renderizar serviços como componentes React
  const renderServiceSection = (serviceKey, title, content) => {
    if (!services[serviceKey]) return null;

    // Incrementar o contador apenas se o serviço estiver selecionado
    serviceCounter++;

    let processedContent = content;
    if (content) {
      if (serviceKey === 'rpps' && customEstimates.rpps) {
        processedContent = content.replace('{{rpps_estimate}}', customEstimates.rpps);
      }
      if (serviceKey === 'impostoRenda' && customEstimates.impostoRenda) {
        processedContent = content.replace('{{impostoRenda_estimate}}', customEstimates.impostoRenda);
      }
    } else if (!content) {
      // Handle missing content
      return (
        <>
          <hr style={{ border: "2px solid black", margin: "24px 0" }} />
          <h3 className="font-bold text-lg mt-6 mb-2" style={{ color: "#000" }}>{title}</h3>
          <div className="space-y-4"><p>Conteúdo não disponível.</p></div>
        </>
      );
    }

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = DOMPurify.sanitize(processedContent, { ADD_TAGS: ["div"], ADD_ATTR: ["class"] });

    // Use querySelectorAll to select only the elements I want to render.
    const elements = Array.from(tempDiv.querySelectorAll("p, div.image-placeholder")).map((el, idx) => {
      if (el.tagName === 'P') {
        return <p key={idx} style={{ margin: "4px 0", textAlign: "justify", fontSize: "11px" }}>{el.textContent}</p>;
      }
      if (el.tagName === 'DIV' && el.classList.contains('image-placeholder')) {
        if (rppsImage) {
          return <img key={idx} src={rppsImage} style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain', margin: '8px 0' }} />;
        } else {
          return (
            <div key={idx} style={{ border: '1px solid #000', height: '300px', width: '80%', margin: '8px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#888', fontSize: "10px" }}>Espaço para imagem/gráfico</p>
            </div>
          );
        }
      }
      return null;
    }).filter(Boolean);

    // Usar o contador dinâmico para a numeração
    const numberedTitle = `2.${serviceCounter} – ${title}`;

    return (
      <>
        <h3 style={{ fontWeight: "bold", fontSize: "12px", marginTop: "12px", marginBottom: "6px", color: "#000" }}>
          {numberedTitle}
        </h3>
        <div className="page-content-body" style={{ marginBottom: "12px" }}>{elements}</div>
      </>
    );
  };

  // Helper para renderizar linhas da tabela
  const renderTableRow = (serviceKey, tese, cabimento) => {
    if (!services[serviceKey]) return null;

    // Usar o valor customizado se existir, senão usar o valor padrão
    const finalCabimento = customCabimentos && customCabimentos[serviceKey] ? customCabimentos[serviceKey] : cabimento;

    const cellStyle = {
      padding: '4px',
      borderBottom: `1px solid #000`,
      borderRight: `1px solid #000`,
      color: "#000",
      verticalAlign: 'top',
      fontSize: "10px"
    };

    const lastCellStyle = {
      ...cellStyle,
      borderRight: 'none',
      textAlign: 'center'
    };

    return (
      <tr key={serviceKey}>
        <td style={cellStyle}>
          <strong>{tese}</strong>
        </td>
        <td style={lastCellStyle}>
          <strong>{finalCabimento}</strong>
        </td>
      </tr>
    );
  };

  // Helper para renderizar uma "página" com cabeçalho e rodapé
  const Page = ({ children, pageNumber, showLogo = true, isCoverPage = false, FooterComponent }) => {
    // A capa e páginas sem conteúdo explícito não devem mostrar o logo no cabeçalho.
    const displayLogo = showLogo && !isCoverPage;

    return (
      <div className="pdf-page-render" style={{
        pageBreakAfter: 'always',
        background: 'white',
        width: '210mm',
        padding: '20mm',
        boxSizing: 'border-box',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        marginBottom: '20mm',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        // A altura mínima só é forçada na capa para centralização vertical
        minHeight: isCoverPage ? '297mm' : 'auto',
      }}>
        {/* CABEÇALHO */}
        {displayLogo && (
          <div className="page-header" style={{ textAlign: 'center', marginBottom: '16px', flexShrink: 0 }}>
            <img
              src="/logo-cavalcante-reis.png"
              alt="Logo Cavalcante Reis Advogados"
              crossOrigin="anonymous"
              style={{ width: '140px', height: 'auto', display: 'block', margin: '0 auto' }}
            />
          </div>
        )}

        {/* CONTEÚDO */}
        <div className="page-content" style={{ flexGrow: 1 }}>
          {children}
        </div>

        {/* RODAPÉ */}
        {!isCoverPage && (
          <div className="page-footer" style={{ flexShrink: 0, marginTop: '24px', paddingTop: '12px' }}>
            <FooterComponent />
          </div>
        )}

        {/* NÚMERO DA PÁGINA (OPCIONAL) */}
        {pageNumber && (
          <div style={{
            position: 'absolute',
            bottom: '10mm', // Posicionado dentro da margem inferior
            right: '20mm', // Alinhado com a margem direita do conteúdo
            fontSize: '11px',
            fontWeight: 'bold',
          }}>
            {pageNumber}
          </div>
        )}
      </div>
    );
  };

  // --- Lógica de Paginação Dinâmica para a Seção "Análise da Questão" ---
  const analysisServicesOrder = [
    "folhaPagamento", "pasep", "rpps", "cfem", "cfurh", "tabelaSUS",
    "fundef", "fundeb", "energiaEletrica", "royaltiesOleoGas",
    "repassesFPM", "revisaoParcelamento", "issqn", "servicosTecnicos", "demaisTeses"
  ];
  const activeAnalysisServices = analysisServicesOrder.filter(key => services[key]);

  return (
    <div id="preview" className="preview" style={{ fontFamily: "'EB Garamond', serif", fontSize: "11px", color: "#000", lineHeight: "1.4" }}>
      {/* Página 1: Capa */}
      <Page isCoverPage={true} FooterComponent={Footer}>
        <div style={{ textAlign: "center", marginTop: 80, marginBottom: 120 }}>
          <img
            src="/logo-cavalcante-reis.png"
            alt="Cavalcante Reis Advogados"
            crossOrigin="anonymous"
            style={{ width: "166px", height: "87px", display: "block", margin: "0 auto" }}
          />
        </div>

        <div style={{ marginTop: 180, textAlign: "center" }}>
          <div
            style={{
              borderTop: "1px solid #000",
              paddingTop: 25,
              maxWidth: "52%",
              marginLeft: "38%",
            }}>
            <div style={{ textAlign: "right", marginBottom: 30 }}>
              <p style={{ margin: "4px 0" }}>
                <strong>Proponente:</strong>
              </p>
              <p style={{ margin: "4px 0" }}>Cavalcante Reis Advogados</p>

              <p style={{ margin: "16px 0 4px 0" }}>
                <strong>Destinatário:</strong>
              </p>
              <p style={{ margin: "4px 0" }}>Prefeitura Municipal de {options.municipio || "[Nome do Município]"}</p>
            </div>

            <div style={{ borderTop: "1px solid #000", paddingTop: 12, textAlign: "right" }}>
              <p style={{ fontSize: "16px", fontWeight: "bold" }}>{options.data || "2025"}</p>
            </div>
          </div>
        </div>
      </Page>

      {/* Página 2: Sumário */}
      <Page pageNumber={2} showLogo={true} FooterComponent={Footer}>
        <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: 12 }}>Sumário</h2>
        <div style={{ paddingLeft: 20, lineHeight: 1.6 }}>
          <p style={{ margin: "6px 0" }}>
            <strong>1. Objeto da Proposta</strong>
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>2. Análise da Questão</strong>
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>3. Dos Honorários, das Condições de Pagamento e Despesas</strong>
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>4. Prazo e Cronograma de Execução dos Serviços</strong>
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>5. Experiência em atuação em favor de Municípios e da Equipe Responsável</strong>
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>6. Disposições Finais</strong>
          </p>
        </div>
      </Page>

      {/* Página 3: Objeto da Proposta */}
      <Page pageNumber={3} showLogo={true} FooterComponent={Footer}>
        <h2 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: 4, marginBottom: 8 }}>
          1. Objeto da Proposta
        </h2>
        <div className="page-content-body">
          <p style={{ margin: "4px 0", textAlign: "justify" }}>
            É objeto do presente contrato o desenvolvimento de serviços advocatícios especializados por parte da
            Proponente, Cavalcante Reis Advogados, ao Aceitante, Município de{" "}
            {options.municipio || "[Nome do Município]"}, a fim de prestação de serviços de assessoria técnica e
            jurídica nas <strong>áreas de Direito Público, Tributário, Econômico, Financeiro, Minerário e Previdenciário,</strong>
            atuando perante o Ministério da Fazenda e os seus órgãos administrativos, em especial para alcançar o
            incremento de receitas, ficando responsável pelo ajuizamento, acompanhamento e eventuais intervenções de
            terceiro em ações de interesse do Município.
          </p>
          <p style={{ margin: "4px 0 8px 0", textAlign: "justify" }}>A proposta inclui os seguintes objetos:</p>
        </div>
        <table
          className="w-full"
          style={{
            width: "100%",
            borderCollapse: 'collapse',
            border: `1px solid #000`,
            fontSize: "10px",
            marginTop: "8px"
          }}>
          <thead>
            <tr style={{ background: "#f7f7f7" }}>
              <th style={{ padding: 4, borderBottom: `2px solid #000`, borderRight: `1px solid #000`, textAlign: 'center', fontSize: "10px" }}>
                <strong>TESE</strong>
              </th>
              <th style={{ padding: 4, borderBottom: `2px solid #000`, textAlign: 'center', fontSize: "10px" }}>
                <strong>CABIMENTO</strong>
              </th>
            </tr>
          </thead>
          <tbody>
            {renderTableRow(
              "folhaPagamento",
              "Folha de pagamento, recuperação de verbas indenizatórias e contribuições previdenciárias (INSS)",
              "A perspectiva de incremento/recuperação é de aproximadamente o valor referente a até duas folhas de pagamento mensais."
            )}
            {renderTableRow("pasep", "Recuperação/ compensação PASEP", "Cabível")}
            {renderTableRow("rpps", "RPPS Regime Próprio de Previdência Social", "Cabível")}
            {renderTableRow("cfem", "Compensação financeira pela exploração de recursos minerais – CFEM", "Cabível")}
            {renderTableRow(
              "cfurh",
              "Compensação Financeira pela Utilização dos Recursos Hídricos – CFURH",
              "Cabível"
            )}
            {renderTableRow("tabelaSUS", "Tabela SUS", "Cabível")}
            {renderTableRow("fundef", "FUNDEF - Possível atuação no feito para agilizar a tramitação, a fim de efetivar o incremento financeiro, com a consequente expedição do precatório.", "Cabível")}
            {renderTableRow("fundeb", "Recuperação dos valores repassados à menor a título de FUNDEB.", "Cabível")}
            {renderTableRow("energiaEletrica", "Auditoria e Consultoria do pagamento de Energia Elétrica", "Cabível")}
            {renderTableRow(
              "royaltiesOleoGas",
              "Royalties pela exploração de óleo bruto, xisto betuminoso e gás natural.",
              "Cabível"
            )}
            {renderTableRow(
              "repassesFPM",
              "Repasses dos recursos de FPM com base na real e efetiva arrecadação do IPI e IR.",
              "Cabível"
            )}
            {renderTableRow("revisaoParcelamento", "Revisão dos parcelamentos previdenciários", "Cabível")}
            {renderTableRow("issqn", "Recuperação de Créditos de ISSQN", "Cabível")}
            {renderTableRow(
              "servicosTecnicos",
              "Serviços técnicos especializados de assessoria e consultoria jurídica (DF)",
              "Cabível"
            )}
            {renderTableRow(
              "demaisTeses",
              "Demais teses consiste na prestação de serviços de assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico, Financeiro, previdenciário e Minerário, atuando perante o Ministério da Fazenda e os seus órgãos administrativos.",
              "Cabível"
            )}
          </tbody>
        </table>
        <p style={{ marginTop: 16, textAlign: "justify" }}>
          Além disso, a proposta também tem como objeto:
        </p>
        <p style={{ textAlign: "justify" }}><strong>(i)</strong> Análise do caso concreto, com a elaboração dos estudos pertinentes ao Município de Manacapuru, Estado do Amazonas;</p>
        <p style={{ textAlign: "justify" }}><strong>(ii)</strong> Ingresso de medida administrativa e/ou judicial, com posterior acompanhamento do processo durante sua tramitação, com realização de defesas, diligências, manifestação em razão de intimações, produção de provas, recursos e demais atos necessários ao deslinde dos feitos;</p>
        <p style={{ textAlign: "justify" }}><strong>(iii)</strong> Atuação perante a Justiça Federal seja na condição de recorrente ou recorrido, bem como interposição de recursos ou apresentação de contrarrazões aos Tribunais Superiores, se necessário for;</p>
        <p style={{ textAlign: "justify" }}><strong>(iv)</strong> Acompanhamento processual completo, até o trânsito em Julgado da Sentença administrativa e/ou judicial;</p>
        <p style={{ textAlign: "justify" }}><strong>(v)</strong> Acompanhamento do cumprimento das medidas administrativas e/ou judiciais junto aos órgãos administrativos.</p>
      </Page>

      {/* Páginas 3+: TODO O CONTEÚDO EM FLUXO CONTÍNUO (SEM ESPAÇOS EM BRANCO) */}
      <Page showLogo={true} FooterComponent={Footer}>
        {/* SEÇÃO 2: Análise da Questão */}
        {activeAnalysisServices.map((serviceKey, index) => (
          <div key={serviceKey}>
            {renderServiceSection(serviceKey, allServices[serviceKey])}
          </div>
        ))}

        {/* SEÇÃO 3: Honorários */}
        <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: 3, marginBottom: 5, marginTop: 12, lineHeight: "1.4" }}>
          3. Dos Honorários, das Condições de Pagamento e Despesas
        </h2>
        <p style={{ margin: "2px 0", textAlign: "justify", fontSize: "11pt", lineHeight: "1.4" }}>
          Considerando a necessidade de manutenção do equilíbrio econômico-financeiro do contrato administrativo, propõe o escritório CAVALCANTE REIS ADVOGADOS que esta Municipalidade pague ao Proponente da seguinte forma:
        </p>
        <p style={{ margin: "2px 0", textAlign: "justify", fontSize: "11pt", lineHeight: "1.4" }}>
          <strong>3.1.1</strong> <strong>Para todos os demais itens descritos nesta Proposta</strong> será efetuado o pagamento de honorários advocatícios à CAVALCANTE REIS ADVOGADOS pela execução dos serviços de recuperação de créditos, <strong>ad êxito na ordem de {paymentValue} para cada R$ 1,00 (um real)</strong> do montante referente ao incremento financeiro, ou seja, com base nos valores que entrarem nos cofres do CONTRATANTE;
        </p>
        <p style={{ margin: "2px 0", textAlign: "justify", fontSize: "11pt", lineHeight: "1.4" }}>
          <strong>3.1.2</strong> Em caso de valores retroativos recuperados em favor da municipalidade, que consiste nos <strong>valores não repassados em favor do Contratante nos últimos 5 (cinco) anos</strong> (prescrição quinquenal) ou não abarcados pela prescrição, também serão cobrados honorários advocatícios <strong>na ordem de {paymentValue} para cada R$ 1.00 (um real) do montante recuperado aos Cofres Municipais.</strong>
        </p>

        {/* SEÇÃO 4: Prazo */}
        <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: 3, marginBottom: 5, marginTop: 12, lineHeight: "1.4" }}>
          4. Prazo e Cronograma de Execução dos Serviços
        </h2>
        <p style={{ margin: "2px 0", textAlign: "justify", fontSize: "11pt", lineHeight: "1.4" }}>
          O prazo de execução será de {prazo} meses ou pelo tempo que perdurar os processos judiciais,
          podendo ser prorrogado por interesse das partes.
        </p>

        {/* SEÇÃO 5: Experiência */}
        <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: 3, marginBottom: 10, marginTop: 12, lineHeight: "1.4" }}>
          5. Experiência e Equipe Responsável
        </h2>
        <p style={{ marginBottom: 8, fontSize: "11pt", lineHeight: "1.4", textAlign: "justify" }}>No portfólio de serviços executados e/ou em execução, constam os seguintes Municípios contratantes:</p>
        <div style={{ marginTop: 8, marginBottom: 6 }}>
          <img src="/munincipios01.png" alt="Municípios Contratantes 1" crossOrigin="anonymous" style={{ width: "100%", height: "auto", maxHeight: "280px", objectFit: "contain", objectPosition: "center", display: "block", margin: "0 auto" }} />
        </div>
        <div style={{ marginTop: 6, marginBottom: 12 }}>
          <img src="/Munincipios02.png" alt="Municípios Contratantes 2" crossOrigin="anonymous" style={{ width: "100%", height: "auto", maxHeight: "200px", objectFit: "contain", objectPosition: "center", display: "block", margin: "0 auto" }} />
        </div>
        <p style={{ marginTop: 12, marginBottom: 8, fontSize: "11pt", lineHeight: "1.4", textAlign: "justify" }}>
          Para coordenar os trabalhos de consultoria propostos neste documento, a CAVALCANTE REIS ADVOGADOS alocará os seguintes profissionais:
        </p>
        <p style={{ marginBottom: 12, fontSize: "11pt", lineHeight: "1.4", textAlign: 'justify' }}>
          <strong>IURI DO LAGO NOGUEIRA CAVALCANTE REIS –</strong> Doutorando em Direito e Mestre em Direito Econômico e Desenvolvimento pelo Instituto Brasileiro de Ensino, Desenvolvimento e Pesquisa (IDP/Brasília). LLM (Master of Laws) em Direito Empresarial pela Fundação Getúlio Vargas (FGV/RJ). Integrante da Comissão de Juristas do Senado Federal criada para consolidar a proposta do novo Código Comercial Brasileiro. Autor e Coautor de livros, pareceres e artigos jurídicos na área do direito público. Sócio-diretor do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: iuri@cavalcantereis.adv.br).
        </p>
        <p style={{ marginBottom: 12, fontSize: "11pt", lineHeight: "1.4", textAlign: 'justify' }}>
          <strong>PEDRO AFONSO FIGUEIREDO DE SOUZA –</strong> Graduado em Direito pela Pontifícia Universidade Católica de Minas Gerais. Especialista em Direito Penal e Processo Penal pela Academia Brasileira de Direito Constitucional. Mestre em Direito nas Relações Econômicas e Sociais pela Faculdade de Direito Milton Campos. Diretor de Comunicação e Conselheiro Consultivo, Científico e Fiscal do Instituto de Ciências Penais. Autor de artigos e capítulos de livros jurídicos. Advogado associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: pedro@cavalcantereis.adv.br).
        </p>
        <p style={{ marginBottom: 12, fontSize: "11pt", lineHeight: "1.4", textAlign: 'justify' }}>
          <strong>SÉRGIO RICARDO ALVES DE JESUS FILHO –</strong> Graduado em Direito pelo Centro Universitário de Brasília (UniCEUB). Graduando em Ciências Contábeis pelo Centro Universitário de Brasília (UniCEUB). Pós-graduando em Direito Tributário pelo Instituto Brasileiro de Ensino, Desenvolvimento e Pesquisa (IDP). Membro da Comissão de Assuntos Tributários da OAB/DF. Advogado Associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: sergio@cavalcantereis.adv.br).
        </p>
        <p style={{ marginBottom: 12, fontSize: "11pt", lineHeight: "1.4", textAlign: 'justify' }}>
          <strong>JOSÉ HUMBERTO DOS SANTOS JÚNIOR –</strong> Graduado em Direito pelo Centro Universitário UniProcessus. Pós-graduando em Direito Penal e Direito Processual Penal aplicados e Execução Penal pela Escola Brasileira de Direito (EBRADI). Advogado Associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: jose.humberto@cavalcantereis.adv.br).
        </p>
        <p style={{ marginBottom: 12, fontSize: "11pt", lineHeight: "1.4", textAlign: 'justify' }}>
          <strong>GABRIEL SALES RESENDE SALGADO -</strong> Graduado em Direito pela Universidade do Distrito Federal (UDF). Pós-graduando em Direito Tributário pelo Instituto Brasileiro de Estudos Tributários (IBET). Advogado Associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248- 0612 (endereço eletrônico: gabriel@cavalcantereis.adv.br).
        </p>
        <p style={{ marginBottom: 12, fontSize: "11pt", lineHeight: "1.4", textAlign: 'justify' }}>
          Além desses profissionais, a CAVALCANTE REIS ADVOGADOS alocará uma equipe de profissionais pertencentes ao seu quadro técnico, utilizando, também, caso necessário, o apoio técnico especializado de terceiros, pessoas físicas ou jurídicas, que deverão atuar sob sua orientação, cabendo à CAVALCANTE REIS ADVOGADOS a responsabilidade técnica pela execução das tarefas.
        </p>
        <p style={{ fontSize: "11pt", lineHeight: "1.4", textAlign: 'justify' }}>
          Nossa contratação, portanto, devido à altíssima qualificação e experiência, aliada à singularidade do objeto da demanda, bem como os diferenciais já apresentados acima, está inserida dentre as hipóteses do art. 6º, XVIII “e” e art. 74, III, “e”, da Lei n.º 14.133/2021.
        </p>

        {/* SEÇÃO 6: Disposições Finais */}
        <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: 3, marginBottom: 5, marginTop: 12, lineHeight: "1.4" }}>
          6. Disposições Finais
        </h2>
        <p style={{ margin: "2px 0", textAlign: "justify", fontSize: "11pt", lineHeight: "1.4" }}>
          Nesse sentido, ficamos no aguardo da manifestação deste Município para promover os ajustes contratuais que entenderem necessários, sendo mantida a mesma forma de remuneração aqui proposta, com fundamento no art. 6º, XVIII, “e” e art. 74, III, “e”, da Lei n.º 14.133/2021.
        </p>
        <p style={{ margin: "2px 0", textAlign: "justify", fontSize: "11pt", lineHeight: "1.4" }}>
          A presente proposta tem validade de 60 (sessenta) dias.
        </p>
        <p style={{ margin: "2px 0", textAlign: "justify", fontSize: "11pt", lineHeight: "1.4" }}>
          Sendo o que se apresenta para o momento, aguardamos posicionamento da parte de V. Exa., colocando-nos, desde já, à inteira disposição para dirimir quaisquer dúvidas eventualmente existentes.
        </p>
        <p style={{ marginTop: 12, marginBottom: 6, textAlign: "center", fontSize: "11pt", lineHeight: "1.4" }}>
          Brasília-DF, {formatDateWithMonthName(options.data)}.
        </p>
        <div style={{ marginTop: 6, textAlign: "center" }}>
          <p style={{ fontSize: "11pt", lineHeight: "1.4" }}>Atenciosamente,</p>
          <img src="/Assinatura.png" alt="Assinatura" crossOrigin="anonymous" style={{ width: "180px", margin: "6px auto 0" }} />
          <h3 style={{ fontWeight: "bold", marginTop: "6px", fontSize: "12pt", lineHeight: "1.4" }}>CAVALCANTE REIS ADVOGADOS</h3>
        </div>
      </Page>
    </div>
  );
};
// Componente principal App
function App() {
  const [theme] = useState("light");
  const [showPreview, setShowPreview] = useState(false);
  const [options, setOptions] = useState({ municipio: "", destinatario: "", data: "" });
  const [prazo, setPrazo] = useState("24 (vinte e quatro)");

  useEffect(() => {
    document.title = 'Gerador de Propostas - Sistema Cavalcante Reis';
  }, []);

  const [services, setServices] = useState(
    Object.keys(allServices).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {})
  );
  const [customCabimentos, setCustomCabimentos] = useState({
    pasep: "Cabível",
    rpps: "Cabível",
    cfem: "Cabível",
    cfurh: "Cabível",
    tabelaSUS: "Cabível",
    fundef: "Cabível",
    fundeb: "Cabível",
    energiaEletrica: "Cabível",
    royaltiesOleoGas: "Cabível",
    repassesFPM: "Cabível",
    revisaoParcelamento: "Cabível",
    issqn: "Cabível",
    servicosTecnicos: "Cabível",
    demaisTeses: "Cabível",
  });
  const [customEstimates, setCustomEstimates] = useState({
    rpps: "R$ 24.020.766,00 (vinte e quatro milhões, vinte mil e setecentos e sessenta e seis reais)",
  });

  const [footerOffices, setFooterOffices] = useState({
    rj: {
      enabled: true,
      cidade: "Rio de Janeiro - RJ",
      linha1: "AV. DAS AMÉRICAS, 3434 - BL 04",
      linha2: "Sala, 207 Barra Da Tijuca,",
      linha3: "CEP: 22640-102"
    },
    df: {
      enabled: true,
      cidade: "Brasília - DF",
      linha1: "SHIS QL 10, Conj. 06, Casa 19",
      linha2: "Lago Sul,",
      linha3: "CEP: 71630-065"
    },
    am: {
      enabled: true,
      cidade: "Manaus - AM",
      linha1: "Rua Silva Ramos, 78 - Centro",
      linha2: "Manaus, AM",
      linha3: "CEP: 69010-180"
    },
    sp: {
      enabled: true,
      cidade: "São Paulo - SP",
      linha1: "Rua Fidêncio Ramos, 223,",
      linha2: "Cobertura, Vila Olimpia,",
      linha3: "CEP: 04551-010"
    },
  });

  const [rppsImage, setRppsImage] = useState(null);
  const [paymentValue, setPaymentValue] = useState("R$ 0,20 (vinte centavos)");

  const [savedProposals, setSavedProposals] = useState([]);
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "",
    type: "info",
    onConfirm: () => { },
    onCancel: () => { },
  });

  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingDocx, setLoadingDocx] = useState(false);

  // Estados para zoom touch na prévia mobile
  const [previewScale, setPreviewScale] = useState(0.4);
  const [previewTranslate, setPreviewTranslate] = useState({ x: 0, y: 0 });

  const generatePdf = async () => {
    console.log("=== INÍCIO GERAÇÃO PDF ===");
    setLoadingPdf(true);
    console.log("Gerando PDF...");
    const previewElement = document.getElementById('preview');
    console.log("Preview element:", previewElement);
    if (!previewElement) {
      console.error("Elemento de pré-visualização não encontrado!");
      alert("Elemento de pré-visualização não encontrado.");
      setLoadingPdf(false);
      return;
    }

    const pageElements = previewElement.querySelectorAll('.pdf-page-render');
    console.log("Páginas encontradas:", pageElements.length);
    if (pageElements.length === 0) {
      console.error("Nenhuma página encontrada!");
      alert("Nenhuma página encontrada para gerar o PDF.");
      setLoadingPdf(false);
      return;
    }

    // Aguardar um pouco para garantir renderização
    await new Promise(resolve => setTimeout(resolve, 500));

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    try {
      // Capturar cada página sequencialmente (mais estável que em paralelo)
      for (let i = 0; i < pageElements.length; i++) {
        console.log(`Capturando página ${i + 1}...`);

        const canvas = await html2canvas(pageElements[i], {
          scale: 1.5,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 0
        });

        const imgData = canvas.toDataURL('image/png');

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        console.log(`Página ${i + 1} adicionada ao PDF`);
      }

      pdf.save(`Proposta-${options.municipio || "Municipio"}.pdf`);
      console.log("Download do PDF iniciado!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert(`Erro ao gerar PDF: ${error.message}`);
    } finally {
      setLoadingPdf(false);
    }
  };

  // Funções auxiliares
  const generateDocx = async () => {
    console.log("=== INÍCIO GERAÇÃO DOCX ===");
    setLoadingDocx(true);
    console.log("Gerando DOCX...");

    // Validar campos obrigatórios
    console.log("Município:", options.municipio);
    console.log("Data:", options.data);
    if (!options.municipio || !options.data) {
      console.warn("Campos obrigatórios não preenchidos!");
      setModal({
        open: true,
        title: "Campos Obrigatórios",
        message: "Por favor, preencha o Município Destinatário e a Data da Proposta antes de baixar o documento.",
        confirmText: "OK",
        cancelText: "",
        type: "warning",
        onConfirm: () => setModal((m) => ({ ...m, open: false })),
      });
      setLoadingDocx(false);
      return;
    }

    try {
      // Carregar a imagem do logo
      const logoResponse = await fetch("/logo-cavalcante-reis.png");
      const logoBlob = await logoResponse.blob();
      const logoBuffer = await logoBlob.arrayBuffer();

      // Carregar imagens dos municípios
      const municipios01Response = await fetch("/munincipios01.png");
      const municipios01Blob = await municipios01Response.blob();
      const municipios01Buffer = await municipios01Blob.arrayBuffer();

      const municipios02Response = await fetch("/Munincipios02.png");
      const municipios02Blob = await municipios02Response.blob();
      const municipios02Buffer = await municipios02Blob.arrayBuffer();

      // Carregar imagem da assinatura
      const assinaturaResponse = await fetch("/Assinatura.png");
      const assinaturaBlob = await assinaturaResponse.blob();
      const assinaturaBuffer = await assinaturaBlob.arrayBuffer();

      const pageMargins = { top: 720, right: 900, bottom: 720, left: 900 }; // Margens Word padrão: 2.54cm (720 twips) superior/inferior, 3.17cm (900 twips) esquerda/direita
      const defaultFont = "Garamond";
      const defaultSize = 26; // 13pt (26/2 = 13pt)
      const titleSize = 32; // 16pt para títulos

      // Criar rodapé com escritórios habilitados
      const createFooter = () => {
        const enabledOffices = [];
        if (footerOffices.rj.enabled) enabledOffices.push(footerOffices.rj);
        if (footerOffices.df.enabled) enabledOffices.push(footerOffices.df);
        if (footerOffices.sp.enabled) enabledOffices.push(footerOffices.sp);
        if (footerOffices.am.enabled) enabledOffices.push(footerOffices.am);

        const footerCells = enabledOffices.map(office =>
          new TableCell({
            borders: { top: { style: "none" }, bottom: { style: "none" }, left: { style: "none" }, right: { style: "none" } },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 }, children: [new TextRun({ text: office.cidade, bold: true, font: defaultFont, size: 18 })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 10 }, children: [new TextRun({ text: office.linha1, font: defaultFont, size: 16 })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 10 }, children: [new TextRun({ text: office.linha2, font: defaultFont, size: 16 })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: office.linha3, font: defaultFont, size: 16 })] }),
            ],
          })
        );

        return new Footer({
          children: [
            new Table({
              width: { size: 100, type: "pct" },
              borders: { top: { style: "none" }, bottom: { style: "none" }, left: { style: "none" }, right: { style: "none" }, insideVertical: { style: "none" }, insideHorizontal: { style: "none" } },
              rows: [new TableRow({ children: footerCells })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 50 },
              indent: { left: 720, right: 720 },
              border: { top: { color: "D0D0D0", space: 2, style: "single", size: 6 }, bottom: { color: "D0D0D0", space: 2, style: "single", size: 6 }, left: { color: "D0D0D0", space: 2, style: "single", size: 6 }, right: { color: "D0D0D0", space: 2, style: "single", size: 6 } },
              children: [new TextRun({ text: "w w w . c a v a l c a n t e r e i s . a d v . b r", bold: true, font: defaultFont, size: 16, color: "555555" })],
            }),
          ],
        });
      };

      const createSectionTitle = (text) =>
        new Paragraph({
          spacing: { after: 300 },
          border: { bottom: { color: "DDDDDD", space: 1, style: "single", size: 6 } },
          children: [new TextRun({ text, bold: true, font: defaultFont, size: titleSize })],
        });

      // Função auxiliar para criar linha de tabela
      const createTableRow = (teseText, cabimentoText) => {
        return new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: teseText, font: defaultFont, size: 26, bold: true })] })],
            }),
            new TableCell({
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: cabimentoText, font: defaultFont, size: 26, bold: true })] })],
            }),
          ],
        });
      };

      // Criar linhas da tabela dinamicamente
      const tableRows = [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: "F7F7F7" },
              children: [new Paragraph({ children: [new TextRun({ text: "TESE", bold: true, font: defaultFont, size: 26 })] })],
            }),
            new TableCell({
              shading: { fill: "F7F7F7" },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CABIMENTO", bold: true, font: defaultFont, size: 26 })] })],
            }),
          ],
        }),
      ];

      if (services.folhaPagamento) tableRows.push(createTableRow("Folha de pagamento, recuperação de verbas indenizatórias e contribuições previdenciárias (INSS)", "A perspectiva de incremento/recuperação é de aproximadamente o valor referente a até duas folhas de pagamento mensais."));
      if (services.pasep) tableRows.push(createTableRow("Recuperação/ compensação PASEP", customCabimentos.pasep));
      if (services.rpps) tableRows.push(createTableRow("RPPS - Regime Próprio de Previdência Social", customCabimentos.rpps));
      if (services.cfem) tableRows.push(createTableRow("Compensação financeira pela exploração de recursos minerais – CFEM", customCabimentos.cfem));
      if (services.cfurh) tableRows.push(createTableRow("Compensação Financeira pela Utilização dos Recursos Hídricos – CFURH", customCabimentos.cfurh));
      if (services.tabelaSUS) tableRows.push(createTableRow("Tabela SUS", customCabimentos.tabelaSUS));
      if (services.fundef) tableRows.push(createTableRow("FUNDEF - Possível atuação no feito para agilizar a tramitação, a fim de efetivar o incremento financeiro, com a consequente expedição do precatório.", customCabimentos.fundef));
      if (services.fundeb) tableRows.push(createTableRow("Recuperação dos valores repassados à menor a título de FUNDEB.", customCabimentos.fundeb));
      if (services.energiaEletrica) tableRows.push(createTableRow("Auditoria e Consultoria do pagamento de Energia Elétrica", customCabimentos.energiaEletrica));
      if (services.royaltiesOleoGas) tableRows.push(createTableRow("Royalties pela exploração de óleo bruto, xisto betuminoso e gás natural.", customCabimentos.royaltiesOleoGas));
      if (services.repassesFPM) tableRows.push(createTableRow("Repasses dos recursos de FPM com base na real e efetiva arrecadação do IPI e IR.", customCabimentos.repassesFPM));
      if (services.revisaoParcelamento) tableRows.push(createTableRow("Revisão dos parcelamentos previdenciários", customCabimentos.revisaoParcelamento));
      if (services.issqn) tableRows.push(createTableRow("Recuperação de Créditos de ISSQN", customCabimentos.issqn));
      if (services.servicosTecnicos) tableRows.push(createTableRow("Serviços técnicos especializados de assessoria e consultoria jurídica (DF)", customCabimentos.servicosTecnicos));
      if (services.demaisTeses) tableRows.push(createTableRow("Demais teses consiste na prestação de serviços de assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico, Financeiro, previdenciário e Minerário, atuando perante o Ministério da Fazenda e os seus órgãos administrativos.", customCabimentos.demaisTeses));

      // --- Seções do Documento ---
      const sections = [];

      const footerConfig = createFooter();

      const headerLogo = new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: { width: 166, height: 87 },
          }),
        ],
      });

      // Página 1: Capa
      sections.push({
        properties: { page: { margin: pageMargins } },
        footers: { default: footerConfig },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 4000, before: 200 },
            children: [new ImageRun({ data: logoBuffer, transformation: { width: 166, height: 87 } })],
          }),
          // Linha horizontal superior
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { top: { color: "000000", space: 1, style: "single", size: 1 } },
            spacing: { before: 200, after: 100 },
            children: [],
          }),
          // Proponente
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 50 },
            children: [new TextRun({ text: "Proponente:", bold: true, font: defaultFont, size: defaultSize })]
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            children: [new TextRun({ text: "Cavalcante Reis Advogados", font: defaultFont, size: defaultSize })]
          }),
          // Destinatário
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 50 },
            children: [new TextRun({ text: "Destinatário:", bold: true, font: defaultFont, size: defaultSize })]
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 300 },
            children: [new TextRun({ text: `Prefeitura Municipal de ${options.municipio || "[Nome do Município]"}`, font: defaultFont, size: defaultSize })]
          }),
          // Linha horizontal intermediária + Data
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { top: { color: "000000", space: 1, style: "single", size: 1 } },
            spacing: { before: 300, after: 200 },
            children: [new TextRun({ text: options.data || "2025", bold: true, font: defaultFont, size: titleSize })]
          }),
        ],
      });

      // Página 2: Sumário
      sections.push({
        properties: { page: { margin: pageMargins } },
        footers: { default: footerConfig },
        children: [
          headerLogo,
          new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 400 }, children: [new TextRun({ text: "2 -", font: defaultFont, size: defaultSize })] }),
          new Paragraph({ spacing: { after: 400 }, children: [new TextRun({ text: "Sumário", bold: true, font: defaultFont, size: 32 })] }),
          new Paragraph({ spacing: { after: 200 }, indent: { left: 720 }, children: [new TextRun({ text: "1. Objeto da Proposta", bold: true, font: defaultFont, size: defaultSize })] }),
          new Paragraph({ spacing: { after: 200 }, indent: { left: 720 }, children: [new TextRun({ text: "2. Análise da Questão", bold: true, font: defaultFont, size: defaultSize })] }),
          new Paragraph({ spacing: { after: 200 }, indent: { left: 720 }, children: [new TextRun({ text: "3. Dos Honorários, das Condições de Pagamento e Despesas", bold: true, font: defaultFont, size: defaultSize })] }),
          new Paragraph({ spacing: { after: 200 }, indent: { left: 720 }, children: [new TextRun({ text: "4. Prazo e Cronograma de Execução dos Serviços", bold: true, font: defaultFont, size: defaultSize })] }),
          new Paragraph({ spacing: { after: 200 }, indent: { left: 720 }, children: [new TextRun({ text: "5. Experiência em atuação em favor de Municípios e da Equipe Responsável", bold: true, font: defaultFont, size: defaultSize })] }),
          new Paragraph({ spacing: { after: 200 }, indent: { left: 720 }, children: [new TextRun({ text: "6. Disposições Finais", bold: true, font: defaultFont, size: defaultSize })] }),
        ],
      });

      // Página 3: Objeto da Proposta
      sections.push({
        properties: { page: { margin: pageMargins } },
        footers: { default: footerConfig },
        children: [
          headerLogo,
          createSectionTitle("1. Objeto da Proposta"),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `É objeto do presente contrato o desenvolvimento de serviços advocatícios especializados por parte da Proponente, Cavalcante Reis Advogados, ao Aceitante, Município de ${options.municipio || "[Nome do Município]"}, a fim de prestação de serviços de assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico, Financeiro, Minerário e Previdenciário, atuando perante o Ministério da Fazenda e os seus órgãos administrativos, em especial para alcançar o incremento de receitas, ficando responsável pelo ajuizamento, acompanhamento e eventuais intervenções de terceiro em ações de interesse do Município.`, font: defaultFont, size: defaultSize })] }),
          new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: "A proposta inclui os seguintes objetos:", font: defaultFont, size: defaultSize })] }),
          new Table({ width: { size: 100, type: "pct" }, rows: tableRows }),
        ],
      });

      // Seção "Análise da Questão" (Dinâmica para DOCX)
      const analysisServicesOrder = [
        "folhaPagamento", "pasep", "rpps", "cfem", "cfurh", "tabelaSUS",
        "fundef", "fundeb", "energiaEletrica", "royaltiesOleoGas",
        "repassesFPM", "revisaoParcelamento", "issqn", "servicosTecnicos", "demaisTeses"
      ];
      const activeAnalysisServices = analysisServicesOrder.filter(key => services[key]);

      if (activeAnalysisServices.length > 0) {
        const servicesPerPage = 4;
        const servicePages = [];
        for (let i = 0; i < activeAnalysisServices.length; i += servicesPerPage) {
          servicePages.push(activeAnalysisServices.slice(i, i + servicesPerPage));
        }

        let teseCounter = 1;
        servicePages.forEach((pageServices, index) => {
          const pageChildren = [headerLogo];

          // Adiciona o título principal apenas na primeira página da seção
          if (index === 0) {
            pageChildren.push(createSectionTitle("2. Análise da Questão"));
          }

          pageServices.forEach(key => {
            if (serviceTextDatabase[key]) {
              pageChildren.push(new Paragraph({
                spacing: { before: 400 },
                children: [new TextRun({ text: `2.${teseCounter} ${allServices[key]}`, bold: true, font: defaultFont, size: 26 })]
              }));
              teseCounter++;

              const paragraphs = serviceTextDatabase[key]
                .replace(/<p[^>]*>/gi, "")
                .split(/<\/p>/gi)
                .map(p => p.replace(/<[^>]+>/g, ' ').trim())
                .filter(p => p);

              paragraphs.forEach(pText => {
                pageChildren.push(new Paragraph({
                  spacing: { after: 150 },
                  alignment: AlignmentType.JUSTIFIED,
                  children: [new TextRun({ text: pText, font: defaultFont, size: defaultSize })]
                }));
              });
            }
          });

          sections.push({
            properties: { page: { margin: pageMargins } },
            footers: { default: footerConfig },
            children: pageChildren,
          });
        });
      }

      // Página: Honorários e Prazo (juntos na mesma página)
      sections.push({
        properties: { page: { margin: pageMargins } },
        footers: { default: footerConfig },
        children: [
          headerLogo,
          createSectionTitle("3. Dos Honorários, das Condições de Pagamento e Despesas"),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Considerando a necessidade de manutenção do equilíbrio econômico-financeiro do contrato administrativo, propõe o escritório CAVALCANTE REIS ADVOGADOS que esta Municipalidade pague ao Proponente da seguinte forma:", font: defaultFont, size: defaultSize })] }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({ text: "3.1.1 ", bold: true, font: defaultFont, size: defaultSize }),
              new TextRun({ text: "Para todos os demais itens descritos nesta Proposta", bold: true, font: defaultFont, size: defaultSize }),
              new TextRun({ text: " será efetuado o pagamento de honorários advocatícios à CAVALCANTE REIS ADVOGADOS pela execução dos serviços de recuperação de créditos, ", font: defaultFont, size: defaultSize }),
              new TextRun({ text: `ad êxito na ordem de ${paymentValue} para cada R$ 1,00 (um real)`, bold: true, font: defaultFont, size: defaultSize }),
              new TextRun({ text: " do montante referente ao incremento financeiro, ou seja, com base nos valores que entrarem nos cofres do CONTRATANTE;", font: defaultFont, size: defaultSize }),
            ]
          }),
          new Paragraph({
            spacing: { after: 400 },
            children: [
              new TextRun({ text: "3.1.2 ", bold: true, font: defaultFont, size: defaultSize }),
              new TextRun({ text: "Em caso de valores retroativos recuperados em favor da municipalidade, que consiste nos ", font: defaultFont, size: defaultSize }),
              new TextRun({ text: "valores não repassados em favor do Contratante nos últimos 5 (cinco) anos", bold: true, font: defaultFont, size: defaultSize }),
              new TextRun({ text: " (prescrição quinquenal) ou não abarcados pela prescrição, também serão cobrados honorários advocatícios ", font: defaultFont, size: defaultSize }),
              new TextRun({ text: `na ordem de ${paymentValue} para cada R$ 1.00 (um real) do montante recuperado aos Cofres Municipais.`, bold: true, font: defaultFont, size: defaultSize }),
            ]
          }),
          createSectionTitle("4. Prazo e Cronograma de Execução dos Serviços"),
          new Paragraph({ children: [new TextRun({ text: `O prazo de execução será de ${prazo} meses ou pelo tempo que perdurar os processos judiciais, podendo ser prorrogado por interesse das partes.`, font: defaultFont, size: defaultSize })] }),
        ],
      });

      // Página 6: Experiência
      sections.push({
        properties: { page: { margin: pageMargins } },
        footers: { default: footerConfig },
        children: [
          headerLogo,
          createSectionTitle("5. Experiência e Equipe Responsável"),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "No portfólio de serviços executados e/ou em execução, constam os seguintes Municípios contratantes:", font: defaultFont, size: defaultSize })] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new ImageRun({
                data: municipios01Buffer,
                transformation: { width: 500, height: 300 },
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new ImageRun({
                data: municipios02Buffer,
                transformation: { width: 500, height: 200 },
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Para coordenar os trabalhos de consultoria propostos neste documento, a CAVALCANTE REIS ADVOGADOS alocará os seguintes profissionais:", font: defaultFont, size: defaultSize })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "IURI DO LAGO NOGUEIRA CAVALCANTE REIS", font: defaultFont, size: defaultSize, bold: true }), new TextRun({ text: " – Doutorando em Direito e Mestre em Direito Econômico e Desenvolvimento pelo Instituto Brasileiro de Ensino, Desenvolvimento e Pesquisa (IDP/Brasília). LLM (Master of Laws) em Direito Empresarial pela Fundação Getúlio Vargas (FGV/RJ). Integrante da Comissão de Juristas do Senado Federal criada para consolidar a proposta do novo Código Comercial Brasileiro. Autor e Coautor de livros, pareceres e artigos jurídicos na área do direito público. Sócio-diretor do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: iuri@cavalcantereis.adv.br).", font: defaultFont, size: defaultSize })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "PEDRO AFONSO FIGUEIREDO DE SOUZA", font: defaultFont, size: defaultSize, bold: true }), new TextRun({ text: " – Graduado em Direito pela Pontifícia Universidade Católica de Minas Gerais. Especialista em Direito Penal e Processo Penal pela Academia Brasileira de Direito Constitucional. Mestre em Direito nas Relações Econômicas e Sociais pela Faculdade de Direito Milton Campos. Diretor de Comunicação e Conselheiro Consultivo, Científico e Fiscal do Instituto de Ciências Penais. Autor de artigos e capítulos de livros jurídicos. Advogado associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: pedro@cavalcantereis.adv.br).", font: defaultFont, size: defaultSize })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "SÉRGIO RICARDO ALVES DE JESUS FILHO", font: defaultFont, size: defaultSize, bold: true }), new TextRun({ text: " – Graduado em Direito pelo Centro Universitário de Brasília (UniCEUB). Graduando em Ciências Contábeis pelo Centro Universitário de Brasília (UniCEUB). Pós-graduando em Direito Tributário pelo Instituto Brasileiro de Ensino, Desenvolvimento e Pesquisa (IDP). Membro da Comissão de Assuntos Tributários da OAB/DF. Advogado Associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: sergio@cavalcantereis.adv.br).", font: defaultFont, size: defaultSize })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "JOSÉ HUMBERTO DOS SANTOS JÚNIOR", font: defaultFont, size: defaultSize, bold: true }), new TextRun({ text: " – Graduado em Direito pelo Centro Universitário UniProcessus. Pós-graduando em Direito Penal e Direito Processual Penal aplicados e Execução Penal pela Escola Brasileira de Direito (EBRADI). Advogado Associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: jose.humberto@cavalcantereis.adv.br).", font: defaultFont, size: defaultSize })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "GABRIEL SALES RESENDE SALGADO", font: defaultFont, size: defaultSize, bold: true }), new TextRun({ text: " - Graduado em Direito pela Universidade do Distrito Federal (UDF). Pós-graduando em Direito Tributário pelo Instituto Brasileiro de Estudos Tributários (IBET). Advogado Associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248- 0612 (endereço eletrônico: gabriel@cavalcantereis.adv.br).", font: defaultFont, size: defaultSize })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Além desses profissionais, a CAVALCANTE REIS ADVOGADOS alocará uma equipe de profissionais pertencentes ao seu quadro técnico, utilizando, também, caso necessário, o apoio técnico especializado de terceiros, pessoas físicas ou jurídicas, que deverão atuar sob sua orientação, cabendo à CAVALCANTE REIS ADVOGADOS a responsabilidade técnica pela execução das tarefas.", font: defaultFont, size: defaultSize })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'Nossa contratação, portanto, devido à altíssima qualificação e experiência, aliada à singularidade do objeto da demanda, bem como os diferenciais já apresentados acima, está inserida dentre as hipóteses do art. 6º, XVIII "e" e art. 74, III, "e", da Lei n.º 14.133/2021.', font: defaultFont, size: defaultSize })] }),
        ],
      });

      // Página 7: Disposições Finais
      sections.push({
        properties: { page: { margin: pageMargins } },
        footers: { default: footerConfig },
        children: [
          headerLogo,
          createSectionTitle("6. Disposições Finais"),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'Nesse sentido, ficamos no aguardo da manifestação deste Município para promover os ajustes contratuais que entenderem necessários, sendo mantida a mesma forma de remuneração aqui proposta, com fundamento no art. 6º, XVIII, "e" e art. 74, III, "e", da Lei n.º 14.133/2021.', font: defaultFont, size: defaultSize })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "A presente proposta tem validade de 60 (sessenta) dias.", font: defaultFont, size: defaultSize })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Sendo o que se apresenta para o momento, aguardamos posicionamento da parte de V. Exa., colocando-nos, desde já, à inteira disposição para dirimir quaisquer dúvidas eventualmente existentes.", font: defaultFont, size: defaultSize })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: `Brasília-DF, ${options.data || "17 de janeiro de 2025"}.`, font: defaultFont, size: defaultSize })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100 }, children: [new TextRun({ text: "Atenciosamente,", bold: true, font: defaultFont, size: defaultSize })] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 150, after: 100 },
            children: [
              new ImageRun({
                data: assinaturaBuffer,
                transformation: { width: 200, height: 100 },
              }),
            ],
          }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 50 }, children: [new TextRun({ text: "CAVALCANTE REIS ADVOGADOS", bold: true, font: defaultFont, size: defaultSize })] }),
        ],
      });

      const doc = new Document({ sections });

      console.log("Documento criado, gerando blob...");

      const blob = await Packer.toBlob(doc);
      console.log("Blob gerado, iniciando download...");
      saveAs(blob, `Proposta-${options.municipio || "Municipio"}-${Date.now()}.docx`);
      console.log("Download iniciado!");

      setModal({
        open: true,
        title: "Download Concluído",
        message: "O documento .docx foi gerado com sucesso!",
        confirmText: "OK",
        type: "success",
        onConfirm: () => setModal((m) => ({ ...m, open: false })),
      });
      setLoadingDocx(false);
    } catch (error) {
      console.error("Erro ao gerar DOCX:", error);
      setModal({
        open: true,
        title: "Erro ao Gerar Documento",
        message: `Ocorreu um erro ao gerar o documento: ${error.message}`,
        confirmText: "OK",
        type: "error",
        onConfirm: () => setModal((m) => ({ ...m, open: false })),
      });
      setLoadingDocx(false);
    }
  };

  const saveProposal = () => {
    const newProposal = {
      id: Date.now(),
      municipio: options.municipio,
      data: options.data,
      services,
      customCabimentos,
      expiresAt: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15 dias
    };

    const updated = [...savedProposals, newProposal];
    setSavedProposals(updated);
    localStorage.setItem("savedPropostas", JSON.stringify(updated));

    setModal({
      open: true,
      title: "Proposta Salva",
      message: "Proposta salva com sucesso!",
      confirmText: "OK",
      cancelText: "",
      type: "success",
      onConfirm: () =>
        setModal({
          open: false,
          title: "",
          message: "",
          confirmText: "OK",
          cancelText: "",
          type: "info",
          onConfirm: () => { },
          onCancel: () => { },
        }),
      onCancel: () => { },
    });
  };

  const loadProposal = (proposal) => {
    setOptions({ municipio: proposal.municipio, destinatario: "", data: proposal.data });
    setServices(proposal.services);
    // Restaurar customCabimentos se existir, senão usar valores padrão
    if (proposal.customCabimentos) {
      setCustomCabimentos(proposal.customCabimentos);
    }
  };

  const deleteProposal = (id) => {
    setModal({
      open: true,
      title: "Confirmar Exclusão",
      message: "Tem certeza que deseja excluir esta proposta salva? Esta ação não pode ser desfeita.",
      confirmText: "Sim, Excluir",
      cancelText: "Cancelar",
      type: "warning",
      onConfirm: () => {
        const updated = savedProposals.filter((p) => p.id !== id);
        setSavedProposals(updated);
        localStorage.setItem("savedPropostas", JSON.stringify(updated));
        setModal({
          open: false,
          title: "",
          message: "",
          confirmText: "OK",
          cancelText: "",
          type: "info",
          onConfirm: () => { },
          onCancel: () => { },
        });
      },
      onCancel: () =>
        setModal({
          open: false,
          title: "",
          message: "",
          confirmText: "OK",
          cancelText: "",
          type: "info",
          onConfirm: () => { },
          onCancel: () => { },
        }),
    });
  };

  // Funções de limpeza de propostas expiradas
  const cleanExpiredProposals = (proposals) => {
    const now = Date.now();
    return proposals.filter((p) => {
      if (!p.expiresAt) return true;
      return p.expiresAt > now;
    });
  };

  // Carregar propostas salvas do localStorage ao iniciar e limpar expiradas
  React.useEffect(() => {
    const saved = localStorage.getItem("savedPropostas");
    if (saved) {
      const allProposals = JSON.parse(saved);
      const validProposals = cleanExpiredProposals(allProposals);

      if (validProposals.length !== allProposals.length) {
        localStorage.setItem("savedPropostas", JSON.stringify(validProposals));
        console.log(
          `${allProposals.length - validProposals.length} proposta(s) expirada(s) foi(ram) deletada(s) automaticamente.`
        );
      }

      setSavedProposals(validProposals);
    }
  }, []);

  // Começar do zero - reseta tudo
  const startFromScratch = () => {
    setModal({
      open: true,
      title: "Nova Proposta",
      message: "Deseja começar uma nova proposta do zero? Todos os dados não salvos serão perdidos.",
      confirmText: "Começar",
      cancelText: "Cancelar",
      type: "warning",
      onConfirm: () => {
        setOptions({ municipio: "", destinatario: "", data: "" });
        setServices(
          Object.keys(allServices).reduce((acc, key) => {
            acc[key] = false;
            return acc;
          }, {})
        );
        setCustomCabimentos({
          pasep: "Cabível",
          rpps: "Cabível",
          impostoRenda: "Cabível",
          cfem: "Cabível",
          cfurh: "Cabível",
          tabelaSUS: "Cabível",
          fundef: "Cabível",
          fundeb: "Cabível",
          energiaEletrica: "Cabível",
          royaltiesOleoGas: "Cabível",
          repassesFPM: "Cabível",
          revisaoParcelamento: "Cabível",
          issqn: "Cabível",
          servicosTecnicos: "Cabível",
          demaisTeses: "Cabível",
        });
        setModal({
          open: false,
          title: "",
          message: "",
          confirmText: "OK",
          cancelText: "",
          type: "info",
          onConfirm: () => { },
          onCancel: () => { },
        });
      },
      onCancel: () =>
        setModal({
          open: false,
          title: "",
          message: "",
          confirmText: "OK",
          cancelText: "",
          type: "info",
          onConfirm: () => { },
          onCancel: () => { },
        }),
    });
  };

  // Função para validar arquivos .docx
  const validateDocxFile = (file) => {
    const MAX_SIZE = 10 * 1024 * 1024;
    const ALLOWED_TYPES = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    const ALLOWED_EXTENSIONS = [".docx", ".doc"];

    if (!file) {
      return { valid: false, error: "Nenhum arquivo selecionado." };
    }

    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: 10MB. Tamanho do arquivo: ${(file.size / 1024 / 1024).toFixed(
          2
        )}MB`,
      };
    }

    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return { valid: false, error: "Formato inválido. Use apenas arquivos .docx ou .doc" };
    }

    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: "Tipo de arquivo inválido. Use apenas documentos Word." };
    }

    return { valid: true };
  };

  // Importar documento .docx
  const importDocx = async (file) => {
    const validation = validateDocxFile(file);
    if (!validation.valid) {
      setModal({
        open: true,
        title: "Arquivo inválido",
        message: validation.error,
        confirmText: "OK",
        type: "error",
        onConfirm: () => setModal((m) => ({ ...m, open: false })),
      });
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      let text = result.value; // texto puro

      // Substituir município e data
      if (options.municipio) {
        // Substitui ocorrências simples do município anterior para o novo
        const municipioRegex = /Brasileira|Corrente|Jaic[oó]s/gi;
        text = text.replace(municipioRegex, options.municipio);
      }
      if (options.data) {
        // substitui datas comuns por nova
        text = text.replace(/\d{1,2}\s+de\s+(\w+)\s+de\s+\d{4}/g, options.data);
      }

      // Remover seções 2.2 até 2.8 (assume que as seções iniciam com '2.' e número)
      // Estratégia: dividir por linhas e filtrar entre linhas que começam com 2.2... até 2.8
      const lines = text.split(/\r?\n/);
      let outLines = [];
      let skip = false;
      for (let ln of lines) {
        const t = ln.trim();
        if (/^2\.[2-8]\b/.test(t) || /^2\.[2-8]\s?–/.test(t) || /^2\.[2-8]\s?-/.test(t)) {
          skip = true;
          continue;
        }
        if (skip && /^3\./.test(t)) {
          skip = false;
        }
        if (!skip) outLines.push(ln);
      }

      const cleaned = outLines.join("\n");

      // Gerar docx com conteúdo processado
      const doc = new Document();
      const paras = cleaned.split(/\n\n+/g);
      const children = paras.map((p) => new Paragraph(p));
      doc.addSection({ children });
      const packer = new Packer();
      const blob = await packer.toBlob(doc);
      saveAs(blob, `Proposta-ajustada-${options.municipio}.docx`);
    } catch (err) {
      console.error("Erro ao processar .docx:", err);
    }
  };

  // Handler para download e salvar, passado para o sidebar
  const onDownloadDocx = generateDocx;
  const onSaveProposal = saveProposal;
  React.useEffect(() => {
    const upload = document.getElementById("upload-docx");
    if (upload) {
      upload.onchange = (e) => {
        const f = e.target.files && e.target.files[0];
        if (f) handleUpload(f);
      };
    }
  }, [options, services]);

  return (
    <div className={`app ${theme}`} style={{ backgroundColor: colors[theme].background }}>
      <main className="main" style={{ paddingTop: 0 }}>
        {/* Versão Desktop - Sidebar sempre visível */}
        <div className="desktop-layout">
          <ControlsSidebar
            theme={theme}
            options={options}
            setOptions={setOptions}
            prazo={prazo}
            setPrazo={setPrazo}
            services={services}
            setServices={setServices}
            customCabimentos={customCabimentos}
            setCustomCabimentos={setCustomCabimentos}
            customEstimates={customEstimates}
            setCustomEstimates={setCustomEstimates}
            rppsImage={rppsImage}
            setRppsImage={setRppsImage}
            footerOffices={footerOffices}
            setFooterOffices={setFooterOffices}
            paymentValue={paymentValue}
            setPaymentValue={setPaymentValue}
            savedProposals={savedProposals || []}
            onLoadProposal={loadProposal}
            onDeleteProposal={deleteProposal}
            onStartFromScratch={startFromScratch}
            onImportDocx={importDocx}
            onSaveProposal={saveProposal}
            onDownloadDocx={generateDocx}
            onDownloadPdf={generatePdf}
            loadingPdf={loadingPdf}
            loadingDocx={loadingDocx}
          />
          <div className="content" style={{
            background: '#227056',
            padding: '20px 0',
            minHeight: '100vh'
          }}>
            <div style={{ width: '100%', maxWidth: '210mm', margin: '0 auto' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', color: '#ffffff', fontFamily: "'EB Garamond', serif" }}>Prévia</h2>
              <ProposalDocument theme={theme} options={options} prazo={prazo} services={services} customCabimentos={customCabimentos} customEstimates={customEstimates} rppsImage={rppsImage} footerOffices={footerOffices} paymentValue={paymentValue} />
            </div>
          </div>
        </div>

        {/* Versão Mobile */}
        <div className="mobile-layout">
          {/* Sidebar de personalização (sempre visível quando não está em preview) */}
          {!showPreview && (
            <div className="mobile-sidebar">
              <ControlsSidebar
                theme={theme}
                options={options}
                setOptions={setOptions}
                prazo={prazo}
                setPrazo={setPrazo}
                services={services}
                setServices={setServices}
                customCabimentos={customCabimentos}
                setCustomCabimentos={setCustomCabimentos}
                customEstimates={customEstimates}
                setCustomEstimates={setCustomEstimates}
                rppsImage={rppsImage}
                setRppsImage={setRppsImage}
                footerOffices={footerOffices}
                setFooterOffices={setFooterOffices}
                paymentValue={paymentValue}
                setPaymentValue={setPaymentValue}
                savedProposals={savedProposals || []}
                onLoadProposal={loadProposal}
                onDeleteProposal={deleteProposal}
                onStartFromScratch={startFromScratch}
                onImportDocx={importDocx}
                onSaveProposal={saveProposal}
                onDownloadDocx={generateDocx}
                onDownloadPdf={generatePdf}
                loadingPdf={loadingPdf}
                loadingDocx={loadingDocx}
              />
            </div>
          )}

          {/* Preview Modal Mobile com Zoom Touch */}
          {showPreview && (
            <div className="mobile-preview">
              <button
                onClick={() => {
                  setShowPreview(false);
                  setPreviewScale(0.4);
                  setPreviewTranslate({ x: 0, y: 0 });
                }}
                className="mobile-close-preview"
                style={{
                  position: 'fixed',
                  top: '20px',
                  left: '20px',
                  zIndex: 10000,
                  background: '#227056',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s'
                }}
              >
                <X size={24} />
              </button>

              {/* Indicador de zoom */}
              <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 10000,
                background: 'rgba(34, 112, 86, 0.9)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {Math.round(previewScale * 100)}%
              </div>

              <div
                id="mobile-preview-container"
                style={{
                  padding: '80px 0 20px',
                  overflowY: 'auto',
                  overflowX: 'auto',
                  height: '100vh',
                  touchAction: 'pan-x pan-y pinch-zoom',
                  WebkitOverflowScrolling: 'touch'
                }}
                onTouchStart={(e) => {
                  if (e.touches.length === 2) {
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    const distance = Math.hypot(
                      touch2.clientX - touch1.clientX,
                      touch2.clientY - touch1.clientY
                    );
                    e.currentTarget.dataset.initialDistance = distance;
                    e.currentTarget.dataset.initialScale = previewScale;
                  }
                }}
                onTouchMove={(e) => {
                  if (e.touches.length === 2) {
                    e.preventDefault();
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    const distance = Math.hypot(
                      touch2.clientX - touch1.clientX,
                      touch2.clientY - touch1.clientY
                    );
                    const initialDistance = parseFloat(e.currentTarget.dataset.initialDistance);
                    const initialScale = parseFloat(e.currentTarget.dataset.initialScale);

                    if (initialDistance && initialScale) {
                      const scale = (distance / initialDistance) * initialScale;
                      const clampedScale = Math.min(Math.max(scale, 0.2), 3);
                      setPreviewScale(clampedScale);
                    }
                  }
                }}
              >
                <div style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.1s ease-out',
                  width: '100%',
                  display: 'inline-block',
                  background: '#227056',
                  padding: '20px 0'
                }}>
                  <ProposalDocument
                    theme={theme}
                    options={options}
                    prazo={prazo}
                    services={services}
                    customCabimentos={customCabimentos}
                    customEstimates={customEstimates}
                    rppsImage={rppsImage}
                    footerOffices={footerOffices}
                    paymentValue={paymentValue}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Botão Flutuante de Visualizar Prévia */}
          {!showPreview && (
            <button
              onClick={() => setShowPreview(true)}
              className="mobile-preview-button"
              style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 9999,
                background: 'linear-gradient(135deg, #227056 0%, #1a5642 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '64px',
                height: '64px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(34, 112, 86, 0.4)',
                transition: 'all 0.3s',
                fontSize: '10px',
                fontWeight: '600',
                gap: '4px'
              }}
            >
              <Eye size={24} />
              <span>Prévia</span>
            </button>
          )}
        </div>

        <Modal {...modal} />
      </main>

      <style>{`
        /* Estilos para quebra automática de página */
        .pdf-page-render {
          page-break-after: always;
          page-break-inside: auto;
        }
        
        .pdf-page-render h2,
        .pdf-page-render h3 {
          page-break-after: avoid;
          break-after: avoid;
        }
        
        .pdf-page-render p {
          orphans: 2;
          widows: 2;
        }
        
        /* Impressão / PDF */
        @media print {
          .pdf-page-render {
            page-break-after: always;
            min-height: 0 !important;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          @page {
            size: A4;
            margin: 0;
          }
        }

        .desktop-layout {
          display: flex;
          width: 100%;
        }

        .mobile-layout {
          display: none;
        }

        @media (max-width: 768px) {
          .desktop-layout {
            display: none;
          }

          .mobile-layout {
            display: block;
            width: 100%;
          }

          .mobile-sidebar {
            width: 100%;
            padding: 20px;
            overflow-y: auto;
          }

          .mobile-preview {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: white;
            z-index: 9998;
            overflow-y: auto;
          }

          .mobile-preview-button:hover {
            transform: scale(1.1);
            box-shadow: 0 8px 24px rgba(34, 112, 86, 0.5);
          }

          .mobile-close-preview:hover {
            background: #1a5642;
          }

          .sidebar {
            position: relative !important;
            top: auto !important;
            height: auto !important;
            overflow-y: visible !important;
          }

          .pdf-page-render {
            width: 100% !important;
            min-height: auto !important;
            padding: 20px !important;
            margin-bottom: 40px !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
          }

          .proposal-table {
            font-size: 12px !important;
          }

          .proposal-table th,
          .proposal-table td {
            padding: 6px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
