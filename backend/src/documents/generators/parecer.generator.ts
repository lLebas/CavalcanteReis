import { Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun, Header, BorderStyle } from 'docx';
import * as fs from 'fs';
import * as path from 'path';
import { parseRichText } from './shared.helpers';

export async function generateParecerDocx(dados: any): Promise<Buffer> {
  const defaultFont = 'Garamond';
  const defaultSize = 22; // 11pt

  // 1. CARREGAR IMAGEM
  const publicDir = path.join(process.cwd(), 'public');
  let barrocasBuffer: Buffer | null = null;
  try {
    barrocasBuffer = fs.readFileSync(path.join(publicDir, 'barrocas.png'));
  } catch (error) {
    console.warn('Logo barrocas.png não encontrado');
  }

  // 2. CABEÇALHO COM LOGO
  const createHeader = () => new Header({
    children: barrocasBuffer ? [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: barrocasBuffer,
            transformation: { width: 340, height: 115 },
          } as any),
        ],
        spacing: { after: 200 },
      }),
    ] : [],
  });

  const docChildren: Paragraph[] = [];

  // 3. IDENTIFICAÇÃO CENTRALIZADA (sem negrito nos rótulos)
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: dados.municipio || '', font: defaultFont, size: defaultSize }),
      ],
      spacing: { after: 80 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: `Processo Administrativo: ${dados.processo || ''}`, font: defaultFont, size: defaultSize }),
      ],
      spacing: { after: 280 },
    })
  );

  // 4. TÍTULO
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'PARECER JURÍDICO',
          bold: true,
          size: 26,
          font: defaultFont,
          underline: {},
        }),
      ],
      spacing: { after: 800 },
    })
  );

  // 5. SEÇÕES COM NUMERAÇÃO ROMANA
  if (dados.secoes && Array.isArray(dados.secoes)) {
    dados.secoes.forEach((secao: any) => {
      // Título da seção (ex: "I- DO RELATÓRIO")
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: secao.titulo,
              bold: true,
              size: 24,
              font: defaultFont,
            }),
          ],
          spacing: { before: 400, after: 200 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' } },
        })
      );

      // Conteúdo da seção (parágrafos separados por \n\n)
      const paragrafos = (secao.conteudo || '').split('\n\n');
      paragrafos.forEach((paragrafo: string) => {
        if (!paragrafo.trim()) return;
        const parsedContent = parseRichText(paragrafo.trim(), defaultFont, defaultSize);
        docChildren.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: parsedContent,
            spacing: { after: 150 },
          })
        );
      });
    });
  }

  // 6. BLOCO DE ASSINATURA
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: dados.dataFormatada
            ? `${dados.local || ''} ${dados.dataFormatada}.`
            : `${dados.local || ''}, ____ de __________ de 2025.`,
          font: defaultFont,
          size: defaultSize,
        }),
      ],
      spacing: { before: 800, after: 400 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: dados.assessor || 'ASSESSORIA JURÍDICA',
          bold: true,
          font: defaultFont,
          size: defaultSize,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '_______________________________',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  const doc = new Document({
    creator: 'CAVALCANTE REIS',
    title: `Parecer Jurídico - ${dados.municipio}`,
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        }
      },
      headers: { default: createHeader() },
      children: docChildren,
    }],
  });

  return await Packer.toBuffer(doc);
}
