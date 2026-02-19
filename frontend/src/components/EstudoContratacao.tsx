'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Settings, LogOut, Save } from 'lucide-react';
import { downloadEstudoContratacaoViaBackend } from '@/lib/estudoGenerator';
import { estudosApi } from '@/lib/api';
import { toast } from 'sonner';

interface EstudoContratacaoProps {
  onBack: () => void;
  onLogout?: () => void;
  onSave?: () => void;
  documentId?: string | null;
}

// ========== HELPER: Renderiza texto com **negrito** ==========
function renderText(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i}>{part}</strong>
      : <React.Fragment key={i}>{part}</React.Fragment>
  );
}

// ========== NOMES CURTOS PARA O PAINEL ESQUERDO ==========
const TOPIC_LABELS: Record<number, string> = {
  1: '1. Introdução',
  2: '2. Descrição da Necessidade',
  3: '3. Requisitos da Contratação',
  4: '4. Estimativa de Recuperação',
  5: '5. Análise de Mercado',
  6: '6. Estimativa do Valor',
  7: '7. Descrição da Solução',
  8: '8. Não Parcelamento',
  9: '9. Objetivos',
  10: '10. Providências',
  11: '11. Contratações Correlatas',
  12: '12. Declaração de Viabilidade',
};

// ========== DADOS DOS 12 TÓPICOS ==========
const TOPICS: Record<number, { title: string; content: string | null }> = {
  1: {
    title: '1. INTRODUÇÃO',
    content: `O presente documento caracteriza importante etapa da fase de planejamento para a contratação de serviços jurídicos especializados na propositura de demandas judiciais e/ou administrativas visando o estudo, levantamento, questionamento processual, redução das despesas correntes e incremento das receitas provenientes das cobranças realizadas indevidas em relação aos seguintes objetos: a) **folha de pagamento/contribuição patronal**, identificação de recolhimentos a maior referentes às contribuições previdenciárias; b) **auditoria e consultoria energética** consistente no levantamento de dados, preparação, encaminhamento e acompanhamento da recuperação financeira dos valores pagos ou cobrados indevidamente pela concessionária/distribuidora de energia elétrica e recuperação ICMS; c) À recuperação de créditos do Imposto Sobre Serviços de Qualquer Natureza **(ISSQN);** d) **Imposto de Renda** Retido na Fonte incidente sobre fornecimento de bens ou prestação de serviços em geral; e) Recuperação dos valores repassados à menor pela União Federal a título de **FUNDEF** e **FUNDEB;** f) o reconhecimento, a implementação e a manutenção do pagamento de compensação financeira exploração de recursos minerais **– CFEM,** seja na condição de produtor, afetado e/ou limítrofe.`,
  },
  2: {
    title: '2. DESCRIÇÃO DA NECESSIDADE',
    content: `A solicitação de contratação dos serviços justifica-se pela necessidade de melhorar a arrecadação municipal através da propositura de demandas judiciais e/ou administrativas com o objetivo de recuperar e incrementar novas receitas pagas indevidamente ou a maior pela municipalidade.

Isto é, há valores que deveriam retornar aos cofres públicos em razão da incidência de legislação posterior ou advindas de decisão judicial, que poderão auxiliar financeiramente o município e que devem ser buscadas pela via judicial ou administrativa.

Registre-se que a instituição não possui servidores efetivos ou comissionados nomeados ou designados cujas atribuições encontrem parâmetro na execução das atividades pretendidas.

Tal ato denota a singularidade dos serviços prestados, bem como a necessidade de profissionais especializados, assim sendo, tornando-se inviável escolher o melhor profissional, para prestar serviço de natureza intelectual, por meio de licitação, pois tal mensuração se funda em critérios objetivos.

No caso concreto a equipe técnica é composta por advogados especializados em conhecimentos jurídicos da contratação em tela, o que induz amplos conhecimentos individuais e coletivos da empresa na área do objeto da contratação, conforme proposta de intenção de contratação apresentada pelo escritório.

Assim sendo, considerando que para lograr êxito no desempenho do trabalho, deverá restar demonstrada capacidade técnica e ampla experiência acerca da matéria jurídica envolvida.

Sob outro prisma, vale destacar que a Estrutura Administrativa do Município conta com uma Procuradoria Jurídica, que embora composta por profissionais altamente capacitados, não possui jurista habilitado com especialidade na área da contratação em tela, que dada sua complexidade não constitui atividade corriqueira, aquela que pode ser executada com facilidade e por qualquer pessoa.

Assim, observa-se que os procuradores nomeados desempenham papel de relevante importância, nas suas áreas de especialização/atuação e no que tange a generalidade das atividades desenvolvidas rotineiramente no âmbito do Poder Executivo. Ocorre que, consoante fundamentado alhures, o Poder Executivo enfrenta no seu dia-a-dia atividades de natureza altamente complexa, assim como necessita de profissionais experientes com soluções adequadas aos casos concretos, sobretudo, no acompanhamento e ajuizamento de ações em favor da municipalidade, cuja área de conhecimento não seja dominada pelos profissionais que já compõem o quadro da Procuradoria Jurídica.

Portanto, o objeto apresentado se justifica por inexigibilidade de licitação, levando-se em conta a especialidade dos serviços e singularidade dos mesmos, bem como, a pessoalidade e confiança do profissional a realizar os serviços, em concordância com o art. 74, III, alíneas "c" e "e", da Lei Federal n.º 14.133/21.

O que se propõe, portanto, é a contratação de serviços técnicos relativos à assessoria e consultoria jurídica, com notória especialidade e vasta experiência, a fim de melhor atender as necessidades e resguardar o interesse público.`,
  },
  3: {
    title: '3. REQUISITOS DA CONTRATAÇÃO',
    content: `A contratação se dará por inexigibilidade por se tratar de contratação de serviço técnico especializado de natureza predominantemente intelectual, de acordo os termos do art. 74, inciso III, da Lei 14.133 de 1º de abril de 2021.

A inexigibilidade de licitações demonstra ser a modalidade adequada para contratação de serviços técnicos especializados pela Administração Direta com previsão legal no art. 74, inciso III, alínea "c" e "e", da Lei n.º 14.133/21:

Art. 74. É inexigível a licitação quando inviável a competição, em especial nos casos de:
III - contratação dos seguintes serviços técnicos especializados de natureza predominantemente intelectual com profissionais ou empresas de notória especialização, vedada a inexigibilidade para serviços de publicidade e divulgação:
c) assessorias ou consultorias técnicas e auditorias financeiras ou tributárias;
e) patrocínio ou defesa de causas judiciais ou administrativas;

A nova lei vislumbra elucidar o aspecto objetivo da contratação, definindo que os serviços advocatícios e contábeis, quando executados por profissionais notórios e especializados, são presumidamente singulares, trazendo segurança jurídica para as contratações diretas por inexigibilidade de licitação.

Em suma: a singularidade é relevante e um serviço deve ser havido como singular quando nele tem de interferir, como requisito de satisfatório entendimento da necessidade administrativa, um componente criativo de seu autor, envolvendo o estilo, o traço, a engenhosidade, a especial habilidade, a contribuição intelectual, artística, ou a argúcia de quem o executa, atributos, estes, que são precisamente os que a Administração reputa convenientes e necessita para a satisfação do interesse público em causa.

O art. 25, inciso II, da Lei 8.666/1993 (revogada), substituída pela lei n.º 14.133, art. 74, III, apresenta a impossibilidade de estabelecer critérios de julgamento suficientes para julgar o profissional ou empresa especialista, considerando as variadas formas da execução dos serviços que impactam na entrega do objeto, torna-se determinante para o gestor público o exercício da discricionariedade para escolha da melhor solução encontrada no mercado, com o fulcro de garantir o alcance satisfatório da contratação.

Os serviços a serem contratados, por sua essencialidade, são prestados de forma permanente e continua sendo apresentado relatórios mensais quanto a atuação e atendimento as demandas que ocorrem. Analisadas contratações semelhantes em outros órgãos e entidades públicas recentemente com o mesmo escopo, após análise, verificou-se que o modelo adotado é o que mais se adequa às necessidades da Administração.

O prazo do contrato será de 01 (um) ano, podendo ser prorrogável por igual período.

A empresa deverá apresentar:

i) Atestado(s) de aptidão do desempenho da atividade, o qual comprove que tenha prestado, de forma satisfatória, serviços compatíveis com o objeto constante da contratação, fornecidos por pessoas jurídicas de direito público ou privado;
ii) A empresa deverá apresentar aptidão para o desempenho de suas atividades pertinente e compatível em característica, quantidade e prazos com objeto da contratação, através da apresentação de seus atestados de capacidade técnica onde fique demonstrado sua experiência;
iii) A Contratada deverá ter registro ou inscrição da na entidade profissional da Ordem dos Advogados do Brasil - OAB, em plena validade.`,
  },
  4: { title: '4. ESTIMATIVA DE RECUPERAÇÃO', content: null },
  5: {
    title: '5. ANÁLISE DE MERCADO',
    content: `O levantamento de mercado se configura como um passo fundamental nesse processo, uma vez que possibilita a análise detalhada e criteriosa do cenário de fornecedores, serviços e produtos disponíveis no mercado. Entretanto, nesta etapa, o §4º do art.23 e os arts. 72 e 74 da Lei 14.133/2021 oferecem subsídios para a comprovação da inviabilidade de competição, mostrando que o objeto a ser contratado possui características singulares ou que o profissional requerido possui um conhecimento técnico e/ou especializado que o torna único para atender às demandas específicas do órgão contratante.

Diante da necessidade do objeto deste estudo, foi realizado o levantamento de mercado no intuito de prospectar e analisar soluções para a pretensa contratação, que atendam aos critérios de vantajosidade para a Administração, sob os aspectos da conveniência, economicidade e eficiência. Assim, em pesquisa sobre o panorama do mercado, observou se que, em matéria de soluções para a prestação de serviços técnicos relativos à consultoria e assessoria jurídica a Administração Pública em geral costuma adotar a contratação de empresa especializada na prestação de serviços advocatícios.

Isto porque, esta se mostra mais vantajosa para a Administração Pública, uma vez que a Estrutura Administrativa do Município conta com uma Procuradoria Jurídica, que embora composta por profissionais altamente capacitados, não possui jurista habilitado com especialidade na área da contratação em tela, que dada sua complexidade não constitui atividade corriqueira, aquela que pode ser executada com facilidade e por qualquer pessoa.`,
  },
  6: {
    title: '6. ESTIMATIVA DO VALOR DA CONTRATAÇÃO',
    content: `O fluxo de pagamento dos honorários advocatícios seguirá da seguinte forma:

a) Valores a serem recebidos na modalidade ad êxito, no percentual de 12% (doze por cento) de todo o proveito econômico obtido pelo município;
b) No caso de haver proveito econômico para o município, resultante da recuperação de valores em atraso, incidirá o mesmo índice de 12% (doze por cento), para valores efetivamente pagos em razão dos serviços ora contratados, que serão devidas também em caso de acordo judicial ou extrajudicial envolvendo a matéria objeto;
c) Em caso de pagamento de valores retroativos, tanto na esfera judicial quanto na administrativa, serão devidos honorários na razão de 12% sobre o montante auferido.

Os pagamentos somente serão realizados quando o Município Contratante receber os valores acima mencionados de forma definitiva, não havendo mais possibilidade de futuros questionamentos na esfera judicial ou administrativa.`,
  },
  7: {
    title: '7. DESCRIÇÃO DA SOLUÇÃO',
    content: `Contratação de serviços jurídicos especializados na propositura de demandas judiciais e/ou administrativas visando o estudo, levantamento, questionamento processual, redução das despesas correntes e incremento das receitas provenientes das cobranças realizadas indevidas em relação aos seguintes objetos: a) **auditoria e consultoria energética** consistente no levantamento de dados, preparação, encaminhamento e acompanhamento da recuperação financeira dos valores pagos ou cobrados indevidamente pela concessionária/distribuidora de energia elétrica e recuperação ICMS; b) **folha de pagamento/contribuição patronal**, identificação de recolhimentos a maior referentes às contribuições previdenciárias; c) **Imposto de Renda** Retido na Fonte incidente sobre fornecimento de bens ou prestação de serviços em geral; d) À recuperação de créditos do Imposto Sobre Serviços de Qualquer Natureza **(ISSQN);** e) Recuperação dos valores repassados à menor pela União Federal a título de **FUNDEF** e **FUNDEB;** f) o reconhecimento, a implementação e a manutenção do pagamento de compensação financeira exploração de recursos minerais **– CFEM,** seja na condição de produtor, afetado e/ou limítrofe.

Opta-se pela contratação da pessoa jurídica CAVALCANTE REIS SOCIEDADE DE ADVOGADOS, sociedade de advocacia inscrita no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS, QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71.630-065, (61) 3248-4524, endereço eletrônico: advocacia@cavalcantereis.adv.br.

A contratação é fundamentada pela especialização e experiência do escritório em causas relacionadas às cobranças realizadas indevidas nas contas de energia elétrica pela Concessionária em relação às cargas instaladas. A complexidade da demanda exige uma atuação técnica especializada, o que justifica a escolha deste escritório.

A contratação se dá por inexigibilidade de licitação, conforme previsto pelo art. 74 da Lei nº 14.133/21, devido à singularidade dos serviços prestados e à comprovada capacidade técnica do escritório para lidar com causas dessa natureza, como detalhado no §4º do art. 23 da mesma lei. Conforme se evidencia no caso em análise, a escolha da contratação de serviços técnicos baseia-se por esta ser a única forma de contratar profissional especializado.`,
  },
  8: {
    title: '8. JUSTIFICATIVA PARA O NÃO PARCELAMENTO DA SOLUÇÃO',
    content: `Não se aplica ao objeto em questão uma vez que não se trata de algo de caráter divisível e competitivo, portanto, não é técnica e economicamente viável.

No entanto, o serviço que a empresa contratada prestará será em regime mensal, possibilitando, dessa forma, a análise constante do serviço prestado, e permitindo que o município tenha um melhor controle financeiro, sem comprometer o seu fluxo financeiro e obrigações.`,
  },
  9: {
    title: '9. OBJETIVOS',
    content: `Objetiva-se, com a contratação, a melhoria da arrecadação municipal através da propositura de demandas judiciais e/ou administrativas com o objetivo de recuperar e incrementar novas receitas pagas indevidamente ou a maior pela municipalidade.

Neste sentido, com o incremento dos Cofres, decorrentes da prestação eventualmente exitosa, políticas públicas poderão ser fomentadas e implementadas, de forma a trazer benefício de ordem concreta à população local.`,
  },
  10: {
    title: '10. PROVIDÊNCIAS A SEREM TOMADAS',
    content: `Em relação ao impacto na equipe da área demandante informa-se que será designado servidor para atuar na fiscalização do contrato.`,
  },
  11: {
    title: '11. CONTRATAÇÕES CORRELATAS',
    content: `Não se verifica contratações correlatas ou interdependentes para a viabilidade e contratação deste objeto.`,
  },
  12: {
    title: '12. DECLARAÇÃO DE VIABILIDADE',
    content: `Esta equipe de planejamento declara viável esta contratação.

Em complemento, os requisitos listados atendem adequadamente às demandas formuladas, os custos previstos são compatíveis e os riscos identificados são administráveis, pelo que RECOMENDAMOS o prosseguimento da pretensão contratual.`,
  },
};

// ========== TABELA DO TÓPICO 4 ==========
const TABELA_TOPICO4 = [
  {
    item: 1,
    descricao: 'Folha de pagamento, recuperação de verbas indenizatórias e contribuições previdenciárias - INSS – Instituto Nacional de Serviço Social (Regime Geral Res. 754 da RFB e Tema 163 do STF) – SAT/RAT\n\nRecuperação/Compensação de Imposto de Renda',
    cabimento: 'A perspectiva de incremento/recuperação é de aproximadamente o valor referente a até duas folhas de pagamento mensais – Valores poderão ser utilizados para pagar parcelamentos vigentes\n\n1006745-22.2025.4.01.3400',
  },
  { item: 2, descricao: 'FUNDEB', cabimento: 'Cabível' },
  {
    item: 3,
    descricao: 'FUNDEF - Possível atuação no feito para agilizar a tramitação, a fim de efetivar o incremento financeiro, com a consequente expedição do precatório.',
    cabimento: '0020459-93.2007.4.01.3304 e 1019002-18.2021.4.01.3304',
  },
  { item: 4, descricao: 'Auditoria e Consultoria do pagamento de Energia Elétrica – Recuperação do ICMS', cabimento: 'Cabível' },
  {
    item: 5,
    descricao: 'Recuperação de Créditos de ISSQN',
    cabimento: 'O valor total será dimensionado após a auditoria, pois este é uma das etapas do trabalho contratado',
  },
  {
    item: 6,
    descricao: 'Compensação financeira pela exploração de recursos minerais – CFEM',
    cabimento: 'O valor total será dimensionado após a auditoria, pois este é uma das etapas do trabalho contratado',
  },
];

// ========== CONTEÚDO DIVIDIDO POR PÁGINA ==========
// Tópico 2 — Parte A (§ 1-3): vai junto com o Tópico 1 na página 1
const TOPIC_2A = `A solicitação de contratação dos serviços justifica-se pela necessidade de melhorar a arrecadação municipal através da propositura de demandas judiciais e/ou administrativas com o objetivo de recuperar e incrementar novas receitas pagas indevidamente ou a maior pela municipalidade.

Isto é, há valores que deveriam retornar aos cofres públicos em razão da incidência de legislação posterior ou advindas de decisão judicial, que poderão auxiliar financeiramente o município e que devem ser buscadas pela via judicial ou administrativa.

Registre-se que a instituição não possui servidores efetivos ou comissionados nomeados ou designados cujas atribuições encontrem parâmetro na execução das atividades pretendidas.`;

// Tópico 2 — Parte B (§ 4-10): página 2
const TOPIC_2B = `Tal ato denota a singularidade dos serviços prestados, bem como a necessidade de profissionais especializados, assim sendo, tornando-se inviável escolher o melhor profissional, para prestar serviço de natureza intelectual, por meio de licitação, pois tal mensuração se funda em critérios objetivos.

No caso concreto a equipe técnica é composta por advogados especializados em conhecimentos jurídicos da contratação em tela, o que induz amplos conhecimentos individuais e coletivos da empresa na área do objeto da contratação, conforme proposta de intenção de contratação apresentada pelo escritório.

Assim sendo, considerando que para lograr êxito no desempenho do trabalho, deverá restar demonstrada capacidade técnica e ampla experiência acerca da matéria jurídica envolvida.

Sob outro prisma, vale destacar que a Estrutura Administrativa do Município conta com uma Procuradoria Jurídica, que embora composta por profissionais altamente capacitados, não possui jurista habilitado com especialidade na área da contratação em tela, que dada sua complexidade não constitui atividade corriqueira, aquela que pode ser executada com facilidade e por qualquer pessoa.

Assim, observa-se que os procuradores nomeados desempenham papel de relevante importância, nas suas áreas de especialização/atuação e no que tange a generalidade das atividades desenvolvidas rotineiramente no âmbito do Poder Executivo. Ocorre que, consoante fundamentado alhures, o Poder Executivo enfrenta no seu dia-a-dia atividades de natureza altamente complexa, assim como necessita de profissionais experientes com soluções adequadas aos casos concretos, sobretudo, no acompanhamento e ajuizamento de ações em favor da municipalidade, cuja área de conhecimento não seja dominada pelos profissionais que já compõem o quadro da Procuradoria Jurídica.

Portanto, o objeto apresentado se justifica por inexigibilidade de licitação, levando-se em conta a especialidade dos serviços e singularidade dos mesmos, bem como, a pessoalidade e confiança do profissional a realizar os serviços, em concordância com o art. 74, III, alíneas "c" e "e", da Lei Federal n.º 14.133/21.

O que se propõe, portanto, é a contratação de serviços técnicos relativos à assessoria e consultoria jurídica, com notória especialidade e vasta experiência, a fim de melhor atender as necessidades e resguardar o interesse público.`;

// Tópico 3 — Parte A (§ 1-6): página 3
const TOPIC_3A = `A contratação se dará por inexigibilidade por se tratar de contratação de serviço técnico especializado de natureza predominantemente intelectual, de acordo os termos do art. 74, inciso III, da Lei 14.133 de 1º de abril de 2021.

A inexigibilidade de licitações demonstra ser a modalidade adequada para contratação de serviços técnicos especializados pela Administração Direta com previsão legal no art. 74, inciso III, alínea "c" e "e", da Lei n.º 14.133/21:

Art. 74. É inexigível a licitação quando inviável a competição, em especial nos casos de:
III - contratação dos seguintes serviços técnicos especializados de natureza predominantemente intelectual com profissionais ou empresas de notória especialização, vedada a inexigibilidade para serviços de publicidade e divulgação:
c) assessorias ou consultorias técnicas e auditorias financeiras ou tributárias;
e) patrocínio ou defesa de causas judiciais ou administrativas;

A nova lei vislumbra elucidar o aspecto objetivo da contratação, definindo que os serviços advocatícios e contábeis, quando executados por profissionais notórios e especializados, são presumidamente singulares, trazendo segurança jurídica para as contratações diretas por inexigibilidade de licitação.

Em suma: a singularidade é relevante e um serviço deve ser havido como singular quando nele tem de interferir, como requisito de satisfatório entendimento da necessidade administrativa, um componente criativo de seu autor, envolvendo o estilo, o traço, a engenhosidade, a especial habilidade, a contribuição intelectual, artística, ou a argúcia de quem o executa, atributos, estes, que são precisamente os que a Administração reputa convenientes e necessita para a satisfação do interesse público em causa.

O art. 25, inciso II, da Lei 8.666/1993 (revogada), substituída pela lei n.º 14.133, art. 74, III, apresenta a impossibilidade de estabelecer critérios de julgamento suficientes para julgar o profissional ou empresa especialista, considerando as variadas formas da execução dos serviços que impactam na entrega do objeto, torna-se determinante para o gestor público o exercício da discricionariedade para escolha da melhor solução encontrada no mercado, com o fulcro de garantir o alcance satisfatório da contratação.`;

// Tópico 3 — Parte B (§ 7-10): página 4 (junto com Tópico 4)
const TOPIC_3B = `Os serviços a serem contratados, por sua essencialidade, são prestados de forma permanente e continua sendo apresentado relatórios mensais quanto a atuação e atendimento as demandas que ocorrem. Analisadas contratações semelhantes em outros órgãos e entidades públicas recentemente com o mesmo escopo, após análise, verificou-se que o modelo adotado é o que mais se adequa às necessidades da Administração.

O prazo do contrato será de 01 (um) ano, podendo ser prorrogável por igual período.

A empresa deverá apresentar:

i) Atestado(s) de aptidão do desempenho da atividade, o qual comprove que tenha prestado, de forma satisfatória, serviços compatíveis com o objeto constante da contratação, fornecidos por pessoas jurídicas de direito público ou privado;
ii) A empresa deverá apresentar aptidão para o desempenho de suas atividades pertinente e compatível em característica, quantidade e prazos com objeto da contratação, através da apresentação de seus atestados de capacidade técnica onde fique demonstrado sua experiência;
iii) A Contratada deverá ter registro ou inscrição da na entidade profissional da Ordem dos Advogados do Brasil - OAB, em plena validade.`;

// Tópico 7 — Parte A (§ 1): página 6, junto com Tópico 6
const TOPIC_7A = `Contratação de serviços jurídicos especializados na propositura de demandas judiciais e/ou administrativas visando o estudo, levantamento, questionamento processual, redução das despesas correntes e incremento das receitas provenientes das cobranças realizadas indevidas em relação aos seguintes objetos: a) **auditoria e consultoria energética** consistente no levantamento de dados, preparação, encaminhamento e acompanhamento da recuperação financeira dos valores pagos ou cobrados indevidamente pela concessionária/distribuidora de energia elétrica e recuperação ICMS; b) **folha de pagamento/contribuição patronal**, identificação de recolhimentos a maior referentes às contribuições previdenciárias; c) **Imposto de Renda** Retido na Fonte incidente sobre fornecimento de bens ou prestação de serviços em geral; d) À recuperação de créditos do Imposto Sobre Serviços de Qualquer Natureza **(ISSQN);** e) Recuperação dos valores repassados à menor pela União Federal a título de **FUNDEF** e **FUNDEB;** f) o reconhecimento, a implementação e a manutenção do pagamento de compensação financeira exploração de recursos minerais **– CFEM,** seja na condição de produtor, afetado e/ou limítrofe.`;

// Tópico 7 — Parte B (§ 2-4): página 7, junto com Tópico 8
const TOPIC_7B = `Opta-se pela contratação da pessoa jurídica CAVALCANTE REIS SOCIEDADE DE ADVOGADOS, sociedade de advocacia inscrita no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS, QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71.630-065, (61) 3248-4524, endereço eletrônico: advocacia@cavalcantereis.adv.br.

A contratação é fundamentada pela especialização e experiência do escritório em causas relacionadas às cobranças realizadas indevidas nas contas de energia elétrica pela Concessionária em relação às cargas instaladas. A complexidade da demanda exige uma atuação técnica especializada, o que justifica a escolha deste escritório.

A contratação se dá por inexigibilidade de licitação, conforme previsto pelo art. 74 da Lei nº 14.133/21, devido à singularidade dos serviços prestados e à comprovada capacidade técnica do escritório para lidar com causas dessa natureza, como detalhado no §4º do art. 23 da mesma lei. Conforme se evidencia no caso em análise, a escolha da contratação de serviços técnicos baseia-se por esta ser a única forma de contratar profissional especializado.`;

// ========== ESTRUTURA DAS PÁGINAS ==========
type PageSegment =
  | { topicNum: number; full: true }
  | { topicNum: number; full: false; content: string; showTitle: boolean };

// Cada entrada = uma página. Cada segmento = um bloco de conteúdo dentro da página.
const PAGE_DEFINITIONS: PageSegment[][] = [
  // Pág 1: Tópico 1 completo + Tópico 2 parágrafos 1-3
  [
    { topicNum: 1, full: true },
    { topicNum: 2, full: false, content: TOPIC_2A, showTitle: true },
  ],
  // Pág 2: Tópico 2 parágrafos 4-10 (continuação)
  [
    { topicNum: 2, full: false, content: TOPIC_2B, showTitle: false },
  ],
  // Pág 3: Tópico 3 parágrafos 1-6
  [
    { topicNum: 3, full: false, content: TOPIC_3A, showTitle: true },
  ],
  // Pág 4: Tópico 3 parágrafos 7-10 + Tópico 4 (tabela)
  [
    { topicNum: 3, full: false, content: TOPIC_3B, showTitle: false },
    { topicNum: 4, full: true },
  ],
  // Pág 5: Tópico 5 completo
  [
    { topicNum: 5, full: true },
  ],
  // Pág 6: Tópico 6 completo + Tópico 7 parágrafo 1
  [
    { topicNum: 6, full: true },
    { topicNum: 7, full: false, content: TOPIC_7A, showTitle: true },
  ],
  // Pág 7: Tópico 7 parágrafos 2-4 + Tópico 8 completo
  [
    { topicNum: 7, full: false, content: TOPIC_7B, showTitle: false },
    { topicNum: 8, full: true },
  ],
  // Última pág: Tópicos 9-12 + assinatura + rodapé
  [
    { topicNum: 9, full: true },
    { topicNum: 10, full: true },
    { topicNum: 11, full: true },
    { topicNum: 12, full: true },
  ],
];

// ========== COMPONENTE PRINCIPAL ==========
export default function EstudoContratacao({ onBack, onLogout, onSave, documentId: initialDocumentId }: EstudoContratacaoProps) {
  const [formData, setFormData] = useState({
    municipio: 'BARROCAS/BA',
    processo: '000/2025',
    localAssinatura: 'Barrocas/BA',
    dia: '____',
    mes: '____________',
    ano: '2026',
  });

  const [topicosAtivos, setTopicosAtivos] = useState<Set<number>>(
    new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  );

  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(initialDocumentId || null);

  useEffect(() => {
    if (initialDocumentId) {
      estudosApi.getById(initialDocumentId).then(doc => {
        if (doc.formData) {
          const fd = doc.formData as any;
          setFormData(prev => ({
            ...prev,
            municipio: fd.municipio || prev.municipio,
            processo: fd.processo || prev.processo,
            localAssinatura: fd.localAssinatura || prev.localAssinatura,
            dia: fd.dia || prev.dia,
            mes: fd.mes || prev.mes,
            ano: fd.ano || prev.ano,
          }));
          if (fd.topicosAtivos && Array.isArray(fd.topicosAtivos)) {
            setTopicosAtivos(new Set(fd.topicosAtivos as number[]));
          }
        }
        setDocumentId(initialDocumentId);
      }).catch(err => console.error('Erro ao carregar estudo:', err));
    }
  }, [initialDocumentId]);

  const handleSaveEstudo = async () => {
    setIsSaving(true);
    try {
      const payload = {
        municipio: formData.municipio,
        formData: {
          ...formData,
          topicosAtivos: Array.from(topicosAtivos),
        } as Record<string, unknown>,
      };
      if (documentId) {
        await estudosApi.update(documentId, payload);
      } else {
        const created = await estudosApi.create(payload);
        setDocumentId(created.id || null);
      }
      toast.success('Estudo salvo com sucesso!');
      if (onSave) onSave();
    } catch (error) {
      console.error('Erro ao salvar estudo:', error);
      toast.error('Erro ao salvar estudo. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTopico = (num: number) => {
    const next = new Set(topicosAtivos);
    if (next.has(num)) next.delete(num);
    else next.add(num);
    setTopicosAtivos(next);
  };

  const topicosOrdenados = Array.from(topicosAtivos).sort((a, b) => a - b);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Monta o array de tópicos selecionados com título e texto
      const topicosParaEnviar = topicosOrdenados.map((num) => ({
        titulo: TOPICS[num].title,
        texto: TOPICS[num].content || '',
      }));

      await downloadEstudoContratacaoViaBackend({
        municipio: formData.municipio,
        processo: formData.processo,
        localAssinatura: formData.localAssinatura || formData.municipio,
        dia: formData.dia,
        mes: formData.mes,
        ano: formData.ano,
        topicos: topicosParaEnviar,
      });
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      toast.error('Erro ao gerar documento. Tente novamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  // ===== ESTILOS REUTILIZÁVEIS =====
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '13pt',
    fontWeight: 'bold',
    color: '#000',
    borderBottom: '1pt solid #000',
    paddingBottom: '8px',
    marginBottom: '15px',
    marginTop: '0',
    fontFamily: "'Garamond', serif",
  };

  const bodyTextStyle: React.CSSProperties = {
    textAlign: 'justify',
    fontSize: '13pt',
    lineHeight: '1.5',
    marginBottom: '0',
    marginTop: '0',
    color: '#000',
    fontFamily: "'Garamond', serif",
    whiteSpace: 'pre-line',
  };

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

  // ===== BLOCOS REUTILIZÁVEIS =====
  const LogoBarrocas = () => (
    <div style={{ textAlign: 'center', marginBottom: '14pt', flexShrink: 0 }}>
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
      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="left">
          <button onClick={onBack} className="btn secondary" style={{ padding: '8px 12px' }}>
            <ArrowLeft size={18} /> Voltar para Home
          </button>
          <h1>Estudo de Contratação</h1>
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

        {/* ===== PAINEL ESQUERDO: MENU DE TÓPICOS ===== */}
        <div style={{
          width: '210px',
          background: '#fff',
          borderRight: '1px solid #e5e5e5',
          overflowY: 'auto',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e5e5' }}>
            <p style={{
              fontSize: '10.5px',
              fontWeight: '700',
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: 0,
            }}>
              Tópicos
            </p>
          </div>

          {Array.from({ length: 12 }, (_, i) => i + 1).map(num => {
            const ativo = topicosAtivos.has(num);
            return (
              <button
                key={num}
                onClick={() => toggleTopico(num)}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  textAlign: 'left',
                  background: ativo ? '#f0f9f5' : 'transparent',
                  border: 'none',
                  borderLeft: ativo ? '3px solid #227056' : '3px solid transparent',
                  borderBottom: '1px solid #f0f0f0',
                  color: ativo ? '#227056' : '#555',
                  fontSize: '12.5px',
                  fontWeight: ativo ? '600' : '400',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  lineHeight: '1.35',
                  transition: 'all 0.12s',
                }}
              >
                <span style={{ flex: 1 }}>{TOPIC_LABELS[num]}</span>
                {ativo && (
                  <span style={{ color: '#227056', fontSize: '18px', flexShrink: 0, marginLeft: '6px' }}>›</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ===== SIDEBAR: CONFIGURAÇÕES ===== */}
        <aside className="sidebar" style={{ width: '260px', flexShrink: 0 }}>
          <div className="sidebar-header" style={{ marginBottom: '24px' }}>
            <Settings size={22} color="#227056" />
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#227056' }}>Personalizar</h2>
          </div>

          <div className="field">
            <label>Município</label>
            <input
              value={formData.municipio}
              onChange={e => setFormData({ ...formData, municipio: e.target.value })}
              style={{ borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>

          <div className="field">
            <label>Processo Administrativo</label>
            <input
              value={formData.processo}
              onChange={e => setFormData({ ...formData, processo: e.target.value })}
              style={{ borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>

          <div className="field">
            <label>Local de Assinatura</label>
            <input
              value={formData.localAssinatura}
              onChange={e => setFormData({ ...formData, localAssinatura: e.target.value })}
              style={{ borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>

          <div className="field">
            <label>Dia / Mês / Ano</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input
                placeholder="Dia"
                value={formData.dia}
                onChange={e => setFormData({ ...formData, dia: e.target.value })}
                style={{ width: '52px', borderRadius: '8px', border: '1px solid #ccc', padding: '10px 6px', fontSize: '13px' }}
              />
              <input
                placeholder="Mês"
                value={formData.mes}
                onChange={e => setFormData({ ...formData, mes: e.target.value })}
                style={{ flex: 1, borderRadius: '8px', border: '1px solid #ccc', padding: '10px 6px', fontSize: '13px' }}
              />
              <input
                placeholder="Ano"
                value={formData.ano}
                onChange={e => setFormData({ ...formData, ano: e.target.value })}
                style={{ width: '56px', borderRadius: '8px', border: '1px solid #ccc', padding: '10px 6px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div className="actions">
            <button
              onClick={() => setTopicosAtivos(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]))}
              className="btn secondary"
              style={{ width: '100%' }}
            >
              Selecionar Todos
            </button>
            <button
              onClick={() => setTopicosAtivos(new Set())}
              className="btn secondary"
              style={{ width: '100%' }}
            >
              Limpar Seleção
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="btn primary"
              style={{ width: '100%', marginTop: '8px' }}
            >
              <Download size={16} />
              {isDownloading ? 'Gerando...' : 'Baixar DOCX'}
            </button>
            <button
              onClick={handleSaveEstudo}
              disabled={isSaving}
              className="btn primary"
              style={{ width: '100%', marginTop: '8px' }}
            >
              <Save size={16} />
              {isSaving ? 'Salvando...' : 'Salvar Estudo'}
            </button>
          </div>
        </aside>

        {/* ===== ÁREA DE PREVIEW (VERDE + PÁGINAS A4) ===== */}
        <div className="content" style={{ flex: 1, overflowY: 'auto', padding: '40px 20px' }}>
          <p className="preview-title">Documento do Estudo</p>

          {topicosOrdenados.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginTop: '80px' }}>
              <p style={{ fontSize: '16px' }}>Nenhum tópico selecionado.</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>Clique nos tópicos ao lado para adicioná-los.</p>
            </div>
          ) : (() => {
            // Filtra páginas cujos segmentos têm ao menos um tópico ativo
            const paginasAtivas = PAGE_DEFINITIONS
              .map(pagina => pagina.filter(seg => topicosAtivos.has(seg.topicNum)))
              .filter(pagina => pagina.length > 0);

            const totalPaginas = paginasAtivas.length;
            let isFirst = true;

            const renderSegmento = (seg: PageSegment, idx: number, total: number) => {
              const marginBottom = idx < total - 1 ? '24px' : '0';

              // Tópico 4: renderização especial (tabela)
              if (seg.topicNum === 4 && seg.full) {
                return (
                  <div key="4" style={{ marginBottom }}>
                    <h2 style={sectionTitleStyle}>{TOPICS[4].title}</h2>
                    <p style={{ ...bodyTextStyle, marginBottom: '16px' }}>
                      A estimativa valor para a recuperação em favor do município será apurada após a contratação.
                    </p>
                    <table className="proposal-table" style={{ fontFamily: "'Garamond', serif", fontSize: '10pt' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '38px', textAlign: 'center' }}>ITEM</th>
                          <th>DESCRIÇÃO</th>
                          <th style={{ width: '42%' }}>CABIMENTO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TABELA_TOPICO4.map(row => (
                          <tr key={row.item}>
                            <td style={{ textAlign: 'center', verticalAlign: 'top' }}>{row.item}</td>
                            <td style={{ whiteSpace: 'pre-line', verticalAlign: 'top' }}>{row.descricao}</td>
                            <td style={{ whiteSpace: 'pre-line', verticalAlign: 'top' }}>{row.cabimento}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              // Tópico normal (completo ou parcial)
              const content = seg.full ? (TOPICS[seg.topicNum].content || '') : seg.content;
              const showTitle = seg.full || (!seg.full && seg.showTitle);

              return (
                <div key={`${seg.topicNum}-${idx}`} style={{ marginBottom }}>
                  {showTitle && <h2 style={sectionTitleStyle}>{TOPICS[seg.topicNum].title}</h2>}
                  <p style={bodyTextStyle}>{renderText(content)}</p>
                </div>
              );
            };

            return paginasAtivas.map((pagina, pageIdx) => {
              const isLastPage = pageIdx === totalPaginas - 1;
              const mostrarTitulo = isFirst;
              if (isFirst) isFirst = false;

              return (
                <div key={pageIdx} style={pageStyle}>
                  <LogoBarrocas />

                  {mostrarTitulo && (
                    <h1 style={{
                      fontSize: '14pt',
                      fontWeight: 'bold',
                      color: '#000',
                      textAlign: 'center',
                      marginBottom: '22px',
                      marginTop: '0',
                      fontFamily: "'Garamond', serif",
                      textDecoration: 'underline',
                      textTransform: 'uppercase',
                    }}>
                      Estudo de Viabilidade de Contratação
                    </h1>
                  )}

                  <div style={{ flex: 1 }}>
                    {pagina.map((seg, idx) => renderSegmento(seg, idx, pagina.length))}

                    {isLastPage && (
                      <div style={{ marginTop: '48px' }}>
                        <p style={{
                          textAlign: 'right',
                          fontSize: '13pt',
                          fontFamily: "'Garamond', serif",
                          color: '#000',
                          margin: '0 0 48px 0',
                        }}>
                          {formData.localAssinatura}, {formData.dia} de {formData.mes} de {formData.ano}.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <div style={{ textAlign: 'center', borderTop: '1pt solid #000', paddingTop: '8px', minWidth: '220px' }}>
                            <p style={{ fontWeight: 'bold', fontSize: '11pt', color: '#000', fontFamily: "'Garamond', serif", margin: '0' }}>
                              Equipe de Planejamento
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {isLastPage && (
                    <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #ccc' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '1cm',
                        fontSize: '9pt',
                        fontWeight: '500',
                        paddingTop: '8pt',
                        width: '100%',
                        textAlign: 'center',
                        color: '#000',
                        fontFamily: "'Garamond', serif",
                      }}>
                        <span>Rio de Janeiro - RJ</span>
                        <span>Brasília - DF</span>
                        <span>Manaus - AM</span>
                      </div>
                      <p style={{ fontSize: '8pt', color: '#aaa', marginTop: '4px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
                        WWW.CAVALCANTEREIS.ADV.BR
                      </p>
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      </main>
    </div>
  );
}
