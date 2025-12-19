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

      const footerCells = enabledOffices.map(office =>
        new TableCell({
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: office.cidade, bold: true, font: defaultFont, size: 18 })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: office.linha1, font: defaultFont, size: 16 })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: office.linha2, font: defaultFont, size: 16 })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: office.linha3, font: defaultFont, size: 16 })] }),
          ],
        })
      );

      return new Footer({
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE } },
            rows: [new TableRow({ children: footerCells })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
            children: [
              new TextRun({
                text: 'www.cavalcante-reis.adv.br',
                bold: true,
                font: defaultFont,
                size: 18,
                color: '666666',
              }),
            ],
          }),
        ],
      });
    };

    const docChildren = [];

    // --- PÁGINA 1: CAPA ---
    if (logoBuffer) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 2000, after: 1000 },
          children: [new ImageRun({ data: logoBuffer, transformation: { width: 166, height: 87 } })],
        })
      );
    }
    
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 3000 },
        children: [
          new TextRun({ text: 'Proponente:', bold: true, font: defaultFont, size: 24 }),
          new TextRun({ break: 1, text: 'Cavalcante Reis Advogados', font: defaultFont, size: 24 }),
          new TextRun({ break: 2, text: 'Destinatário:', bold: true, font: defaultFont, size: 24 }),
          new TextRun({ break: 1, text: `Prefeitura Municipal de ${municipio}`, font: defaultFont, size: 24 }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 1000 },
        children: [new TextRun({ text: dataProposta || '2025', bold: true, font: defaultFont, size: 32 })],
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
        spacing: { before: 200, after: 200 },
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
        spacing: { before: 200, after: 200 },
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
        spacing: { before: 100 },
        children: [
          new TextRun({ text: '(i) Análise do caso concreto, com a elaboração dos estudos pertinentes ao Município de ', font: defaultFont, size: defaultSize }),
          new TextRun({ text: municipio, font: defaultFont, size: defaultSize, bold: true }),
          new TextRun({ text: ';', font: defaultFont, size: defaultSize }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 100 },
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
        spacing: { before: 100 },
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
        spacing: { before: 100 },
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
        spacing: { before: 100 },
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
        spacing: { before: 100 },
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
          spacing: { before: 400, after: 200 },
          children: [new TextRun({ text: `2.${index + 1} – ${s.label}`, bold: true, font: defaultFont, size: 26 })],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [new TextRun({ text: s.content?.replace(/<[^>]+>/g, '') || '', font: defaultFont, size: defaultSize })],
        }),
        new Paragraph({ children: [new PageBreak()] })
      );
    });

    // --- HONORÁRIOS E DEMAIS ---
    docChildren.push(
      new Paragraph({
        spacing: { after: 300 },
        border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
        children: [new TextRun({ text: '3. Dos Honorários, das Condições de Pagamento e Despesas', bold: true, font: defaultFont, size: titleSize })],
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 200, after: 200 },
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
        spacing: { before: 200, after: 200 },
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
        spacing: { before: 200, after: 200 },
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
        spacing: { before: 200, after: 200 },
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
        spacing: { before: 200, after: 200 },
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
      new Paragraph({ children: [new PageBreak()] }),

      new Paragraph({
        spacing: { after: 300 },
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
      ...(mun01Buffer ? [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new ImageRun({ data: mun01Buffer, transformation: { width: 500, height: 250 } })],
      })] : []),
      ...(mun02Buffer ? [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
        children: [new ImageRun({ data: mun02Buffer, transformation: { width: 500, height: 180 } })],
      })] : []),
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
        children: [new ImageRun({ data: assinaturaBuffer, transformation: { width: 180, height: 60 } })],
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
}
