'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Settings, LogOut, Save } from 'lucide-react';
import { downloadParecerJuridicoViaBackend } from '@/lib/parecerGenerator';
import { pareceresApi } from '@/lib/api';

interface ParecerJuridicoProps {
  onBack: () => void;
  onLogout?: () => void;
  onSave?: () => void;
  documentId?: string | null;
}

// ========== LABELS DO PAINEL ESQUERDO ==========
const SECTION_LABELS: Record<number, string> = {
  1: 'I. Do Relatório',
  2: 'II. Da Análise Jurídica',
  3: 'III. Dos Documentos',
  4: 'IV. Da Conclusão',
};

// ========== CONTEÚDO COMPLETO DAS SEÇÕES ==========
const SECOES = [
  {
    numero: 1,
    titulo: 'I- DO RELATÓRIO',
    conteudo: `Trata-se do processo nº ______, o qual foi encaminhado para exame e parecer desta Procuradoria acerca da CONTRATAÇÃO DE CONSULTORIA JURÍDICA objetivando o desenvolvimento de serviços advocatícios especializados de prestação de serviços de assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico, Financeiro e Previdenciário, em especial para alcançar o incremento de receitas, dentre elas: folha de pagamento, prospectar e quantificar ativos ocultos decorrentes do recolhimento de contribuições previdenciárias a maior, recuperação dos valores repassados à menor pela união federal a título de fundeb, incremento de receitas do Fundo de Participação dos Municípios e recuperar os valores não repassados devidamente pela União ao Municípios, auditoria e consultoria do pagamento de energia elétrica, o reconhecimento, a implementação e a manutenção do pagamento de compensação financeira exploração de recursos minerais – CFEM, seja na condição de produtor, afetado e/ou limítrofe; ficando responsável pelo ajuizamento, acompanhamento e intervenções de terceiro em ações judiciais e administrativas de interesse do município de Barrocas/BA por meio de inexigibilidade de licitação.

Assim, versam os presentes autos sobre a inexigibilidade de licitação, o qual se encontra na fase final, ou seja, para emissão de Parecer Jurídico quanto à legalidade do procedimento adotado.

Eis, o que tínhamos a relatar.`,
  },
  {
    numero: 2,
    titulo: 'II- DA ANÁLISE JURÍDICA',
    conteudo: `Excluindo-se os elementos técnicos e econômicos que embasaram o procedimento, é realizada a presente análise sobre os elementos e/ou requisitos eminentemente jurídicos do presente processo de inexigibilidade.

Inicialmente, procederemos ao estudo acerca da possibilidade jurídica de enquadramento da hipótese debatida numa das disposições legais cuja contratação prescinde de certame licitatório, por inexigibilidade. A Constituição da República prescreve:

"Art. 37. (...) XXI - ressalvados os casos especificados na legislação, as obras, serviços, compras e alienações serão contratados mediante processo de licitação pública que assegure igualdade de condições a todos os concorrentes, com cláusulas que estabeleçam obrigações de pagamento, mantidas as condições efetivas da proposta, nos termos da lei, o qual somente permitirá as exigências de qualificação técnica e econômica indispensáveis à garantia do cumprimento das obrigações."

No nosso ordenamento jurídico o dever de licitar é a regra geral. Sendo procedimento administrativo pelo qual o ente público – inclusive a Sociedade de Economia Mista – procede a uma seleção, de forma imparcial, entre interessados, avaliando através de requisitos objetivos, aquele que melhor atende a sua pretensão. Leva em conta princípios como impessoalidade, moralidade, eficiência, legalidade, economicidade e, até onde é possível valorar objetivamente, o aspecto técnico.

Entretanto, a teor do que enuncia o dispositivo supra, há exceções à obrigatoriedade de licitar. O art. 74 da Lei nº 14.133/21 prevê a inexigibilidade de licitação:

Art. 74. É inexigível a licitação quando inviável a competição, em especial nos casos de:

I - aquisição de materiais, de equipamentos ou de gêneros ou contratação de serviços que só possam ser fornecidos por produtor, empresa ou representante comercial exclusivos;

II - contratação de profissional do setor artístico, diretamente ou por meio de empresário exclusivo, desde que consagrado pela crítica especializada ou pela opinião pública;

III - contratação dos seguintes serviços técnicos especializados de natureza predominantemente intelectual com profissionais ou empresas de notória especialização, vedada a inexigibilidade para serviços de publicidade e divulgação:

a) estudos técnicos, planejamentos, projetos básicos ou projetos executivos;
b) pareceres, perícias e avaliações em geral;
c) assessorias ou consultorias técnicas e auditorias financeiras ou tributárias;
d) fiscalização, supervisão ou gerenciamento de obras ou serviços;
e) patrocínio ou defesa de causas judiciais ou administrativas;
f) treinamento e aperfeiçoamento de pessoal;
g) restauração de obras de arte e de bens de valor histórico;
h) controles de qualidade e tecnológico, análises, testes e ensaios de campo e laboratoriais, instrumentação e monitoramento de parâmetros específicos de obras e do meio ambiente e demais serviços de engenharia que se enquadrem no disposto neste inciso;

IV - objetos que devam ou possam ser contratados por meio de credenciamento;

V - aquisição ou locação de imóvel cujas características de instalações e de localização tornem necessária sua escolha.

§ 1º Para fins do disposto no inciso I do caput deste artigo, a Administração deverá demonstrar a inviabilidade de competição mediante atestado de exclusividade, contrato de exclusividade, declaração do fabricante ou outro documento idôneo capaz de comprovar que o objeto é fornecido ou prestado por produtor, empresa ou representante comercial exclusivos, vedada a preferência por marca específica.

§ 2º Para fins do disposto no inciso II do caput deste artigo, considera-se empresário exclusivo a pessoa física ou jurídica que possua contrato, declaração, carta ou outro documento que ateste a exclusividade permanente e contínua de representação, no País ou em Estado específico, do profissional do setor artístico, afastada a possibilidade de contratação direta por inexigibilidade por meio de empresário com representação restrita a evento ou local específico.

§ 3º Para fins do disposto no inciso III do caput deste artigo, considera-se de notória especialização o profissional ou a empresa cujo conceito no campo de sua especialidade, decorrente de desempenho anterior, estudos, experiência, publicações, organização, aparelhamento, equipe técnica ou outros requisitos relacionados com suas atividades, permita inferir que o seu trabalho é essencial e reconhecidamente adequado à plena satisfação do objeto do contrato.

§ 4º Nas contratações com fundamento no inciso III do caput deste artigo, é vedada a subcontratação de empresas ou a atuação de profissionais distintos daqueles que tenham justificado a inexigibilidade.

§ 5º Nas contratações com fundamento no inciso V do caput deste artigo, devem ser observados os seguintes requisitos:

I - avaliação prévia do bem, do seu estado de conservação, dos custos de adaptações, quando imprescindíveis às necessidades de utilização, e do prazo de amortização dos investimentos;
II - certificação da inexistência de imóveis públicos vagos e disponíveis que atendam ao objeto;
III - justificativas que demonstrem a singularidade do imóvel a ser comprado ou locado pela Administração e que evidenciem vantagem para ela.

O presente caso envolve hipótese de inexigibilidade de licitação para determinados serviços técnicos, que possuam natureza singular, realizados com profissionais ou empresas de notória especialização. Esses serviços técnicos estão enumerados no art. 6, incisos, XVIII e XIX, da Lei n° 14.133/21, de forma taxativa ou restritiva, vejamos:

Art. 6º Para os fins desta Lei, consideram-se:

XVIII - serviços técnicos especializados de natureza predominantemente intelectual: aqueles realizados em trabalhos relativos a:

a) estudos técnicos, planejamentos, projetos básicos e projetos executivos;
b) pareceres, perícias e avaliações em geral;
c) assessorias e consultorias técnicas e auditorias financeiras e tributárias;
d) fiscalização, supervisão e gerenciamento de obras e serviços;
e) patrocínio ou defesa de causas judiciais e administrativas;
f) treinamento e aperfeiçoamento de pessoal;
g) restauração de obras de arte e de bens de valor histórico;
h) controles de qualidade e tecnológico, análises, testes e ensaios de campo e laboratoriais, instrumentação e monitoramento de parâmetros específicos de obras e do meio ambiente e demais serviços de engenharia que se enquadrem na definição deste inciso;

XIX - notória especialização: qualidade de profissional ou de empresa cujo conceito, no campo de sua especialidade, decorrente de desempenho anterior, estudos, experiência, publicações, organização, aparelhamento, equipe técnica ou outros requisitos relacionados com suas atividades, permite inferir que o seu trabalho é essencial e reconhecidamente adequado à plena satisfação do objeto do contrato;

Essa é a capitulação a que a hipótese descrita pelo órgão requisitante sobre a qual passaremos a discorrer. Partimos para o desmembramento dos conceitos encadeados.

Primeiro a competição deve ser inviável. O Professor Marçal Justen Filho, em sua obra, "Comentários à Lei de Licitações e Contratos Administrativos, Dialética, 10ª edição, pág. 268 e seguintes" discorre:

"Segundo a fórmula legal, a inexigibilidade de licitação deriva da inviabilidade de competição."

Segue em suas razões:

"É imperioso destacar que a inviabilidade de competição não é um conceito simples, que corresponda a uma ideia única. Trata-se de um gênero, comportando diferentes modalidades. Mais precisamente, a inviabilidade de competição é uma consequência, que pode ser produzida por diferentes causas, as quais consistem nas diversas hipóteses de ausência de pressupostos necessários à licitação.

Se a Constituição impusesse a prévia licitação como regra absoluta e não excepcionável, ter-se-ia de reconhecer não uma presunção, mas uma espécie de ficção jurídica. A diferença entre os dois institutos foi longamente estudada nos diferentes ramos do Direito. A presunção absoluta consiste na determinação legal de determinado comando, a partir da experiência acerca do que normalmente ocorre. A ficção reside na imposição normativa de certo comando em dissonância com o conhecimento que se extrai do mundo físico ou social. Na presunção absoluta, o Direito acolhe e generaliza os dados recolhidos pelo conhecimento e pela experiência; na ficção, o Direito infringe e se contrapõe à ordem extrajurídica dos fatos. Se, portanto, a Constituição proibisse em termos absolutos contratações sem prévia licitação, ter-se-ia de reconhecer uma ficção jurídica. Estaria consagrado que, sempre e em todas as hipóteses, a contratação mais vantajosa, com observância do princípio da isonomia, seria obtida através do procedimento licitatório. Ora, a experiência e o conhecimento demonstram que a licitação nem sempre conduz à consecução de tais objetivos. Seria incompatível com os princípios da República, da moralidade e da isonomia impor como obrigatória, em todos os casos, solução que conducente à frustração dos objetivos norteadores da atividade administrativa. Justamente por isso, a própria Constituição ressalva, no art. 37, inc. XXI, a possibilidade de contratação sem prévia licitação, nas hipóteses disciplinadas pela legislação. Tem de reconhecer-se, portanto, o dever do legislador infraconstitucional prever as hipóteses de contratação direta, atentando para os casos onde realizar prévia licitação comprometeria os valores da República, da moralidade e da isonomia."

Na sequência o autor citado enumera os requisitos de uma inexigibilidade de licitação:

· Ausência de alternativas: há uma única solução para a Administração e um único particular capaz de prestá-la;
· Ausência de mercado concorrencial;
· Ausência de objetividade na seleção do objeto: existem diferentes alternativas, mas a natureza personalíssima da atuação do particular impede julgamento objetivo;
· Ausência de definição objetiva da prestação a ser executada.

Observamos dos documentos juntados ao presente processo que a vantajosidade comercial/preço foi devidamente atestada, cumprindo assim os moldes exigidos pelo Tribunal de Contas da União, demais Órgãos de controle e pela Lei.

Ainda, no que tange às condições de preço/comerciais, temos entendimento doutrinário e do Tribunal de Contas que a nosso ver foram atendidos pela documentação apensada.

Portanto, a notoriedade conceituada no § 3º, do art. 74, constitui-se num requisito a ser verificado pelo administrador no caso concreto, para se caracterizar a inexigibilidade de licitação, o que observamos que foi devidamente atendido no presente caso pelos elementos documentais apresentados.

Diante disso, a empresa ou profissional devem possuir destaque na área em que atuam, o que no presente caso, restou profusamente comprovado na documentação enviada pela empresa CAVALCANTE REIS SOCIEDADE DE ADVOGADOS, que de forma pública e notória em âmbito estadual e nacional é sinônimo de serviços efetivamente diferenciados.

A escolha de determinada empresa ou profissional, mesmo com as disposições do permissivo legal supra, poderá ser bastante subjetiva, gerando problemas com os órgãos fiscalizadores da Administração Pública. Por isso, como ocorreu no presente caso de forma inequívoca, tal escolha deve ser devidamente justificada e motivada, a fim de que se torne legítima.

Com efeito, assim como evidenciado em sua proposta a empresa CAVALCANTE REIS SOCIEDADE DE ADVOGADOS, demonstrou experiência com 25 municípios e conta no seu quadro profissionais devidamente qualificados na área de atuação do objeto contratado quais sejam:

IURI DO LAGO NOGUEIRA CAVALCANTE REIS – Doutorando em Direito e Mestre em Direito Econômico e Desenvolvimento pelo Instituto Brasileiro de Ensino, Desenvolvimento e Pesquisa (IDP/Brasília). LLM (Master of Laws) em Direito Empresarial pela Fundação Getúlio Vargas (FGV/RJ). Integrante da Comissão de Juristas do Senado Federal criada para consolidar a proposta do novo Código Comercial Brasileiro. Autor e Coautor de livros, pareceres e artigos jurídicos na área do direito público. Sócio-diretor do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: iuri@cavalcantereis.adv.br).

GABRIEL GAUDÊNCIO ZANCHETTA CALIMAN – Graduado em Direito pelo Centro Universitário de Brasília (UniCeub). Especialista em Gestão Pública e Tributária pelo Gran Centro Universitário. Membro da Comissão de Assuntos Tributários da OAB/DF. Advogado associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: gabrielcaliman@cavalcantereis.adv.br).

FELIPE NOBREGA ROCHA – Graduado em Direito pela Universidade Presbiteriana Mackenzie. LLM (Master of Laws) em Direito Empresarial pela Fundação Getúlio Vargas (FGV). Mestrado Profissional em Direito pelo Instituto Brasileiro de Ensino, Desenvolvimento e Pesquisa (IDP). Advogado associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: felipe@cavalcantereis.adv.br).

RYSLHAINY DOS SANTOS CORDEIRO – Graduada em Direito pelo Centro Universitário ICESP. Pós-graduada em Direito Civil e Processo Civil, Direito Tributário e Processo Tributário e Planejamento Tributário pela Faculdade Legale. Advogada associada do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: ryslhainy@cavalcantereis.adv.br).

Como já mencionado, um outro aspecto a ser verificado na inexigibilidade de licitação, que também se estende aos casos de dispensa, refere-se aos preços. Não pode haver a figura do superfaturamento, que ocorre quando o valor contratado se apresentar superior ao praticado no mercado. Portanto, faz-se necessária a comparação.

Portanto, reiteramos que o processo deve ser instruído com a justificativa de preço, o que como vimos foi robustamente observado.

Como visto, ao requisitante competiu, portanto, analisar a presença dos requisitos que demonstram que o serviço que se pretende contratar é técnico profissional especializado e o que melhor atende e de forma diferenciada às necessidades da Administração Pública no caso em comento. Presentes tais requisitos, expostos acima, entendemos que há a tipificação da hipótese ao tipo legal.`,
  },
  {
    numero: 3,
    titulo: 'III- DOS DOCUMENTOS QUE INSTRUEM O PRESENTE PROCESSO',
    conteudo: `Passamos a análise da observância dos requisitos legais impostos. Nesse particular, observa-se que o artigo 72 da Lei n.º 14.133/2021, assim dispõe:

"Art. 72. O processo de contratação direta, que compreende os casos de inexigibilidade e de dispensa de licitação, deverá ser instruído com os seguintes documentos:

I - documento de formalização de demanda e, se for o caso, estudo técnico preliminar, análise de riscos, termo de referência, projeto básico ou projeto executivo;
II - estimativa de despesa, que deverá ser calculada na forma estabelecida no art. 23 desta Lei;
III - parecer jurídico e pareceres técnicos, se for o caso, que demonstrem o atendimento dos requisitos exigidos;
IV - demonstração da compatibilidade da previsão de recursos orçamentários com o compromisso a ser assumido;
V - comprovação de que o contratado preenche os requisitos de habilitação e qualificação mínima necessária;
VI - razão da escolha do contratado;
VII - justificativa de preço;
VIII - autorização da autoridade competente.

Assim, passamos a verificar se o procedimento em análise obedece aos comandos legais supracitados.

Conforme documentos anexos, tem-se que o procedimento se encontra instruído com os documentos exigidos pela Lei nº 14.133/20121.

Considerando que se trata de matéria estritamente técnica, inerente à competência da Administração Pública, cabe a essa assessoria jurídica orientar a respeito do tema, sem necessariamente fazer juízo de valor a respeito do resultado da pesquisa.

O artigo 72, IV, da Nova Lei de Licitações estabelece, dentre outras exigências, que o processo de inexigibilidade seja instruído com documento probatório da compatibilidade da previsão de recursos orçamentários com o compromisso a ser assumido.

No caso dos autos, a disponibilidade orçamentária é comprovada mediante juntada de despacho emitido por servidor público competente, atestando a existência de crédito orçamentário.

Nos termos do artigo 92, inciso XVI, da Lei nº 14.133/2021, a contratada deverá manter durante a contratação, todas as condições de habilitação e qualificação que foram exigidas na licitação, ou nos atos preparatórios que antecederam a contratação direta, por dispensa ou por inexigibilidade. Tais quesitos, segundo os incisos do art. 62 da mesma Lei, englobam habilitação jurídica, técnica, fiscal, social, trabalhista e econômico-financeira.

Os autos foram instruídos com a comprovação da regularidade na habilitação da empresa.

O artigo 72, VI e VII, da Lei n.º 14.133/2021 estabelecem a necessidade de instruir os autos com a razão da escolha do fornecedor e a justificativa do preço, em anexo.

O artigo 72, VIII, da Lei n.º 14.133/2021 prevê a necessidade de autorização pela autoridade competente, em anexo.

Atente-se, também, para a exigência e necessidade de cumprimento, no momento oportuno, da obrigatoriedade constante no parágrafo único do art. 72 da Nova Lei de Licitações, o qual determina que "o ato que autoriza a contratação direta ou o extrato decorrente do contrato deverá ser divulgado e mantido à disposição do público em sítio eletrônico oficial".

Recomenda-se, portanto, em atenção aos dispositivos em destaque, que o ato que autoriza a contratação direta seja divulgado e mantido à disposição do público em sítio eletrônico oficial do órgão, bem como ocorra divulgação no Portal Nacional de Contratações Públicas (PNCP) para a eficácia do contrato (artigos 72, §único e 94 da Lei n.º 14.133/2021).`,
  },
  {
    numero: 4,
    titulo: 'IV- DA CONCLUSÃO',
    conteudo: `Conclui-se por tanto que a contratação de empresa especializada decorre da necessidade legal de assessoria técnica e jurídica nas áreas de direito público, tributário, econômico, financeiro, previdenciário e minerário, em especial para alcançar o incremento de receitas.

Diante do exposto, e com fulcro nas razões acima expostas, opinamos pela plena possibilidade técnica de afastamento da licitação por inexigibilidade, objetivando a contratação da empresa CAVALCANTE REIS SOCIEDADE DE ADVOGADOS, inscrita no CNPJ sob o nº 26.632.686/0001-27, para a "o desenvolvimento de serviços advocatícios especializados de prestação de serviços de assessoria técnica e jurídica nas áreas de direito público, tributário, econômico, financeiro e previdenciário, em especial para alcançar o incremento de receitas, bem como recuperações que busquem a reduzir as despesas recorrentes, em observância imperativa dos princípios da supremacia do interesse público, eficiência e o da economicidade no caso proposto.

Salienta-se que as Certidões Negativas de Débito Federal, Estadual, Municipal, Trabalhista e o Certificado de Regularidade Fiscal do FGTS deverão constar nos autos dentro da data de validade quando da assinatura do Contrato.

Este é o parecer S.M.J.`,
  },
];

// ========== GRUPOS DE PÁGINAS ==========
const PAGE_GROUPS = [
  [1],     // Página 1: Seção I (com cabeçalho do doc)
  [2],     // Página 2: Seção II (longa)
  [3],     // Página 3: Seção III
  [4],     // Página 4: Seção IV + Assinatura
];

export default function ParecerJuridico({ onBack, onLogout, onSave, documentId: initialDocumentId }: ParecerJuridicoProps) {
  const [formData, setFormData] = useState({
    municipio: 'BARROCAS/BA',
    processo: '000/2025',
    local: 'Barrocas/BA',
    dia: '____',
    mes: '__________',
    ano: '2025',
    assessor: 'ASSESSORIA JURÍDICA',
  });

  const [secaoAtiva, setSecaoAtiva] = useState<number>(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(initialDocumentId || null);

  useEffect(() => {
    if (initialDocumentId) {
      pareceresApi.getById(initialDocumentId).then(doc => {
        if (doc.formData) {
          setFormData(prev => ({ ...prev, ...(doc.formData as any) }));
        }
        setDocumentId(initialDocumentId);
      }).catch(err => console.error('Erro ao carregar parecer:', err));
    }
  }, [initialDocumentId]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadParecerJuridicoViaBackend({
        municipio: formData.municipio,
        processo: formData.processo,
        local: formData.local,
        dataFormatada: `${formData.dia} de ${formData.mes} de ${formData.ano}`,
        assessor: formData.assessor,
        secoes: SECOES,
      });
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      alert('Erro ao gerar documento. Tente novamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        municipio: formData.municipio,
        formData: formData as unknown as Record<string, unknown>,
      };
      if (documentId) {
        await pareceresApi.update(documentId, payload);
      } else {
        const created = await pareceresApi.create(payload);
        setDocumentId(created.id || null);
      }
      alert('Parecer salvo com sucesso!');
      if (onSave) onSave();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // ===== ESTILOS =====
  const pageStyle: React.CSSProperties = {
    background: 'white',
    width: '210mm',
    minHeight: '297mm',
    padding: '20mm 25mm 25mm 25mm',
    margin: '0 auto 20px auto',
    boxShadow: '0 0 20px rgba(0,0,0,0.15)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '13pt',
    fontWeight: 'bold',
    color: '#000',
    borderBottom: '1pt solid #000',
    paddingBottom: '6px',
    marginBottom: '12px',
    marginTop: '0',
    fontFamily: "'Garamond', serif",
  };

  const bodyTextStyle: React.CSSProperties = {
    textAlign: 'justify',
    fontSize: '11pt',
    lineHeight: '1.5',
    color: '#000',
    fontFamily: "'Garamond', serif",
    whiteSpace: 'pre-line',
    marginBottom: '0',
    marginTop: '0',
  };

  const LogoBarrocas = () => (
    <div style={{ textAlign: 'center', marginBottom: '12pt', flexShrink: 0 }}>
      <img
        src="/barrocas.png"
        alt="Logo Barrocas"
        style={{ width: '180pt', height: 'auto', display: 'block', margin: '0 auto' }}
        crossOrigin="anonymous"
      />
    </div>
  );

  return (
    <div className="app light">
      {/* HEADER */}
      <header className="header">
        <div className="left">
          <button onClick={onBack} className="btn secondary" style={{ padding: '8px 12px' }}>
            <ArrowLeft size={18} /> Voltar para Home
          </button>
          <h1>Parecer Jurídico</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onLogout && (
            <button onClick={onLogout} className="theme-btn" title="Sair">
              <LogOut size={20} color="#227056" />
            </button>
          )}
        </div>
      </header>

      <main className="main" style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>

        {/* PAINEL ESQUERDO: SEÇÕES */}
        <div style={{
          width: '210px', background: '#fff', borderRight: '1px solid #e5e5e5',
          overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e5e5' }}>
            <p style={{ fontSize: '10.5px', fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Seções
            </p>
          </div>
          {[1, 2, 3, 4].map(num => {
            const ativo = secaoAtiva === num;
            return (
              <button
                key={num}
                onClick={() => setSecaoAtiva(num)}
                style={{
                  width: '100%', padding: '10px 16px', textAlign: 'left',
                  background: ativo ? '#f0f9f5' : 'transparent', border: 'none',
                  borderLeft: ativo ? '3px solid #227056' : '3px solid transparent',
                  borderBottom: '1px solid #f0f0f0',
                  color: ativo ? '#227056' : '#555',
                  fontSize: '12px', fontWeight: ativo ? '600' : '400',
                  cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', lineHeight: '1.35', transition: 'all 0.12s',
                }}
              >
                <span style={{ flex: 1 }}>{SECTION_LABELS[num]}</span>
                {ativo && <span style={{ color: '#227056', fontSize: '18px', flexShrink: 0, marginLeft: '6px' }}>›</span>}
              </button>
            );
          })}
        </div>

        {/* SIDEBAR */}
        <aside className="sidebar" style={{ width: '260px', flexShrink: 0 }}>
          <div className="sidebar-header" style={{ marginBottom: '20px' }}>
            <Settings size={22} color="#227056" />
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#227056' }}>Personalizar</h2>
          </div>

          <div className="field">
            <label>Município</label>
            <input value={formData.municipio} onChange={e => setFormData({ ...formData, municipio: e.target.value })}
              style={{ borderRadius: '8px', border: '1px solid #ccc' }} />
          </div>

          <div className="field">
            <label>Processo Administrativo</label>
            <input value={formData.processo} onChange={e => setFormData({ ...formData, processo: e.target.value })}
              style={{ borderRadius: '8px', border: '1px solid #ccc' }} />
          </div>

          <div className="field">
            <label>Local (para assinatura)</label>
            <input value={formData.local} onChange={e => setFormData({ ...formData, local: e.target.value })}
              style={{ borderRadius: '8px', border: '1px solid #ccc' }} />
          </div>

          <div className="field">
            <label>Dia / Mês / Ano</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input placeholder="Dia" value={formData.dia} onChange={e => setFormData({ ...formData, dia: e.target.value })}
                style={{ width: '52px', borderRadius: '8px', border: '1px solid #ccc', padding: '10px 6px', fontSize: '13px' }} />
              <input placeholder="Mês" value={formData.mes} onChange={e => setFormData({ ...formData, mes: e.target.value })}
                style={{ flex: 1, borderRadius: '8px', border: '1px solid #ccc', padding: '10px 6px', fontSize: '13px' }} />
              <input placeholder="Ano" value={formData.ano} onChange={e => setFormData({ ...formData, ano: e.target.value })}
                style={{ width: '56px', borderRadius: '8px', border: '1px solid #ccc', padding: '10px 6px', fontSize: '13px' }} />
            </div>
          </div>

          <div className="field">
            <label>Assessoria Jurídica</label>
            <input value={formData.assessor} onChange={e => setFormData({ ...formData, assessor: e.target.value })}
              style={{ borderRadius: '8px', border: '1px solid #ccc' }} />
          </div>

          <div className="actions" style={{ marginTop: '16px' }}>
            <button onClick={handleDownload} disabled={isDownloading} className="btn primary" style={{ width: '100%' }}>
              <Download size={16} />
              {isDownloading ? 'Gerando...' : 'Baixar DOCX'}
            </button>
            <button onClick={handleSave} disabled={isSaving} className="btn primary" style={{ width: '100%', marginTop: '8px' }}>
              <Save size={16} />
              {isSaving ? 'Salvando...' : 'Salvar Parecer'}
            </button>
          </div>
        </aside>

        {/* ÁREA DE PREVIEW */}
        <div className="content" style={{ flex: 1, overflowY: 'auto', padding: '40px 20px' }}>
          <p className="preview-title">Documento do Parecer Jurídico</p>

          {PAGE_GROUPS.map((grupo, pageIndex) => {
            const isFirstPage = pageIndex === 0;
            const isLastPage = pageIndex === PAGE_GROUPS.length - 1;

            return (
              <div key={pageIndex} style={pageStyle} className="pdf-page-render">
                {/* Logo em cada página */}
                <LogoBarrocas />

                {/* Cabeçalho apenas na primeira página */}
                {isFirstPage && (
                  <>
                    <h1 style={{
                      textAlign: 'center', fontSize: '14pt', fontWeight: 'bold',
                      textDecoration: 'underline', fontFamily: "'Garamond', serif",
                      marginBottom: '8px', marginTop: '0',
                    }}>
                      PARECER JURÍDICO
                    </h1>
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontFamily: "'Garamond', serif", fontSize: '11pt', margin: '2px 0' }}>
                        <strong>Município:</strong> {formData.municipio}
                      </p>
                      <p style={{ fontFamily: "'Garamond', serif", fontSize: '11pt', margin: '2px 0' }}>
                        <strong>Processo Administrativo:</strong> {formData.processo}
                      </p>
                    </div>
                  </>
                )}

                {/* Seções da página */}
                {grupo.map(secaoNum => {
                  const secao = SECOES.find(s => s.numero === secaoNum);
                  if (!secao) return null;
                  return (
                    <div key={secaoNum} style={{ marginBottom: '20px' }}>
                      <p style={sectionTitleStyle}>{secao.titulo}</p>
                      <p style={bodyTextStyle}>{secao.conteudo}</p>
                    </div>
                  );
                })}

                {/* Finalização apenas na última página */}
                {isLastPage && (
                  <div style={{ marginTop: 'auto', paddingTop: '30px' }}>
                    <p style={{ fontFamily: "'Garamond', serif", fontSize: '11pt', marginBottom: '30px' }}>
                      {formData.local} ___ de {formData.mes} de {formData.ano}.
                    </p>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: "'Garamond', serif", fontSize: '11pt', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                        {formData.assessor}
                      </p>
                      <div style={{ borderTop: '1px solid #000', width: '240px', margin: '0 auto', paddingTop: '4px' }}>
                        <p style={{ fontFamily: "'Garamond', serif", fontSize: '9pt', margin: '0', color: '#555' }}>
                          _______________________________
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
