import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, ImageRun, Footer, WidthType, BorderStyle, PageBreak } from 'docx';
import * as fs from 'fs';
import * as path from 'path';

export async function generatePropostaDocx(data: any): Promise<Buffer> {
  const {
    municipio,
    destinatario,
    data: dataProposta,
    prazo,
    paymentValue,
    services,
    footerOffices,
  } = data;

  const defaultFont = 'EB Garamond';
  const defaultSize = 22; // 11pt
  const titleSize = 32; // 16pt

  const publicDir = path.join(process.cwd(), 'public');
  const logoBuffer = fs.readFileSync(path.join(publicDir, 'logo-cavalcante-reis.png'));
  const mun01Buffer = fs.readFileSync(path.join(publicDir, 'munincipios01.png'));
  const mun02Buffer = fs.readFileSync(path.join(publicDir, 'Munincipios02.png'));
  const assinaturaBuffer = fs.readFileSync(path.join(publicDir, 'Assinatura.png'));

  const createFooter = () => {
    const enabledOffices = [];
    if (footerOffices) {
      if (footerOffices.rj?.enabled) enabledOffices.push(footerOffices.rj);
      if (footerOffices.df?.enabled) enabledOffices.push(footerOffices.df);
      if (footerOffices.sp?.enabled) enabledOffices.push(footerOffices.sp);
      if (footerOffices.am?.enabled) enabledOffices.push(footerOffices.am);
    }

    // Se não houver escritórios habilitados, usa apenas DF como padrão
    if (enabledOffices.length === 0) {
      enabledOffices.push({
        cidade: 'Brasília - DF',
        linha1: 'SHIS QL 10, Conj. 06, Casa 19',
        linha2: 'Lago Sul,',
        linha3: 'CEP: 71630-065'
      });
    }

    // Células do rodapé - LADO A LADO (igual à prévia com flexbox row)
    // CRÍTICO: UM ÚNICO Paragraph por escritório para ficar lado a lado
    const footerCells = enabledOffices.map(office =>
      new TableCell({
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
        margins: { top: 0, bottom: 0, left: 30, right: 30 }, // Margens mínimas
        children: [
          // UM ÚNICO Paragraph com todo o conteúdo do escritório
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 }, // ZERO espaçamento
            children: [
              new TextRun({ text: office.cidade.toUpperCase(), bold: true, font: defaultFont, size: 16 }),
              new TextRun({ text: '\n', break: 1 }), // Quebra de linha
              new TextRun({ text: office.linha1, font: defaultFont, size: 14 }),
              new TextRun({ text: '\n', break: 1 }),
              new TextRun({ text: office.linha2, font: defaultFont, size: 14 }),
              new TextRun({ text: '\n', break: 1 }),
              new TextRun({ text: office.linha3, font: defaultFont, size: 14 }),
            ],
          }),
        ],
      })
    );

    // RODAPÉ: Escritórios LADO A LADO (igual à prévia - flexbox row)
    // Table com UMA LINHA para garantir que fiquem lado a lado horizontalmente
    const numOffices = enabledOffices.length || 1;

    return new Footer({
      children: [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE }
          },
          // CRÍTICO: columnWidths em twips para garantir lado a lado
          // Largura total da página A4 ≈ 11906 twips (210mm)
          // Dividir igualmente entre os escritórios
          columnWidths: numOffices > 0
            ? Array(numOffices).fill(Math.floor(11906 / numOffices))
            : [11906],
          rows: [
            new TableRow({
              children: footerCells,
              cantSplit: true, // CRÍTICO: não quebrar a linha (mantém lado a lado)
            })
          ],
        }),
        // Linha horizontal antes do site (igual à prévia)
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 50 },
          border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'D0D0D0' } },
        }),
        // Site em caixa com bordas (igual à prévia)
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [
            new TextRun({
              text: 'WWW.CAVALCANTE-REIS.ADV.BR',
              bold: true,
              font: defaultFont,
              size: 18,
              color: '000000',
            }),
          ],
          // Borda ao redor (caixa da prévia)
          border: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'D0D0D0' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D0D0D0' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'D0D0D0' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'D0D0D0' }
          },
          shading: { fill: 'FFFFFF' },
        }),
      ],
    });
  };

  const docChildren = [];

  // --- PÁGINA 1: CAPA ---
  // Logo centralizado no topo - 170px de largura (mantém proporção)
  if (logoBuffer) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 2000, after: 1000 },
        children: [new ImageRun({ data: logoBuffer, transformation: { width: 170, height: 170 * 0.512 } } as any)], // 170px largura, proporção ~0.512
      })
    );
  }

  // Linha superior - BORDA PRETA SUPERIOR GRANDE (igual à prévia)
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 2000, after: 400 },
      border: { top: { style: BorderStyle.SINGLE, size: 12, color: '000000' } },
      indent: { right: 0 }, // Garantir que a linha apareça
    })
  );

  // Proponente (alinhado à direita) com borda inferior
  docChildren.push(
    new Paragraph({
      children: [new TextRun({ text: 'Proponente:', bold: true, font: defaultFont, size: 24 })],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: 'Cavalcante Reis Advogados',
      alignment: AlignmentType.RIGHT,
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' } },
    })
  );

  // Destinatário (alinhado à direita) com borda inferior
  docChildren.push(
    new Paragraph({
      children: [new TextRun({ text: 'Destinatário:', bold: true, font: defaultFont, size: 24 })],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: destinatario || `Prefeitura Municipal de ${municipio}`,
      alignment: AlignmentType.RIGHT,
      spacing: { after: 400 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' } },
    })
  );

  // Linha inferior - BORDA PRETA INFERIOR GRANDE com ano colado (igual à prévia)
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 0 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: '000000' } },
      indent: { right: 0 }, // Garantir que a linha apareça
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 200 },
      children: [new TextRun({ text: dataProposta || new Date().getFullYear().toString(), bold: true, font: defaultFont, size: 32 })],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // --- PÁGINA 2: SUMÁRIO ---
  docChildren.push(
    new Paragraph({
      spacing: { after: 300 },
      children: [new TextRun({ text: 'Sumário', bold: true, font: defaultFont, size: titleSize })],
    }),
    new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: '1. Objeto da Proposta', bold: true, font: defaultFont, size: 26 })] }),
    new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: '2. Análise da Questão', bold: true, font: defaultFont, size: 26 })] }),
    new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: '3. Dos Honorários, das Condições de Pagamento e Despesas', bold: true, font: defaultFont, size: 26 })] }),
    new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: '4. Prazo e Cronograma de Execução dos Serviços', bold: true, font: defaultFont, size: 26 })] }),
    new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: '5. Experiência e Equipe Responsável', bold: true, font: defaultFont, size: 26 })] }),
    new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: '6. Disposições Finais', bold: true, font: defaultFont, size: 26 })] }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // --- PÁGINA 3: OBJETO ---
  docChildren.push(
    new Paragraph({
      spacing: { after: 300 },
      border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
      children: [new TextRun({ text: '1. Objeto da Proposta', bold: true, font: defaultFont, size: titleSize })],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 200, after: 50 }, // REDUZIDO: 50 após (texto corrido)
      children: [
        new TextRun({
          text: `É objeto do presente contrato o desenvolvimento de serviços advocatícios especializados por parte da Proponente, Cavalcante Reis Advogados, ao Aceitante, Município de ${municipio}, a fim de prestação de serviços de assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico, Financeiro, Previdenciário, atuando perante o Ministério da Fazenda e os seus órgãos administrativos, em especial para alcançar o incremento de receitas, ficando responsável pelo ajuizamento, acompanhamento e eventuais intervenções de terceiro em ações de interesse do Município.`,
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 50, after: 50 }, // REDUZIDO: 50 (texto corrido)
      children: [
        new TextRun({
          text: 'A proposta inclui os seguintes objetos:',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    })
  );

  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ shading: { fill: 'F7F7F7' }, children: [new Paragraph({ children: [new TextRun({ text: 'TESE', bold: true, font: defaultFont, size: 22 })] })] }),
        new TableCell({ shading: { fill: 'F7F7F7' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'CABIMENTO', bold: true, font: defaultFont, size: 22 })] })] }),
      ],
    }),
  ];

  services.forEach((s: any) => {
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.label, font: defaultFont, size: 20 })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: s.cabimento, font: defaultFont, size: 20 })] })] }),
        ],
      }),
    );
  });

  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: 'Além disso, a proposta também tem como objeto:',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 50, after: 0 }, // REDUZIDO: 50 antes, 0 após (texto corrido)
      children: [
        new TextRun({ text: '(i) Análise do caso concreto, com a elaboração dos estudos pertinentes ao Município de ', font: defaultFont, size: defaultSize }),
        new TextRun({ text: municipio, font: defaultFont, size: defaultSize, bold: true }),
        new TextRun({ text: ';', font: defaultFont, size: defaultSize }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 50, after: 0 }, // REDUZIDO: 50 antes, 0 após (texto corrido)
      children: [
        new TextRun({
          text: '(ii) Análise e coleta dos documentos fornecidos pela municipalidade que irão gerar subsídios para os pleitos do incremento de receita relativo ao CFEM no critério de produção afetação e/ou limítrofe;',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 50, after: 0 }, // REDUZIDO: 50 antes, 0 após (texto corrido)
      children: [
        new TextRun({
          text: '(iii) Ingresso de medida administrativa perante a ANM e/ou judicial, com posterior acompanhamento do processo durante sua tramitação, com realização de defesas, diligências, manifestação em razão de intimações, produção de provas, recursos e demais atos necessários ao deslinde dos feitos;',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 50, after: 0 }, // REDUZIDO: 50 antes, 0 após (texto corrido)
      children: [
        new TextRun({
          text: '(iv) Atuação perante a Justiça Federal seja na condição de recorrente ou recorrido, bem como interposição de recursos ou apresentação de contrarrazões aos Tribunais Superiores, se necessário for;',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 50, after: 0 }, // REDUZIDO: 50 antes, 0 após (texto corrido)
      children: [
        new TextRun({
          text: '(v) Acompanhamento processual completo, até o trânsito em Julgado da Sentença administrativa e/ou judicial;',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 50, after: 0 }, // REDUZIDO: 50 antes, 0 após (texto corrido)
      children: [
        new TextRun({
          text: '(vi) Acompanhamento do cumprimento das medidas administrativas e/ou judiciais junto aos órgãos administrativos, sobretudo na ANM.',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // --- PÁGINAS DE ANÁLISE ---
  // Tópico 2: fluxo contínuo entre subitens (sem PageBreak entre eles)
  services.forEach((s: any, index: number) => {
    if (index === 0) {
      docChildren.push(
        new Paragraph({
          spacing: { after: 300 },
          border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
          children: [new TextRun({ text: '2. Análise da Questão', bold: true, font: defaultFont, size: titleSize })],
        }),
      );
    }
    docChildren.push(
      new Paragraph({
        spacing: { before: index === 0 ? 400 : 50, after: 0 }, // REDUZIDO: 50 entre itens (texto corrido)
        children: [new TextRun({ text: `2.${index + 1} – ${s.label}`, bold: true, font: defaultFont, size: 26 })],
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 50 }, // REDUZIDO: 50 após (texto corrido, não separado)
        children: [new TextRun({ text: s.content?.replace(/<[^>]+>/g, '') || '', font: defaultFont, size: defaultSize })],
      })
      // REMOVIDO: PageBreak() - deixar fluir continuamente entre subitens do tópico 2
    );
  });
  // Quebra de página apenas após TODOS os subitens do tópico 2
  docChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // --- HONORÁRIOS E DEMAIS ---
  docChildren.push(
    new Paragraph({
      spacing: { after: 300 },
      border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
      children: [new TextRun({ text: '3. Dos Honorários, das Condições de Pagamento e Despesas', bold: true, font: defaultFont, size: titleSize })],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 200, after: 50 }, // REDUZIDO: 50 após (texto corrido)
      children: [
        new TextRun({
          text: 'Os valores levantados a título de incremento são provisórios, baseados em informações preliminares, podendo, ao final, representar valores a maior ou a menor.',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 0, after: 50 }, // REDUZIDO: 50 após (texto corrido)
      children: [
        new TextRun({
          text: 'Considerando a necessidade de manutenção do equilíbrio econômico-financeiro do contrato administrativo, propõe o escritório CAVALCANTE REIS ADVOGADOS que esta Municipalidade pague ao Proponente da seguinte forma:',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 0, after: 50 }, // REDUZIDO: 50 após (texto corrido)
      children: [
        new TextRun({ text: '3.1.1. ', font: defaultFont, size: defaultSize, bold: true }),
        new TextRun({
          text: 'Para todos os demais itens descritos nesta Proposta será efetuado o pagamento de honorários advocatícios à CAVALCANTE REIS ADVOGADOS pela execução dos serviços de recuperação de créditos, ',
          font: defaultFont,
          size: defaultSize,
        }),
        new TextRun({ text: 'ad êxito', font: defaultFont, size: defaultSize, bold: true }),
        new TextRun({
          text: ` na ordem de R$ 0,12 (doze centavos) para cada R$ 1,00 (um real) do montante referente ao incremento financeiro, ou seja, com base nos valores que entrarem nos cofres do CONTRATANTE;`,
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 0, after: 50 }, // REDUZIDO: 50 após (texto corrido)
      children: [
        new TextRun({ text: '3.1.2. ', font: defaultFont, size: defaultSize, bold: true }),
        new TextRun({
          text: 'Em caso de valores retroativos recuperados em favor da municipalidade, que consiste nos valores não repassados em favor do Contratante nos últimos 5 (cinco) anos (prescrição quinquenal) ou não abarcados pela prescrição, também serão cobrados honorários advocatícios na ordem de R$ 0,12 (doze centavos) para cada R$ 1,00 (um real) do montante recuperado aos Cofres Municipais.',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 0, after: 50 }, // REDUZIDO: 50 após (texto corrido)
      children: [
        new TextRun({ text: '3.1.3. ', font: defaultFont, size: defaultSize, bold: true }),
        new TextRun({
          text: 'Sendo um contrato ',
          font: defaultFont,
          size: defaultSize,
        }),
        new TextRun({ text: 'AD EXITUM', font: defaultFont, size: defaultSize, bold: true }),
        new TextRun({
          text: ', acaso o incremento financeiro em favor deste Município supere o valor mencionado na cláusula que trata do valor do contrato, os desembolsos não poderão ser previstos por dotação orçamentária, posto que terão origem na ',
          font: defaultFont,
          size: defaultSize,
        }),
        new TextRun({ text: 'REDUÇÃO DE DESPESAS/INCREMENTO DE RECEITAS', font: defaultFont, size: defaultSize, bold: true }),
        new TextRun({
          text: ', como consequência da prestação dos serviços.',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),
    // REMOVIDO: PageBreak() entre tópico 3 e 4 - devem ficar juntos
    new Paragraph({
      spacing: { before: 200, after: 200 }, // Reduzido: espaçamento menor para ficarem juntos
      border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
      children: [new TextRun({ text: '4. Prazo e Cronograma de Execução dos Serviços', bold: true, font: defaultFont, size: titleSize })],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: `O prazo de execução será de ${prazo} (vinte e quatro) meses`, font: defaultFont, size: defaultSize, bold: true }),
        new TextRun({ text: ' ou pelo tempo que perdurar os processos judiciais, podendo ser prorrogado por interesse das partes, com base no art. 107 da Lei n.º 14.133/21.', font: defaultFont, size: defaultSize }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] }),

    new Paragraph({
      spacing: { after: 300 },
      border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
      children: [new TextRun({ text: '5. Experiência e Equipe Responsável', bold: true, font: defaultFont, size: titleSize })],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: 'No portfólio de serviços executados e/ou em execução, constam os seguintes Municípios contratantes:',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),
    ...(mun01Buffer ? [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
      children: [new ImageRun({ data: mun01Buffer, transformation: { width: 600, height: 300 } } as any)], // 600px cabe dentro da margem A4 (~159mm útil)
    })] : []),
    ...(mun02Buffer ? [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
      children: [new ImageRun({ data: mun02Buffer, transformation: { width: 600, height: 216 } } as any)], // mantém proporção 800:288 → 600:216
    })] : []),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: 'Para coordenar os trabalhos de consultoria propostos neste documento, a CAVALCANTE REIS ADVOGADOS alocará os seguintes profissionais:',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),

    // Profissional 1: IURI DO LAGO NOGUEIRA CAVALCANTE REIS
    new Paragraph({
      children: [
        new TextRun({ text: 'IURI DO LAGO NOGUEIRA CAVALCANTE REIS', bold: true, font: defaultFont, size: 24 }),
      ],
      spacing: { before: 200, after: 0 },
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 0, after: 150 },
      children: [
        new TextRun({
          text: 'Doutorando em Direito e Mestre em Direito Econômico e Desenvolvimento pelo Instituto Brasileiro de Ensino, Desenvolvimento e Pesquisa (IDP/Brasília). LLM (Master of Laws) em Direito Empresarial pela Fundação Getúlio Vargas (FGV/RJ). Integrante da Comissão de Juristas do Senado Federal criada para consolidar a proposta do novo Código Comercial Brasileiro. Autor e Coautor de livros, pareceres e artigos jurídicos na área do direito público. Sócio-diretor do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: iuri@cavalcantereis.adv.br).',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),

    // Profissional 2: PEDRO AFONSO FIGUEIREDO DE SOUZA
    new Paragraph({
      children: [
        new TextRun({ text: 'PEDRO AFONSO FIGUEIREDO DE SOUZA', bold: true, font: defaultFont, size: 24 }),
      ],
      spacing: { before: 100, after: 0 },
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 0, after: 150 },
      children: [
        new TextRun({
          text: 'Graduado em Direito pela Pontifícia Universidade Católica de Minas Gerais. Especialista em Direito Penal e Processo Penal pela Academia Brasileira de Direito Constitucional. Mestre em Direito nas Relações Econômicas e Sociais pela Faculdade de Direito Milton Campos. Diretor de Comunicação e Conselheiro Consultivo, Científico e Fiscal do Instituto de Ciências Penais. Autor de artigos e capítulos de livros jurídicos. Advogado associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: pedro@cavalcantereis.adv.br).',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),

    // Profissional 3: GABRIEL GAUDÊNCIO ZANCHETTA CALIMAN
    new Paragraph({
      children: [
        new TextRun({ text: 'GABRIEL GAUDÊNCIO ZANCHETTA CALIMAN', bold: true, font: defaultFont, size: 24 }),
      ],
      spacing: { before: 100, after: 0 },
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 0, after: 150 },
      children: [
        new TextRun({
          text: 'Graduado em Direito pelo Centro Universitário de Brasília (UniCeub). Especialista em Gestão Pública e Tributária pelo Gran Centro Universitário. Membro da Comissão de Assuntos Tributários da OAB/DF. Advogado associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: gabrielcaliman@cavalcantereis.adv.br).',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),

    // Profissional 4: RYSLHAINY DOS SANTOS CORDEIRO
    new Paragraph({
      children: [
        new TextRun({ text: 'RYSLHAINY DOS SANTOS CORDEIRO', bold: true, font: defaultFont, size: 24 }),
      ],
      spacing: { before: 100, after: 0 },
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: 'Graduada em Direito pelo Centro Universitário ICESP. Pós-graduada em Direito Civil e Processo Civil, Direito Tributário e Processo Tributário e Planejamento Tributário (Faculdade Legale). Advogada associada do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: ryslhainy@cavalcantereis.adv.br).',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),

    // Texto "Além desses profissionais..."
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 100, after: 200 },
      children: [
        new TextRun({
          text: 'Além desses profissionais, a CAVALCANTE REIS ADVOGADOS alocará uma equipe de profissionais pertencentes ao seu quadro técnico, utilizando, também, caso necessário, o apoio técnico especializado de terceiros, pessoas físicas ou jurídicas, que deverão atuar sob sua orientação, cabendo à CAVALCANTE REIS ADVOGADOS a responsabilidade técnica pela execução das tarefas.',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: 'Nossa contratação, portanto, devido à altíssima qualificação e experiência, aliada à singularidade do objeto da demanda, bem como os diferenciais já apresentados acima, está inserida dentre as hipóteses do art. 6°, XVIII "e" e art. 74, III, "e", da Lei n.º 14.133/2021.',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
    }),

    new Paragraph({ children: [new PageBreak()] }),

    new Paragraph({
      spacing: { after: 300 },
      border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
      children: [new TextRun({ text: '6. Disposições Finais', bold: true, font: defaultFont, size: titleSize })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1000 },
      children: [
        new TextRun({ text: `Brasília-DF, ${dataProposta}.`, font: defaultFont, size: defaultSize }),
        new TextRun({ break: 2, text: 'Atenciosamente,', font: defaultFont, size: defaultSize }),
      ],
    }),
    ...(assinaturaBuffer ? [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [new ImageRun({ data: assinaturaBuffer, transformation: { width: 180, height: 60 } } as any)],
    })] : []),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'CAVALCANTE REIS ADVOGADOS', bold: true, font: defaultFont, size: 24 })],
    })
  );

  const doc = new Document({
    creator: 'CAVALCANTE REIS',
    title: `Proposta - ${municipio}`,
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1417,    // 2.5cm
            right: 1417,
            bottom: 2268, // 4cm — espaço suficiente para rodapé com 4 cidades
            left: 1417,
            footer: 709,  // 1.25cm — distância do fim da folha ao rodapé
          },
        }
      },
      footers: { default: createFooter() },
      children: docChildren,
    }],
  });

  return await Packer.toBuffer(doc);
}
