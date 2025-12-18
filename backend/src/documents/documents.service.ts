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
                text: 'w w w . c a v a l c a n t e r e i s . a d v . b r',
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
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 2000, after: 1000 },
        children: [new ImageRun({ data: logoBuffer, transformation: { width: 166, height: 87 } })],
      }),
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
        alignment: AlignmentType.CENTER,
        spacing: { after: 500 },
        children: [new TextRun({ text: 'SUMÁRIO', bold: true, font: defaultFont, size: 36 })],
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
        spacing: { before: 200 },
        children: [
          new TextRun({
            text: `É objeto do presente contrato o desenvolvimento de serviços advocatícios especializados por parte da Proponente ao Aceitante, Município de ${municipio}, a fim de prestação de serviços de assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico, Financeiro, Minerário e Previdenciário.`,
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
        children: [new TextRun({ text: `O Município pagará à Proponente o valor de ${paymentValue} por cada economia recuperada.`, font: defaultFont, size: defaultSize })],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      new Paragraph({
        spacing: { after: 300 },
        border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
        children: [new TextRun({ text: '4. Prazo e Cronograma de Execução dos Serviços', bold: true, font: defaultFont, size: titleSize })],
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: `O prazo de execução será de ${prazo} meses.`, font: defaultFont, size: defaultSize })],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      new Paragraph({
        spacing: { after: 300 },
        border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
        children: [new TextRun({ text: '5. Experiência e Equipe Responsável', bold: true, font: defaultFont, size: titleSize })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new ImageRun({ data: mun01Buffer, transformation: { width: 500, height: 250 } })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
        children: [new ImageRun({ data: mun02Buffer, transformation: { width: 500, height: 180 } })],
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
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
        children: [new ImageRun({ data: assinaturaBuffer, transformation: { width: 180, height: 60 } })],
      }),
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
