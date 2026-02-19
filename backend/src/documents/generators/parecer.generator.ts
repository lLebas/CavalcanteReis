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
        spacing: { before: 0, after: 0 },
      }),
    ] : [],
  });

  const docChildren: Paragraph[] = [];

  // 3. TÍTULO CENTRALIZADO
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
      spacing: { before: 0, after: 280 },
    })
  );

  // 4. TEXTO TÉCNICO ALINHADO À DIREITA (recuo ~38% da largura do conteúdo)
  const textoTecnico = `PARECER JURÍDICO, PROCESSO Nº ${dados.processo || '_______'}, CONTRATO OBJETIVANDO O DESENVOLVIMENTO DE SERVIÇOS ADVOCATÍCIOS ESPECIALIZADOS EM PRESTAÇÃO DE SERVIÇOS DE ASSESSORIA TÉCNICA E JURÍDICA NAS ÁREAS DE DIREITO PÚBLICO, TRIBUTÁRIO, ECONÔMICO, FINANCEIRO E PREVIDENCIÁRIO, EM ESPECIAL PARA ALCANÇAR O INCREMENTO DE RECEITAS, DENTRE ELAS: FOLHA DE PAGAMENTO, RECUPERAÇÃO DE VERBAS INDENIZATÓRIAS E CONTRIBUIÇÕES PREVIDENCIÁRIAS; REVISAR O RECOLHIMENTO INDEVIDO AO PROGRAMA DE FORMAÇÃO DO PATRIMÔNIO DO SERVIDOR PÚBLICO (PASEP), REVISAR O RECOLHIMENTO INDEVIDO A CONTRIBUIÇÃO DE SAT/RAT, BEM COMO RECUPERAR OS CRÉDITOS DE ISSQN; RECUPERAÇÃO DOS VALORES REPASSADOS À MENOR PELA UNIÃO FEDERAL A TÍTULO DE FUNDEF e FUNDEB ; AUDITORIA E CONSULTORIA ENERGÉTICA CONSISTENTE NO LEVANTAMENTO DE DADOS, PREPARAÇÃO, ENCAMINHAMENTO E ACOMPANHAMENTO DA RECUPERAÇÃO FINANCEIRA DOS VALORES PAGOS OU COBRADOS INDEVIDAMENTE PELA CONCESSIONÁRIA/DISTRIBUIDORA DE ENERGIA ELÉTRICA; RECUPERAÇÃO DE IMPOSTO DE RENDA INCIDENTE SOBRE AS AQUISIÇÕES DE BENS E SERVIÇOS FICANDO RESPONSÁVEL PELO AJUIZAMENTO, ACOMPANHAMENTO E INTERVENÇÕES DE TERCEIRO EM AÇÕES JUDICIAIS E ADMINISTRATIVAS DE INTERESSE DO MUNICÍPIO.`;

  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: 3450 },
      children: [
        new TextRun({
          text: textoTecnico,
          bold: true,
          font: defaultFont,
          size: 18, // 9pt
        }),
      ],
      spacing: { after: 560 },
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
    title: `Parecer Jurídico - Processo ${dados.processo || ''}`,
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1417,    // 2.5cm
            right: 1417,
            bottom: 1417,
            left: 1417,
            header: 450,  // 0.8cm — logo compacto no topo
          },
        }
      },
      headers: { default: createHeader() },
      children: docChildren,
    }],
  });

  return await Packer.toBuffer(doc);
}
