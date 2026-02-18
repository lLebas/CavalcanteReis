import { Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun, BorderStyle } from 'docx';
import * as fs from 'fs';
import * as path from 'path';
import { parseRichText } from './shared.helpers';

export async function generateEstudoDocx(dados: any): Promise<Buffer> {
  const defaultFont = 'Garamond';
  const defaultSize = 26; // 13pt (docx usa meios-pontos: 13 * 2 = 26)

  // 1. CARREGAR IMAGEM COMO BUFFER (Resolve o erro da imagem não aparecer)
  const publicDir = path.join(process.cwd(), 'frontend', 'public');
  let barrocasBuffer: Buffer | null = null;

  try {
    barrocasBuffer = fs.readFileSync(path.join(publicDir, 'barrocas.png'));
  } catch (error) {
    // Tenta caminho alternativo
    try {
      barrocasBuffer = fs.readFileSync(path.join(process.cwd(), 'public', 'barrocas.png'));
    } catch (e) {
      console.warn('Logo barrocas.png não encontrado, continuando sem imagem');
    }
  }

  // 2. MARGENS IDÊNTICAS AO FRONTEND (em Twips: 1 inch = 1440 twips)
  const MARGENS = {
    top: 1417,    // 2.5cm (igual ao frontend)
    right: 1417,  // 2.5cm
    bottom: 1417, // 2.5cm
    left: 1417,   // 2.5cm
  };

  // ARRAY ONDE VAMOS COLOCAR TUDO (Isso garante que nada seja cortado)
  const children: Paragraph[] = [];

  // 3. CABEÇALHO MANUAL (Logo centralizada)
  if (barrocasBuffer) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: barrocasBuffer,
            transformation: {
              width: 340,
              height: 115,
            },
          } as any),
        ],
        spacing: { before: 0, after: 200 },
      })
    );
  }

  // Identificação centralizada (sem negrito nos rótulos)
  if (dados.municipio) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: dados.municipio, font: defaultFont, size: 22 }),
        ],
        spacing: { after: 80 },
      })
    );
  }

  if (dados.processo) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: `Processo Administrativo: ${dados.processo}`, font: defaultFont, size: 22 }),
        ],
        spacing: { after: 80 },
      })
    );
  }

  if (dados.dia && dados.mes && dados.ano) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: `${dados.dia} de ${dados.mes} de ${dados.ano}`, font: defaultFont, size: 22 }),
        ],
        spacing: { after: 280 },
      })
    );
  }

  // Título principal
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'ESTUDO DE VIABILIDADE DE CONTRATAÇÃO',
          bold: true,
          size: 26,
          underline: {},
          font: defaultFont,
        }),
      ],
      spacing: { after: 800 },
    })
  );

  // 4. LOOP DINÂMICO
  if (dados.topicos && Array.isArray(dados.topicos)) {
    dados.topicos.forEach((topico: any, index: number) => {
      // Título do tópico
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: topico.titulo,
              bold: true,
              size: 24,
              font: defaultFont,
            }),
          ],
          spacing: { before: index === 0 ? 0 : 300, after: 150 },
        })
      );

      // Conteúdo do tópico (com suporte a negritos)
      const parsedContent = parseRichText(topico.texto, defaultFont, defaultSize);
      children.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: parsedContent,
          spacing: { after: 200 },
        })
      );
    });
  }

  // 5. FINALIZAÇÃO APENAS NA ÚLTIMA PÁGINA (Resolve o erro do rodapé repetido)
  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: `${dados.localAssinatura || dados.municipio}, ${dados.dia} de ${dados.mes} de ${dados.ano}.`,
          size: 22,
          font: defaultFont,
        }),
      ],
      spacing: { before: 1200 },
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '__________________________________________',
          size: 22,
          font: defaultFont,
        }),
      ],
      spacing: { before: 800 },
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'Equipe de Planejamento',
          bold: true,
          size: 20,
          font: defaultFont,
        }),
      ],
      spacing: { before: 200, after: 600 },
    })
  );

  // Rodapé manual (apenas na última página)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
      children: [],
      spacing: { before: 400, after: 100 },
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'Rio de Janeiro - RJ        Brasília - DF        Manaus - AM',
          size: 18,
          font: defaultFont,
        }),
      ],
      spacing: { after: 50 },
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'WWW.CAVALCANTEREIS.ADV.BR',
          size: 16,
          color: '888888',
          font: defaultFont,
        }),
      ],
      spacing: { after: 100 },
    })
  );

  const doc = new Document({
    sections: [{
      properties: { page: { margin: MARGENS } },
      children: children, // Aqui vai a lista completa sem cortes
    }],
  });

  return Packer.toBuffer(doc);
}
