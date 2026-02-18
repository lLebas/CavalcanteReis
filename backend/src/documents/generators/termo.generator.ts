import { Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun, Header, BorderStyle } from 'docx';
import * as fs from 'fs';
import * as path from 'path';
import { parseRichText } from './shared.helpers';

export async function generateTermoDocx(dados: any): Promise<Buffer> {
  const defaultFont = 'Garamond';
  const defaultSize = 22; // 11pt

  // 1. CARREGAR IMAGEM COMO BUFFER
  const publicDir = path.join(process.cwd(), 'public');
  let barrocasBuffer: Buffer | null = null;

  try {
    barrocasBuffer = fs.readFileSync(path.join(publicDir, 'barrocas.png'));
  } catch (error) {
    console.warn('Logo barrocas.png não encontrado');
  }

  // Cabeçalho com logo
  const createHeader = () => {
    return new Header({
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
  };

  const docChildren: Paragraph[] = [];

  // DADOS DO CONTRATANTE
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'DADOS DO CONTRATANTE:', bold: false, size: 24, font: defaultFont }),
      ],
      spacing: { after: 80 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: dados.municipio || '', bold: false, size: 24, font: defaultFont }),
      ],
      spacing: { after: 80 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: `Endereço: ${dados.endereco || ''}`, size: defaultSize, font: defaultFont }),
      ],
      spacing: { after: 280 },
    })
  );

  // Título principal
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'TERMO DE REFERÊNCIA',
          bold: true,
          size: 26,
          font: defaultFont,
          underline: {},
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'INEXIGIBILIDADE DE LICITAÇÃO',
          bold: false,
          size: 24,
          font: defaultFont,
        }),
      ],
      spacing: { after: 800 },
    })
  );

  // Processar cláusulas dinamicamente
  if (dados.clausulas && Array.isArray(dados.clausulas)) {
    dados.clausulas.forEach((clausula: any) => {
      // Título da cláusula principal (ex: "1. DO OBJETO:")
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: clausula.titulo,
              bold: true,
              size: 24,
              font: defaultFont,
            }),
          ],
          spacing: { before: 300, after: 200 },
        })
      );

      // Subitens da cláusula
      if (clausula.subitens && Array.isArray(clausula.subitens)) {
        clausula.subitens.forEach((subitem: any) => {
          const parsedContent = parseRichText(subitem.texto, defaultFont, defaultSize);
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: subitem.numero + ' ',
                  bold: true,
                  font: defaultFont,
                  size: defaultSize,
                }),
                ...parsedContent,
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            })
          );
        });
      }
    });
  }

  // Assinaturas no final
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: 'E assim justos e contratados, as partes firmam o presente, em 03 (três) vias de igual teor e forma para o mesmo fim, juntamente com duas testemunhas civilmente capazes.',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
      spacing: { before: 800, after: 200 },
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: dados.dataFormatada
            ? `${dados.localAssinatura || dados.municipio}, ${dados.dataFormatada}.`
            : `${dados.localAssinatura || dados.municipio}, ____ de __________de ${dados.ano || '2025'}.`,
          font: defaultFont,
          size: defaultSize,
        }),
      ],
      spacing: { after: 600 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '_________________________________',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
      spacing: { before: 600, after: 100 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: dados.responsavel || 'XXXX',
          bold: true,
          font: defaultFont,
          size: defaultSize,
        }),
      ],
      spacing: { after: 50 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: dados.cargoResponsavel || 'Responsável pelo Termo de Referência',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
      spacing: { after: 400 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '_________________________________',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: dados.secretario || 'XXX',
          bold: true,
          font: defaultFont,
          size: defaultSize,
        }),
      ],
      spacing: { after: 50 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: dados.cargoSecretario || 'Secretário Municipal de Finanças',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
      spacing: { after: 600 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'A P R O V O, o presente Termo de Referência, consoante o previsto no art. 7º da Lei Federal n.º 14.133/2021.',
          font: defaultFont,
          size: defaultSize,
          bold: true,
        }),
      ],
      spacing: { after: 400 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'Em _____/_____/_____',
          font: defaultFont,
          size: defaultSize,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  const doc = new Document({
    creator: 'CAVALCANTE REIS',
    title: `Termo de Referência - ${dados.municipio}`,
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
