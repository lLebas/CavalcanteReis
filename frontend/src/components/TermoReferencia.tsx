'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Settings, LogOut, Save } from 'lucide-react';
import { downloadTermoReferenciaViaBackend } from '@/lib/termoGenerator';
import { termosApi } from '@/lib/api';

interface TermoReferenciaProps {
  onBack: () => void;
  onLogout?: () => void;
  onSave?: () => void;
  documentId?: string | null;
}

// ========== LABELS DO PAINEL ESQUERDO ==========
const CLAUSE_LABELS: Record<number, string> = {
  1: '1. Do Objeto',
  2: '2. Da Justificativa',
  3: '3. Requisitos da Contratação',
  4: '4. Modelo de Gestão',
  5: '5. Do Valor e Dotação',
  6: '6. Revisão de Preços',
  7: '7. Da Vigência Contratual',
  8: '8. Obrigações',
  9: '9. Infrações e Sanções',
  10: '10. Da Rescisão Contratual',
  11: '11. Da Publicação',
  12: '12. Dos Casos Omissos',
  13: '13. Do Foro',
};

// ========== CONTEÚDO COMPLETO DAS CLÁUSULAS ==========
const CLAUSULAS = [
  {
    numero: 1,
    titulo: '1. DO OBJETO:',
    subitens: [
      { numero: '1.1', texto: 'É objeto do presente contrato o desenvolvimento de serviços advocatícios especializados de prestação de serviços de assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico e Financeiro, atuando perante o Ministério da Fazenda e os seus órgãos administrativos, em especial para alcançar o incremento de receitas, por meio do ajuizamento, acompanhamento e intervenções de terceiros em ações judiciais e/ou administrativas, perante o Supremo Tribunal Federal (STF), Superior Tribunal de Justiça (STJ), Tribunal de Contas da União (TCU), primeiro e segundo grau de jurisdição dos Tribunais de Justiça e Tribunais Regionais Federais competentes territorialmente, assim como os órgãos, autarquias, fundações e agências reguladoras da União, dos Estados e do Distrito Federal competentes.' },
      { numero: '1.2', texto: 'Os objetos contidos nas cláusulas do presente contrato terão os valores levantados após a disponibilização da documentação necessária para a efetivação do serviço, haja a vista a natureza concomitante do trabalho desenvolvido.' },
      { numero: '1.3', texto: 'Será procedida a contratação por meio de INEXIGIBILIDADE DE LICITAÇÃO, realizada com base no art. 74, inciso III, alínea "e", da Lei Federal n.º 14.133/21. A contratação será regida pela legislação acima referida e alterações posteriores, bem como pelos princípios gerais de Direito.' },
      { numero: '1.4', texto: 'A inexigibilidade decorre da impossibilidade de se fixar critérios objetivos de julgamento, conforme será esmiuçado no tópico subsequente.' },
    ],
  },
  {
    numero: 2,
    titulo: '2. DA JUSTIFICATIVA:',
    subitens: [
      { numero: '2.1', texto: 'É dever do Poder Público promover todas as ações necessárias para viabilização do cumprimento de suas obrigações institucionais, maximizando os benefícios à comunidade e em estrita observância aos princípios norteadores da administração pública, em especial os da eficiência e economicidade. Para isto, uma das vertentes fundamentais é a equalização das suas receitas, procurando reduzir ao máximo a evasão bem como os lapsos entre ocorrência, o recolhimento e sua efetiva aplicação.' },
      { numero: '2.2', texto: 'Há imposição legal no sentido que o Contratante não se pode manter inerte ante o seu mister de buscar recursos previdenciários – art. 7º da Lei n.º 9.796/1996 o que lhe impõe a otimização dos trabalhos desenvolvido, isso porque, o Decreto n.º 10.188/2019, que Regulamenta a Lei n.º 9.796/1999, estabeleceu no art. 12 a aplicação de prescrição quinquenal nos termos do disposto no Decreto n.º 20.910 de 6 de janeiro de 1932, na hipótese de inércia ou morosidade no cumprimento das obrigações estatutárias do contratante.' },
      { numero: '2.3', texto: 'Aliado a isso o princípio da eficiência impõe que a atividade administrativa seja exercida com presteza, perfeição e rendimento funcional, exigindo resultados positivos para o serviço público e satisfatório atendimento das necessidades da comunidade e de seus membros.' },
      { numero: '2.4', texto: 'Há em tramitação no Contratante processos que buscam cumprir os ditames da Lei n.º 9.796/1996, contudo a demanda reprimida frente ao quantitativo necessário de mão de obra empregada gera a perda de receita ante a prescrição quinquenal dita acima.' },
      { numero: '2.5', texto: 'Somado a tudo isso, a atual crise mundial diminuiu significativamente as atividades econômicas, forçando a isenção de impostos federais para estímulo da atividade econômica e a consequente redução na arrecadação das receitas repassadas pela União, aliada a redução da arrecadação com tributos estaduais que impactam diretamente aos entes federativos diminuindo os respectivos orçamentos e impossibilitam o aumento do quadro funcional.' },
      { numero: '2.6', texto: 'Temos então, como justificativa: (1) a determinação legal que o Instituto é obrigado a buscar valores pagos a maior ou indevidamente não repassados; (2) a necessidade do Instituto em buscar novos incrementos de receita em razão da redução significativa dos repasses, como via legal para a realização dos investimentos nos serviços básicos para a população local.' },
      { numero: '2.7', texto: 'Além disso, a Contração decorre do fato de que o Contratado dispõe de profissionais dotados de conhecimentos específicos que credenciem ao pleno exercício, cumprindo satisfatoriamente a necessidade de concretização dos serviços técnicos especializados objeto do presente. Dessa maneira, justifica-se a contratação direta, pois o processo licitatório jamais terá o condão de selecionar o profissional da área mais recomendável para os interesses deste Instituto.' },
      { numero: '2.8', texto: 'A notória especialização pode ser verificada por meio do vasto currículo com formação na área específica, ampla experiência e conhecimento da área pública, desempenho anterior, organização, técnica e resultados de serviços já prestados a outros entes municipais/institutos, sendo o trabalho essencial e, indiscutivelmente, o mais adequado à plena satisfação das necessidades desse Instituto.' },
      { numero: '2.9', texto: 'Em relação à estimativa de recuperação da receita os valores somente poderão ser apurados após a realização dos serviços a serem prestados em favor da municipalidade.' },
      { numero: '2.10', texto: 'Trata-se de uma importante iniciativa para aperfeiçoar a gestão fiscal e aumentar a arrecadação municipal. Assim, a prestação de serviços objeto do presente termo tem como escopo fazer levantamento de dados e informações, elaborar estudos e pesquisas técnicas.' },
      { numero: '2.11', texto: 'Há, pois, inerente singularidade do serviço, porquanto o objeto do contrato diz respeito à serviço que escape da rotina da entidade contratante e da própria estrutura de advocacia que o atende. Conforme evidenciado, a atividade a ser prestada envolve complexidades que tornam necessária a peculiar expertise. Portanto, examina-se que o objeto necessita de um profissional que foge aos padrões comuns do mercado.' },
      { numero: '2.12', texto: 'A precificação dos valores que embasam a futura contratação foi levantada a partir de propostas efetivadas pelo Contratado e contratos firmados com outros entes da federação com objetos semelhantes. Ressalta-se que os valores propostos de honorários correspondem ao valor estimado e que foi realizada a reserva de dotações orçamentárias para o correlato adimplemento, não havendo cláusulas contratuais que tragam incerteza quanto ao valor a ser empenhado, liquidado e pago por este Instituto.' },
      { numero: '2.13', texto: 'Ademais, a remuneração do Contratado ocorrerá tão somente baseada no montante efetivamente recuperado ou auferido com a prestação do serviço, após passadas as fases necessárias do processo para garantir que os valores de fato estejam depositados nas contas deste Instituto. Com fulcro na garantia de celeridade e transparência ao processo, apresenta no presente termo os fundamentos que evidenciam os valores a serem alçados pela administração.' },
      { numero: '2.14', texto: 'Desta maneira, fundamenta-se a razoabilidade dos valores a serem cobrados pelo Contratado, levando em consideração os demais contratos e conforme se depreende da Tabela Oficial de Honorários Advocatícios da OAB, demonstra-se neste termo a compatibilidade entre a proposta e o praticado pelo mercado.' },
      { numero: '2.15', texto: 'Diante do exposto faz-se necessária a contratação da empresa CAVALCANTE REIS SOCIEDADE DE ADVOGADOS, inscrita no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-4524, endereço eletrônico: advocacia@cavalcantereis.adv.br, que prestará o serviço com todo o seu corpo técnico.' },
    ],
  },
  {
    numero: 3,
    titulo: '3. REQUISITOS DA CONTRATAÇÃO.',
    subitens: [
      { numero: '3.1', texto: 'Os requisitos da contratação constam do item 4 do Estudo Técnico Preliminar, anexo a este Termo de Referência.' },
      { numero: '3.2', texto: 'Será exigida a garantia da contratação de que tratam os artigos 96 e seguintes da Lei n.º 14.133, de 2021, no percentual e condições descritas nas cláusulas do contrato ou outro instrumento hábil que o substitua.' },
      { numero: '3.3', texto: 'Em caso de opção pelo seguro-garantia, o particular deverá apresentá-la, no máximo, até a data de assinatura do contrato.' },
      { numero: '3.4', texto: 'Não há necessidade de realização de avaliação prévia do local de execução dos serviços.' },
    ],
  },
  {
    numero: 4,
    titulo: '4. MODELO DE GESTÃO DO CONTRATO.',
    subitens: [
      { numero: '4.1', texto: 'O contrato deverá ser executado fielmente pelas partes, de acordo com as cláusulas avençadas e as normas da Lei n.º 14.133/21 e cada parte responderá pelas consequências de sua inexecução total ou parcial.' },
      { numero: '4.2', texto: 'Em caso de impedimento, ordem de paralisação ou suspensão do contrato, o cronograma de execução será prorrogado automaticamente pelo tempo correspondente, anotadas tais circunstâncias mediante simples apostila/ofício.' },
      { numero: '4.3', texto: 'As comunicações entre o órgão ou entidade e a contratada devem ser realizadas por escrito sempre que o ato exigir tal formalidade, admitindo-se o uso de mensagem eletrônica para esse fim.' },
      { numero: '4.4', texto: 'O órgão ou entidade poderá convocar representante da empresa para adoção de providências que devam ser cumpridas de imediato.' },
      { numero: '4.5', texto: 'Após a assinatura do contrato ou instrumento equivalente, o órgão ou entidade poderá convocar o representante da empresa contratada para reunião inicial para apresentação do plano de fiscalização, que conterá informações acerca das obrigações contratuais, dos mecanismos de fiscalização, das estratégias para execução do objeto, do plano complementar de execução da contratada, quando houver, do método de aferição dos resultados e das sanções aplicáveis, dentre outros.' },
      { numero: '4.6', texto: 'A Contratada poderá designará formalmente o preposto da empresa, antes do início da prestação dos serviços, indicando no instrumento os poderes e deveres em relação à execução do objeto contratado.' },
      { numero: '4.7', texto: 'O Contratante poderá recusar, desde que justificadamente, a indicação ou a manutenção do preposto da empresa, hipótese em que a Contratada designará outro para o exercício da atividade.' },
      { numero: '4.8', texto: 'A execução do contrato deverá ser acompanhada e fiscalizada pelo(s) fiscal(is) do contrato, ou pelos respectivos substitutos (Lei n.º 14.133, de 2021, art. 117, caput).' },
      { numero: '4.9', texto: 'O fiscal técnico do contrato acompanhará a execução do contrato, para que sejam cumpridas todas as condições estabelecidas no contrato, de modo a assegurar os melhores resultados para a Administração. (Decreto n.º 11.246 de 2022, art. 22, VI).' },
      { numero: '4.10', texto: 'O gestor do contrato deverá enviar a documentação pertinente ao setor de contratos para a formalização dos procedimentos de liquidação e pagamento, no valor dimensionado pela fiscalização e gestão nos termos do contrato.' },
    ],
  },
  {
    numero: 5,
    titulo: '5. DO VALOR E DA DOTAÇÃO ORÇAMENTÁRIA E PAGAMENTO',
    subitens: [
      { numero: '5.1', texto: 'Os serviços serão recebidos no êxito de acordo a cada valor de repatriação inserida no cofre do Instituto Contratante, sendo pagos à CONTRATADA de acordo os recebíveis no prazo de 5 cinco dias, pelos administrativo do instituto responsável pelos pagamentos, mediante termos detalhados, quando verificado o cumprimento das exigências de caráter técnico e administrativo. (art. 140, inciso I, "a", da Lei n.º 14.133/21 e arts. 22, inciso X e 23, inciso X do Decreto n.º 11.246/22).' },
      { numero: '5.2', texto: 'O prazo da disposição acima será contado do recebimento de comunicação de cobrança oriunda do contratado com a comprovação da prestação dos serviços a que se referem a parcela a ser paga.' },
      { numero: '5.3', texto: 'Emitir Termo Detalhado para efeito de recebimento definitivo dos serviços prestados, com base nos relatórios e documentações apresentadas.' },
      { numero: '5.4', texto: 'Comunicar a empresa para que emita a Nota Fiscal ou Fatura, com o valor exato dimensionado pela fiscalização.' },
      { numero: '5.5', texto: 'Portanto, a contraprestação de serviços contratados o Contratante realizará o pagamento da seguinte forma:' },
      { numero: '5.6.1', texto: 'Honorários advocatícios ad êxito na ordem de R$ 0,20 (vinte centavos) para cada R$ 1,00 (um real) do montante referente a repatriação inserida no cofre do Contratante.' },
      { numero: '5.7', texto: 'As despesas decorrentes da presente contratação correrão à conta de recursos específicos consignados no orçamento destinado para o ano de 2025.' },
      { numero: '5.8', texto: 'A contratação será atendida pela seguinte dotação:\nGestão/Unidade: [...];\nFonte de Recursos: [...];\nPrograma de Trabalho: [...];\nElemento de Despesa: [...];\nPlano Interno: [...].' },
      { numero: '5.9', texto: 'A dotação relativa aos exercícios financeiros subsequentes será indicada após aprovação da Lei Orçamentária respectiva e liberação dos créditos correspondentes, mediante apostilamento.' },
      { numero: '5.10', texto: 'Entretanto, sendo um contrato AD EXITUM, acaso o incremento financeiro em favor deste Instituto supere o valor mencionado na cláusula que trata do valor do contrato, os desembolsos não poderão ser previstos por dotação orçamentária, posto que terão origem na REDUÇÃO DE DESPESAS/INCREMENTO DE RECEITAS, como consequência da prestação dos serviços.' },
    ],
  },
  {
    numero: 6,
    titulo: '6. REVISÃO DE PREÇOS',
    subitens: [
      { numero: '6.1', texto: 'Os preços são fixos e reajustáveis, somente após um período de um ano, será aplicado o INPC como índice de reajuste.' },
      { numero: '6.2', texto: 'Quando o preço contratado se tornar inferior ao praticados no mercado, e a contratada não puder cumprir com o compromisso inicialmente assumido, poderá mediante requerimento devidamente instruído, pedir revisão dos preços ou a rescisão do contrato.' },
      { numero: '6.3', texto: 'Os preços poderão ser revistos nas hipóteses de oscilação de preços, para mais ou para menos, devidamente comprovadas, em decorrência de situações previstas no art. 134 da Lei 14.133/21, mediante os procedimentos legais.' },
      { numero: '6.4', texto: 'A comprovação, para efeitos de revisão de preços, deverá ser feita por meio de documentação comprobatória da elevação dos preços inicialmente pactuados, mediante juntada a planilha de custos, alusiva à data da apresentação da proposta e do momento do pleito, sob pena de indeferimento do pedido.' },
      { numero: '6.5', texto: 'A Contratada deverá aceitar nas mesmas condições contratuais, os acréscimos ou supressões que se fizerem necessários, até 25% (vinte e cinco por cento) do contrato, em observância ao art. 125 da Lei nº 14.133/21 e alterações, sob pena das sanções cabíveis.' },
    ],
  },
  {
    numero: 7,
    titulo: '7. DA VIGÊNCIA CONTRATUAL',
    subitens: [
      { numero: '7.1', texto: 'O prazo de vigência do Contrato será de 12 (doze) meses, com início a partir da assinatura do contrato, podendo ser prorrogado conforme permissivo do art. 105 da Lei n.º 14.133/21.' },
      { numero: '7.2', texto: 'Nos casos de realização de restituições Financeiras e/ou Previdenciárias, o presente contrato terá vigência, a contar da data de assinatura, devendo ser prorrogado, caso a CONTRATADA não tenha terminado e/ou recuperado os créditos referentes aos serviços pactuados.' },
    ],
  },
  {
    numero: 8,
    titulo: '8. OBRIGAÇÕES',
    subitens: [
      { numero: '8.1', texto: 'Compete ao CONTRATANTE:' },
      { numero: '8.1.1', texto: 'Providenciar o pagamento à Contratada na apresentação da Nota Fiscal, devidamente atestada nos prazos e condições estabelecidas.' },
      { numero: '8.1.2', texto: 'Prorrogar o prazo de vigência do contrato, caso existam demandas pendentes.' },
      { numero: '8.1.3', texto: 'Disponibilizar todas as informações e documentos necessários à execução dos serviços contratados.' },
      { numero: '8.1.4', texto: 'Exercer, por seu representante, acompanhando e fiscalização sobre a execução dos serviços, providenciando as necessárias medidas para regularização de quaisquer irregularidades levantadas no cumprimento do contrato.' },
      { numero: '8.1.5', texto: 'Noticiar, formal e tempestivamente a contratada sobre multas, penalidades e quaisquer débitos de sua responsabilidade e sobre as irregularidades observadas no cumprimento deste contrato.' },
      { numero: '8.1.6', texto: 'Verificar a regularidade de recolhimento dos encargos sociais antes do pagamento.' },
      { numero: '8.1.7', texto: 'O Contratante se reserva o direito de suspender a prestação de serviços em desacordo com o pactuado entre a partes.' },
      { numero: '8.2', texto: 'Compete a CONTRATADA:' },
      { numero: '8.2.1', texto: 'Fornecer profissionais para a execução dos serviços com capacidade técnica compatível.' },
      { numero: '8.2.2', texto: 'Responsabilizar-se pela execução dos serviços descritos no memorial descritivo que integra o presente contrato.' },
      { numero: '8.2.3', texto: 'Notificar o Contratante, por escrito, as ocorrências que porventura possam prejudicar ou embaraçar o perfeito desempenho das atividades dos serviços contratados.' },
      { numero: '8.2.4', texto: 'Atender de forma imediata as solicitações de substituição da mão de obra qualificada, quando comprovadamente entendida inadequada para a prestação de serviços contratados.' },
      { numero: '8.2.5', texto: 'Orientar seus profissionais, quanto ao sigilo profissional que deverá ser mantido com relação às informações que venha a ter acesso.' },
      { numero: '8.2.6', texto: 'Manter, durante toda a execução do contrato, em compatibilidade com as obrigações assumidas, todas as condições de habilitação exigidas na contratação.' },
      { numero: '8.2.7', texto: 'Apresentar relatório da prestação de serviços.' },
      { numero: '8.2.8', texto: 'Responsabilizar-se pelas despesas de locomoção, refeições, translado e outras similares dos seus colaboradores.' },
      { numero: '8.2.9', texto: 'Comparecer sempre que solicitado, na data, local e horários agendados previamente pelo Contratante.' },
      { numero: '8.2.10', texto: 'Responsabilizar-se, com exclusividade, por quaisquer ônus, direitos e obrigações de cunho tributário, previdenciário, trabalhista ou secundário, decorrentes da execução do objeto do presente contrato.' },
      { numero: '8.2.11', texto: 'Manter-se, durante toda a execução do contrato, em compatibilidade com as obrigações assumidas.' },
    ],
  },
  {
    numero: 9,
    titulo: '9. DAS INFRAÇÕES E DAS SANÇÕES ADMINISTRATIVAS',
    subitens: [
      { numero: '9.1', texto: 'A inexecução total ou parcial do Contrato, ou o descumprimento de quaisquer dos deveres elencados no Contrato, sujeitará a CONTRATADA, garantida a prévia defesa, sem prejuízo da responsabilidade civil e criminal, às penalidades de:' },
      { numero: '9.1.2', texto: 'Advertência por faltas leves, assim entendidas como aquelas que não acarretarem prejuízos significativos ao objeto da contratação.' },
      { numero: '9.1.3', texto: 'Multa compensatória de até 2% (dois por cento) sobre o valor total da contratação.' },
      { numero: '9.1.4', texto: 'Suspensão de licitar e impedimento de contratar pelo prazo de até dois anos.' },
      { numero: '9.1.5', texto: 'Declaração de inidoneidade para licitar ou contratar com a Administração Pública enquanto perdurarem os motivos determinantes da punição ou até que seja promovida a reabilitação perante a própria autoridade que aplicou a penalidade, que será concedida sempre que a CONTRATADA ressarcir a Administração pelos prejuízos resultantes e após decorrido o prazo da penalidade de suspensão do subitem anterior.' },
    ],
  },
  {
    numero: 10,
    titulo: '10. DA RESCISÃO CONTRATUAL',
    subitens: [
      { numero: '10.1', texto: 'Serão motivos para a rescisão do Contrato, nos termos do art. 137 da Lei n.° 14.133/21:' },
      { numero: '10.1.1', texto: 'O cumprimento irregular de cláusulas contratuais, especificações, projetos e prazos.' },
      { numero: '10.1.2', texto: 'A lentidão do seu cumprimento, levando a Administração a comprovar a impossibilidade da conclusão do serviço, nos prazos estipulados.' },
      { numero: '10.1.3', texto: 'O atraso injustificado no início do serviço.' },
      { numero: '10.1.4', texto: 'A paralisação do serviço, sem justa causa e prévia comunicação à Administração.' },
      { numero: '10.1.5', texto: 'O desatendimento às determinações regulares da autoridade designada para acompanhar e fiscalizar a sua execução, assim como as de seus superiores.' },
      { numero: '10.1.6', texto: 'O cometimento reiterado de faltas na sua execução, anotadas na forma do § 1º do art. 117 da Lei n.º 14.133/21.' },
      { numero: '10.1.7', texto: 'A decretação de falência, ou a instauração de insolvência civil.' },
      { numero: '10.1.8', texto: 'A dissolução da sociedade, ou falecimento do CONTRATADA.' },
      { numero: '10.1.9', texto: 'A alteração social ou a modificação da finalidade ou da estrutura do CONTRATADA, que prejudique a execução do Contrato.' },
      { numero: '10.1.10', texto: 'Razões de interesse público, de alta relevância e amplo conhecimento, justificadas e determinadas pela máxima autoridade da esfera administrativa.' },
      { numero: '10.1.11', texto: 'A supressão, por parte da Administração, de serviços, acarretando modificação do valor inicial do Contrato além do limite permitido no art. 125 da Lei nº 14.133/21.' },
      { numero: '10.1.12', texto: 'A suspensão de sua execução, por ordem escrita da Administração, por prazo superior a 120 (cento e vinte) dias, salvo em caso de calamidade pública, grave perturbação da ordem interna, guerra.' },
      { numero: '10.1.13', texto: 'O atraso superior a 90 (noventa) dias dos pagamentos devidos pela Administração, decorrentes de serviços, fornecimento, ou parcelas destes já recebidos ou executados, salvo em caso de calamidade pública, grave perturbação da ordem interna ou guerra.' },
      { numero: '10.1.14', texto: 'A não liberação, por parte da Administração, do objeto para execução do serviço, nos prazos contratuais.' },
      { numero: '10.1.15', texto: 'A ocorrência de caso fortuito ou de força maior, regularmente comprovada, impeditiva da execução do Contrato.' },
      { numero: '10.1.16', texto: 'O descumprimento do disposto no inciso IV do art. 62 da Lei n.º 14.133/21, sem prejuízo das sanções penais cabíveis.' },
      { numero: '10.1.17', texto: 'Os casos da rescisão contratual serão formalmente motivados nos autos, assegurado o contraditório e a ampla defesa.' },
      { numero: '10.2', texto: 'A rescisão do Contrato poderá ser:' },
      { numero: '10.2.1', texto: 'Determinada por ato unilateral e escrito da Administração, nos casos enumerados nos incisos I a XII, XVI e XVII desta cláusula.' },
      { numero: '10.2.2', texto: 'Amigável, por acordo entre as partes, reduzida a termo no processo, desde que haja conveniência para a Administração.' },
      { numero: '10.2.3', texto: 'Judicial, nos termos da legislação.' },
      { numero: '10.2.4', texto: 'A rescisão administrativa ou amigável deverá ser precedida de autorização escrita e fundamentada da autoridade competente.' },
    ],
  },
  {
    numero: 11,
    titulo: '11. DA PUBLICAÇÃO',
    subitens: [
      { numero: '11.1', texto: 'O contrato deverá ser publicado em veículo de divulgação oficial do contratante.' },
    ],
  },
  {
    numero: 12,
    titulo: '12. DOS CASOS OMISSOS',
    subitens: [
      { numero: '12.1', texto: 'Os casos omissos, assim como as dúvidas, serão resolvidos com base na Lei n.º 14.133/21, cujas normas ficam incorporadas ao presente instrumento, ainda que delas não se faça aqui menção expressa.' },
    ],
  },
  {
    numero: 13,
    titulo: '13. DO FORO',
    subitens: [
      { numero: '13.1', texto: 'Elege-se como Foro competente para o Contrato, o de Brasília/DF, para dirimir as dúvidas que porventura surjam e escapam aos termos do presente, dispensando-se qualquer outro, por especial e privilegiado que seja.' },
    ],
  },
];

// ========== GRUPOS DE PÁGINAS ==========
const PAGE_GROUPS = [
  [1],          // Página 1: Cláusula 1
  [2],          // Página 2: Cláusula 2 (longa)
  [3, 4],       // Página 3: Cláusulas 3 + 4
  [5],          // Página 4: Cláusula 5
  [6, 7],       // Página 5: Cláusulas 6 + 7
  [8],          // Página 6: Cláusula 8 (longa)
  [9, 10],      // Página 7: Cláusulas 9 + 10
  [11, 12, 13], // Página 8: Cláusulas 11 + 12 + 13 + Assinaturas
];

export default function TermoReferencia({ onBack, onLogout, onSave, documentId: initialDocumentId }: TermoReferenciaProps) {
  const [formData, setFormData] = useState({
    municipio: 'MUNICÍPIO DE BARROCAS',
    endereco: 'Av. ACM, 705 - Centro | Barrocas - BA, CEP 48705-000.',
    localAssinatura: 'BARROCAS/BA',
    processo: '000/2025',
    dia: '____',
    mes: '__________',
    ano: '2025',
    responsavel: 'XXXX',
    cargoResponsavel: 'Responsável pelo Termo de Referência',
    secretario: 'XXX',
    cargoSecretario: 'Secretário Municipal de Finanças',
  });

  const [clausulaAtiva, setClausulaAtiva] = useState<number>(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(initialDocumentId || null);

  useEffect(() => {
    if (initialDocumentId) {
      termosApi.getById(initialDocumentId).then(doc => {
        if (doc.formData) {
          setFormData(prev => ({ ...prev, ...(doc.formData as any) }));
        }
        setDocumentId(initialDocumentId);
      }).catch(err => console.error('Erro ao carregar termo:', err));
    }
  }, [initialDocumentId]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadTermoReferenciaViaBackend({
        municipio: formData.municipio,
        endereco: formData.endereco,
        localAssinatura: formData.localAssinatura,
        processo: formData.processo,
        dataFormatada: `${formData.dia} de ${formData.mes} de ${formData.ano}`,
        ano: formData.ano,
        responsavel: formData.responsavel,
        cargoResponsavel: formData.cargoResponsavel,
        secretario: formData.secretario,
        cargoSecretario: formData.cargoSecretario,
        clausulas: CLAUSULAS,
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
      if (documentId) {
        await termosApi.update(documentId, {
          municipio: formData.municipio,
          formData: formData as unknown as Record<string, unknown>,
        });
      } else {
        const created = await termosApi.create({
          municipio: formData.municipio,
          formData: formData as unknown as Record<string, unknown>,
        });
        setDocumentId(created.id || null);
      }
      alert('Termo salvo com sucesso!');
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
    padding: '10mm 25mm 25mm 25mm',
    margin: '0 auto 20px auto',
    boxShadow: '0 0 20px rgba(0,0,0,0.15)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  };

  const titleStyle: React.CSSProperties = {
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
    marginBottom: '6px',
  };

  const LogoBarrocas = () => (
    <div style={{ textAlign: 'center', marginBottom: '8pt', flexShrink: 0 }}>
      <img
        src="/barrocas.png"
        alt="Logo Barrocas"
        style={{ width: '220pt', height: 'auto', display: 'block', margin: '0 auto' }}
        crossOrigin="anonymous"
      />
    </div>
  );

  const renderSubitens = (subitens: { numero: string; texto: string }[]) =>
    subitens.map((sub) => (
      <p key={sub.numero} style={bodyTextStyle}>
        <strong>{sub.numero}</strong> {sub.texto}
      </p>
    ));

  return (
    <div className="app light">
      {/* HEADER */}
      <header className="header">
        <div className="left">
          <button onClick={onBack} className="btn secondary" style={{ padding: '8px 12px' }}>
            <ArrowLeft size={18} /> Voltar para Home
          </button>
          <h1>Termo de Referência</h1>
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

        {/* PAINEL ESQUERDO: CLÁUSULAS */}
        <div style={{
          width: '210px', background: '#fff', borderRight: '1px solid #e5e5e5',
          overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e5e5' }}>
            <p style={{ fontSize: '10.5px', fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Cláusulas
            </p>
          </div>
          {Array.from({ length: 13 }, (_, i) => i + 1).map(num => {
            const ativo = clausulaAtiva === num;
            return (
              <button
                key={num}
                onClick={() => setClausulaAtiva(num)}
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
                <span style={{ flex: 1 }}>{CLAUSE_LABELS[num]}</span>
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
            <label>Município (Contratante)</label>
            <input value={formData.municipio} onChange={e => setFormData({ ...formData, municipio: e.target.value })}
              style={{ borderRadius: '8px', border: '1px solid #ccc' }} />
          </div>

          <div className="field">
            <label>Endereço</label>
            <input value={formData.endereco} onChange={e => setFormData({ ...formData, endereco: e.target.value })}
              style={{ borderRadius: '8px', border: '1px solid #ccc' }} />
          </div>

          <div className="field">
            <label>Local/UF (assinatura)</label>
            <input value={formData.localAssinatura} onChange={e => setFormData({ ...formData, localAssinatura: e.target.value })}
              style={{ borderRadius: '8px', border: '1px solid #ccc' }} />
          </div>

          <div className="field">
            <label>Processo Administrativo</label>
            <input value={formData.processo} onChange={e => setFormData({ ...formData, processo: e.target.value })}
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
            <label>Responsável TR</label>
            <input value={formData.responsavel} onChange={e => setFormData({ ...formData, responsavel: e.target.value })}
              style={{ borderRadius: '8px', border: '1px solid #ccc' }} />
          </div>

          <div className="field">
            <label>Secretário</label>
            <input value={formData.secretario} onChange={e => setFormData({ ...formData, secretario: e.target.value })}
              style={{ borderRadius: '8px', border: '1px solid #ccc' }} />
          </div>

          <div className="actions" style={{ marginTop: '16px' }}>
            <button onClick={handleDownload} disabled={isDownloading} className="btn primary" style={{ width: '100%' }}>
              <Download size={16} />
              {isDownloading ? 'Gerando...' : 'Baixar DOCX'}
            </button>
            <button onClick={handleSave} disabled={isSaving} className="btn primary" style={{ width: '100%', marginTop: '8px' }}>
              <Save size={16} />
              {isSaving ? 'Salvando...' : 'Salvar Termo'}
            </button>
          </div>
        </aside>

        {/* ÁREA DE PREVIEW */}
        <div className="content" style={{ flex: 1, overflowY: 'auto', padding: '40px 20px' }}>
          <p className="preview-title">Documento do Termo de Referência</p>

          {PAGE_GROUPS.map((grupo, pageIndex) => {
            const isFirstPage = pageIndex === 0;
            const isLastPage = pageIndex === PAGE_GROUPS.length - 1;

            return (
              <div key={pageIndex} style={pageStyle} className="pdf-page-render">
                {/* Logo em cada página */}
                <LogoBarrocas />

                {/* Cabeçalho só na primeira página */}
                {isFirstPage && (
                  <>
                    {/* DADOS DO CONTRATANTE */}
                    <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                      <p style={{ fontFamily: "'Garamond', serif", fontSize: '12pt', fontWeight: 'normal', margin: '0 0 2px 0' }}>
                        DADOS DO CONTRATANTE:
                      </p>
                      <p style={{ fontFamily: "'Garamond', serif", fontSize: '12pt', fontWeight: 'normal', margin: '0 0 2px 0' }}>
                        {formData.municipio}
                      </p>
                      <p style={{ fontFamily: "'Garamond', serif", fontSize: '11pt', margin: '0 0 0 0' }}>
                        Endereço: {formData.endereco}
                      </p>
                    </div>
                    {/* TÍTULO */}
                    <h1 style={{
                      textAlign: 'center', fontSize: '13pt', fontWeight: 'bold',
                      textDecoration: 'underline', fontFamily: "'Garamond', serif",
                      marginBottom: '4px', marginTop: '10px',
                    }}>
                      TERMO DE REFERÊNCIA
                    </h1>
                    <p style={{ textAlign: 'center', fontSize: '12pt', fontFamily: "'Garamond', serif", marginBottom: '28px', fontWeight: 'normal', color: '#000' }}>
                      INEXIGIBILIDADE DE LICITAÇÃO
                    </p>
                  </>
                )}

                {/* Cláusulas da página */}
                {grupo.map(clausulaNum => {
                  const clausula = CLAUSULAS.find(c => c.numero === clausulaNum);
                  if (!clausula) return null;
                  return (
                    <div key={clausulaNum} style={{ marginBottom: '20px' }}>
                      <p style={titleStyle}>{clausula.titulo}</p>
                      {renderSubitens(clausula.subitens)}
                    </div>
                  );
                })}

                {/* Finalização apenas na última página */}
                {isLastPage && (
                  <div style={{ marginTop: 'auto', paddingTop: '30px' }}>
                    <p style={{ fontFamily: "'Garamond', serif", fontSize: '11pt', textAlign: 'justify', marginBottom: '8px', lineHeight: '1.5' }}>
                      E assim justos e contratados, as partes firmam o presente, em 03 (três) vias de igual teor e forma para o mesmo fim, juntamente com duas testemunhas civilmente capazes.
                    </p>
                    <p style={{ fontFamily: "'Garamond', serif", fontSize: '11pt', textAlign: 'left', marginBottom: '40px' }}>
                      {formData.localAssinatura}, {formData.dia} de {formData.mes} de {formData.ano}.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '300px', borderTop: '1px solid #000', margin: '0 auto', paddingTop: '6px' }}>
                          <p style={{ fontFamily: "'Garamond', serif", fontSize: '11pt', margin: '0', fontWeight: 'bold' }}>{formData.responsavel}</p>
                          <p style={{ fontFamily: "'Garamond', serif", fontSize: '9pt', margin: '0' }}>{formData.cargoResponsavel}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '300px', borderTop: '1px solid #000', margin: '0 auto', paddingTop: '6px' }}>
                          <p style={{ fontFamily: "'Garamond', serif", fontSize: '11pt', margin: '0', fontWeight: 'bold' }}>{formData.secretario}</p>
                          <p style={{ fontFamily: "'Garamond', serif", fontSize: '9pt', margin: '0' }}>{formData.cargoSecretario}</p>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: '32px', padding: '12px 16px', border: '1px solid #000' }}>
                      <p style={{ fontFamily: "'Garamond', serif", fontSize: '10pt', margin: '0 0 10px 0', fontStyle: 'italic' }}>
                        A P R O V O, o presente Termo de Referência, consoante o previsto no art. 7º da Lei Federal n.º 14.133/2021.
                      </p>
                      <p style={{ fontFamily: "'Garamond', serif", fontSize: '10pt', margin: '0', textAlign: 'right' }}>
                        Em _____/_____/_____
                      </p>
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
