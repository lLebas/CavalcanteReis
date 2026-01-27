'use client';

// ========== IMPORTS ==========
import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import DOMPurify from "dompurify";
import { Settings, FileText, ArrowLeft, LogOut, Download, RefreshCw, X, ChevronRight, Plus, Trash2 } from "lucide-react";
import { saveAs } from "file-saver";
// ========== IMPORTS: BIBLIOTECA DOCX ==========
import { Document, Packer, Paragraph, TextRun, ImageRun, Header, AlignmentType, PageBreak, Table, TableRow, TableCell, WidthType, HeadingLevel, SectionType } from "docx";
import { createSimpleParagraph } from "../lib/docxHelper"; // Helper para criação de parágrafos simples

// ========== CONSTANTES: ESTRUTURA COMPLETA DAS CLÁUSULAS ==========

// Objetos da Cláusula 1 e 2 (sem Recuperação de Imposto de Renda)
const clausula1Objects: Record<string, { nome: string; texto: string }> = {
  '1.1': { nome: '1.1', texto: 'À recuperação do Imposto de Renda incidente sobre as aquisições de bens e serviços pagos a maior ou indevidamente pelo Município;' },
  '1.2': { nome: '1.2', texto: 'À revisão dos parcelamentos previdenciários, com o objetivo de reduzir ou cancelar os montantes das prestações devidas pela municipalidade a partir da realização das compensações dos créditos dos quais o Município é credor perante a União Federal; O objeto inclui a recuperação dos valores pagos a título de RAT (risco ambiental do trabalho) e SAT (seguro de acidente do trabalho);' },
  '1.3': { nome: '1.3', texto: 'À prospecção, identificação e quantificação dos ativos ocultos decorrentes do recolhimento de incidência de contribuições previdenciárias indevidamente, a partir da proposição de ações judiciais para obter o reconhecimento do direito de recuperação administrativa dos valores pagos a maior pelo Município, bem como a análise da situação técnica do município, à luz da PEC 66, a fim de pedir a aplicação dos benefícios listados na emenda constitucional;' },
  '1.4': { nome: '1.4', texto: 'À auditoria e consultoria energética consistente no levantamento de dados, preparação, encaminhamento e acompanhamento da recuperação financeira dos valores pagos ou cobrados indevidamente pela concessionária/distribuidora de energia elétrica;' },
  '1.5': { nome: '1.5', texto: 'À recuperação de créditos do Imposto Sobre Serviços de Qualquer Natureza (ISSQN);' },
  '1.6': { nome: '1.6', texto: 'Ao reconhecimento, implementação e manutenção do pagamento da Compensação Financeira pela Exploração Mineral (CFEM), por meio do acompanhamento e propositura de medidas administrativas e judiciais cabíveis perante a Agência Nacional de Mineração;' },
  '1.7': { nome: '1.7', texto: 'Ao acompanhamento e intervenção para a defesa dos interesses do Município nas ações referentes aos valores do Fundo de Manutenção e Desenvolvimento do Ensino Fundamental e de Valorização do Magistério (FUNDEF) dos seguintes processos: 0020459-93.2007.4.01.3304, em trâmite perante a 1ª Vara Federal Cível e Criminal da SSJ de Feira de Santana-BA e 1019002-18.2021.4.01.3304, em trâmite perante a 1ª Vara Federal Cível e Criminal da SSJ de Feira de Santana-BA;' },
  '1.8': { nome: '1.8', texto: 'À revisão e recuperação dos valores repassados a menor pela União Federal ao Município a título do Fundo de Manutenção e Desenvolvimento da Educação Básica e de Valorização dos Profissionais da Educação (FUNDEB).' }
};

const clausula2Objects: Record<string, { nome: string; texto: string }> = {
  '2.1': { nome: '2.1', texto: 'Em relação ao Imposto de Renda, é objeto do presente contrato também o desenvolvimento de serviços de natureza jurídica com a realização de peticionamentos e diligências para defesa dos interesses do Município nos autos do seguinte processo: 1006745-22.2025.4.01.3400, atualmente na 8ª Vara Federal Cível da SJDF.' },
  '2.2': { nome: '2.2', texto: 'Em relação aos parcelamentos previdenciários, após a prospecção e identificação de créditos em favor do Município, serão propostas ações judiciais e administrativas com o intuito de utilizar os referidos valores para redução ou amortização total das mensalidades despendidas perante a União Federal.' },
  '2.3': { nome: '2.3', texto: 'No tocante à identificação dos ativos ocultos referentes aos créditos de contribuições previdenciarias não contabilizados, será confeccionado um laudo de auditoria para identificar, quantificar e atualizar todos os pagamentos indevidos feitos à União Federal/INSS calculados sobre as verbas dos últimos 60 (sessenta) meses. A partir dessa análise, será requerida a devolução administrativamente, com a concomitante proposição de mandados de segurança para obtenção de decisão judicial que respalde a compensação dos créditos apurados com as futuras contribuições mensais a serem realizadas pela municipalidade, bem como a análise da situação técnica do município, à luz da PEC 66, a fim de pedir a aplicação dos benefícios listados na emenda constitucional.' },
  '2.4': { nome: '2.4', texto: 'No que tange ao serviço de auditoria da energia elétrica, consiste na promoção de revisão de toda classificação dos lançamentos das cobranças nas faturas, a identificação de falhas na classificação tarifária, a apuração dos valores realmente devidos a título de consumo de energia elétrica, a recuperação de valores atinente aos indébitos identificados, estabelecimento de mecanismos de auditoria permanente para sanar ocorrências futuras e auditoria do lançamento e arrecadação da CIP/COSIP - Contribuição para Custeio da Iluminação Pública de forma a coibir a Distribuidora de lançamentos errados e consequentemente arrecadação e repasse com erro.' },
  '2.5': { nome: '2.5', texto: 'A recuperação de créditos do ISSQN (Imposto Sobre Serviços de Qualquer Natureza) para um município envolve identificar valores pagos indevidamente ou a maior, geralmente por erros de cálculo, alíquota ou base de cálculo. Após análise, o município pode restituir o valor ou compensá-lo em débitos futuros.' },
  '2.6': { nome: '2.6', texto: 'Quanto ao CFEM, é objeto do presente contrato o desenvolvimento de serviços advocatícios especializados com a prestação de serviços de assessoria técnica e jurídica por meio do acompanhamento e propositura de medidas administrativas e/ou judiciais cabíveis, visando o incremento de receitas à municipalidade, nas condições de produtor, afetados por estrutura e/ou limítrofes. É também objeto a prestação de serviços para recuperação de créditos da CFEM, identificando inconsistências na apuração, informação, recolhimento e demais atos acessórios de obrigatoriedade das mineradoras, inclusive dados do SPED que possam reduzir a base de cálculo da receita patrimonial, gerando redução no repasse, bem como visando à recuperação dos tributos municipais, como ISS, Alvará, taxas diversas, relacionadas à atividade minerária, inclusive ao VAF – Valor Adicional Fiscal (IVA).' },
  '2.7': { nome: '2.7', texto: 'Em relação ao FUNDEF, é objeto do presente contrato também o desenvolvimento de serviços de natureza jurídica com a realização de peticionamentos e diligências para defesa dos interesses do Município nos autos dos seguintes processos: 0020459-93.2007.4.01.3304, atualmente na 1ª Vara Federal Cível e Criminal da SSJ de Feira de Santana-BA, e 1019002-18.2021.4.01.3304, atualmente na 1ª Vara Federal Cível e Criminal da SSJ de Feira de Santana-BA.' },
  '2.8': { nome: '2.8', texto: 'Em relação ao FUNDEB, é possível (i) o ajuizamento de ação ordinária em desfavor da União Federal, com o intuito de demonstrar a defasagem dos repasses das diferenças ao FUNDEB em decorrência da inobservância ao piso fixado na legislação vigente, condenando-a ao pagamento da diferença do valor anual mínimo por aluno relativos aos últimos 60 (sessenta) meses, bem como (ii) a atuação em ações judiciais já propostas perante o Juízo Federal de 1º Grau, o respectivo Tribunal Regional Federal (2º Grau) e Tribunais Superiores, objetivando agilizar o trâmite processual e o recebimento dos valores.' }
};

// Estrutura completa das cláusulas 3-18
const allClauses: Record<string, { titulo: string; subitens: Record<string, string> }> = {
  '3': {
    titulo: 'CLÁUSULA 3ª - DOS REQUISITOS PARA A CONTRATAÇÃO DIRETA DE SERVIÇOS TÉCNICOS ESPECIALIZADOS.',
    subitens: {
      '3.1': 'A aquisição consubstanciada no presente contrato foi objeto de Inexigibilidade de licitação, nos termos do artigo 74, inciso III alíneas "c" e "f" da Lei n°. 14.133/21, conforme estipulações constantes, conforme processo administrativo em tela, o qual encarta todos os elementos e documentos comprobatórios, aos quais se vincula este contrato.',
      '3.2': 'Previsão Legal:\n\nA inexigibilidade de licitações para contratação de serviços técnicos especializados pela Administração Direta tem previsão legal no art. 74, inciso III, alíneas "c" e "f" da Lei n.º. 14.133/21:\n\nArt. 74. É inexigível a licitação quando inviável a competição, em especial nos casos de:\n\nIII – contratação dos seguintes serviços técnicos especializados de natureza predominantemente intelectual com profissionais ou empresas de notória especialização, vedada a inexigibilidade para serviços de publicidade e divulgação:\n\nc) assessorias ou consultorias técnicas e auditorias financeiras ou tributárias;\nf) treinamento e aperfeiçoamento de pessoal;\n\n§ 3º Para fins do disposto no inciso III do caput deste artigo, considera-se de notória especialização o profissional ou a empresa cujo conceito no campo de sua especialidade, decorrente de desempenho anterior, estudos, experiência, publicações, organização, aparelhamento, equipe técnica ou outros requisitos relacionados com suas atividades, permita inferir que o seu trabalho é essencial e reconhecidamente adequado à plena satisfação do objeto do contrato.\n\nA Lei n.º 14.039/2020 regulamentou sobre a natureza singular dos serviços profissionais contábeis:\n\nArt. 2º O art. 25 do Decreto-Lei nº 9.295, de 27 de maio de 1946, passa a vigorar acrescido dos seguintes §§ 1º e 2º:\n\n"Art. 25\n\n§ 1º Os serviços profissionais de contabilidade são, por sua natureza, técnicos e singulares, quando comprovada sua notória especialização, nos termos da lei.\n\n§ 2º Considera-se notória especialização o profissional ou a sociedade de profissionais de contabilidade cujo conceito no campo de sua especialidade, decorrente de desempenho anterior, estudos, experiências, publicações, organização, aparelhamento, equipe técnica ou de outros requisitos relacionados com suas atividades, permita inferir que o seu trabalho é essencial e indiscutivelmente o mais adequado à plena satisfação do objeto do contrato.\n\nA nova lei vislumbra elucidar o aspecto objetivo da contratação, definindo que os serviços advocatícios e contábeis, quando executados por profissionais notórios e especializados, são presumidamente singulares, trazendo segurança jurídica para as contratações diretas por inexigibilidade de licitação.\n\nO propósito do novo texto legal garante o tratamento devido às produções intelectuais, já consolidado na doutrina jurídica, como, por exemplo, Celso Antônio Bandeira de Mello, o qual defende que os serviços singulares estão presentes "sempre que o trabalho a ser produzido se defina pela marca pessoal (ou coletiva), expressada em características científicas, técnicas ou artísticas importantes para o preenchimento da necessidade administrativa a ser suprida, de maneira que os fatores singularizadores de um dado serviço apresentem realce para a satisfação da necessidade administrativa". - BANDEIRA DE MELLO, Celso Antônio. Curso de Direito Administrativo. 19. ed., São Paulo: Malheiros, 2005. p. 508\n\nAssim, diante de diversos profissionais portadores de especialização e reconhecimento para a efetiva execução do objeto pretendido pela Administração, a escolha, que é subjetiva, deve recair sobre aquele que, em razão do cumprimento dos elementos objetivos (desempenho anterior, estudos, experiências, publicações, organização, aparelhamento, equipe técnica), transmite à Administração a confiança de que o seu trabalho é o mais adequado.',
      '3.3': 'Subjetividade dos Critérios de Escolha – Singularidade dos Serviços:\n\nConforme demonstrado pelo Parecer Jurídico que acompanha o presente procedimento administrativo, os serviços elencados nos objetos do presente contrato não são rotineiros e requerem uma atuação por meio de um quadro com notória expertise para realizar a especialíssima tarefa objeto deste pacto.\n\nO art. 25, inciso II, da Lei 8.666/1993 (revogada), substituída pela Lei n.º 14.133, art. 74, III, apresenta a impossibilidade de estabelecer critérios de julgamento suficientes para julgar o profissional ou empresa especialista, considerando as variadas formas da execução dos serviços que impactam na entrega do objeto, torna-se determinante para o gestor público o exercício da discricionariedade para escolha da melhor solução encontrada no mercado, com o fulcro de garantir o alcance satisfatório da contratação.\n\nSão inúmeros os critérios subjetivos que impactam na escolha da presente CONTRATADA para a recuperação dos créditos referidos, dos quais podemos citar, de forma não exaustiva:\n\n· A ampla atuação administrativa e judicial demonstrada na documentação de habilitação anexa;\n· Aparelhamento, corpo técnico, metodologia de trabalho que impactam no prazo de levantamento e aproveitamento do crédito;\n· Confiança e reconhecimento no mercado da eficiência dos serviços;\n· Prazo de entrega de resultados;\n· A empresa especialista garante as operações de compensação.'
    }
  },
  '4': {
    titulo: 'CLÁUSULA 4ª - DO PREÇO.',
    subitens: {
      '4.1': 'Os serviços descritos nas cláusulas 1ª e 2ª do presente contrato serão remunerados com base no êxito obtido para cada parcela de benefício financeiro ou econômico produzido em favor do Município em uma proporção de R$ 0,20 (vinte centavos de real) para cada R$ 1,00 (um real).',
      '4.2': 'Nos casos de valores retroativos recuperados em favor da municipalidade, que consistem nos valores não repassados em favor do Contratante nos últimos 5 (cinco) anos (prescrição quinquenal) ou não abarcados pela prescrição, também serão devidos honorários advocatícios na ordem de R$ 0,20 (vinte centavos de real) para cada R$ 1,00 (um real) do montante recuperado aos Cofres Municipais.',
      '4.3': 'Eventuais créditos não processados pelo MPS/INSS devido Certificado de Regularidade Previdenciária (CRP) e/ou Certidão Negativa de Débito (CND) do Estado em condição irregular, ou em função de compensação com dívidas do Município perante a União Federal, incluindo as decorrentes da suspensão de pagamentos de compensações e parcelamentos, serão considerados como creditados para fins de faturamento e pagamento dos honorários na proporção de R$ 0,20 (vinte centavos de real) para cada R$ 1,00 (um real).',
      '4.4': 'O CONTRATANTE pagará ao CONTRATADO, pelos serviços descritos nas cláusulas 2.7 e 2.8 (ação judicial FUNDEF/FUNDEB), honorários advocatícios pela execução dos serviços de recuperação de créditos, ad exitum na proporção de R$ 0,20 (vinte centavos de real) para cada R$ 1,00 (um real) para cada um dos processos mencionados na referida cláusula, considerando como êxito a obtenção do incremento financeiro pleiteado nos processos aos cofres municipais, ou seja, com base nos valores que entrarem nos cofres do CONTRATANTE.',
      '4.5': 'No valor da remuneração estarão incluídos todos os custos operacionais, despesas de natureza tributária, fiscal, que incidirem sobre o objeto deste Contrato, e desenvolvimento das atividades descritas, excluindo-se eventuais custas e/ou emolumentos pela interposição de ações ou recursos judiciais.',
      '4.6': 'As memórias de cálculo e valores exatos somente poderão ser fixados no momento da conclusão dos serviços, quando já estiverem definidos os valores por decisão ou acordo judicial, bem como por decisão ou acordo na via administrativa, desde que não esteja mais sujeito a nenhum tipo de recurso ou questionamento, ou seja, que esteja fixado de forma definitiva.'
    }
  },
  '5': {
    titulo: 'CLÁUSULA 5ª - DO PAGAMENTO.',
    subitens: {
      '5.1': 'Os honorários de êxito deverão ser pagos proporcionalmente e na medida do recebimento dos valores, em até 03 (três) dias data de sua efetivação, após a prestação da nota fiscal realizada pela CONTRATADA.',
      '5.2': 'Para efeito de liquidação e pagamento, a CONTRATADA deverá apresentar os seguintes documentos:\n\na) Nota Fiscal devidamente atestada pelo executor do contrato;\nb) Certidão Negativa de Débitos Federais-CND/emitida pelo INSS – Instituto Nacional de Seguridade Social, devidamente atualizado (Lei n 0 8.212/90); Certidão Negativa de Débitos Estaduais;\nc) Certidão Negativa de Débitos Municipais;\nd) Certificado de Regularidade do Fundo de Garantia por Tempo de Serviço – FGTS, fornecido pela CEF – Caixa Econômica Federal, devidamente atualizado (Lei n.º 8.036/90);\ne) Prova de inexistência de débitos inadimplidos perante a Justiça do Trabalho, mediante a apresentação de certidão negativa (CNDT);',
      '5.3': 'Entende-se como êxito o proferimento de decisão judicial que autorize a realizar o aproveitamento do crédito do Imposto de Renda retido na fonte decorrente das notas fiscais sobre compras e serviços.',
      '5.4': 'É vedado o pagamento antecipado;',
      '5.5': 'Nenhum pagamento será efetuado à licitante vencedora enquanto pendente de liquidação, qualquer obrigação que lhe for imposta, em virtude de penalidade ou inadimplência, sem que isso gere direito ao pleito de reajustamento de preços ou correção monetária (quando for o caso);',
      '5.6': 'Havendo erro na apresentação da Nota Fiscal/Fatura, ou circunstância que impeça a liquidação da despesa, o pagamento ficará sobrestado até que a CONTRATADA providencie as medidas saneadoras. Nesta hipótese, o prazo para pagamento iniciar-se-á após a comprovação da regularização da situação, não acarretando qualquer ônus para a CONTRATANTE;',
      '5.7': 'Será considerada data do pagamento o dia em que constar como emitida a ordem bancária para pagamento.',
      '5.8': 'Antes de cada pagamento à CONTRATADA, será realizada verificação da manutenção das condições de habilitação exigidas.',
      '5.9': 'Os honorários advocatícios de sucumbência, os decorrentes de acordo judicial ou extrajudicial, bem como quaisquer outros valores de natureza honorária que venham a ser fixados em favor da parte representada pela CONTRATADA, pertencem exclusivamente à CONTRATADA, nos exatos termos do art. 23, caput e parágrafo único, da Lei federal nº 8.906/1994 (Estatuto da Advocacia e da OAB) e do art. 85, § 14º, do Código de Processo Civil.',
      '5.10': 'Fica permitido à CONTRATADA, a qualquer tempo, enquanto tramitarem as ações ou requerimentos na via judicial ou administrativa decorrentes do presente contrato, requerer diretamente nos autos o destaque e o levantamento dos honorários advocatícios que lhe pertencem de pleno direito, nos exatos termos do art. 22, § 4º, da Lei nº 8.906/1994, reconhecendo o CONTRATANTE, desde já, a legitimidade exclusiva da CONTRATADA para tanto.'
    }
  },
  '6': {
    titulo: 'CLÁUSULA 6ª - DAS OBRIGAÇÕES DA CONTRATADA.',
    subitens: {
      '6.1': 'Obriga-se a CONTRATADA à presteza na execução dos serviços solicitados na defesa dos interesses deste MUNICÍPIO DE BARROCAS/BA, sendo;\n\na) Elaboração das planilhas e cálculos de acordo com as legislações vigentes e licitáveis;\nb) Ingressar com a medida judicial cabível, se necessário, e acompanhar em todas as instâncias, até o trânsito em julgado;',
      '6.2': 'Para prestação dos serviços, a CONTRATADA deverá efetuar todas as intimações e/ou documentos necessários a serem enviados aos órgãos competentes a cada serviço, além dos procedimentos de auditoria contábil fiscal pertinentes ao serviço pactuado.',
      '6.3': 'Após o recebimento da receita ou do bem dado em garantia, dar entrada no caixa ou nos bens patrimoniais do município, o proponente deverá apresentar relatório descrevendo os serviços efetuados e, acostando as provas, justificar e efetivar a execução do serviço CONTRATADO.',
      '6.4': 'Executar os serviços conforme especificações no termo de referência para o perfeito cumprimento das obrigações assumidas;',
      '6.5': 'Em havendo cisão, incorporação ou fusão da proponente, CONTRATADA, a aceitação de qualquer uma dessas operações, como pressuposto para a continuidade do contrato, ficará condicionada à análise, por esta administração CONTRATANTE, do procedimento realizado e da documentação da nova empresa, considerando todas as normas aqui estabelecidas como parâmetros de aceitação, tendo em vista a eliminação dos riscos de insucesso na execução do objeto CONTRATADO;',
      '6.6': 'Para averiguação do disposto no item anterior, a empresa resultante de qualquer das operações comerciais ali descritas fica obrigada a apresentar, imediatamente, a documentação comprobatória de sua situação;',
      '6.7': 'Reparar, corrigir, remover ou substituir, às suas expensas, no total ou em parte, no prazo fixado pelo fiscal do contrato, os serviços efetuados em que se verificarem vícios, defeitos ou incorreções resultantes da execução ou dos SERVIÇOS PRESTADOS;',
      '6.8': 'Responsabilizar-se por todas as obrigações trabalhistas, sociais, previdenciárias, tributárias e as demais previstas na legislação específica, cuja inadimplência não transfere.',
      '6.9': 'Serão de exclusiva responsabilidade da CONTRATADA eventuais erros/equívocos no dimensionamento da proposta.'
    }
  },
  '7': {
    titulo: 'CLÁUSULA 7ª - DAS OBRIGAÇÕES DO CONTRATANTE:',
    subitens: {
      '7.1': 'Obriga–se o CONTRATANTE a fornecer toda a documentação necessária e demais provas de qualquer natureza, inclusive todas as informações que se fizerem imprescindíveis para o bom desenvolvimento dos serviços necessários à defesa de seus interesses, devendo entregar tais documentos com antecedência mínima de 20 (vinte) dias para a propositura da ação e 5 (cinco) dias em caso de audiência.',
      '7.2': 'Prover os meios e condições de livre acesso da CONTRATADA aos diversos órgãos e setores das diversas secretarias municipais, especialmente à Secretaria de Finanças/Fazenda;',
      '7.3': 'Pagar, pontualmente, a remuneração pactuada;',
      '7.4': 'Disponibilizar outros documentos quando solicitados pela CONTRATADA;',
      '7.5': 'Exercer o acompanhamento e a fiscalização dos serviços, por servidor ou comissão especialmente designada, anotando em registro próprio as falhas detectadas, indicando dia, mês e ano, bem como o nome dos empregados eventualmente envolvidos, encaminhando os apontamentos à autoridade competente para as providências cabíveis, na forma prevista na Lei n° 14.133/21.',
      '7.6': 'Notificar a CONTRATADA por escrito da ocorrência de eventuais imperfeições, falhas ou irregularidades constatadas no curso da execução dos serviços, fixando prazo para a sua correção, certificando-se de que as soluções por ela proposta sejam as mais adequadas;',
      '7.7': 'Pagar à CONTRATADA o valor resultante da prestação do serviço, conforme definido em contrato;',
      '7.8': 'Efetuar as retenções tributárias devidas sobre o valor da fatura de serviços da CONTRATADA;',
      '7.9': 'Fornecer por escrito as informações necessárias para o desenvolvimento dos serviços objeto do contrato;',
      '7.10': 'Cientificar o órgão de representação judicial do município para adoção das medidas cabíveis quando do descumprimento das obrigações pela CONTRATADA;',
      '7.11': 'Zelar pelo cumprimento das obrigações da CONTRATADA relativas à observância das normas ambientais vigentes;',
      '7.12': 'Proporcionar todas as condições para que a CONTRATADA possa desempenhar seus serviços de acordo com as determinações deste Termo de Referência.\n\na) Certidão conjunta relativa aos tributos federais e à Dívida Ativa da União – prova de regularidade relativa à Seguridade Social;\nb) Certidões que comprovem a regularidade perante a Fazenda Estadual ou sede da Contratada;\nc) Certidões que comprovem a regularidade perante a Fazenda Municipal do domicílio ou sede da Contratada\nd) Certidão de Regularidade do FGTS – CRF;\ne) Certidão Negativa de Débitos Trabalhistas – CNDT.'
    }
  },
  '8': {
    titulo: 'CLÁUSULA 8ª - DA VIGÊNCIA DO CONTRATO.',
    subitens: {
      '8.1': 'O prazo de vigência do Contrato será de 12 (doze) meses, com início a partir da assinatura do contrato, podendo ser prorrogado conforme permissivo do art. 105 da Lei n.º 14.133/21.',
      '8.2': 'Em caso de Compensações Financeiras e/ou Previdenciárias, o presente contrato terá vigência, a contar da data de assinatura, devendo ser prorrogado, caso a CONTRATADA não tenha terminado e/ou recuperado os créditos referentes aos serviços pactuados. Em outros termos, enquanto tramitarem as ações e requerimentos, seja na via judicial ou administrativa, o referido contrato permanecerá válido, autorizando o destaque de honorários a qualquer tempo (art. 22, § 4º, da Lei 8.906/1994).'
    }
  },
  '9': {
    titulo: 'CLÁUSULA 9ª - DOS ACRÉSCIMOS E DAS SUPRESSÕES.',
    subitens: {
      '9.1': 'A CONTRATADA se obriga a aceitar os acréscimos ou supressões até o limite de 25% (vinte e cinco por cento) do valor atualizado de cada item do contrato.'
    }
  },
  '10': {
    titulo: 'CLÁUSULA 10ª - DA DESPESA.',
    subitens: {
      '10.1': 'As despesas de viagem: combustíveis, hospedagem e alimentação serão pagas pela CONTRATADA, não havendo necessidade de previsão orçamentária, pois o serviço, uma vez recuperado, custeará a despesa gerada.'
    }
  },
  '11': {
    titulo: 'CLÁUSULA 11ª - DA FISCALIZAÇÃO.',
    subitens: {
      '11.1': 'Cabe ao CONTRATANTE, a seu critério e por meio de seus servidores ou de pessoas previamente designadas, exercer a fiscalização de todas as fases de execução do presente contrato, sem prejuízo das ressalvas contidas nas disposições legais e normativas que regem a advocacia, sendo obrigação da CONTRATADA fiscalizar seus empregados, parceiros e prepostos.',
      '11.2': 'A fiscalização ou acompanhamento da execução deste contrato será realizada pela administração municipal através do correspondente Fiscal de Contrato, o que não exclui e nem reduz a responsabilidade da CONTRATADA, nos termos da legislação referente às licitações e contratos administrativos.',
      '11.3': 'O Fiscal do presente contrato será formalmente designado pelo CONTRATANTE, competindo–lhe o acompanhamento e fiscalização do contrato, respondendo pelas ações e omissões que vierem sujeitar a Administração Pública à prejuízos e danos, diretos e indiretos.',
      '11.4': 'Dentre as atribuições do Fiscal do Contrato, entre outras decorrentes da função, destacam-se as seguintes:\n\na) Acompanhar e fiscalizar a execução dos contratos;\nb) Registrar nos autos do processo administrativo, quando observar irregularidades na execução do serviço, por meio de instrumento hábil (laudo de inspeção, relatórios de acompanhamento e recebimento, parecer técnico, memorando etc.), adotando as providências necessárias ao seu correto cumprimento em conformidade com os critérios de qualidade, rendimento, economicidade e eficiência, entre outros previstos no instrumento convocatório, contrato e/ou proposta;\nc) Acompanhar os prazos de vigência dos contratos, indicando a necessidade de prorrogações, acréscimos e supressões;\nd) Solicitar à CONTRATADA e aos órgãos competentes da administração municipal, tempestivamente, todas as informações, documentos ou providências necessárias à boa execução do contrato;\ne) Conferir se o serviço realizado atende integralmente à especificação contida no instrumento convocatório, contrato e/ou proposta, podendo, caso necessário, solicitar parecer técnico dos usuários dos serviços e dos setores competentes para a comprovação da regularidade do serviço executado;\nf) Proceder à verificação de todas as condições pré–estabelecidas pelos órgãos competentes da Administração Municipal, devendo rejeitar, no todo ou em parte, o fornecimento em desacordo com elas, documentando as ocorrências nos autos da contratação;\ng) Requerer aos órgãos competentes da Administração Municipal e ao Ordenador da Despesa que determine à CONTRATADA as providências para correção de eventuais falhas ou defeitos observados;\nh) Emitir, nos autos da contratação, laudo de inspeção, relatórios de acompanhamento e recebimento, parecer técnico, memorando etc., informando aos órgãos competentes da Administração Municipal e ao Ordenador da Despesa as ocorrências observadas na entrega do material e na execução do serviço;\ni) Solicitar aos setores competentes, quando não o fizer pessoalmente, que tomem as medidas necessárias à comunicação à Contratada para a promoção da reparação, correção, substituição ou a entrega imediata do objeto contratado, com a fixação de prazos, na tentativa de se evitar o processo administrativo punitivo,\nj) Nos casos de prorrogações, as solicitações devem ser expedidas em no máximo 30 (trinta) dias do término do contrato;\nk) Nos casos de acréscimos e supressões, as solicitações devem ser expedidas em, no máximo 30 (trinta) dias para a realização da alteração contratual;\nl) Verificar se o contrato firmado continua sendo necessário aos fins públicos, manifestando-se, imediatamente, em caso de desnecessidade; e\nm) Acompanhar os andamentos das solicitações de contratações.'
    }
  },
  '12': {
    titulo: 'CLÁUSULA 12ª - DAS SANÇÕES ADMINISTRATIVAS.',
    subitens: {
      '12.1': 'Além do direito ao ressarcimento por eventuais perdas e danos causados pela CONTRATADA, por descumprir compromissos contratuais definidos neste instrumento decorrentes de atos que, no exercício profissional, praticar com dolo ou culpa, poderão ser impostas as seguintes penalidades previstas na Lei n.º 14.133/21, quais sejam:\n\na) Advertência;\nb) Suspensão e impedimento do direito de licitar e contratar com a Administração Municipal CONTRATANTE;\nc) Declaração de inidoneidade para licitar e contratar no caso de reincidência em falta grave;\nd) Pagamento de multa de até 5% sobre o valor da parcela em atraso.\n\nParagrafo 1°- A penalidade consistente em multa pode ser aplicada, cumulativamente, com uma das demais sanções, observada a gravidade da infração.',
      '12.2': 'Antes da aplicação de qualquer sanção, será garantido à CONTRATADA o contraditório e a ampla defesa, em processo administrativo.',
      '12.3': 'Os valores das multas deverão ser recolhidos perante a Secretaria Municipal de Finanças, no prazo e forma estabelecidos pela CONTRATADA, sendo cobrados judicialmente caso ocorra sua inadimplência, após inscrição em dívida ativa, podendo o CONTRATANTE efetuar retenção junto aos créditos que, porventura, possua a CONTRATADA.',
      '12.4': 'A CONTRATADA não será punida e nem responde pelos prejuízos resultantes de caso fortuito ou força maior, ou quando provada a justa causa e impedimento, ou, ainda, quando não decorrem de atos que, no exercício profissional, praticar com dolo ou culpa.'
    }
  },
  '13': {
    titulo: 'CLÁUSULA 13ª - DA RESCISÃO.',
    subitens: {
      '13.1': 'A inexecução total ou parcial deste contrato por parte da CONTRATADA assegurará ao CONTRATANTE o direito de rescisão nos termos do art. 104, II, da Lei n.º 14.133/21, sempre mediante notificação, assegurado o contraditório e a ampla defesa.',
      '13.2': 'O CONTRATANTE rescindirá o contrato automaticamente e independentemente de aviso ou notificação judicial ou extrajudicial, nos seguintes casos: concordata, falência ou instalação de insolvência civil da CONTRATADA, ou de dissolução de sociedade.'
    }
  },
  '14': {
    titulo: 'CLÁUSULA 14ª - DO FORO.',
    subitens: {
      '14.1': 'O foro competente para dirimir e resolver qualquer questão relativa ao presente termo de contrato é o de Brasília/DF.'
    }
  },
  '15': {
    titulo: 'CLÁUSULA 15ª - DA PUBLICAÇÃO.',
    subitens: {
      '15.1': 'O CONTRATANTE providenciará a publicação de forma resumida deste Contrato no placar/quadro de avisos do MUNICÍPIO DE BARROCAS/BA, também a publicação do extrato na íntegra do diário oficial do MUNICÍPIO DE BARROCAS/BA e no portal da transparência, em obediência ao disposto no §1° do artigo 89 da Lei Federal nº. 14.133/21.'
    }
  },
  '16': {
    titulo: 'CLÁUSULA 16ª - DAS PRERROGATIVAS DA CONTRATANTE.',
    subitens: {
      '16.1': 'São prerrogativas do CONTRATANTE todas aquelas previstas nos artigos 104 e 124 da Lei Federal n.º 14.133/21, e em especial as seguintes.',
      '16.2': 'Promover, mantidas as mesmas condições contratuais, supressões ou acréscimos de até 25% (vinte e cinco por cento) do valor inicial atualizado do contrato.'
    }
  },
  '17': {
    titulo: 'CLÁUSULA 17ª - DA DOTAÇÃO ORÇAMENTÁRIA.',
    subitens: {
      '17.1': 'A contratação supracitada ocorrerá mediante a seguinte dotação orçamentária:',
      '17.2': 'Considerando que se trata de um contrato ad exitum cujos valores serão levantados no curso da execução do serviço, na hipótese de o incremento financeiro em favor deste Município superar o valor inicialmente estimado na dotação orçamentária, obriga-se o CONTRATANTE a realizar o apostilamento, nos termos do artigo 136, IV, da Lei n.º 14.133/2021, para readequação e consequente realização dos pagamentos efetivamente devidos.'
    }
  },
  '18': {
    titulo: 'CLÁUSULA 18ª - DA SUBCONTRATAÇÃO.',
    subitens: {
      '18.1': 'Somente será permitida a subcontratação do objeto deste contrato mediante a comprovação da qualidade técnica do substituto através de solicitação previamente aprovada pela administração.'
    }
  }
};

// Tabela 4.6 - Itens editáveis (invertido: agora a tabela vai com o 4.6)
const tabela45Items: Record<string, { descricao: string; cabimento: string }> = {
  '1': { descricao: 'Folha de pagamento, recuperação de verbas indenizatórias e contribuições previdenciárias.', cabimento: 'O valor estimado será apurado após a Contratação através de estudo técnico com base na documentação compartilhada pelo ente municipal.' },
  '2': { descricao: 'Recuperação/Compensação de Imposto de Renda', cabimento: 'Processo n.° 1006745-22.2025.4.01.3400, em trâmite perante a 8ª Vara Federal Cível da SJDF' },
  '3': { descricao: 'Auditoria e Consultoria do pagamento de Energia Elétrica – Recuperação do ICMS', cabimento: 'Cabível' },
  '4': { descricao: 'Recuperação de créditos do Imposto Sobre Serviços de Qualquer Natureza (ISSQN);', cabimento: 'O valor total será dimensionado após o estudo técnico, pois este é uma das etapas do trabalho contratado.' },
  '5': { descricao: 'FUNDEF - Possível atuação no feito para agilizar a tramitação, a fim de efetivar o incremento financeiro, com a consequente expedição do precatório.', cabimento: 'Processos n.º 0020459-93.2007.4.01.3304 e 1019002-18.2021.4.01.3304, ambos em trâmite perante a 1ª Vara Federal Cível e Criminal da SSJ de Feira de Santana-BA' },
  '6': { descricao: 'FUNDEB', cabimento: 'Cabível' },
  '7': { descricao: 'CFEM', cabimento: 'Cabível' }
};

// Texto fixo da capa
const FIXED_COVER_TEXT = `CONTRATO QUE ENTRE SI CELEBRAM O MUNICÍPIO DE BARROCAS/BA E, DE OUTRO LADO; O ESCRITÓRIO DE ADVOCACIA CAVALCANTE REIS ADVOGADOS, OBJETIVANDO O DESENVOLVIMENTO DE SERVIÇOS ADVOCATÍCIOS ESPECIALIZADOS DE PRESTAÇÃO DE SERVIÇOS DE ASSESSORIA TÉCNICA E JURÍDICA NAS ÁREAS DE DIREITO PÚBLICO, TRIBUTÁRIO, ECONÔMICO, FINANCEIRO, EM ESPECIAL PARA ALCANÇAR O INCREMENTO DE RECEITAS, DENTRE ELAS: REVISAR OS PARCELAMENTOS PREVIDENCIÁRIOS VISANDO A REDUÇÃO DO MONTANTE; PROSPECTAR E QUANTIFICAR ATIVOS OCULTOS DECORRENTES DO RECOLHIMENTO DE CONTRIBUIÇÕES PREVIDENCIÁRIAS A MAIOR; FOLHA DE PAGAMENTO, RECUPERAÇÃO DE VERBAS INDENIZATÓRIAS E CONTRIBUIÇÕES PREVIDENCIÁRIAS, AUDITORIA E CONSULTORIA DO PAGAMENTO DE ENERGIA ELÉTRICA; ICMS ENERGIA ELÉTRICA RECUPERAÇÃO DE CRÉDITOS DO IMPOSTO SOBRE SERVIÇOS DE QUALQUER NATUREZA (ISSQN); COMPENSAÇÃO FINANCEIRA PELA EXPLORAÇÃO MINERAL (CFEM); RAT-FAP, REVISÃO E RECUPERAÇÃO DOS VALORES REPASSADOS A MENOR PELA UNIÃO A TÍTULO DE FUNDEB E FUNDEF FICANDO RESPONSÁVEL PELO AJUIZAMENTO, ACOMPANHAMENTO E INTERVENÇÕES DE TERCEIRO EM AÇÕES JUDICIAIS E ADMINISTRATIVAS DE INTERESSE DO MUNICÍPIO.`;

// Texto padrão das partes
const DEFAULT_TEXT_PARTES = `Por este instrumento particular, de um lado, o MUNICÍPIO DE BARROCAS, pessoa jurídica de direito público, regularmente inscrito no CNPJ sob o n° 04.216.287/0001-42, com sede administrativa na Av. ACM, 705, Centro, CEP: 48.705-000, representado neste ato pelo Prefeito Municipal Sr. JOSÉ ALMIR ARAÚJO QUEIROZ, residente e domiciliado em Barrocas/BA, que pode ser encontrado no mesmo endereço acima colacionado, doravante denominado de "CONTRATANTE", e, de outro lado, CAVALCANTE REIS SOCIEDADE DE ADVOGADOS, sociedade de advocacia inscrita no CNPJ sob o n.º 26.632.686/0001-27, localizada na SHIS, QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71.630-065, (61) 3248-4524, endereço eletrônico: advocacia@cavalcantereis.adv.br, neste ato representada por seu sócio-diretor, IURI DO LAGO NOGUEIRA CAVALCANTE REIS, brasileiro, advogado, inscrito na OAB/DF sob o n.º 35.075, doravante denominada "CONTRATADA", pactuam o presente contrato em conformidade com o que dispõe a Lei de licitação e contratos n.º 14.133/21 e suas alterações, mediante as cláusulas e condições a seguir:`;

// Interface
interface MinutaGeneratorProps {
  onBackToHome: () => void;
  onLogout: () => void;
}

// ========== COMPONENTE: MENU DE CLÁUSULAS (ESQUERDA) ==========
const ClausesMenu = ({ selectedClause, onSelectClause }: any) => {
  return (
    <aside style={{
      width: '250px',
      background: 'white',
      borderRight: '1px solid #eee',
      padding: '20px',
      overflowY: 'auto',
      height: '100vh'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#227056' }}>
        Cláusulas
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'].map((num) => (
          <button
            key={num}
            onClick={() => onSelectClause(num)}
            style={{
              padding: '12px',
              textAlign: 'left',
              background: selectedClause === num ? '#f0f8f5' : 'transparent',
              border: `2px solid ${selectedClause === num ? '#227056' : '#eee'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              color: selectedClause === num ? '#227056' : '#333',
              fontWeight: selectedClause === num ? '600' : '400',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>Cláusula {num}ª</span>
            {selectedClause === num && <ChevronRight size={16} />}
          </button>
        ))}
      </div>
    </aside>
  );
};

// ========== COMPONENTE: MODAL TABELA 4.6 ==========
const ModalTabela45 = ({ open, onClose, tabelaItems, onUpdate }: any) => {
  // Se tabelaItems estiver vazio, usa os valores padrão
  const defaultItems = Object.keys(tabelaItems || {}).length === 0 ? tabela45Items : (tabelaItems || {});
  const [items, setItems] = useState<Record<string, { descricao: string; cabimento: string }>>(defaultItems);

  useEffect(() => {
    // Se tabelaItems estiver vazio, inicializa com valores padrão
    if (Object.keys(tabelaItems || {}).length === 0) {
      setItems(tabela45Items);
    } else {
      setItems(tabelaItems || {});
    }
  }, [tabelaItems]);

  const handleAddItem = () => {
    const nextNum = Object.keys(items).length > 0
      ? String(Math.max(...Object.keys(items).map(Number)) + 1)
      : '1';
    setItems({
      ...items,
      [nextNum]: { descricao: '', cabimento: '' }
    });
  };

  const handleRemoveItem = (itemNum: string) => {
    const newItems = { ...items };
    delete newItems[itemNum];
    setItems(newItems);
    onUpdate(newItems);
  };

  const handleSave = () => {
    onUpdate(items);
    onClose();
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#227056' }}>
            Tabela 4.6 - Memórias de Cálculo
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#999'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '12px', background: '#f0f8f5', borderRadius: '6px' }}>
          <p style={{ fontSize: '13pt', lineHeight: '1.6', color: '#333', margin: 0 }}>
            <strong>4.6-</strong> As memórias de cálculo e valores exatos somente poderão ser fixados no momento da conclusão dos serviços, quando já estiverem definidos os valores por decisão ou acordo judicial, bem como por decisão ou acordo na via administrativa, desde que não esteja mais sujeito a nenhum tipo de recurso ou questionamento, ou seja, que esteja fixado de forma definitiva.
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={handleAddItem}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#227056',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Plus size={18} />
            Adicionar Item
          </button>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden', marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', fontSize: '13pt', fontWeight: '600' }}>ITEM</th>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', fontSize: '13pt', fontWeight: '600' }}>DESCRIÇÃO</th>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', fontSize: '13pt', fontWeight: '600' }}>CABIMENTO</th>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', fontSize: '13pt', fontWeight: '600', width: '60px' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(items)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([itemNum, item]: [string, any]) => (
                  <tr key={itemNum}>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: '600' }}>
                      {itemNum}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <textarea
                        value={item.descricao || ''}
                        onChange={(e) => {
                          const newItems = { ...items };
                          newItems[itemNum] = { ...item, descricao: e.target.value };
                          setItems(newItems);
                        }}
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '6px',
                          fontSize: '12px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                        placeholder="Descrição do item"
                      />
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <textarea
                        value={item.cabimento || ''}
                        onChange={(e) => {
                          const newItems = { ...items };
                          newItems[itemNum] = { ...item, cabimento: e.target.value };
                          setItems(newItems);
                        }}
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '6px',
                          fontSize: '12px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                        placeholder="Cabimento (Editável)"
                      />
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleRemoveItem(itemNum)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Remover item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              {Object.keys(items).length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                    Nenhum item adicionado. Clique em &quot;Adicionar Item&quot; para começar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              background: '#227056',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== COMPONENTE: MODAL TABELA 17.1 ==========
const ModalTabela171 = ({ open, onClose, dotacaoItems, onUpdate }: any) => {
  const [items, setItems] = useState<Array<{
    dotacaoOrcamentaria: string;
    unidOrcamentaria: string;
    projetoAtividade: string;
    categoria: string;
    fonteRecurso: string;
  }>>(dotacaoItems || []);

  useEffect(() => {
    setItems(dotacaoItems || []);
  }, [dotacaoItems]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        dotacaoOrcamentaria: '',
        unidOrcamentaria: '',
        projetoAtividade: '',
        categoria: '',
        fonteRecurso: ''
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleUpdateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSave = () => {
    onUpdate(items);
    onClose();
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '900px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#227056' }}>
            Tabela 17.1 - Dotação Orçamentária
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#999'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={handleAddItem}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#227056',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Plus size={18} />
            Adicionar Linha
          </button>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden', marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th colSpan={2} style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', fontSize: '13pt', fontWeight: '600' }}>
                  DOTAÇÃO ORÇAMENTÁRIA
                </th>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', fontSize: '13pt', fontWeight: '600', width: '60px' }}>AÇÕES</th>
              </tr>
              <tr style={{ background: '#f9f9f9' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: '600' }}>CAMPO</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: '600' }}>VALOR</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: '600' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: '600', background: '#f9f9f9' }}>
                      DOTAÇÃO ORÇAMENTÁRIA
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <input
                        type="text"
                        value={item.dotacaoOrcamentaria || ''}
                        onChange={(e) => handleUpdateItem(index, 'dotacaoOrcamentaria', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px',
                          fontSize: '12px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontFamily: 'inherit'
                        }}
                        placeholder="Digite a dotação orçamentária"
                      />
                    </td>
                    <td rowSpan={5} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Remover linha"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: '600', background: '#f9f9f9' }}>
                      UNID. ORÇAMENTÁRIA
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <input
                        type="text"
                        value={item.unidOrcamentaria || ''}
                        onChange={(e) => handleUpdateItem(index, 'unidOrcamentaria', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px',
                          fontSize: '12px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontFamily: 'inherit'
                        }}
                        placeholder="Digite a unidade orçamentária"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: '600', background: '#f9f9f9' }}>
                      PROJETO ATIVIDADE
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <input
                        type="text"
                        value={item.projetoAtividade || ''}
                        onChange={(e) => handleUpdateItem(index, 'projetoAtividade', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px',
                          fontSize: '12px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontFamily: 'inherit'
                        }}
                        placeholder="Digite o projeto/atividade"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: '600', background: '#f9f9f9' }}>
                      CATEGORIA
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <input
                        type="text"
                        value={item.categoria || ''}
                        onChange={(e) => handleUpdateItem(index, 'categoria', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px',
                          fontSize: '12px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontFamily: 'inherit'
                        }}
                        placeholder="Digite a categoria"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: '600', background: '#f9f9f9' }}>
                      FONTE DE RECURSO
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <input
                        type="text"
                        value={item.fonteRecurso || ''}
                        onChange={(e) => handleUpdateItem(index, 'fonteRecurso', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px',
                          fontSize: '12px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontFamily: 'inherit'
                        }}
                        placeholder="Digite a fonte de recurso"
                      />
                    </td>
                  </tr>
                  {index < items.length - 1 && (
                    <tr>
                      <td colSpan={3} style={{ padding: '8px', background: '#f0f0f0' }}></td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                    Nenhuma linha adicionada. Clique em &quot;Adicionar Linha&quot; para começar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              background: '#227056',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== COMPONENTE: BARRA LATERAL DE EDIÇÃO (DIREITA) ==========
const EditSidebar = ({ clause, onClose, onUpdateClause, clauseData }: any) => {
  if (!clause) return null;

  const isClause12 = clause === '1' || clause === '2';
  const isClause4 = clause === '4';
  const isClause17 = clause === '17';

  // Para cláusulas 1 e 2: mostrar objetos selecionáveis
  if (isClause12) {
    const objects = clause === '1' ? clausula1Objects : clausula2Objects;
    const selected = clauseData[`clause${clause}`] || {};

    return (
      <aside style={{
        width: '400px',
        background: 'white',
        borderLeft: '1px solid #eee',
        padding: '20px',
        overflowY: 'auto',
        height: '100vh',
        position: 'fixed',
        right: 0,
        top: 0,
        boxShadow: '-2px 0 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#227056' }}>
            Selecionar {clause === '1' ? 'Objetos' : 'Detalhamentos'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#999'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.entries(objects).map(([key, obj]: [string, any]) => (
            <label
              key={key}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px',
                border: `2px solid ${selected[key] ? '#227056' : '#eee'}`,
                borderRadius: '6px',
                background: selected[key] ? '#f0f8f5' : 'transparent',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={!!selected[key]}
                onChange={(e) => {
                  const newSelected = { ...selected };
                  if (e.target.checked) {
                    newSelected[key] = obj.texto;
                  } else {
                    delete newSelected[key];
                  }
                  onUpdateClause(`clause${clause}`, newSelected);
                }}
                style={{ marginTop: '4px', accentColor: '#227056' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '13pt', marginBottom: '4px' }}>
                  {key}
                </div>
                <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
                  {obj.texto.substring(0, 150)}...
                </div>
              </div>
            </label>
          ))}
        </div>
      </aside>
    );
  }

  // Para outras cláusulas: mostrar sub-itens selecionáveis
  const clauseInfo = allClauses[clause];
  if (!clauseInfo) return null;

  const selected = clauseData[`clause${clause}`] || {};

  return (
    <aside style={{
      width: '400px',
      background: 'white',
      borderLeft: '1px solid #eee',
      padding: '20px',
      overflowY: 'auto',
      height: '100vh',
      position: 'fixed',
      right: 0,
      top: 0,
      boxShadow: '-2px 0 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#227056' }}>
          {clauseInfo.titulo}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: '#999'
          }}
        >
          <X size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.entries(clauseInfo.subitens).map(([key, texto]: [string, string]) => (
          <div key={key}>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px',
                border: `2px solid ${selected[key] ? '#227056' : '#eee'}`,
                borderRadius: '6px',
                background: selected[key] ? '#f0f8f5' : 'transparent',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={!!selected[key]}
                onChange={(e) => {
                  const newSelected = { ...selected };
                  if (e.target.checked) {
                    newSelected[key] = texto;
                  } else {
                    delete newSelected[key];
                  }
                  onUpdateClause(`clause${clause}`, newSelected);
                }}
                style={{ marginTop: '4px', accentColor: '#227056' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '13pt', marginBottom: '4px' }}>
                  {key}
                </div>
                <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
                  {typeof texto === 'string' ? texto.substring(0, 150) + '...' : 'Texto longo'}
                </div>
              </div>
            </label>
            {/* Botão para abrir modal da tabela 4.6 (invertido: agora a tabela vai com o 4.6) */}
            {key === '4.6' && selected[key] && (
              <button
                onClick={() => {
                  // O modal será controlado no componente pai
                  const event = new CustomEvent('openModal45');
                  window.dispatchEvent(event);
                }}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '10px',
                  background: '#227056',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13pt',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <FileText size={16} />
                Abrir Tabela 4.6
              </button>
            )}
            {/* Botão para abrir modal da tabela 17.1 */}
            {key === '17.1' && selected[key] && (
              <button
                onClick={() => {
                  // O modal será controlado no componente pai
                  const event = new CustomEvent('openModal171');
                  window.dispatchEvent(event);
                }}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '10px',
                  background: '#227056',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13pt',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <FileText size={16} />
                Abrir Tabela 17.1
              </button>
            )}
            {/* Botão informativo para 17.2 */}
            {key === '17.2' && selected[key] && (
              <div
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '10px',
                  background: '#f0f8f5',
                  border: '1px solid #227056',
                  borderRadius: '6px',
                  fontSize: '13pt',
                  color: '#227056',
                  textAlign: 'center'
                }}
              >
                ✓ 17.2 selecionado - Informações sobre apostilamento
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

// ========== COMPONENTE: BARRA LATERAL DE CONTROLES (ESQUERDA) ==========
const ControlsSidebar = ({
  options,
  setOptions,
  percentual,
  setPercentual,
  onStartFromScratch,
  onDownloadDocx,
  loadingDocx,
}: any) => {

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOptions((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <aside className="sidebar" style={{ width: '300px' }}>
      <div className="sidebar-header" style={{ marginBottom: '24px' }}>
        <Settings size={24} color="#227056" />
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#227056' }}>Personalizar Minuta</h2>
      </div>

      <div className="start-buttons">
        <button onClick={onStartFromScratch} className="btn primary" style={{ width: '100%' }}>
          <RefreshCw size={18} /> Começar do Zero
        </button>
      </div>

      {/* Campos Editáveis da Capa */}
      <div className="field">
        <label>Número do Contrato</label>
        <input
          name="numeroContrato"
          value={options.numeroContrato || ""}
          onChange={handleOptionChange}
          placeholder="Ex: 001/2025"
          style={{ borderRadius: '8px', border: '1px solid #ccc' }}
        />
      </div>

      <div className="field">
        <label>Número da Inexigibilidade de Licitação</label>
        <input
          name="numeroInexigibilidade"
          value={options.numeroInexigibilidade || ""}
          onChange={handleOptionChange}
          placeholder="Ex: 001/2025"
          style={{ borderRadius: '8px', border: '1px solid #ccc' }}
        />
      </div>

      <div className="field">
        <label>Número do Processo Administrativo</label>
        <input
          name="numeroProcesso"
          value={options.numeroProcesso || ""}
          onChange={handleOptionChange}
          placeholder="Ex: 12345/2025"
          style={{ borderRadius: '8px', border: '1px solid #ccc' }}
        />
      </div>

      <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #eee' }} />

      {/* Percentual de Êxito */}
      <div className="field">
        <label>Percentual de Êxito</label>
        <input
          type="text"
          value={percentual}
          onChange={(e) => setPercentual(e.target.value)}
          placeholder="Ex: R$ 0,20 (vinte centavos)"
          style={{ borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
          Valor que será inserido automaticamente no texto (ex: R$ 0,20 para cada R$ 1,00)
        </p>
      </div>

      {/* Botões de ação */}
      <div className="actions" style={{ marginTop: '30px' }}>
        <button
          className="btn secondary"
          style={{ width: '100%', padding: '14px' }}
          onClick={onDownloadDocx}
          disabled={loadingDocx}
        >
          {loadingDocx ? "Gerando..." : <><Download size={18} /> Docs</>}
        </button>
      </div>
    </aside>
  );
};

// ========== COMPONENTE: DOCUMENTO DA MINUTA (PRÉVIA) ==========
const MinutaDocument = ({
  options,
  clauseData,
  percentual
}: any) => {
  const Page = ({ children, pageNumber }: any) => {
    return (
      <div className="pdf-page-render" data-page={pageNumber} style={{
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        margin: '0 auto',
        marginBottom: '20px',
        background: 'white',
        padding: '20mm 25mm 25mm 25mm', // Margens uniformes (sem rodapé)
        width: '210mm',
        minHeight: '297mm', // minHeight permite crescimento
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        pageBreakAfter: 'always',
        overflow: 'visible' // Permite overflow para fluxo contínuo
      }}>
        {/* Cabeçalho com Logo da Prefeitura - 180pt para paridade com DOCX */}
        <div style={{ textAlign: 'center', marginBottom: '25pt', flexShrink: 0 }}>
          <img
            src="/barrocas.png"
            alt="Logo Prefeitura"
            style={{ width: '180pt', height: 'auto', display: 'block', margin: '0 auto' }}
            crossOrigin="anonymous"
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {children}
        </div>
      </div>
    );
  };

  // Obter objetos selecionados das cláusulas 1 e 2
  const clause1Selected = Object.entries(clauseData.clause1 || {}).sort(([a], [b]) => a.localeCompare(b));
  const clause2Selected = Object.entries(clauseData.clause2 || {}).sort(([a], [b]) => a.localeCompare(b));
  // Usa valores padrão se não houver dados salvos
  const tabela45ItemsData = Object.keys(clauseData.tabela45 || {}).length > 0
    ? (clauseData.tabela45 || {})
    : tabela45Items;
  const dotacao17 = clauseData.dotacao17 || {};

  return (
    <div id="preview" className="preview" style={{ fontFamily: "'Garamond', serif" }}>
      {/* PÁGINA 1: CAPA */}
      <Page pageNumber={1}>
        <div style={{ marginBottom: '30px' }}>
          <p style={{ fontSize: '13pt', color: '#000', marginBottom: '8px', fontFamily: "'Garamond', serif" }}>
            CONTRATO N° {options.numeroContrato || "____________"}
          </p>
          <p style={{ fontSize: '13pt', color: '#000', marginBottom: '8px', fontFamily: "'Garamond', serif" }}>
            INEXIGIBILIDADE DE LICITAÇÃO N° {options.numeroInexigibilidade || "_____________"}
          </p>
          <p style={{ fontSize: '13pt', color: '#000', marginBottom: '0', fontFamily: "'Garamond', serif" }}>
            PROCESSO ADMINISTRATIVO N° {options.numeroProcesso || "_____________________"}
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}></div>

        {/* Texto Fixo */}
        <div style={{
          textAlign: 'justify',
          marginBottom: '30px',
          marginRight: '120px',
          maxWidth: 'calc(100% - 120px)',
          marginLeft: 'auto'
        }}>
          <p style={{
            fontSize: '13pt',
            lineHeight: '1.5',
            color: '#000',
            fontFamily: "'Garamond', serif",
            textAlign: 'justify'
          }}>
            {FIXED_COVER_TEXT}
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}></div>

        {/* Texto das Partes (Fixo) */}
        <div style={{
          marginRight: '120px',
          marginLeft: 'auto',
          textAlign: 'right',
          maxWidth: 'calc(100% - 120px)'
        }}>
          <div style={{
            textAlign: 'justify',
            marginLeft: 'auto'
          }}>
            <p style={{
              fontSize: '13pt',
              lineHeight: '1.5',
              color: '#000',
              fontFamily: "'Garamond', serif",
              textAlign: 'justify',
              margin: 0
            }}>
              {DEFAULT_TEXT_PARTES}
            </p>
          </div>
        </div>
      </Page>

      {/* PÁGINA 2: CLÁUSULA 1ª */}
      {clause1Selected.length > 0 && (
        <Page pageNumber={2}>
          <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
            <h2 style={{
              fontSize: '13pt',
              fontWeight: 'bold',
              color: '#000',
              borderBottom: '1pt solid #000',
              paddingBottom: '8px',
              marginBottom: '20px',
              marginTop: '0',
              fontFamily: "'Garamond', serif"
            }}>
              CLÁUSULA 1ª - DO OBJETO
            </h2>

            <p style={{
              textAlign: 'justify',
              fontSize: '13pt',
              lineHeight: '1.5',
              marginBottom: '15px',
              marginTop: '0',
              color: '#000',
              fontFamily: "'Garamond', serif"
            }}>
              É objeto do presente contrato o desenvolvimento de serviços advocatícios especializados por parte da CONTRATADA, CAVALCANTE REIS ADVOGADOS, ao CONTRATANTE, Município de BARROCAS, a fim de prestação de serviços de assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico, Financeiro e Previdenciário, atuando perante o Ministério da Fazenda e os seus órgãos administrativos, em especial para alcançar o incremento de receitas, ficando responsável pelo ajuizamento, acompanhamento e eventuais intervenções de terceiro em ações de interesse do Município.
            </p>

            {clause1Selected.map(([key, texto]: [string, any]) => (
              <div key={key} style={{ marginBottom: '15px' }}>
                <p style={{
                  textAlign: 'justify',
                  fontSize: '13pt',
                  lineHeight: '1.5',
                  marginBottom: '10px',
                  color: '#000',
                  fontFamily: "'Garamond', serif"
                }}>
                  <strong>{key}</strong> {texto}
                </p>
              </div>
            ))}
          </div>
        </Page>
      )}

      {/* PÁGINA 3: CLÁUSULA 2ª - Separando 2.1-2.5 e 2.6-2.8 */}
      {clause2Selected.length > 0 && (() => {
        // Separa itens 2.1-2.5 dos 2.6-2.8
        const clause2Early = clause2Selected.filter(([key]) => {
          const num = parseFloat(key.replace('2.', ''));
          return num >= 1 && num <= 5;
        });
        const clause2Late = clause2Selected.filter(([key]) => {
          const num = parseFloat(key.replace('2.', ''));
          return num >= 6 && num <= 8;
        });

        return (
          <>
            {/* Primeira página: 2.1-2.5 */}
            {clause2Early.length > 0 && (
              <Page pageNumber={3}>
                <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
                  <h2 style={{
                    fontSize: '13pt',
                    fontWeight: 'bold',
                    color: '#000',
                    borderBottom: '1pt solid #000',
                    paddingBottom: '8px',
                    marginBottom: '20px',
                    marginTop: '0',
                    fontFamily: "'Garamond', serif"
                  }}>
                    CLÁUSULA 2ª - DETALHAMENTO DO OBJETO E ESPECIFICAÇÕES DOS SERVIÇOS A SEREM EXECUTADOS
                  </h2>

                  {clause2Early.map(([key, texto]: [string, any]) => (
                    <div key={key} style={{ marginBottom: '15px' }}>
                      {texto.split('\n').map((line: string, lineIdx: number) => (
                        <p
                          key={lineIdx}
                          style={{
                            textAlign: 'justify',
                            fontSize: '13pt',
                            lineHeight: '1.5',
                            marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                            color: '#000',
                            fontFamily: "'Garamond', serif"
                          }}
                        >
                          {lineIdx === 0 && <strong>{key}- </strong>}
                          {line || '\u00A0'}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </Page>
            )}

            {/* Segunda página: 2.6-2.8 (antes da cláusula 3) */}
            {clause2Late.length > 0 && (
              <Page pageNumber={clause2Early.length > 0 ? 4 : 3}>
                <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
                  {clause2Late.map(([key, texto]: [string, any]) => (
                    <div key={key} style={{ marginBottom: '15px' }}>
                      {texto.split('\n').map((line: string, lineIdx: number) => (
                        <p
                          key={lineIdx}
                          style={{
                            textAlign: 'justify',
                            fontSize: '13pt',
                            lineHeight: '1.5',
                            marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                            color: '#000',
                            fontFamily: "'Garamond', serif"
                          }}
                        >
                          {lineIdx === 0 && <strong>{key}- </strong>}
                          {line || '\u00A0'}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </Page>
            )}
          </>
        );
      })()}

      {/* CLÁUSULAS 3-18 - RENDERIZAÇÃO COM AGRUPAMENTO */}
      {(() => {
        const clausesToRender: Array<{ num: string; selected: Record<string, any>; info: any }> = [];
        let currentPageNum = 3 + (clause1Selected.length > 0 ? 1 : 0) + (clause2Selected.length > 0 ? 1 : 0);

        // Calcula número de páginas iniciais considerando cláusula 2 dividida
        const clause2Late = clause2Selected.filter(([key]) => {
          const num = parseFloat(key.replace('2.', ''));
          return num >= 6 && num <= 8;
        });
        const basePageCount = 1 + (clause1Selected.length > 0 ? 1 : 0) + (clause2Selected.length > 0 ? 1 : 0) + (clause2Late.length > 0 ? 1 : 0);

        // Coleta todas as cláusulas que têm sub-itens selecionados
        for (const num of ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18']) {
          const clauseSelected = clauseData[`clause${num}`] || {};
          if (Object.keys(clauseSelected).length > 0) {
            const clauseInfo = allClauses[num];
            if (clauseInfo) {
              clausesToRender.push({ num, selected: clauseSelected, info: clauseInfo });
            }
          }
        }

        // Atualiza currentPageNum
        currentPageNum = basePageCount;

        // Função auxiliar para ordenar sub-itens numericamente
        const sortSubItems = (entries: [string, any][]): [string, any][] => {
          return entries.sort(([a], [b]) => {
            // Extrai números da chave (ex: "7.10" -> [7, 10])
            const aParts = a.split('.').map(Number);
            const bParts = b.split('.').map(Number);

            // Compara parte por parte
            for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
              const aVal = aParts[i] || 0;
              const bVal = bParts[i] || 0;
              if (aVal !== bVal) {
                return aVal - bVal;
              }
            }
            return 0;
          });
        };

        // Renderiza com agrupamento
        const renderedPages: JSX.Element[] = [];
        let i = 0;

        while (i < clausesToRender.length) {
          const current = clausesToRender[i];
          const currentNum = parseInt(current.num);

          // Agrupa 8-10 juntos (e inclui 7.11-7.12 se houver)
          if (currentNum >= 8 && currentNum <= 10) {
            const group = clausesToRender.filter(c => {
              const n = parseInt(c.num);
              return n >= 8 && n <= 10;
            });
            // Busca 7.11-7.12 da cláusula 7
            const clause7 = clausesToRender.find(c => c.num === '7');
            const clause7Late = clause7 ? sortSubItems(Object.entries(clause7.selected)).filter(([key]) => {
              const num = parseFloat(key.replace('7.', ''));
              return num >= 11 && num <= 12;
            }) : [];

            i += group.length;

            // Renderiza grupo 8-10 em uma página (com 7.11-7.12 antes se houver)
            renderedPages.push(
              <Page key={`group-8-10`} pageNumber={currentPageNum++}>
                <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
                  {/* 7.11-7.12 primeiro se existir */}
                  {clause7Late.map(([key, texto]: [string, any]) => (
                    <div key={key} style={{ marginBottom: '15px' }}>
                      {texto.split('\n').map((line: string, lineIdx: number) => (
                        <p
                          key={lineIdx}
                          style={{
                            textAlign: 'justify',
                            fontSize: '13pt',
                            lineHeight: '1.5',
                            marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                            color: '#000',
                            fontFamily: "'Garamond', serif"
                          }}
                        >
                          {lineIdx === 0 && <strong>{key}- </strong>}
                          {line || '\u00A0'}
                        </p>
                      ))}
                    </div>
                  ))}
                  {group.map((item, idx) => (
                    <div key={item.num} style={{ marginBottom: item === group[group.length - 1] ? '0' : '30px' }}>
                      <h2 style={{
                        fontSize: '13pt',
                        fontWeight: 'bold',
                        color: '#000',
                        borderBottom: '1pt solid #000',
                        paddingBottom: '8px',
                        marginBottom: '20px',
                        marginTop: idx === 0 && clause7Late.length > 0 ? '20px' : '0',
                        fontFamily: "'Garamond', serif"
                      }}>
                        {item.info.titulo}
                      </h2>

                      {sortSubItems(Object.entries(item.selected))
                        .map(([key, texto]: [string, any]) => (
                          <div key={key} style={{ marginBottom: '15px' }}>
                            {texto.split('\n').map((line: string, lineIdx: number) => (
                              <p
                                key={lineIdx}
                                style={{
                                  textAlign: 'justify',
                                  fontSize: '13pt',
                                  lineHeight: '1.5',
                                  marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                                  color: '#000',
                                  fontFamily: "'Garamond', serif"
                                }}
                              >
                                {lineIdx === 0 && <strong>{key}- </strong>}
                                {line || '\u00A0'}
                              </p>
                            ))}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </Page>
            );
            continue;
          }

          // Agrupa 13-15 juntos
          if (currentNum >= 13 && currentNum <= 15) {
            const group = clausesToRender.filter(c => {
              const n = parseInt(c.num);
              return n >= 13 && n <= 15;
            });
            i += group.length;

            // Renderiza grupo 13-15 em uma página
            renderedPages.push(
              <Page key={`group-13-15`} pageNumber={currentPageNum++}>
                <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
                  {group.map((item) => (
                    <div key={item.num} style={{ marginBottom: item === group[group.length - 1] ? '0' : '30px' }}>
                      <h2 style={{
                        fontSize: '13pt',
                        fontWeight: 'bold',
                        color: '#000',
                        borderBottom: '1pt solid #000',
                        paddingBottom: '8px',
                        marginBottom: '20px',
                        marginTop: '0',
                        fontFamily: "'Garamond', serif"
                      }}>
                        {item.info.titulo}
                      </h2>

                      {sortSubItems(Object.entries(item.selected))
                        .map(([key, texto]: [string, any]) => (
                          <div key={key} style={{ marginBottom: '15px' }}>
                            {texto.split('\n').map((line: string, lineIdx: number) => (
                              <p
                                key={lineIdx}
                                style={{
                                  textAlign: 'justify',
                                  fontSize: '13pt',
                                  lineHeight: '1.5',
                                  marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                                  color: '#000',
                                  fontFamily: "'Garamond', serif"
                                }}
                              >
                                {lineIdx === 0 && <strong>{key}- </strong>}
                                {line || '\u00A0'}
                              </p>
                            ))}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </Page>
            );
            continue;
          }

          // Agrupa 16-18 juntos (com finalização na mesma página)
          if (currentNum >= 16 && currentNum <= 18) {
            const group = clausesToRender.filter(c => {
              const n = parseInt(c.num);
              return n >= 16 && n <= 18;
            });
            i += group.length;

            // Renderiza grupo 16-18 em uma página com assinaturas
            renderedPages.push(
              <Page key={`group-16-18`} pageNumber={currentPageNum++}>
                <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
                  <div style={{ flex: 1 }}>
                    {group.map((item) => (
                      <div key={item.num} style={{ marginBottom: item === group[group.length - 1] ? '0' : '30px' }}>
                        <h2 style={{
                          fontSize: '13pt',
                          fontWeight: 'bold',
                          color: '#000',
                          borderBottom: '1pt solid #000',
                          paddingBottom: '8px',
                          marginBottom: '20px',
                          marginTop: '0',
                          fontFamily: "'Garamond', serif"
                        }}>
                          {item.info.titulo}
                        </h2>

                        {Object.entries(item.selected)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([key, texto]: [string, any]) => {
                            // Renderiza o texto do 17.1 com a tabela logo após
                            if (item.num === '17' && key === '17.1') {
                              return (
                                <React.Fragment key={key}>
                                  <div style={{ marginBottom: '15px' }}>
                                    {texto.split('\n').map((line: string, lineIdx: number) => (
                                      <p
                                        key={lineIdx}
                                        style={{
                                          textAlign: 'justify',
                                          fontSize: '13pt',
                                          lineHeight: '1.5',
                                          marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                                          color: '#000',
                                          fontFamily: "'Garamond', serif"
                                        }}
                                      >
                                        {lineIdx === 0 && <strong>{key}- </strong>}
                                        {line || '\u00A0'}
                                      </p>
                                    ))}
                                  </div>
                                  {/* Tabela 17.1 logo após o texto */}
                                  {Array.isArray(dotacao17) && dotacao17.length > 0 && (
                                    <div style={{ marginTop: '30px', marginBottom: '15px' }}>
                                      {dotacao17.map((dotacao: any, idx: number) => (
                                        <table key={idx} style={{
                                          width: '100%',
                                          borderCollapse: 'collapse',
                                          border: '1px solid #000',
                                          marginTop: idx > 0 ? '20px' : '20px',
                                          fontFamily: "'Garamond', serif"
                                        }}>
                                          <thead>
                                            <tr>
                                              <th colSpan={2} style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000', textAlign: 'center', fontWeight: 'bold' }}>
                                                DOTAÇÃO ORÇAMENTÁRIA
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {dotacao.dotacaoOrcamentaria && (
                                              <tr>
                                                <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000', fontWeight: 'bold' }}>DOTAÇÃO ORÇAMENTÁRIA</td>
                                                <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000' }}>{dotacao.dotacaoOrcamentaria}</td>
                                              </tr>
                                            )}
                                            {dotacao.unidOrcamentaria && (
                                              <tr>
                                                <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000', fontWeight: 'bold' }}>UNID. ORÇAMENTÁRIA</td>
                                                <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000' }}>{dotacao.unidOrcamentaria}</td>
                                              </tr>
                                            )}
                                            {dotacao.projetoAtividade && (
                                              <tr>
                                                <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000', fontWeight: 'bold' }}>PROJETO ATIVIDADE</td>
                                                <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000' }}>{dotacao.projetoAtividade}</td>
                                              </tr>
                                            )}
                                            {dotacao.categoria && (
                                              <tr>
                                                <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000', fontWeight: 'bold' }}>CATEGORIA</td>
                                                <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000' }}>{dotacao.categoria}</td>
                                              </tr>
                                            )}
                                            {dotacao.fonteRecurso && (
                                              <tr>
                                                <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000', fontWeight: 'bold' }}>FONTE DE RECURSO</td>
                                                <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000' }}>{dotacao.fonteRecurso}</td>
                                              </tr>
                                            )}
                                          </tbody>
                                        </table>
                                      ))}
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            }
                            // Outros sub-itens normais
                            return (
                              <div key={key} style={{ marginBottom: '15px' }}>
                                {texto.split('\n').map((line: string, lineIdx: number) => (
                                  <p
                                    key={lineIdx}
                                    style={{
                                      textAlign: 'justify',
                                      fontSize: '13pt',
                                      lineHeight: '1.5',
                                      marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                                      color: '#000',
                                      fontFamily: "'Garamond', serif"
                                    }}
                                  >
                                    {lineIdx === 0 && <strong>{key}- </strong>}
                                    {line || '\u00A0'}
                                  </p>
                                ))}
                              </div>
                            );
                          })}

                      </div>
                    ))}
                  </div>

                  {/* Assinaturas na mesma página */}
                  <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                    <p style={{ fontSize: '13pt', color: '#000', marginBottom: '40px', fontFamily: "'Garamond', serif" }}>
                      Barrocas/BA_____ de dezembro de 2025.
                    </p>

                    <div style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginBottom: '8px' }}>
                          <p style={{ fontSize: '13pt', color: '#000', fontFamily: "'Garamond', serif", margin: 0 }}>
                            MUNICÍPIO DE BARROCAS/BA, representado por seu Prefeito,
                          </p>
                          <p style={{ fontSize: '13pt', color: '#000', fontFamily: "'Garamond', serif", margin: 0 }}>
                            Sr. JOSÉ ALMIR ARAÚJO QUEIROZ
                          </p>
                        </div>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginBottom: '8px' }}>
                          <p style={{ fontSize: '13pt', color: '#000', fontFamily: "'Garamond', serif", margin: 0 }}>
                            CAVALCANTE REIS ADVOGADOS, representado pelo sócio-diretor, Sr.
                          </p>
                          <p style={{ fontSize: '13pt', color: '#000', fontFamily: "'Garamond', serif", margin: 0 }}>
                            IURI DO LAGO NOGUEIRA CAVALCANTE REIS,
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '60px' }}>
                      <p style={{ fontSize: '13pt', color: '#000', fontFamily: "'Garamond', serif", marginBottom: '20px' }}>
                        Testemunhas:
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '40px' }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginBottom: '8px' }}>
                            <p style={{ fontSize: '13pt', color: '#000', fontFamily: "'Garamond', serif", margin: 0 }}>
                              1ª___________________________
                            </p>
                            <p style={{ fontSize: '13pt', color: '#000', fontFamily: "'Garamond', serif", margin: '4px 0 0 0' }}>
                              CPF nº:
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginBottom: '8px' }}>
                            <p style={{ fontSize: '13pt', color: '#000', fontFamily: "'Garamond', serif", margin: 0 }}>
                              2ª___________________________
                            </p>
                            <p style={{ fontSize: '13pt', color: '#000', fontFamily: "'Garamond', serif", margin: '4px 0 0 0' }}>
                              CPF nº:
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Page>
            );
            continue;
          }

          // Caso especial: Cláusula 3 - separar 3.3 para ir antes da cláusula 4
          if (currentNum === 3) {
            const clause3Items = sortSubItems(Object.entries(current.selected));
            const clause3Early = clause3Items.filter(([key]) => key !== '3.3');
            const clause3Late = clause3Items.filter(([key]) => key === '3.3');

            // Renderiza 3.1-3.2
            if (clause3Early.length > 0) {
              renderedPages.push(
                <Page key="3-early" pageNumber={currentPageNum++}>
                  <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
                    <h2 style={{
                      fontSize: '13pt',
                      fontWeight: 'bold',
                      color: '#000',
                      borderBottom: '1pt solid #000',
                      paddingBottom: '8px',
                      marginBottom: '20px',
                      marginTop: '0',
                      fontFamily: "'Garamond', serif"
                    }}>
                      {current.info.titulo}
                    </h2>
                    {clause3Early.map(([key, texto]: [string, any]) => (
                      <div key={key} style={{ marginBottom: '15px' }}>
                        {texto.split('\n').map((line: string, lineIdx: number) => (
                          <p
                            key={lineIdx}
                            style={{
                              textAlign: 'justify',
                              fontSize: '13pt',
                              lineHeight: '1.5',
                              marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                              color: '#000',
                              fontFamily: "'Garamond', serif"
                            }}
                          >
                            {lineIdx === 0 && <strong>{key}- </strong>}
                            {line || '\u00A0'}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </Page>
              );
            }

            // 3.3 vai antes da cláusula 4 se houver
            if (clause3Late.length > 0) {
              const clause4 = clausesToRender.find(c => c.num === '4');
              if (clause4) {
                (clause4 as any).clause3Late = clause3Late;
              } else {
                // Se não houver 4, renderiza 3.3 sozinho
                renderedPages.push(
                  <Page key="3-late" pageNumber={currentPageNum++}>
                    <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
                      {clause3Late.map(([key, texto]: [string, any]) => (
                        <div key={key} style={{ marginBottom: '15px' }}>
                          {texto.split('\n').map((line: string, lineIdx: number) => (
                            <p
                              key={lineIdx}
                              style={{
                                textAlign: 'justify',
                                fontSize: '13pt',
                                lineHeight: '1.5',
                                marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                                color: '#000',
                                fontFamily: "'Garamond', serif"
                              }}
                            >
                              {lineIdx === 0 && <strong>{key}- </strong>}
                              {line || '\u00A0'}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </Page>
                );
              }
            }
            i++;
            continue;
          }

          // Caso especial: Cláusula 4 - separar 4.6 para ir depois do 4.5 (invertido)
          if (currentNum === 4) {
            const clause3Late = (current as any).clause3Late || [];
            const clause4Items = sortSubItems(Object.entries(current.selected));
            const clause4Early = clause4Items.filter(([key]) => key !== '4.6'); // 4.1-4.5
            const clause4Late = clause4Items.filter(([key]) => key === '4.6'); // 4.6 (com tabela)

            // Renderiza 3.3 + 4.1-4.5 (sem o 4.6)
            if (clause4Early.length > 0) {
              renderedPages.push(
                <Page key="4-early" pageNumber={currentPageNum++}>
                  <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
                    {/* 3.3 primeiro se existir */}
                    {clause3Late.map(([key, texto]: [string, any]) => (
                      <div key={key} style={{ marginBottom: '15px' }}>
                        {texto.split('\n').map((line: string, lineIdx: number) => (
                          <p
                            key={lineIdx}
                            style={{
                              textAlign: 'justify',
                              fontSize: '13pt',
                              lineHeight: '1.5',
                              marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                              color: '#000',
                              fontFamily: "'Garamond', serif"
                            }}
                          >
                            {lineIdx === 0 && <strong>{key}- </strong>}
                            {line || '\u00A0'}
                          </p>
                        ))}
                      </div>
                    ))}
                    {/* Título da cláusula 4 */}
                    <h2 style={{
                      fontSize: '13pt',
                      fontWeight: 'bold',
                      color: '#000',
                      borderBottom: '1pt solid #000',
                      paddingBottom: '8px',
                      marginBottom: '20px',
                      marginTop: clause3Late.length > 0 ? '20px' : '0',
                      fontFamily: "'Garamond', serif"
                    }}>
                      {current.info.titulo}
                    </h2>
                    {/* 4.1-4.5 (sem 4.6) */}
                    {clause4Early.map(([key, texto]: [string, any]) => (
                      <div key={key} style={{ marginBottom: '15px' }}>
                        {texto.split('\n').map((line: string, lineIdx: number) => (
                          <p
                            key={lineIdx}
                            style={{
                              textAlign: 'justify',
                              fontSize: '13pt',
                              lineHeight: '1.5',
                              marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                              color: '#000',
                              fontFamily: "'Garamond', serif"
                            }}
                          >
                            {lineIdx === 0 && <strong>{key}- </strong>}
                            {line || '\u00A0'}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </Page>
              );
            }

            // Renderiza 4.6 em nova página (depois do 4.5) - com tabela
            if (clause4Late.length > 0) {
              const [key, texto] = clause4Late[0];
              renderedPages.push(
                <Page key="4-late" pageNumber={currentPageNum++}>
                  <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
                    {/* Texto do 4.6 */}
                    <div style={{ marginBottom: '15px' }}>
                      {texto.split('\n').map((line: string, lineIdx: number) => (
                        <p
                          key={lineIdx}
                          style={{
                            textAlign: 'justify',
                            fontSize: '13pt',
                            lineHeight: '1.5',
                            marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                            color: '#000',
                            fontFamily: "'Garamond', serif"
                          }}
                        >
                          {lineIdx === 0 && <strong>{key}- </strong>}
                          {line || '\u00A0'}
                        </p>
                      ))}
                    </div>
                    {/* Tabela 4.6 logo após o texto */}
                    {Object.keys(tabela45ItemsData).length > 0 && (
                      <div style={{ marginTop: '30px', marginBottom: '15px' }}>
                        <table style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          border: '1px solid #000',
                          marginTop: '20px',
                          fontFamily: "'Garamond', serif"
                        }}>
                          <thead>
                            <tr style={{ background: '#f9f9f9' }}>
                              <th style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000', textAlign: 'center', fontWeight: 'bold' }}>ITEM</th>
                              <th style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000', textAlign: 'center', fontWeight: 'bold' }}>DESCRIÇÃO</th>
                              <th style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000', textAlign: 'center', fontWeight: 'bold' }}>CABIMENTO</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(tabela45ItemsData)
                              .sort(([a], [b]) => parseInt(a) - parseInt(b))
                              .map(([itemNum, item]: [string, any]) => (
                                <tr key={itemNum}>
                                  <td style={{ border: '1px solid #000', padding: '8px', fontSize: '13pt', color: '#000', textAlign: 'center', fontWeight: 'bold' }}>
                                    {itemNum}
                                  </td>
                                  <td style={{ border: '1px solid #000', padding: '8px', fontSize: '13pt', color: '#000' }}>
                                    {item.descricao}
                                  </td>
                                  <td style={{ border: '1px solid #000', padding: '8px', fontSize: '13pt', color: '#000' }}>
                                    {item.cabimento}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>

                        {/* Textos a, b, c, d após tabela */}
                        <div style={{ marginTop: '20px' }}>
                          <p style={{ fontSize: '13pt', lineHeight: '1.5', color: '#000', fontFamily: "'Garamond', serif", textAlign: 'justify', marginBottom: '10px' }}>
                            a) Os demais objetos contidos nas cláusulas do presente contrato terão os valores levantados após a disponibilização da documentação necessária para a efetivação do serviço, haja vista a natureza concomitante do trabalho desenvolvido.
                          </p>
                          <p style={{ fontSize: '13pt', lineHeight: '1.5', color: '#000', fontFamily: "'Garamond', serif", textAlign: 'justify', marginBottom: '10px' }}>
                            b) Os valores levantados a título de incremento são provisórios, baseados em informações preliminares, podendo, ao final, representar valores a maior ou a menor.
                          </p>
                          <p style={{ fontSize: '13pt', lineHeight: '1.5', color: '#000', fontFamily: "'Garamond', serif", textAlign: 'justify', marginBottom: '10px' }}>
                            c) Para efetivação da atualização do valor contratual previsto no parágrafo antecedente, ocorrerá mediante a celebração de aditamento, na forma prevista na Lei n.° 14.133/21.
                          </p>
                          <p style={{ fontSize: '13pt', lineHeight: '1.5', color: '#000', fontFamily: "'Garamond', serif", textAlign: 'justify', marginBottom: '10px' }}>
                            d) Em nenhuma hipótese, o MUNICÍPIO DE BARROCAS/BA pagará à CONTRATADA antes que os valores sejam registrados nos cofres públicos.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Page>
              );
            }
            i++;
            continue;
          }

          // Caso especial: Cláusula 5 - separar 5.10 para ir com 6
          if (currentNum === 5) {
            const clause5Items = sortSubItems(Object.entries(current.selected));
            const clause5Early = clause5Items.filter(([key]) => key !== '5.10');
            const clause5Late = clause5Items.filter(([key]) => key === '5.10');

            // Renderiza 5.1-5.9
            if (clause5Early.length > 0) {
              renderedPages.push(
                <Page key="5-early" pageNumber={currentPageNum++}>
                  <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
                    <h2 style={{
                      fontSize: '13pt',
                      fontWeight: 'bold',
                      color: '#000',
                      borderBottom: '1pt solid #000',
                      paddingBottom: '8px',
                      marginBottom: '20px',
                      marginTop: '0',
                      fontFamily: "'Garamond', serif"
                    }}>
                      {current.info.titulo}
                    </h2>
                    {clause5Early.map(([key, texto]: [string, any]) => (
                      <div key={key} style={{ marginBottom: '15px' }}>
                        {texto.split('\n').map((line: string, lineIdx: number) => (
                          <p
                            key={lineIdx}
                            style={{
                              textAlign: 'justify',
                              fontSize: '13pt',
                              lineHeight: '1.5',
                              marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                              color: '#000',
                              fontFamily: "'Garamond', serif"
                            }}
                          >
                            {lineIdx === 0 && <strong>{key}- </strong>}
                            {line || '\u00A0'}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </Page>
              );
            }

            // Se houver 6, adiciona 5.10 junto
            const clause6 = clausesToRender.find(c => c.num === '6');
            if (clause5Late.length > 0 && clause6) {
              // Guarda para renderizar depois com 6
              (clause6 as any).clause5Late = clause5Late;
            } else if (clause5Late.length > 0) {
              // Se não houver 6, renderiza 5.10 sozinho
              renderedPages.push(
                <Page key="5-late" pageNumber={currentPageNum++}>
                  <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
                    {clause5Late.map(([key, texto]: [string, any]) => (
                      <div key={key} style={{ marginBottom: '15px' }}>
                        {texto.split('\n').map((line: string, lineIdx: number) => (
                          <p
                            key={lineIdx}
                            style={{
                              textAlign: 'justify',
                              fontSize: '13pt',
                              lineHeight: '1.5',
                              marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                              color: '#000',
                              fontFamily: "'Garamond', serif"
                            }}
                          >
                            {lineIdx === 0 && <strong>{key}- </strong>}
                            {line || '\u00A0'}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </Page>
              );
            }
            i++;
            continue;
          }

          // Caso especial: Cláusula 6 - adicionar 5.10 antes e separar 6.9
          if (currentNum === 6) {
            const clause6Items = sortSubItems(Object.entries(current.selected));
            const clause6Early = clause6Items.filter(([key]) => key !== '6.9');
            const clause6Late = clause6Items.filter(([key]) => key === '6.9');
            const clause5Late = (current as any).clause5Late || [];

            // Renderiza 5.10 + 6.1-6.8
            renderedPages.push(
              <Page key="6-with-510" pageNumber={currentPageNum++}>
                <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
                  {/* 5.10 primeiro se existir */}
                  {clause5Late.map(([key, texto]: [string, any]) => (
                    <div key={key} style={{ marginBottom: '15px' }}>
                      {texto.split('\n').map((line: string, lineIdx: number) => (
                        <p
                          key={lineIdx}
                          style={{
                            textAlign: 'justify',
                            fontSize: '13pt',
                            lineHeight: '1.5',
                            marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                            color: '#000',
                            fontFamily: "'Garamond', serif"
                          }}
                        >
                          {lineIdx === 0 && <strong>{key}- </strong>}
                          {line || '\u00A0'}
                        </p>
                      ))}
                    </div>
                  ))}
                  {/* Título da cláusula 6 */}
                  {clause5Late.length > 0 && (
                    <h2 style={{
                      fontSize: '13pt',
                      fontWeight: 'bold',
                      color: '#000',
                      borderBottom: '1pt solid #000',
                      paddingBottom: '8px',
                      marginBottom: '20px',
                      marginTop: '20px',
                      fontFamily: "'Garamond', serif"
                    }}>
                      {current.info.titulo}
                    </h2>
                  )}
                  {clause5Late.length === 0 && (
                    <h2 style={{
                      fontSize: '13pt',
                      fontWeight: 'bold',
                      color: '#000',
                      borderBottom: '1pt solid #000',
                      paddingBottom: '8px',
                      marginBottom: '20px',
                      marginTop: '0',
                      fontFamily: "'Garamond', serif"
                    }}>
                      {current.info.titulo}
                    </h2>
                  )}
                  {/* 6.1-6.8 */}
                  {clause6Early.map(([key, texto]: [string, any]) => (
                    <div key={key} style={{ marginBottom: '15px' }}>
                      {texto.split('\n').map((line: string, lineIdx: number) => (
                        <p
                          key={lineIdx}
                          style={{
                            textAlign: 'justify',
                            fontSize: '13pt',
                            lineHeight: '1.5',
                            marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                            color: '#000',
                            fontFamily: "'Garamond', serif"
                          }}
                        >
                          {lineIdx === 0 && <strong>{key}- </strong>}
                          {line || '\u00A0'}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </Page>
            );

            // 6.9 vai antes do 7.1 se houver
            if (clause6Late.length > 0) {
              const clause7 = clausesToRender.find(c => c.num === '7');
              if (clause7) {
                (clause7 as any).clause6Late = clause6Late;
              } else {
                // Se não houver 7, renderiza 6.9 sozinho
                renderedPages.push(
                  <Page key="6-late" pageNumber={currentPageNum++}>
                    <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
                      {clause6Late.map(([key, texto]: [string, any]) => (
                        <div key={key} style={{ marginBottom: '15px' }}>
                          {texto.split('\n').map((line: string, lineIdx: number) => (
                            <p
                              key={lineIdx}
                              style={{
                                textAlign: 'justify',
                                fontSize: '13pt',
                                lineHeight: '1.5',
                                marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                                color: '#000',
                                fontFamily: "'Garamond', serif"
                              }}
                            >
                              {lineIdx === 0 && <strong>{key}- </strong>}
                              {line || '\u00A0'}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </Page>
                );
              }
            }
            i++;
            continue;
          }

          // Caso especial: Cláusula 7 - adicionar 6.9 antes e separar 7.11-7.12
          if (currentNum === 7) {
            const clause7Items = sortSubItems(Object.entries(current.selected));
            const clause7Early = clause7Items.filter(([key]) => {
              const num = parseFloat(key.replace('7.', ''));
              return num >= 1 && num <= 10;
            });
            const clause7Late = clause7Items.filter(([key]) => {
              const num = parseFloat(key.replace('7.', ''));
              return num >= 11 && num <= 12;
            });
            const clause6Late = (current as any).clause6Late || [];

            // Renderiza 6.9 + 7.1-7.10
            renderedPages.push(
              <Page key="7-with-69" pageNumber={currentPageNum++}>
                <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
                  {/* 6.9 primeiro se existir */}
                  {clause6Late.map(([key, texto]: [string, any]) => (
                    <div key={key} style={{ marginBottom: '15px' }}>
                      {texto.split('\n').map((line: string, lineIdx: number) => (
                        <p
                          key={lineIdx}
                          style={{
                            textAlign: 'justify',
                            fontSize: '13pt',
                            lineHeight: '1.5',
                            marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                            color: '#000',
                            fontFamily: "'Garamond', serif"
                          }}
                        >
                          {lineIdx === 0 && <strong>{key}- </strong>}
                          {line || '\u00A0'}
                        </p>
                      ))}
                    </div>
                  ))}
                  {/* Título da cláusula 7 */}
                  <h2 style={{
                    fontSize: '13pt',
                    fontWeight: 'bold',
                    color: '#000',
                    borderBottom: '1pt solid #000',
                    paddingBottom: '8px',
                    marginBottom: '20px',
                    marginTop: clause6Late.length > 0 ? '20px' : '0',
                    fontFamily: "'Garamond', serif"
                  }}>
                    {current.info.titulo}
                  </h2>
                  {/* 7.1-7.10 */}
                  {clause7Early.map(([key, texto]: [string, any]) => (
                    <div key={key} style={{ marginBottom: '15px' }}>
                      {texto.split('\n').map((line: string, lineIdx: number) => (
                        <p
                          key={lineIdx}
                          style={{
                            textAlign: 'justify',
                            fontSize: '13pt',
                            lineHeight: '1.5',
                            marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                            color: '#000',
                            fontFamily: "'Garamond', serif"
                          }}
                        >
                          {lineIdx === 0 && <strong>{key}- </strong>}
                          {line || '\u00A0'}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </Page>
            );

            // 7.11-7.12 vai com 8 se houver
            if (clause7Late.length > 0) {
              const clause8 = clausesToRender.find(c => c.num === '8');
              if (clause8) {
                (clause8 as any).clause7Late = clause7Late;
              } else {
                // Se não houver 8, renderiza 7.11-7.12 sozinho
                renderedPages.push(
                  <Page key="7-late" pageNumber={currentPageNum++}>
                    <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
                      {clause7Late.map(([key, texto]: [string, any]) => (
                        <div key={key} style={{ marginBottom: '15px' }}>
                          {texto.split('\n').map((line: string, lineIdx: number) => (
                            <p
                              key={lineIdx}
                              style={{
                                textAlign: 'justify',
                                fontSize: '13pt',
                                lineHeight: '1.5',
                                marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                                color: '#000',
                                fontFamily: "'Garamond', serif"
                              }}
                            >
                              {lineIdx === 0 && <strong>{key}- </strong>}
                              {line || '\u00A0'}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </Page>
                );
              }
            }
            i++;
            continue;
          }

          // Caso especial: Cláusula 8 - adicionar 7.11-7.12 antes
          if (currentNum === 8) {
            const clause7Late = (current as any).clause7Late || [];
            const clause8Items = sortSubItems(Object.entries(current.selected));

            // Se faz parte do grupo 8-10, renderiza junto
            const isIn8_10Group = currentNum >= 8 && currentNum <= 10;
            if (isIn8_10Group) {
              // Já é tratado pelo grupo 8-10 acima
              i++;
              continue;
            }

            // Renderiza 7.11-7.12 + 8
            renderedPages.push(
              <Page key="8-with-7late" pageNumber={currentPageNum++}>
                <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
                  {/* 7.11-7.12 primeiro se existir */}
                  {clause7Late.map(([key, texto]: [string, any]) => (
                    <div key={key} style={{ marginBottom: '15px' }}>
                      {texto.split('\n').map((line: string, lineIdx: number) => (
                        <p
                          key={lineIdx}
                          style={{
                            textAlign: 'justify',
                            fontSize: '13pt',
                            lineHeight: '1.5',
                            marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                            color: '#000',
                            fontFamily: "'Garamond', serif"
                          }}
                        >
                          {lineIdx === 0 && <strong>{key}- </strong>}
                          {line || '\u00A0'}
                        </p>
                      ))}
                    </div>
                  ))}
                  {/* Título da cláusula 8 */}
                  <h2 style={{
                    fontSize: '13pt',
                    fontWeight: 'bold',
                    color: '#000',
                    borderBottom: '1pt solid #000',
                    paddingBottom: '8px',
                    marginBottom: '20px',
                    marginTop: clause7Late.length > 0 ? '20px' : '0',
                    fontFamily: "'Garamond', serif"
                  }}>
                    {current.info.titulo}
                  </h2>
                  {/* 8.x */}
                  {clause8Items.map(([key, texto]: [string, any]) => (
                    <div key={key} style={{ marginBottom: '15px' }}>
                      {texto.split('\n').map((line: string, lineIdx: number) => (
                        <p
                          key={lineIdx}
                          style={{
                            textAlign: 'justify',
                            fontSize: '13pt',
                            lineHeight: '1.5',
                            marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                            color: '#000',
                            fontFamily: "'Garamond', serif"
                          }}
                        >
                          {lineIdx === 0 && <strong>{key}- </strong>}
                          {line || '\u00A0'}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </Page>
            );
            i++;
            continue;
          }

          // Cláusulas normais (cada uma em sua própria página)
          renderedPages.push(
            <Page key={current.num} pageNumber={currentPageNum++}>
              <div style={{ maxWidth: '135mm', margin: '0 auto', width: '100%' }}>
                <h2 style={{
                  fontSize: '13pt',
                  fontWeight: 'bold',
                  color: '#000',
                  borderBottom: '1pt solid #000',
                  paddingBottom: '8px',
                  marginBottom: '20px',
                  marginTop: '0',
                  fontFamily: "'Garamond', serif"
                }}>
                  {current.info.titulo}
                </h2>

                {sortSubItems(Object.entries(current.selected))
                  .map(([key, texto]: [string, any]) => {
                    // Renderiza o texto do 4.6 (invertido: agora a tabela vai com o 4.6)
                    if (key === '4.6') {
                      return (
                        <React.Fragment key={key}>
                          <div style={{ marginBottom: '15px' }}>
                            {texto.split('\n').map((line: string, lineIdx: number) => (
                              <p
                                key={lineIdx}
                                style={{
                                  textAlign: 'justify',
                                  fontSize: '13pt',
                                  lineHeight: '1.5',
                                  marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                                  color: '#000',
                                  fontFamily: "'Garamond', serif"
                                }}
                              >
                                {lineIdx === 0 && <strong>{key}- </strong>}
                                {line || '\u00A0'}
                              </p>
                            ))}
                          </div>
                          {/* Tabela 4.6 logo após o texto */}
                          {Object.keys(tabela45ItemsData).length > 0 && (
                            <div style={{ marginTop: '30px', marginBottom: '15px' }}>
                              <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                border: '1px solid #000',
                                marginTop: '20px',
                                fontFamily: "'Garamond', serif"
                              }}>
                                <thead>
                                  <tr style={{ background: '#f9f9f9' }}>
                                    <th style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000', textAlign: 'center', fontWeight: 'bold' }}>ITEM</th>
                                    <th style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000', textAlign: 'center', fontWeight: 'bold' }}>DESCRIÇÃO</th>
                                    <th style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000', textAlign: 'center', fontWeight: 'bold' }}>CABIMENTO</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(tabela45ItemsData)
                                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                                    .map(([itemNum, item]: [string, any]) => (
                                      <tr key={itemNum}>
                                        <td style={{ border: '1px solid #000', padding: '8px', fontSize: '13pt', color: '#000', textAlign: 'center', fontWeight: 'bold' }}>
                                          {itemNum}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '8px', fontSize: '13pt', color: '#000' }}>
                                          {item.descricao}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '8px', fontSize: '13pt', color: '#000' }}>
                                          {item.cabimento}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>

                              {/* Textos a, b, c, d após tabela */}
                              <div style={{ marginTop: '20px' }}>
                                <p style={{ fontSize: '13pt', lineHeight: '1.5', color: '#000', fontFamily: "'Garamond', serif", textAlign: 'justify', marginBottom: '10px' }}>
                                  a) Os demais objetos contidos nas cláusulas do presente contrato terão os valores levantados após a disponibilização da documentação necessária para a efetivação do serviço, haja vista a natureza concomitante do trabalho desenvolvido.
                                </p>
                                <p style={{ fontSize: '13pt', lineHeight: '1.5', color: '#000', fontFamily: "'Garamond', serif", textAlign: 'justify', marginBottom: '10px' }}>
                                  b) Os valores levantados a título de incremento são provisórios, baseados em informações preliminares, podendo, ao final, representar valores a maior ou a menor.
                                </p>
                                <p style={{ fontSize: '13pt', lineHeight: '1.5', color: '#000', fontFamily: "'Garamond', serif", textAlign: 'justify', marginBottom: '10px' }}>
                                  c) Para efetivação da atualização do valor contratual previsto no parágrafo antecedente, ocorrerá mediante a celebração de aditamento, na forma prevista na Lei n.° 14.133/21.
                                </p>
                                <p style={{ fontSize: '13pt', lineHeight: '1.5', color: '#000', fontFamily: "'Garamond', serif", textAlign: 'justify', marginBottom: '10px' }}>
                                  d) Em nenhuma hipótese, o MUNICÍPIO DE BARROCAS/BA pagará à CONTRATADA antes que os valores sejam registrados nos cofres públicos.
                                </p>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    }
                    // Renderiza o texto do 17.1 com a tabela logo após
                    if (key === '17.1') {
                      return (
                        <React.Fragment key={key}>
                          <div style={{ marginBottom: '15px' }}>
                            {texto.split('\n').map((line: string, lineIdx: number) => (
                              <p
                                key={lineIdx}
                                style={{
                                  textAlign: 'justify',
                                  fontSize: '13pt',
                                  lineHeight: '1.5',
                                  marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                                  color: '#000',
                                  fontFamily: "'Garamond', serif"
                                }}
                              >
                                {lineIdx === 0 && <strong>{key}- </strong>}
                                {line || '\u00A0'}
                              </p>
                            ))}
                          </div>
                          {/* Tabela 17.1 logo após o texto */}
                          {Array.isArray(dotacao17) && dotacao17.length > 0 && (
                            <div style={{ marginTop: '30px', marginBottom: '15px' }}>
                              {dotacao17.map((dotacao: any, idx: number) => (
                                <table key={idx} style={{
                                  width: '100%',
                                  borderCollapse: 'collapse',
                                  border: '1px solid #000',
                                  marginTop: idx > 0 ? '20px' : '20px',
                                  fontFamily: "'Garamond', serif"
                                }}>
                                  <thead>
                                    <tr>
                                      <th colSpan={2} style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000', textAlign: 'center', fontWeight: 'bold' }}>
                                        DOTAÇÃO ORÇAMENTÁRIA
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {dotacao.dotacaoOrcamentaria && (
                                      <tr>
                                        <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000', fontWeight: 'bold' }}>DOTAÇÃO ORÇAMENTÁRIA</td>
                                        <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000' }}>{dotacao.dotacaoOrcamentaria}</td>
                                      </tr>
                                    )}
                                    {dotacao.unidOrcamentaria && (
                                      <tr>
                                        <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000', fontWeight: 'bold' }}>UNID. ORÇAMENTÁRIA</td>
                                        <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000' }}>{dotacao.unidOrcamentaria}</td>
                                      </tr>
                                    )}
                                    {dotacao.projetoAtividade && (
                                      <tr>
                                        <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000', fontWeight: 'bold' }}>PROJETO ATIVIDADE</td>
                                        <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000' }}>{dotacao.projetoAtividade}</td>
                                      </tr>
                                    )}
                                    {dotacao.categoria && (
                                      <tr>
                                        <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000', fontWeight: 'bold' }}>CATEGORIA</td>
                                        <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000' }}>{dotacao.categoria}</td>
                                      </tr>
                                    )}
                                    {dotacao.fonteRecurso && (
                                      <tr>
                                        <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000', fontWeight: 'bold' }}>FONTE DE RECURSO</td>
                                        <td style={{ border: '1px solid #000', padding: '10px', fontSize: '13pt', color: '#000' }}>{dotacao.fonteRecurso}</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              ))}
                            </div>
                          )}
                        </React.Fragment>
                      );
                    }
                    // Outros sub-itens normais
                    return (
                      <div key={key} style={{ marginBottom: '15px' }}>
                        {texto.split('\n').map((line: string, lineIdx: number) => (
                          <p
                            key={lineIdx}
                            style={{
                              textAlign: 'justify',
                              fontSize: '13pt',
                              lineHeight: '1.5',
                              marginBottom: lineIdx === texto.split('\n').length - 1 ? '10px' : '2px',
                              color: '#000',
                              fontFamily: "'Garamond', serif"
                            }}
                          >
                            {lineIdx === 0 && <strong>{key}- </strong>}
                            {line || '\u00A0'}
                          </p>
                        ))}
                      </div>
                    );
                  })}

              </div>
            </Page>
          );
          i++;
        }

        return renderedPages;
      })()}

      {/* PÁGINA FINAL: ASSINATURAS - Aparece após as cláusulas ou em página separada */}
      {(() => {
        const hasClause16_18 = ['16', '17', '18'].some(num => {
          const clauseSelected = clauseData[`clause${num}`] || {};
          return Object.keys(clauseSelected).length > 0;
        });

        // Se houver cláusulas 16-18, as assinaturas já estão na mesma página (incluídas no grupo)
        // Se não houver, cria página separada
        if (hasClause16_18) {
          return null; // Assinaturas já foram incluídas na página 16-18
        }

        return (
          <Page key="assinaturas" pageNumber={99}>
            <div style={{
              maxWidth: '135mm',
              margin: '0 auto',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              minHeight: '100%'
            }}>
              <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                <p style={{ fontSize: '13pt', color: '#000', marginBottom: '40px', fontFamily: "'Garamond', serif" }}>
                  Barrocas/BA_____ de dezembro de 2025.
                </p>

                <div style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginBottom: '8px' }}>
                      <p style={{ fontSize: '13pt', color: '#000', fontFamily: "'Garamond', serif", margin: 0 }}>
                        MUNICÍPIO DE BARROCAS/BA, representado por seu Prefeito,
                      </p>
                      <p style={{ fontSize: '13pt', color: '#000', fontFamily: "'Garamond', serif", margin: 0 }}>
                        Sr. JOSÉ ALMIR ARAÚJO QUEIROZ
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginBottom: '8px' }}>
                      <p style={{ fontSize: '13pt', color: '#000', fontFamily: "'Garamond', serif", margin: 0 }}>
                        CAVALCANTE REIS ADVOGADOS, representado pelo sócio-diretor, Sr.
                      </p>
                      <p style={{ fontSize: '13pt', color: '#000', fontFamily: "'Garamond', serif", margin: 0 }}>
                        IURI DO LAGO NOGUEIRA CAVALCANTE REIS,
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '60px' }}>
                  <p style={{ fontSize: '13pt', color: '#000', fontFamily: "'Garamond', serif", marginBottom: '20px' }}>
                    Testemunhas:
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '40px' }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginBottom: '8px' }}>
                        <p style={{ fontSize: '13pt', color: '#000', fontFamily: "'Garamond', serif", margin: 0 }}>
                          1ª___________________________
                        </p>
                        <p style={{ fontSize: '13pt', color: '#000', fontFamily: "'Garamond', serif", margin: '4px 0 0 0' }}>
                          CPF nº:
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginBottom: '8px' }}>
                        <p style={{ fontSize: '13pt', color: '#000', fontFamily: "'Garamond', serif", margin: 0 }}>
                          2ª___________________________
                        </p>
                        <p style={{ fontSize: '13pt', color: '#000', fontFamily: "'Garamond', serif", margin: '4px 0 0 0' }}>
                          CPF nº:
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Page>
        );
      })()}
    </div>
  );
};

// ========== COMPONENTE PRINCIPAL ==========
export default function MinutaGenerator({ onBackToHome, onLogout }: MinutaGeneratorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [options, setOptions] = useState({
    numeroContrato: "",
    numeroInexigibilidade: "",
    numeroProcesso: ""
  });
  const [selectedClause, setSelectedClause] = useState<string | null>(null);
  const [clauseData, setClauseData] = useState<any>({
    clause1: {},
    clause2: {},
    clause3: {},
    clause4: {},
    clause5: {},
    clause6: {},
    clause7: {},
    clause8: {},
    clause9: {},
    clause10: {},
    clause11: {},
    clause12: {},
    clause13: {},
    clause14: {},
    clause15: {},
    clause16: {},
    clause17: {},
    clause18: {},
    tabela45: {},
    dotacao17: []
  });
  const [percentual, setPercentual] = useState("R$ 0,20 (vinte centavos)");
  const [loadingDocx, setLoadingDocx] = useState(false); // Estado de loading ao gerar DOCX
  const [modal, setModal] = useState<any>({ open: false, title: "", message: "", type: "info" });
  const [modal45Open, setModal45Open] = useState(false);
  const [modal171Open, setModal171Open] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  // Event listeners para abrir modais
  useEffect(() => {
    const handleOpenModal45 = () => setModal45Open(true);
    const handleOpenModal171 = () => setModal171Open(true);

    window.addEventListener('openModal45', handleOpenModal45);
    window.addEventListener('openModal171', handleOpenModal171);

    return () => {
      window.removeEventListener('openModal45', handleOpenModal45);
      window.removeEventListener('openModal171', handleOpenModal171);
    };
  }, []);

  const handleUpdateClause = (key: string, value: any) => {
    setClauseData((prev: any) => ({ ...prev, [key]: value }));
  };

  // ========== HANDLER: BAIXAR DOCX DA MINUTA ==========
  // ========== DESCRIÇÃO GERAL ==========
  // Esta função gera um arquivo DOCX (Word) profissional usando a biblioteca docx
  // O documento é construído programaticamente, garantindo fidelidade total ao formato Word
  // ========== ESTRUTURA ==========
  // Seção 1: Capa (sem cabeçalho/rodapé padrão)
  // Seção 2: Todas as cláusulas (com cabeçalho mas SEM rodapé)
  // O Word quebra páginas automaticamente quando o conteúdo chega no limite A4
  // ========== DIFERENÇAS DA PROPOSTA ==========
  // - NÃO tem rodapé (apenas cabeçalho com logo)
  // - Usa imagem /barrocas.png no cabeçalho
  // - Conteúdo flui automaticamente sem quebras manuais
  const handleDownloadDocx = async () => {
    // ========== VALIDAÇÃO: CAMPOS OBRIGATÓRIOS ==========
    if (!options.numeroContrato || !options.numeroContrato.trim()) {
      setModal({
        open: true,
        title: "Atenção",
        message: "Por favor, preencha o número do contrato.",
        type: "error"
      });
      return;
    }

    if (!options.numeroInexigibilidade || !options.numeroInexigibilidade.trim()) {
      setModal({
        open: true,
        title: "Atenção",
        message: "Por favor, preencha o número da inexigibilidade.",
        type: "error"
      });
      return;
    }

    if (!options.numeroProcesso || !options.numeroProcesso.trim()) {
      setModal({
        open: true,
        title: "Atenção",
        message: "Por favor, preencha o número do processo administrativo.",
        type: "error"
      });
      return;
    }

    // ========== INICIALIZAÇÃO: ESTADO ==========
    setLoadingDocx(true);

    try {
      // ========== CARREGAMENTO: IMAGEM DO CABEÇALHO ==========
      // Carrega a imagem Barrocas para o cabeçalho (específica da Minuta)
      // IMPORTANTE: Minuta usa /barrocas.png, NÃO o logo Cavalcante Reis
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

      // Minuta usa APENAS a imagem barrocas.png (não usa logo Cavalcante Reis)
      const barrocasBuffer = await loadImageAsBuffer('/barrocas.png');

      // ========== CONSTRUÇÃO: CABEÇALHOS (PARIDADE COM PRÉVIA: 180pt) ==========
      // Cabeçalho da CAPA: Imagem Barrocas 180pt para paridade com prévia
      const headerCapa = new Header({
        children: barrocasBuffer ? [
          new Paragraph({
            children: [
              new ImageRun({
                data: barrocasBuffer,
                transformation: {
                  width: 180 * 9525, // 180pt em EMUs (paridade com prévia)
                  height: (180 * 9525) * 0.34, // Proporção aproximada
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 }, // Mais espaço após a imagem grande
          }),
        ] : [
          new Paragraph({ text: "" }) // Parágrafo vazio se não houver imagem
        ],
      });

      // Cabeçalho do CONTEÚDO: Imagem Barrocas 180pt para paridade com prévia
      const headerConteudo = new Header({
        children: barrocasBuffer ? [
          new Paragraph({
            children: [
              new ImageRun({
                data: barrocasBuffer,
                transformation: {
                  width: 180 * 9525, // 180pt em EMUs (paridade com prévia)
                  height: (180 * 9525) * 0.34, // Proporção aproximada
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }, // Espaço padrão após a imagem
          }),
        ] : [
          new Paragraph({ text: "" }) // Parágrafo vazio se não houver imagem
        ],
      });

      // ========== CONSTRUÇÃO: SEÇÃO 1 - CAPA ==========
      const capaChildren: any[] = [];

      capaChildren.push(
        createSimpleParagraph(`CONTRATO N° ${options.numeroContrato || "____________"}`, { bold: true }),
        createSimpleParagraph(`INEXIGIBILIDADE DE LICITAÇÃO N° ${options.numeroInexigibilidade || "_____________"}`, { bold: true }),
        createSimpleParagraph(`PROCESSO ADMINISTRATIVO N° ${options.numeroProcesso || "_____________________"}`, { bold: true, spacingAfter: 600 }),
        new Paragraph({ text: "", spacing: { after: 600 } }), // Espaço
        createSimpleParagraph(FIXED_COVER_TEXT, { alignment: AlignmentType.JUSTIFIED, spacingAfter: 600 }),
        new Paragraph({ text: "", spacing: { after: 600 } }), // Espaço
        createSimpleParagraph(DEFAULT_TEXT_PARTES, { alignment: AlignmentType.JUSTIFIED })
      );

      // ========== CONSTRUÇÃO: SEÇÃO 2 - CLÁUSULAS (COM CABEÇALHO, SEM RODAPÉ) ==========
      // Array que conterá todo o conteúdo das cláusulas
      // O Word vai quebrar páginas automaticamente quando chegar no limite A4
      const clausulasChildren: any[] = [];

      // Função auxiliar para processar texto com quebras de linha
      const processTextWithLineBreaks = (texto: string, keyPrefix?: string): Paragraph[] => {
        const lines = texto.split('\n');
        return lines
          .filter(line => line.trim() !== "")
          .map((line, idx) => {
            // Primeira linha pode ter o prefixo (ex: "1.1 - ")
            const content = idx === 0 && keyPrefix ? `${keyPrefix} ${line}` : line;
            return createSimpleParagraph(content || "\u00A0", {
              alignment: AlignmentType.JUSTIFIED,
              spacingAfter: idx === lines.length - 1 ? 300 : 200
            });
          });
      };

      // ========== CLÁUSULA 1 ==========
      const clause1Selected = Object.entries(clauseData.clause1 || {}).sort(([a], [b]) => a.localeCompare(b));
      if (clause1Selected.length > 0) {
        clausulasChildren.push(
          new Paragraph({
            text: "CLÁUSULA 1ª - DO OBJETO",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 400 },
          }),
          createSimpleParagraph(
            "É objeto do presente contrato o desenvolvimento de serviços advocatícios especializados por parte da CONTRATADA, CAVALCANTE REIS ADVOGADOS, ao CONTRATANTE, Município de BARROCAS, a fim de prestação de serviços de assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico, Financeiro e Previdenciário, atuando perante o Ministério da Fazenda e os seus órgãos administrativos, em especial para alcançar o incremento de receitas, ficando responsável pelo ajuizamento, acompanhamento e eventuais intervenções de terceiro em ações de interesse do Município.",
            { alignment: AlignmentType.JUSTIFIED, spacingAfter: 300 }
          )
        );

        clause1Selected.forEach(([key, item]: [string, any]) => {
          const texto = item.texto || item;
          if (typeof texto === 'string') {
            const paragraphs = processTextWithLineBreaks(texto, key);
            clausulasChildren.push(...paragraphs);
          }
        });

        clausulasChildren.push(new Paragraph({ text: "", spacing: { after: 400 } }));
      }

      // ========== CLÁUSULA 2 ==========
      const clause2Selected = Object.entries(clauseData.clause2 || {}).sort(([a], [b]) => a.localeCompare(b));
      if (clause2Selected.length > 0) {
        clausulasChildren.push(
          new Paragraph({
            text: "CLÁUSULA 2ª - DETALHAMENTO DO OBJETO E ESPECIFICAÇÕES DOS SERVIÇOS A SEREM EXECUTADOS",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 400 },
          })
        );

        clause2Selected.forEach(([key, item]: [string, any]) => {
          const texto = item.texto || item;
          if (typeof texto === 'string') {
            const paragraphs = processTextWithLineBreaks(texto, `${key}-`);
            clausulasChildren.push(...paragraphs);
          }
        });

        clausulasChildren.push(new Paragraph({ text: "", spacing: { after: 400 } }));
      }

      // ========== CLÁUSULAS 3-18 ==========
      const sortSubItems = (entries: [string, any][]): [string, any][] => {
        return entries.sort(([a], [b]) => {
          const numA = parseFloat(a.replace(/\D/g, ''));
          const numB = parseFloat(b.replace(/\D/g, ''));
          return numA - numB;
        });
      };

      // Usa valores padrão se não houver dados salvos
      const tabela45ItemsData = Object.keys(clauseData.tabela45 || {}).length > 0
        ? (clauseData.tabela45 || {})
        : tabela45Items;
      const dotacao17 = clauseData.dotacao17 || [];

      // Processa cada cláusula de 3 a 18
      for (const num of ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18']) {
        const clauseSelected = clauseData[`clause${num}`] || {};
        if (Object.keys(clauseSelected).length > 0) {
          const clauseInfo = allClauses[num];
          if (clauseInfo) {
            clausulasChildren.push(
              new Paragraph({
                text: clauseInfo.titulo,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 400 },
              })
            );

            const sortedItems = sortSubItems(Object.entries(clauseSelected));

            // Caso especial: Cláusula 4.6 - inclui tabela
            if (num === '4') {
              sortedItems.forEach(([key, item]: [string, any]) => {
                const texto = item.texto || item;
                if (typeof texto === 'string') {
                  if (key === '4.6') {
                    // Processa texto do 4.6
                    const paragraphs = processTextWithLineBreaks(texto, `${key}-`);
                    clausulasChildren.push(...paragraphs);

                    // Adiciona tabela 4.6 se houver itens
                    if (Object.keys(tabela45ItemsData).length > 0) {
                      const tableRows = [
                        new TableRow({
                          children: [
                            new TableCell({
                              children: [createSimpleParagraph("DESCRIÇÃO", { bold: true, alignment: AlignmentType.CENTER })],
                              shading: { fill: "F9F9F9" },
                            }),
                            new TableCell({
                              children: [createSimpleParagraph("CABIMENTO", { bold: true, alignment: AlignmentType.CENTER })],
                              shading: { fill: "F9F9F9" },
                            }),
                          ],
                        }),
                        ...Object.entries(tabela45ItemsData).map(([itemKey, item]: [string, any]) =>
                          new TableRow({
                            children: [
                              new TableCell({
                                children: [createSimpleParagraph(item.descricao || item, { alignment: AlignmentType.JUSTIFIED })],
                              }),
                              new TableCell({
                                children: [createSimpleParagraph(item.cabimento || "", { alignment: AlignmentType.JUSTIFIED })],
                              }),
                            ],
                          })
                        ),
                      ];

                      const tabela46Table = new Table({
                        rows: tableRows,
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                          top: { style: "single", size: 1, color: "000000" },
                          bottom: { style: "single", size: 1, color: "000000" },
                          left: { style: "single", size: 1, color: "000000" },
                          right: { style: "single", size: 1, color: "000000" },
                          insideHorizontal: { style: "single", size: 1, color: "000000" },
                          insideVertical: { style: "single", size: 1, color: "000000" },
                        },
                      });

                      clausulasChildren.push(tabela46Table);
                      clausulasChildren.push(new Paragraph({ text: "", spacing: { after: 300 } }));
                    }
                  } else {
                    const paragraphs = processTextWithLineBreaks(texto, `${key}-`);
                    clausulasChildren.push(...paragraphs);
                  }
                }
              });
            }
            // Caso especial: Cláusula 17 - inclui dotação orçamentária
            else if (num === '17') {
              sortedItems.forEach(([key, item]: [string, any]) => {
                const texto = item.texto || item;
                if (typeof texto === 'string') {
                  if (key === '17.1') {
                    clausulasChildren.push(
                      createSimpleParagraph(`${key}- ${texto}`, { alignment: AlignmentType.JUSTIFIED, spacingAfter: 300 })
                    );

                    // Adiciona itens da dotação se houver
                    if (Array.isArray(dotacao17) && dotacao17.length > 0) {
                      dotacao17.forEach((dotacao: any, idx: number) => {
                        clausulasChildren.push(
                          createSimpleParagraph(`${dotacao.descricao || dotacao}`, { alignment: AlignmentType.LEFT, spacingAfter: 200 })
                        );
                      });
                      clausulasChildren.push(new Paragraph({ text: "", spacing: { after: 300 } }));
                    }
                  } else {
                    const paragraphs = processTextWithLineBreaks(texto, `${key}-`);
                    clausulasChildren.push(...paragraphs);
                  }
                }
              });
            }
            // Cláusulas normais
            else {
              sortedItems.forEach(([key, item]: [string, any]) => {
                const texto = item.texto || item;
                if (typeof texto === 'string') {
                  const paragraphs = processTextWithLineBreaks(texto, `${key}-`);
                  clausulasChildren.push(...paragraphs);
                }
              });
            }

            clausulasChildren.push(new Paragraph({ text: "", spacing: { after: 400 } }));
          }
        }
      }

      // ========== ASSINATURAS (Cláusulas 16-18 ou final) ==========
      // Verifica se há cláusulas 16, 17 ou 18 para incluir assinaturas
      const hasClause16 = Object.keys(clauseData.clause16 || {}).length > 0;
      const hasClause17 = Object.keys(clauseData.clause17 || {}).length > 0;
      const hasClause18 = Object.keys(clauseData.clause18 || {}).length > 0;

      if (hasClause16 || hasClause17 || hasClause18) {
        clausulasChildren.push(
          createSimpleParagraph("Barrocas/BA_____ de dezembro de 2025.", { spacingAfter: 800 }),
          createSimpleParagraph("MUNICÍPIO DE BARROCAS/BA, representado por seu Prefeito,", { alignment: AlignmentType.CENTER, spacingAfter: 200 }),
          createSimpleParagraph("Sr. JOSÉ ALMIR ARAÚJO QUEIROZ", { alignment: AlignmentType.CENTER, spacingAfter: 600 }),
          createSimpleParagraph("CAVALCANTE REIS ADVOGADOS, representado pelo sócio-diretor, Sr.", { alignment: AlignmentType.CENTER, spacingAfter: 200 }),
          createSimpleParagraph("IURI DO LAGO NOGUEIRA CAVALCANTE REIS,", { alignment: AlignmentType.CENTER, spacingAfter: 600 }),
          createSimpleParagraph("Testemunhas:", { spacingAfter: 600 }),
          createSimpleParagraph("1ª___________________________", { alignment: AlignmentType.CENTER, spacingAfter: 200 }),
          createSimpleParagraph("CPF nº:", { alignment: AlignmentType.CENTER, spacingAfter: 600 }),
          createSimpleParagraph("2ª___________________________", { alignment: AlignmentType.CENTER, spacingAfter: 200 }),
          createSimpleParagraph("CPF nº:", { alignment: AlignmentType.CENTER })
        );
      }

      // ========== CRIAÇÃO: DOCUMENTO WORD COM MÚLTIPLAS SEÇÕES ==========
      // Cria o documento final com seções separadas para capa e cláusulas
      const doc = new Document({
        sections: [
          // ========== SEÇÃO 1: CAPA (COM cabeçalho GRANDE, SEM rodapé) ==========
          {
            properties: {
              type: SectionType.NEXT_PAGE, // Garante que a próxima seção comece em nova página
              page: {
                size: {
                  orientation: "portrait",
                  width: 11906, // A4 (210mm)
                  height: 16838, // A4 (297mm)
                },
                // Margens da capa: top/bottom 2.5cm, left 3cm, right 2.5cm (1cm ≈ 567 twips)
                margin: {
                  top: 1417,   // 2.5cm (cabeçalho GRANDE)
                  right: 1417, // 2.5cm
                  bottom: 1417, // 2.5cm (Minuta não tem rodapé)
                  left: 1701,  // 3cm
                },
              },
            },
            // Cabeçalho com logo GRANDE (~220px) na capa
            headers: {
              default: headerCapa,
            },
            // NOTA: Não definimos 'footers', então NÃO terá rodapé (como solicitado)
            // Conteúdo da capa
            children: capaChildren,
          },
          // ========== SEÇÃO 2: CLÁUSULAS (fluxo contínuo) ==========
          // Conteúdo em sequência; o Word quebra página ao atingir a margem inferior.
          // Minuta não tem rodapé; bottom 2.5cm é suficiente.
          {
            properties: {
              type: SectionType.CONTINUOUS, // Fluxo contínuo após a capa
              page: {
                size: {
                  orientation: "portrait",
                  width: 11906, // A4 (210mm)
                  height: 16838, // A4 (297mm)
                },
                // Margens: top 2.5cm (cabeçalho), bottom 2.5cm, left 2.5cm, right 2cm
                margin: {
                  top: 1417,   // 2.5cm (cabeçalho não sobrepõe texto)
                  right: 1134, // 2cm
                  bottom: 1417, // 2.5cm (sem rodapé)
                  left: 1417,  // 2.5cm
                },
              },
            },
            // Cabeçalho com logo PEQUENO/PADRÃO (~100px) no conteúdo
            headers: {
              default: headerConteudo,
            },
            // NOTA: Não definimos 'footers', então NÃO terá rodapé (como solicitado)
            // Todo o conteúdo das cláusulas: o Word quebra páginas automaticamente
            children: clausulasChildren,
          },
        ],
        styles: {
          default: {
            document: {
              run: {
                font: "Garamond",
                size: 26, // 13pt (docx usa meios-pontos: 13 * 2 = 26)
              },
            },
          },
        },
      });

      // ========== GERAÇÃO E DOWNLOAD: DOCX ==========
      // Gera o blob do documento e faz o download
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Minuta_BARROCAS.docx`);

      // ========== FEEDBACK: SUCESSO ==========
      setModal({
        open: true,
        title: "Sucesso",
        message: "Minuta gerada e baixada com sucesso!",
        type: "success"
      });

    } catch (e: any) {
      // ========== TRATAMENTO: ERRO ==========
      console.error('Erro ao gerar Minuta:', e);
      setModal({
        open: true,
        title: "Erro",
        message: `Erro ao gerar Minuta: ${e.message || 'Erro desconhecido'}. Tente novamente.`,
        type: "error"
      });
    } finally {
      // ========== FINALIZAÇÃO: DESATIVA LOADING ==========
      setLoadingDocx(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando Gerador de Minuta...</p>
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
          <h1>Gerador de Minuta</h1>
        </div>
        <button onClick={onLogout} className="theme-btn" title="Sair">
          <LogOut size={20} color="#227056" />
        </button>
      </header>

      <main className="main" style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
        {/* Menu de Cláusulas (Esquerda) */}
        <ClausesMenu
          selectedClause={selectedClause}
          onSelectClause={setSelectedClause}
        />

        {/* Conteúdo Central: Preview + Controles */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ display: 'flex', width: '100%' }}>
            {/* Barra de Controles (Esquerda dentro do conteúdo) */}
            <ControlsSidebar
              options={options}
              setOptions={setOptions}
              percentual={percentual}
              setPercentual={setPercentual}
              onStartFromScratch={() => {
                setOptions({
                  numeroContrato: "",
                  numeroInexigibilidade: "",
                  numeroProcesso: ""
                });
                setClauseData({
                  clause1: {},
                  clause2: {},
                  clause3: {},
                  clause4: {},
                  clause5: {},
                  clause6: {},
                  clause7: {},
                  clause8: {},
                  clause9: {},
                  clause10: {},
                  clause11: {},
                  clause12: {},
                  clause13: {},
                  clause14: {},
                  clause15: {},
                  clause16: {},
                  clause17: {},
                  clause18: {},
                  tabela45: {},
                  dotacao17: []
                });
                setSelectedClause(null);
              }}
              onDownloadDocx={handleDownloadDocx}
              loadingDocx={loadingDocx}
            />

            {/* Preview */}
            <div className="content" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <h2 className="preview-title">Documento da Minuta</h2>
              <MinutaDocument
                key={JSON.stringify(clauseData)} // Força re-renderização quando clauseData muda
                options={options}
                clauseData={clauseData}
                percentual={percentual}
              />
            </div>
          </div>

          {/* Barra Lateral de Edição (Direita) */}
          {selectedClause && (
            <EditSidebar
              clause={selectedClause}
              onClose={() => setSelectedClause(null)}
              onUpdateClause={handleUpdateClause}
              clauseData={clauseData}
            />
          )}
        </div>

        <Modal {...modal} onConfirm={() => setModal({ ...modal, open: false })} />

        {/* Modais para tabelas 4.5 e 17.1 */}
        <ModalTabela45
          open={modal45Open}
          onClose={() => setModal45Open(false)}
          tabelaItems={clauseData.tabela45 || {}}
          onUpdate={(items: any) => handleUpdateClause('tabela45', items)}
        />
        <ModalTabela171
          open={modal171Open}
          onClose={() => setModal171Open(false)}
          dotacaoItems={clauseData.dotacao17 || []}
          onUpdate={(items: any) => handleUpdateClause('dotacao17', items)}
        />
      </main>
    </div>
  );
}
