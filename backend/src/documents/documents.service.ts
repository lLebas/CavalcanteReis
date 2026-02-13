import { Injectable } from '@nestjs/common';
import * as mammoth from 'mammoth';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  ImageRun,
  Footer,
  Header,
  WidthType,
  BorderStyle,
  PageBreak,
  HeightRule,
} from 'docx';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  async processDocx(
    buffer: Buffer,
    municipio?: string,
    data?: string,
  ): Promise<Buffer> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      let text = result.value;

      if (municipio) {
        text = text.replace(/Brasileira|Corrente|Jaic[oó]s/gi, municipio);
      }

      if (data) {
        text = text.replace(/\d{1,2}\s+de\s+\w+\s+de\s+\d{4}/g, data);
      }

      const lines = text.split(/\r?\n/);
      const outLines: string[] = [];
      let skip = false;

      for (const ln of lines) {
        const t = ln.trim();
        if (/^2\.[2-8]\b/.test(t) || /^2\.[2-8]\s?–/.test(t) || /^2\.[2-8]\s?-/.test(t)) {
          skip = true;
          continue;
        }
        if (skip && /^3\./.test(t)) {
          skip = false;
        }
        if (!skip) {
          outLines.push(ln);
        }
      }

      const cleaned = outLines.join('\n');
      const paras = cleaned
        .split(/\n\n+/g)
        .map((p) => new Paragraph({ children: [new TextRun({ text: p })] }));

      const doc = new Document({
        creator: 'CAVALCANTE REIS',
        title: 'Proposta',
        description: 'Proposta gerada',
        sections: [{ children: paras }],
      });

      return await Packer.toBuffer(doc);
    } catch (error) {
      throw new Error(`Error processing document: ${error.message}`);
    }
  }

  async generateFromData(data: any): Promise<Buffer> {
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
        children: [new ImageRun({ data: mun01Buffer, transformation: { width: 800, height: 400 } } as any)], // AUMENTADO: 800px largura (quase toda a página A4)
      })] : []),
      ...(mun02Buffer ? [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [new ImageRun({ data: mun02Buffer, transformation: { width: 800, height: 288 } } as any)], // AUMENTADO: 800px largura (mantém proporção)
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

      // Profissional 1: IURI DO LAGO NOGUEIRA CAVALCANTE REIS (Yuri - no Tópico 5)
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

      // Profissional 2: GABRIEL GAUDÊNCIO ZANCHETTA CALIMAN (no Tópico 5)
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
      // REMOVIDO: PageBreak() - tópicos 3 e 4 devem ficar juntos

      // Dois últimos advogados ANTES do Tópico 6 (lado a lado - igual à prévia)
      // Usar Table para garantir que fiquem lado a lado
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
        columnWidths: [Math.floor(11906 / 2), Math.floor(11906 / 2)], // 50% cada
        rows: [
          new TableRow({
            children: [
              // Felipe - lado esquerdo
              new TableCell({
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                margins: { top: 0, bottom: 0, left: 100, right: 100 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'FELIPE NOBREGA ROCHA', bold: true, font: defaultFont, size: 24 })],
                    spacing: { before: 200, after: 0 },
                  }),
                  new Paragraph({
                    alignment: AlignmentType.JUSTIFIED,
                    spacing: { before: 0, after: 0 },
                    children: [
                      new TextRun({
                        text: 'Graduado em Direito pela Universidade Presbiteriana Mackenzie. LLM (Master of Laws) em Direito Empresarial pela Fundação Getúlio Vargas (FGV). Mestrado Profissional em Direito pelo Instituto Brasileiro de Ensino, Desenvolvimento e Pesquisa (IDP). Advogado associado do escritório de advocacia CAVALCANTE REIS ADVOGADOS, inscrito no CNPJ sob o n.º 26.632.686/0001-27, localizado na SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065, (61) 3248-0612 (endereço eletrônico: felipe@cavalcantereis.adv.br).',
                        font: defaultFont,
                        size: defaultSize,
                      }),
                    ],
                  }),
                ],
              }),
              // Ryslhainy - lado direito
              new TableCell({
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                margins: { top: 0, bottom: 0, left: 100, right: 100 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'RYSLHAINY DOS SANTOS CORDEIRO', bold: true, font: defaultFont, size: 24 })],
                    spacing: { before: 200, after: 0 },
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
                ],
              }),
            ],
            cantSplit: true, // Não quebrar - manter lado a lado
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
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          }
        },
        footers: { default: createFooter() },
        children: docChildren,
      }],
    });

    return await Packer.toBuffer(doc);
  }

  async generateMinutaDocx(data: any): Promise<Buffer> {
    const {
      municipio = 'BARROCAS',
      numeroContrato,
      numeroInexigibilidade,
      numeroProcesso,
      textoPartes,
      clauseData = {},
      percentual = 'R$ 0,20 (vinte centavos)',
      footerOffices,
    } = data;

    const defaultFont = 'EB Garamond';
    const defaultSize = 22; // 11pt
    const titleSize = 32; // 16pt

    // Carrega logo da prefeitura (fixa: barrocas.png, 180px)
    let prefeituraLogoBuffer: Buffer | null = null;
    try {
      const logoPath = path.join(process.cwd(), '..', 'frontend', 'public', 'barrocas.png');
      if (fs.existsSync(logoPath)) {
        prefeituraLogoBuffer = fs.readFileSync(logoPath);
      } else {
        // Tenta caminho alternativo
        const altPath = path.join(process.cwd(), 'public', 'barrocas.png');
        if (fs.existsSync(altPath)) {
          prefeituraLogoBuffer = fs.readFileSync(altPath);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar logo da prefeitura:', error);
    }

    // Textos fixos
    const municipioUpper = municipio.toUpperCase();
    const FIXED_COVER_TEXT = `CONTRATO QUE ENTRE SI CELEBRAM O MUNICÍPIO DE ${municipioUpper}/BA E, DE OUTRO LADO; O ESCRITÓRIO DE ADVOCACIA CAVALCANTE REIS ADVOGADOS, OBJETIVANDO O DESENVOLVIMENTO DE SERVIÇOS ADVOCATÍCIOS ESPECIALIZADOS DE PRESTAÇÃO DE SERVIÇOS DE ASSESSORIA TÉCNICA E JURÍDICA NAS ÁREAS DE DIREITO PÚBLICO, TRIBUTÁRIO, ECONÔMICO, FINANCEIRO, EM ESPECIAL PARA ALCANÇAR O INCREMENTO DE RECEITAS, DENTRE ELAS: REVISAR OS PARCELAMENTOS PREVIDENCIÁRIOS VISANDO A REDUÇÃO DO MONTANTE; PROSPECTAR E QUANTIFICAR ATIVOS OCULTOS DECORRENTES DO RECOLHIMENTO DE CONTRIBUIÇÕES PREVIDENCIÁRIAS A MAIOR; FOLHA DE PAGAMENTO, RECUPERAÇÃO DE VERBAS INDENIZATÓRIAS E CONTRIBUIÇÕES PREVIDENCIÁRIAS, AUDITORIA E CONSULTORIA DO PAGAMENTO DE ENERGIA ELÉTRICA; ICMS ENERGIA ELÉTRICA RECUPERAÇÃO DE CRÉDITOS DO IMPOSTO SOBRE SERVIÇOS DE QUALQUER NATUREZA (ISSQN); COMPENSAÇÃO FINANCEIRA PELA EXPLORAÇÃO MINERAL (CFEM); RAT-FAP, REVISÃO E RECUPERAÇÃO DOS VALORES REPASSADOS A MENOR PELA UNIÃO A TÍTULO DE FUNDEB E FUNDEF FICANDO RESPONSÁVEL PELO AJUIZAMENTO, ACOMPANHAMENTO E INTERVENÇÕES DE TERCEIRO EM AÇÕES JUDICIAIS E ADMINISTRATIVAS DE INTERESSE DO MUNICÍPIO.`;

    const defaultTextPartes = `Por este instrumento particular, de um lado, o MUNICÍPIO DE ${municipio}, pessoa jurídica de direito público, regularmente inscrito no CNPJ sob o n° 04.216.287/0001-42, com sede administrativa na Av. ACM, 705, Centro, CEP: 48.705-000, representado neste ato pelo Prefeito Municipal Sr. JOSÉ ALMIR ARAÚJO QUEIROZ, residente e domiciliado em Barrocas/BA, que pode ser encontrado no mesmo endereço acima colacionado, doravante denominado de "CONTRATANTE", e, de outro lado, CAVALCANTE REIS SOCIEDADE DE ADVOGADOS, sociedade de advocacia inscrita no CNPJ sob o n.º 26.632.686/0001-27, localizada na SHIS, QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71.630-065, (61) 3248-4524, endereço eletrônico: advocacia@cavalcantereis.adv.br, neste ato representada por seu sócio-diretor, IURI DO LAGO NOGUEIRA CAVALCANTE REIS, brasileiro, advogado, inscrito na OAB/DF sob o n.º 35.075, doravante denominada "CONTRATADA", pactuam o presente contrato em conformidade com o que dispõe a Lei de licitação e contratos n.º 14.133/21 e suas alterações, mediante as cláusulas e condições a seguir:`;

    const textoPartesFinal = textoPartes || defaultTextPartes;

    // Estrutura de dados das cláusulas (mesma do frontend)
    const allClausesData: Record<string, { titulo: string; subitens: Record<string, string> }> = {
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
          '4.1': `Os serviços descritos nas cláusulas 1ª e 2ª do presente contrato serão remunerados com base no êxito obtido para cada parcela de benefício financeiro ou econômico produzido em favor do Município em uma proporção de ${percentual} para cada R$ 1,00 (um real).`,
          '4.2': `Nos casos de valores retroativos recuperados em favor da municipalidade, que consistem nos valores não repassados em favor do Contratante nos últimos 5 (cinco) anos (prescrição quinquenal) ou não abarcados pela prescrição, também serão devidos honorários advocatícios na ordem de ${percentual} para cada R$ 1,00 (um real) do montante recuperado aos Cofres Municipais.`,
          '4.3': `Eventuais créditos não processados pelo MPS/INSS devido Certificado de Regularidade Previdenciária (CRP) e/ou Certidão Negativa de Débito (CND) do Estado em condição irregular, ou em função de compensação com dívidas do Município perante a União Federal, incluindo as decorrentes da suspensão de pagamentos de compensações e parcelamentos, serão considerados como creditados para fins de faturamento e pagamento dos honorários na proporção de ${percentual} para cada R$ 1,00 (um real).`,
          '4.4': `O CONTRATANTE pagará ao CONTRATADO, pelos serviços descritos nas cláusulas 2.7 e 2.8 (ação judicial FUNDEF/FUNDEB), honorários advocatícios pela execução dos serviços de recuperação de créditos, ad exitum na proporção de ${percentual} para cada R$ 1,00 (um real) para cada um dos processos mencionados na referida cláusula, considerando como êxito a obtenção do incremento financeiro pleiteado nos processos aos cofres municipais, ou seja, com base nos valores que entrarem nos cofres do CONTRATANTE.`,
          '4.5': 'As memórias de cálculo e valores exatos somente poderão ser fixados no momento da conclusão dos serviços, quando já estiverem definidos os valores por decisão ou acordo judicial, bem como por decisão ou acordo na via administrativa, desde que não esteja mais sujeito a nenhum tipo de recurso ou questionamento, ou seja, que esteja fixado de forma definitiva.',
          '4.6': 'No valor da remuneração estarão incluídos todos os custos operacionais, despesas de natureza tributária, fiscal, que incidirem sobre o objeto deste Contrato, e desenvolvimento das atividades descritas, excluindo-se eventuais custas e/ou emolumentos pela interposição de ações ou recursos judiciais.'
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
          '15.1': `O CONTRATANTE providenciará a publicação de forma resumida deste Contrato no placar/quadro de avisos do MUNICÍPIO DE ${municipioUpper}/BA, também a publicação do extrato na íntegra do diário oficial do MUNICÍPIO DE ${municipioUpper}/BA e no portal da transparência, em obediência ao disposto no §1° do artigo 89 da Lei Federal nº. 14.133/21.`
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

    // Textos fixos para cláusulas 1 e 2
    const clausula1Objects: Record<string, string> = {
      '1.1': 'À recuperação do Imposto de Renda incidente sobre as aquisições de bens e serviços pagos a maior ou indevidamente pelo Município;',
      '1.2': 'À revisão dos parcelamentos previdenciários, com o objetivo de reduzir ou cancelar os montantes das prestações devidas pela municipalidade a partir da realização das compensações dos créditos dos quais o Município é credor perante a União Federal; O objeto inclui a recuperação dos valores pagos a título de RAT (risco ambiental do trabalho) e SAT (seguro de acidente do trabalho);',
      '1.3': 'À prospecção, identificação e quantificação dos ativos ocultos decorrentes do recolhimento de incidência de contribuições previdenciárias indevidamente, a partir da proposição de ações judiciais para obter o reconhecimento do direito de recuperação administrativa dos valores pagos a maior pelo Município, bem como a análise da situação técnica do município, à luz da PEC 66, a fim de pedir a aplicação dos benefícios listados na emenda constitucional;',
      '1.4': 'À auditoria e consultoria energética consistente no levantamento de dados, preparação, encaminhamento e acompanhamento da recuperação financeira dos valores pagos ou cobrados indevidamente pela concessionária/distribuidora de energia elétrica;',
      '1.5': 'À recuperação de créditos do Imposto Sobre Serviços de Qualquer Natureza (ISSQN);',
      '1.6': 'Ao reconhecimento, implementação e manutenção do pagamento da Compensação Financeira pela Exploração Mineral (CFEM), por meio do acompanhamento e propositura de medidas administrativas e judiciais cabíveis perante a Agência Nacional de Mineração;',
      '1.7': 'Ao acompanhamento e intervenção para a defesa dos interesses do Município nas ações referentes aos valores do Fundo de Manutenção e Desenvolvimento do Ensino Fundamental e de Valorização do Magistério (FUNDEF) dos seguintes processos: 0020459-93.2007.4.01.3304, em trâmite perante a 1ª Vara Federal Cível e Criminal da SSJ de Feira de Santana-BA e 1019002-18.2021.4.01.3304, em trâmite perante a 1ª Vara Federal Cível e Criminal da SSJ de Feira de Santana-BA;',
      '1.8': 'À revisão e recuperação dos valores repassados a menor pela União Federal ao Município a título do Fundo de Manutenção e Desenvolvimento da Educação Básica e de Valorização dos Profissionais da Educação (FUNDEB).'
    };

    const clausula2Objects: Record<string, string> = {
      '2.1': 'Em relação ao Imposto de Renda, é objeto do presente contrato também o desenvolvimento de serviços de natureza jurídica com a realização de peticionamentos e diligências para defesa dos interesses do Município nos autos do seguinte processo: 1006745-22.2025.4.01.3400, atualmente na 8ª Vara Federal Cível da SJDF.',
      '2.2': 'Em relação aos parcelamentos previdenciários, após a prospecção e identificação de créditos em favor do Município, serão propostas ações judiciais e administrativas com o intuito de utilizar os referidos valores para redução ou amortização total das mensalidades despendidas perante a União Federal.',
      '2.3': 'No tocante à identificação dos ativos ocultos referentes aos créditos de contribuições previdenciarias não contabilizados, será confeccionado um laudo de auditoria para identificar, quantificar e atualizar todos os pagamentos indevidos feitos à União Federal/INSS calculados sobre as verbas dos últimos 60 (sessenta) meses. A partir dessa análise, será requerida a devolução administrativamente, com a concomitante proposição de mandados de segurança para obtenção de decisão judicial que respalde a compensação dos créditos apurados com as futuras contribuições mensais a serem realizadas pela municipalidade, bem como a análise da situação técnica do município, à luz da PEC 66, a fim de pedir a aplicação dos benefícios listados na emenda constitucional.',
      '2.4': 'No que tange ao serviço de auditoria da energia elétrica, consiste na promoção de revisão de toda classificação dos lançamentos das cobranças nas faturas, a identificação de falhas na classificação tarifária, a apuração dos valores realmente devidos a título de consumo de energia elétrica, a recuperação de valores atinente aos indébitos identificados, estabelecimento de mecanismos de auditoria permanente para sanar ocorrências futuras e auditoria do lançamento e arrecadação da CIP/COSIP - Contribuição para Custeio da Iluminação Pública de forma a coibir a Distribuidora de lançamentos errados e consequentemente arrecadação e repasse com erro.',
      '2.5': 'A recuperação de créditos do ISSQN (Imposto Sobre Serviços de Qualquer Natureza) para um município envolve identificar valores pagos indevidamente ou a maior, geralmente por erros de cálculo, alíquota ou base de cálculo. Após análise, o município pode restituir o valor ou compensá-lo em débitos futuros.',
      '2.6': 'Quanto ao CFEM, é objeto do presente contrato o desenvolvimento de serviços advocatícios especializados com a prestação de serviços de assessoria técnica e jurídica por meio do acompanhamento e propositura de medidas administrativas e/ou judiciais cabíveis, visando o incremento de receitas à municipalidade, nas condições de produtor, afetados por estrutura e/ou limítrofes. É também objeto a prestação de serviços para recuperação de créditos da CFEM, identificando inconsistências na apuração, informação, recolhimento e demais atos acessórios de obrigatoriedade das mineradoras, inclusive dados do SPED que possam reduzir a base de cálculo da receita patrimonial, gerando redução no repasse, bem como visando à recuperação dos tributos municipais, como ISS, Alvará, taxas diversas, relacionadas à atividade minerária, inclusive ao VAF – Valor Adicional Fiscal (IVA).',
      '2.7': 'Em relação ao FUNDEF, é objeto do presente contrato também o desenvolvimento de serviços de natureza jurídica com a realização de peticionamentos e diligências para defesa dos interesses do Município nos autos dos seguintes processos: 0020459-93.2007.4.01.3304, atualmente na 1ª Vara Federal Cível e Criminal da SSJ de Feira de Santana-BA, e 1019002-18.2021.4.01.3304, atualmente na 1ª Vara Federal Cível e Criminal da SSJ de Feira de Santana-BA.',
      '2.8': 'Em relação ao FUNDEB, é possível (i) o ajuizamento de ação ordinária em desfavor da União Federal, com o intuito de demonstrar a defasagem dos repasses das diferenças ao FUNDEB em decorrência da inobservância ao piso fixado na legislação vigente, condenando-a ao pagamento da diferença do valor anual mínimo por aluno relativos aos últimos 60 (sessenta) meses, bem como (ii) a atuação em ações judiciais já propostas perante o Juízo Federal de 1º Grau, o respectivo Tribunal Regional Federal (2º Grau) e Tribunais Superiores, objetivando agilizar o trâmite processual e o recebimento dos valores.'
    };

    // Itens padrão da tabela 4.5
    const tabela45Default: Record<string, { descricao: string; cabimento: string }> = {
      '1': { descricao: 'Folha de pagamento, recuperação de verbas indenizatórias e contribuições previdenciárias.', cabimento: 'O valor estimado será apurado após a Contratação através de estudo técnico com base na documentação compartilhada pelo ente municipal.' },
      '2': { descricao: 'Recuperação/Compensação de Imposto de Renda', cabimento: 'Processo n.° 1006745-22.2025.4.01.3400, em trâmite perante a 8ª Vara Federal Cível da SJDF' },
      '3': { descricao: 'Auditoria e Consultoria do pagamento de Energia Elétrica – Recuperação do ICMS', cabimento: 'Cabível' },
      '4': { descricao: 'Recuperação de créditos do Imposto Sobre Serviços de Qualquer Natureza (ISSQN);', cabimento: 'O valor total será dimensionado após o estudo técnico, pois este é uma das etapas do trabalho contratado.' },
      '5': { descricao: 'FUNDEF - Possível atuação no feito para agilizar a tramitação, a fim de efetivar o incremento financeiro, com a consequente expedição do precatório.', cabimento: 'Processos n.º 0020459-93.2007.4.01.3304 e 1019002-18.2021.4.01.3304, ambos em trâmite perante a 1ª Vara Federal Cível e Criminal da SSJ de Feira de Santana-BA' },
      '6': { descricao: 'FUNDEB', cabimento: 'Cabível' },
      '7': { descricao: 'CFEM', cabimento: 'Cabível' }
    };

    const docChildren = [];

    // Cria cabeçalho com logo da prefeitura (180px para todas as páginas)
    const createHeader = () => {
      if (!prefeituraLogoBuffer) return undefined;
      return new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 600 },
            children: [new ImageRun({ data: prefeituraLogoBuffer, transformation: { width: 180, height: 180 * 0.75 } } as any)],
          }),
        ],
      });
    };

    // Cria rodapé com escritórios
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
      const footerCells = enabledOffices.map(office =>
        new TableCell({
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          margins: { top: 0, bottom: 0, left: 30, right: 30 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 0 },
              children: [
                new TextRun({ text: office.cidade.toUpperCase(), bold: true, font: defaultFont, size: 16 }),
                new TextRun({ text: '\n', break: 1 }),
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
            columnWidths: numOffices > 0
              ? Array(numOffices).fill(Math.floor(11906 / numOffices))
              : [11906],
            rows: [
              new TableRow({
                children: footerCells,
                cantSplit: true,
              })
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 50 },
            border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'D0D0D0' } },
          }),
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

    // --- PÁGINA 1: CAPA ---
    // Logo da prefeitura no topo (180px)
    if (prefeituraLogoBuffer) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 1200 },
          children: [new ImageRun({ data: prefeituraLogoBuffer, transformation: { width: 180, height: 180 * 0.75 } } as any)],
        })
      );
    }

    // Números do Contrato (alinhados à esquerda)
    docChildren.push(
      new Paragraph({
        children: [new TextRun({ text: `CONTRATO N° ${numeroContrato || "____________"}`, font: defaultFont, size: defaultSize })],
        spacing: { after: 300 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `INEXIGIBILIDADE DE LICITAÇÃO N° ${numeroInexigibilidade || "_____________"}`, font: defaultFont, size: defaultSize })],
        spacing: { after: 300 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `PROCESSO ADMINISTRATIVO N° ${numeroProcesso || "_____________________"}`, font: defaultFont, size: defaultSize })],
        spacing: { after: 1000 },
      })
    );

    // Texto Fixo (FIXED_COVER_TEXT) - Alinhado à direita com indent (margem de 120px ≈ 2268 twips)
    docChildren.push(
      new Paragraph({
        children: [new TextRun({ text: FIXED_COVER_TEXT, font: defaultFont, size: defaultSize })],
        alignment: AlignmentType.JUSTIFIED,
        indent: { right: 2268 },
        spacing: { after: 800 },
      })
    );

    // Espaço
    docChildren.push(new Paragraph({ spacing: { after: 800 } }));

    // Texto das Partes (Fixo)
    docChildren.push(
      new Paragraph({
        children: [new TextRun({ text: textoPartesFinal, font: defaultFont, size: defaultSize })],
        alignment: AlignmentType.JUSTIFIED,
        indent: { right: 2268 },
        spacing: { after: 0 },
      })
    );

    // Quebra de página
    docChildren.push(new Paragraph({ children: [new TextRun({ break: 1 })] }));

    // --- PÁGINA 2: CLÁUSULA 1ª - DO OBJETO ---
    const clause1Selected = clauseData.clause1 || {};
    if (Object.keys(clause1Selected).length > 0) {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: 'CLÁUSULA 1ª - DO OBJETO', bold: true, font: defaultFont, size: defaultSize })],
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' } },
          spacing: { after: 200 }, // Reduzido: 200 em vez de 600
        }),
        new Paragraph({
          children: [new TextRun({
            text: `É objeto do presente contrato o desenvolvimento de serviços advocatícios especializados por parte da CONTRATADA, CAVALCANTE REIS ADVOGADOS, ao CONTRATANTE, Município de ${municipio}, a fim de prestação de serviços de assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico, Financeiro e Previdenciário, atuando perante o Ministério da Fazenda e os seus órgãos administrativos, em especial para alcançar o incremento de receitas, ficando responsável pelo ajuizamento, acompanhamento e eventuais intervenções de terceiro em ações de interesse do Município.`,
            font: defaultFont,
            size: defaultSize
          })],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 200 }, // Reduzido: 200 em vez de 600
        })
      );

      // Sub-itens da cláusula 1 (ordenados) - fluxo contínuo
      Object.entries(clause1Selected)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([key, texto]: [string, any], index: number) => {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${key} `, bold: true, font: defaultFont, size: defaultSize }),
                new TextRun({ text: texto, font: defaultFont, size: defaultSize }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 100 }, // Reduzido: 100 para fluxo contínuo
            })
          );
        });

      docChildren.push(new Paragraph({ children: [new TextRun({ break: 1 })] }));
    }

    // --- PÁGINA 3: CLÁUSULA 2ª ---
    const clause2Selected = clauseData.clause2 || {};
    if (Object.keys(clause2Selected).length > 0) {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: 'CLÁUSULA 2ª - DETALHAMENTO DO OBJETO E ESPECIFICAÇÕES DOS SERVIÇOS A SEREM EXECUTADOS', bold: true, font: defaultFont, size: defaultSize })],
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' } },
          spacing: { after: 200 }, // Reduzido: 200 em vez de 600
        })
      );

      // Sub-itens da cláusula 2 (ordenados) - fluxo contínuo
      Object.entries(clause2Selected)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([key, texto]: [string, any], itemIndex: number) => {
          const lines = texto.split('\n');
          lines.forEach((line: string, idx: number) => {
            docChildren.push(
              new Paragraph({
                children: [
                  ...(idx === 0 ? [new TextRun({ text: `${key}- `, bold: true, font: defaultFont, size: defaultSize })] : []),
                  new TextRun({ text: line || ' ', font: defaultFont, size: defaultSize }),
                ],
                alignment: AlignmentType.JUSTIFIED,
                spacing: {
                  before: idx === 0 && itemIndex > 0 ? 100 : 0, // Primeiro parágrafo de novo item: 100
                  after: idx === lines.length - 1 ? 100 : 50 // Reduzido: 100 no final, 50 entre linhas
                },
              })
            );
          });
        });

      docChildren.push(new Paragraph({ children: [new TextRun({ break: 1 })] }));
    }

    // Função auxiliar para ordenar sub-itens numericamente
    const sortSubItems = (entries: [string, any][]): [string, any][] => {
      return entries.sort(([a], [b]) => {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aVal = aParts[i] || 0;
          const bVal = bParts[i] || 0;
          if (aVal !== bVal) return aVal - bVal;
        }
        return 0;
      });
    };

    // --- CLÁUSULAS 3-18 ---
    const clauseNumbers = ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'];

    // Variável para armazenar 3.3 que será adicionado antes do 4
    let clause3Late: [string, any] | null = null;
    let clause3LateWasAdded = false; // Flag para saber se 3.3 foi adicionado antes do 4

    for (const clauseNum of clauseNumbers) {
      const clauseSelected = clauseData[`clause${clauseNum}`] || {};
      if (Object.keys(clauseSelected).length === 0) {
        // Se cláusula 4 está vazia mas há 3.3 pendente, renderiza só o 3.3
        if (clauseNum === '4' && clause3Late) {
          const lines = clause3Late[1].split('\n');
          lines.forEach((line: string, idx: number) => {
            if (line.trim() === '') {
              docChildren.push(new Paragraph({ spacing: { after: 100 } }));
            } else {
              docChildren.push(
                new Paragraph({
                  children: [
                    ...(idx === 0 ? [new TextRun({ text: `${clause3Late![0]}- `, bold: true, font: defaultFont, size: defaultSize })] : []),
                    new TextRun({ text: line, font: defaultFont, size: defaultSize }),
                  ],
                  alignment: AlignmentType.JUSTIFIED,
                  spacing: {
                    before: idx === 0 ? 100 : 0,
                    after: idx === lines.length - 1 ? 100 : 50
                  },
                })
              );
            }
          });
          clause3Late = null;
        }
        continue;
      }

      const clauseInfo = allClausesData[clauseNum];
      if (!clauseInfo) continue;

      // Caso especial: Cláusula 3 - separar 3.3
      if (clauseNum === '3') {
        const clause3Items = sortSubItems(Object.entries(clauseSelected));
        const clause3Early = clause3Items.filter(([key]) => key !== '3.3');
        const clause3LateItem = clause3Items.find(([key]) => key === '3.3');

        // Renderiza título e 3.1-3.2
        if (clause3Early.length > 0) {
          docChildren.push(
            new Paragraph({
              children: [new TextRun({ text: clauseInfo.titulo, bold: true, font: defaultFont, size: defaultSize })],
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' } },
              spacing: { after: 200 },
            })
          );

          clause3Early.forEach(([key, texto]: [string, any], itemIndex: number) => {
            const lines = texto.split('\n');
            lines.forEach((line: string, idx: number) => {
              if (line.trim() === '') {
                docChildren.push(new Paragraph({ spacing: { after: 100 } }));
              } else {
                docChildren.push(
                  new Paragraph({
                    children: [
                      ...(idx === 0 ? [new TextRun({ text: `${key}- `, bold: true, font: defaultFont, size: defaultSize })] : []),
                      new TextRun({ text: line, font: defaultFont, size: defaultSize }),
                    ],
                    alignment: AlignmentType.JUSTIFIED,
                    spacing: {
                      before: idx === 0 && itemIndex > 0 ? 100 : 0,
                      after: idx === lines.length - 1 ? 100 : 50
                    },
                  })
                );
              }
            });
          });
        }

        // Guarda 3.3 para adicionar antes do 4
        if (clause3LateItem) {
          clause3Late = clause3LateItem;
        }
        continue;
      }

      // Caso especial: Cláusula 4 - adicionar 3.3 antes (sem título antes do 3.3, só espaçamento reduzido)
      if (clauseNum === '4' && clause3Late) {
        // Renderiza 3.3 primeiro (sem título, seguido diretamente)
        const lines = clause3Late[1].split('\n');
        lines.forEach((line: string, idx: number) => {
          if (line.trim() === '') {
            docChildren.push(new Paragraph({ spacing: { after: 100 } }));
          } else {
            docChildren.push(
              new Paragraph({
                children: [
                  ...(idx === 0 ? [new TextRun({ text: `${clause3Late![0]}- `, bold: true, font: defaultFont, size: defaultSize })] : []),
                  new TextRun({ text: line, font: defaultFont, size: defaultSize }),
                ],
                alignment: AlignmentType.JUSTIFIED,
                spacing: {
                  before: idx === 0 ? 100 : 0, // Espaçamento reduzido: 100 em vez de quebra de página
                  after: idx === lines.length - 1 ? 150 : 50 // Espaçamento antes do título do 4: 150
                },
              })
            );
          }
        });
        clause3LateWasAdded = true;
        clause3Late = null;
      }

      // Caso especial: Cláusula 4 - separar 4.5 para ir depois do 4.6
      if (clauseNum === '4') {
        const clause4Items = sortSubItems(Object.entries(clauseSelected));
        const clause4Early = clause4Items.filter(([key]) => key !== '4.5'); // 4.1-4.4, 4.6
        const clause4Late = clause4Items.filter(([key]) => key === '4.5'); // 4.5

        // Título da cláusula 4
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: clauseInfo.titulo, bold: true, font: defaultFont, size: defaultSize })],
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' } },
            spacing: {
              before: clause3LateWasAdded ? 0 : 200, // Se 3.3 foi adicionado antes, não precisa espaço antes do título
              after: 200
            },
          })
        );

        // Renderiza 4.1-4.4, 4.6 (sem o 4.5)
        clause4Early.forEach(([key, texto]: [string, any], itemIndex: number) => {
          const lines = texto.split('\n');
          lines.forEach((line: string, idx: number) => {
            if (line.trim() === '') {
              docChildren.push(new Paragraph({ spacing: { after: 100 } }));
            } else {
              docChildren.push(
                new Paragraph({
                  children: [
                    ...(idx === 0 ? [new TextRun({ text: `${key}- `, bold: true, font: defaultFont, size: defaultSize })] : []),
                    new TextRun({ text: line, font: defaultFont, size: defaultSize }),
                  ],
                  alignment: AlignmentType.JUSTIFIED,
                  spacing: {
                    before: idx === 0 && itemIndex > 0 ? 100 : 0,
                    after: idx === lines.length - 1 ? 100 : 50
                  },
                })
              );
            }
          });
        });

        // Renderiza 4.5 em nova página (depois do 4.6) se existir
        if (clause4Late.length > 0) {
          const [key, texto] = clause4Late[0];
          // Quebra de página antes do 4.5
          docChildren.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })], pageBreakBefore: true }));

          // Texto do 4.5
          const lines = texto.split('\n');
          lines.forEach((line: string, idx: number) => {
            if (line.trim() === '') {
              docChildren.push(new Paragraph({ spacing: { after: 100 } }));
            } else {
              docChildren.push(
                new Paragraph({
                  children: [
                    ...(idx === 0 ? [new TextRun({ text: `${key}- `, bold: true, font: defaultFont, size: defaultSize })] : []),
                    new TextRun({ text: line, font: defaultFont, size: defaultSize }),
                  ],
                  alignment: AlignmentType.JUSTIFIED,
                  spacing: {
                    before: 0,
                    after: idx === lines.length - 1 ? 100 : 50
                  },
                })
              );
            }
          });

          // Para cláusula 4.5: adicionar tabela DEPOIS do texto 4.5
          if (key === '4.5') {
            const tabela45 = clauseData.tabela45 || {};
            if (Object.keys(tabela45).length > 0) {
              const tableRows = [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: 'ITEM', bold: true, font: defaultFont, size: defaultSize })], alignment: AlignmentType.CENTER })],
                      borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                      shading: { fill: 'F9F9F9' },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: 'DESCRIÇÃO', bold: true, font: defaultFont, size: defaultSize })], alignment: AlignmentType.CENTER })],
                      borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                      shading: { fill: 'F9F9F9' },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: 'CABIMENTO', bold: true, font: defaultFont, size: defaultSize })], alignment: AlignmentType.CENTER })],
                      borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                      shading: { fill: 'F9F9F9' },
                    }),
                  ],
                }),
              ];

              Object.entries(tabela45)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .forEach(([itemNum, item]: [string, any]) => {
                  tableRows.push(
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [new Paragraph({ children: [new TextRun({ text: itemNum, bold: true, font: defaultFont, size: defaultSize })], alignment: AlignmentType.CENTER })],
                          borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                        }),
                        new TableCell({
                          children: [new Paragraph({ children: [new TextRun({ text: item.descricao || '', font: defaultFont, size: defaultSize })], alignment: AlignmentType.LEFT })],
                          borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                        }),
                        new TableCell({
                          children: [new Paragraph({ children: [new TextRun({ text: item.cabimento || '', font: defaultFont, size: defaultSize })], alignment: AlignmentType.LEFT })],
                          borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                        }),
                      ],
                    })
                  );
                });

              docChildren.push(
                new Paragraph({ spacing: { before: 200 } }), // Reduzido: 200 em vez de 600
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: tableRows,
                })
              );

              // Textos após a tabela (a, b, c, d)
              const textosAfterTabela = [
                'a) Os demais objetos contidos nas cláusulas do presente contrato terão os valores levantados após a disponibilização da documentação necessária para a efetivação do serviço, haja vista a natureza concomitante do trabalho desenvolvido.',
                'b) Os valores levantados a título de incremento são provisórios, baseados em informações preliminares, podendo, ao final, representar valores a maior ou a menor.',
                'c) Para efetivação da atualização do valor contratual previsto no parágrafo antecedente, ocorrerá mediante a celebração de aditamento, na forma prevista na Lei n.° 14.133/21.',
                `d) Em nenhuma hipótese, o MUNICÍPIO DE ${municipioUpper}/BA pagará à CONTRATADA antes que os valores sejam registrados nos cofres públicos.`
              ];

              textosAfterTabela.forEach((texto, idx) => {
                docChildren.push(
                  new Paragraph({
                    children: [new TextRun({ text: texto, font: defaultFont, size: defaultSize })],
                    alignment: AlignmentType.JUSTIFIED,
                    spacing: { after: idx === textosAfterTabela.length - 1 ? 100 : 50 }, // Reduzido: 100 no final, 50 entre itens
                  })
                );
              });
            }
          }
        }
      } else {
        // Para outras cláusulas: renderização normal
        // Título da cláusula (5, 6, etc.)
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: clauseInfo.titulo, bold: true, font: defaultFont, size: defaultSize })],
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' } },
            spacing: {
              before: 200,
              after: 200
            },
          })
        );

        // Sub-itens selecionados (ordenados numericamente)
        sortSubItems(Object.entries(clauseSelected))
          .forEach(([key, texto]: [string, any], itemIndex: number) => {
            // Para textos muito longos (como 3.2), quebra em parágrafos
            const lines = texto.split('\n');
            lines.forEach((line: string, idx: number) => {
              if (line.trim() === '') {
                docChildren.push(new Paragraph({ spacing: { after: 100 } }));
              } else {
                docChildren.push(
                  new Paragraph({
                    children: [
                      ...(idx === 0 ? [new TextRun({ text: `${key}- `, bold: true, font: defaultFont, size: defaultSize })] : []),
                      new TextRun({ text: line, font: defaultFont, size: defaultSize }),
                    ],
                    alignment: AlignmentType.JUSTIFIED,
                    spacing: {
                      before: idx === 0 && itemIndex > 0 ? 100 : 0,
                      after: idx === lines.length - 1 ? 100 : 50
                    },
                  })
                );
              }
            });

            // Para cláusula 17.1: adicionar tabela DEPOIS do texto 17.1
            if (clauseNum === '17' && key === '17.1') {
              const dotacaoArray = Array.isArray(clauseData.dotacao17) ? clauseData.dotacao17 : [];

              // Renderiza uma tabela para cada item do array
              dotacaoArray.forEach((dotacao: any, idx: number) => {
                if (dotacao && (dotacao.unidOrcamentaria || dotacao.projetoAtividade || dotacao.categoria || dotacao.fonteRecurso || dotacao.dotacaoOrcamentaria)) {
                  const dotTableRows = [
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [new Paragraph({ children: [new TextRun({ text: 'DOTAÇÃO ORÇAMENTÁRIA', bold: true, font: defaultFont, size: defaultSize })], alignment: AlignmentType.CENTER })],
                          borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                          columnSpan: 2,
                        }),
                      ],
                    }),
                  ];

                  // Adiciona linha para DOTAÇÃO ORÇAMENTÁRIA se existir
                  if (dotacao.dotacaoOrcamentaria) {
                    dotTableRows.push(
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: 'DOTAÇÃO ORÇAMENTÁRIA', bold: true, font: defaultFont, size: defaultSize })], alignment: AlignmentType.LEFT })],
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                          }),
                          new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: dotacao.dotacaoOrcamentaria || '', font: defaultFont, size: defaultSize })], alignment: AlignmentType.LEFT })],
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                          }),
                        ],
                      })
                    );
                  }

                  // Adiciona linha para UNID. ORÇAMENTÁRIA se existir
                  if (dotacao.unidOrcamentaria) {
                    dotTableRows.push(
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: 'UNID. ORÇAMENTÁRIA', bold: true, font: defaultFont, size: defaultSize })], alignment: AlignmentType.LEFT })],
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                          }),
                          new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: dotacao.unidOrcamentaria || '', font: defaultFont, size: defaultSize })], alignment: AlignmentType.LEFT })],
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                          }),
                        ],
                      })
                    );
                  }

                  // Adiciona linha para PROJETO ATIVIDADE se existir
                  if (dotacao.projetoAtividade) {
                    dotTableRows.push(
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: 'PROJETO ATIVIDADE', bold: true, font: defaultFont, size: defaultSize })], alignment: AlignmentType.LEFT })],
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                          }),
                          new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: dotacao.projetoAtividade || '', font: defaultFont, size: defaultSize })], alignment: AlignmentType.LEFT })],
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                          }),
                        ],
                      })
                    );
                  }

                  // Adiciona linha para CATEGORIA se existir
                  if (dotacao.categoria) {
                    dotTableRows.push(
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: 'CATEGORIA', bold: true, font: defaultFont, size: defaultSize })], alignment: AlignmentType.LEFT })],
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                          }),
                          new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: dotacao.categoria || '', font: defaultFont, size: defaultSize })], alignment: AlignmentType.LEFT })],
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                          }),
                        ],
                      })
                    );
                  }

                  // Adiciona linha para FONTE DE RECURSO se existir
                  if (dotacao.fonteRecurso) {
                    dotTableRows.push(
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: 'FONTE DE RECURSO', bold: true, font: defaultFont, size: defaultSize })], alignment: AlignmentType.LEFT })],
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                          }),
                          new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: dotacao.fonteRecurso || '', font: defaultFont, size: defaultSize })], alignment: AlignmentType.LEFT })],
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                          }),
                        ],
                      })
                    );
                  }

                  docChildren.push(
                    new Paragraph({ spacing: { before: idx === 0 ? 200 : 400 } }), // Espaçamento entre tabelas: 400
                    new Table({
                      width: { size: 100, type: WidthType.PERCENTAGE },
                      rows: dotTableRows,
                    })
                  );
                }
              });
            }
          });
      }

      // Não adiciona quebra de página após cláusula 3 se houver 3.3 (pois 3.3 será adicionado antes do 4)
      // Quebra de página (exceto para agrupamentos 3-4, 8-10, 13-15, 16-18)
      // Tópicos 3 e 4 devem ficar juntos (sem quebra entre eles quando 3.3 existir)
      const hasClause3LatePending = clauseNum === '3' && clause3Late !== null;

      // Não quebra após 3 se há 3.3 pendente, e não adiciona espaço extra após 4 se 3.3 foi adicionado
      const shouldBreak = !hasClause3LatePending && !(
        (clauseNum === '3' || clauseNum === '4') || // Tópicos 3 e 4 juntos
        (clauseNum === '8' || clauseNum === '9' || clauseNum === '10') ||
        (clauseNum === '13' || clauseNum === '14' || clauseNum === '15') ||
        (clauseNum === '16' || clauseNum === '17')
      );

      if (shouldBreak && !(clauseNum === '4' && clause3LateWasAdded)) {
        docChildren.push(new Paragraph({ children: [new TextRun({ break: 1 })] }));
      } else if (!hasClause3LatePending && !(clauseNum === '4' && clause3LateWasAdded)) {
        // Adiciona espaçamento reduzido apenas se não for 3 com 3.3 pendente e não for 4 com 3.3 adicionado
        docChildren.push(new Paragraph({ spacing: { before: 100 } })); // Espaçamento mínimo
      }

      // Reset flag após processar cláusula 4
      if (clauseNum === '4') {
        clause3LateWasAdded = false;
      }
    }

    // --- PÁGINA FINAL: ASSINATURAS ---
    docChildren.push(new Paragraph({ children: [new TextRun({ break: 1 })] }));

    docChildren.push(
      new Paragraph({
        children: [new TextRun({ text: `Barrocas/BA_____ de dezembro de 2025.`, font: defaultFont, size: defaultSize })],
        spacing: { after: 1200 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 1200 },
        children: [
          new TextRun({ text: '___________________________________________________', font: defaultFont, size: defaultSize }),
          new TextRun({ break: 1 }),
          new TextRun({ text: 'MUNICÍPIO DE BARROCAS/BA, representado por seu Prefeito,', font: defaultFont, size: defaultSize }),
          new TextRun({ break: 1 }),
          new TextRun({ text: 'Sr. JOSÉ ALMIR ARAÚJO QUEIROZ', font: defaultFont, size: defaultSize }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 1200 },
        children: [
          new TextRun({ text: '___________________________________________________', font: defaultFont, size: defaultSize }),
          new TextRun({ break: 1 }),
          new TextRun({ text: 'CAVALCANTE REIS ADVOGADOS, representado pelo sócio-diretor, Sr.', font: defaultFont, size: defaultSize }),
          new TextRun({ break: 1 }),
          new TextRun({ text: 'IURI DO LAGO NOGUEIRA CAVALCANTE REIS,', font: defaultFont, size: defaultSize }),
        ],
      }),
      new Paragraph({
        spacing: { before: 1200 },
        children: [new TextRun({ text: 'Testemunhas:', font: defaultFont, size: defaultSize })],
      }),
      new Paragraph({
        spacing: { before: 800 },
        children: [
          new TextRun({ text: '1ª___________________________', font: defaultFont, size: defaultSize }),
          new TextRun({ text: '    ', font: defaultFont, size: defaultSize }),
          new TextRun({ text: '2ª___________________________', font: defaultFont, size: defaultSize }),
          new TextRun({ break: 1 }),
          new TextRun({ text: '    CPF nº:          ', font: defaultFont, size: defaultSize }),
          new TextRun({ text: 'CPF nº:', font: defaultFont, size: defaultSize }),
        ],
      })
    );

    const doc = new Document({
      creator: 'CAVALCANTE REIS',
      title: `Minuta - ${municipio}`,
      sections: [{
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          }
        },
        headers: { default: createHeader() },
        footers: { default: createFooter() },
        children: docChildren,
      }],
    });

    return await Packer.toBuffer(doc);
  }
}
