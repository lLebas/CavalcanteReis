// ========== GERADOR DE TERMO DE REFERÊNCIA DOCX ==========
import { Document, Packer, Paragraph, TextRun, ImageRun, Header, Footer, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { generateTermoReferenciaContent } from "./docxHelper";
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ========== FUNÇÃO: GERAR E BAIXAR TERMO VIA BACKEND ==========
export const downloadTermoReferenciaViaBackend = async (data: {
  municipio: string;
  endereco?: string;
  localAssinatura?: string;
  processo: string;
  dataFormatada: string;
  ano: string;
  responsavel: string;
  cargoResponsavel: string;
  secretario: string;
  cargoSecretario: string;
  clausulas: Array<{
    numero: number;
    titulo: string;
    subitens: Array<{
      numero: string;
      texto: string;
    }>;
  }>;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/documents/generate-termo-docx`,
      data,
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    saveAs(blob, `Termo_Referencia_${data.municipio.replace(/\//g, '-')}.docx`);

    return true;
  } catch (error) {
    console.error('Erro ao gerar Termo de Referência via backend:', error);
    throw error;
  }
};

// ========== FUNÇÃO AUXILIAR: CARREGAR IMAGEM ==========
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

// ========== FUNÇÃO: CRIAR CABEÇALHO COM LOGO ==========
const createLogoHeader = (logoBuffer: ArrayBuffer | null, largura: number = 160): Header => {
  return new Header({
    children: logoBuffer ? [
      new Paragraph({
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: {
              width: largura,
              height: Math.round(largura * 0.338), // proporção barrocas.png (115/340)
            },
          } as any),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    ] : [
      new Paragraph({ text: "" })
    ],
  });
};

// ========== FUNÇÃO: CRIAR RODAPÉ HORIZONTAL ==========
const createHorizontalFooter = (): Footer => {
  return new Footer({
    children: [
      // Linha superior
      new Paragraph({
        children: [
          new TextRun({
            text: "_______________________________________________________________________________",
            font: "Garamond",
            size: 16,
            color: "CCCCCC",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      // Cidades
      new Paragraph({
        children: [
          new TextRun({
            text: "Rio de Janeiro - RJ        Brasília - DF        Manaus - AM",
            font: "Garamond",
            size: 18, // 9pt
            bold: false,
            color: "000000",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 50 },
      }),
      // Website
      new Paragraph({
        children: [
          new TextRun({
            text: "WWW.CAVALCANTEREIS.ADV.BR",
            font: "Garamond",
            size: 16, // 8pt
            color: "888888",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
    ],
  });
};

// ========== FUNÇÃO: GERAR E BAIXAR TERMO DE REFERÊNCIA ==========
export const downloadTermoReferencia = async (data: {
  municipio: string;
  processo: string;
  data: string;
  objeto: string;
  fundamentacao: string;
  obrigacoes: string;
  prazo: string;
  pagamento: string;
}) => {
  try {
    // Carrega a logo
    const logoBuffer = await loadImageAsBuffer('/logo-cavalcante-reis.png');

    // Cria o cabeçalho e rodapé
    const header = createLogoHeader(logoBuffer);
    const footer = createHorizontalFooter();

    // Gera o conteúdo do documento
    const content = generateTermoReferenciaContent(data);

    // Cria o documento
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                orientation: "portrait",
                width: 11906, // A4 (210mm)
                height: 16838, // A4 (297mm)
              },
              margin: {
                top: 1417,   // 2.5cm
                right: 1417, // 2.5cm
                bottom: 2268, // 4cm (espaço para o rodapé)
                left: 1417,  // 2.5cm
              },
            },
          },
          headers: {
            default: header,
          },
          footers: {
            default: footer,
          },
          children: content,
        },
      ],
      styles: {
        default: {
          document: {
            run: {
              font: "Garamond",
              size: 26, // 13pt
            },
          },
        },
      },
    });

    // Gera o blob e faz o download
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Termo_Referencia_${data.municipio.replace(/\//g, '-')}.docx`);

    return true;
  } catch (error) {
    console.error('Erro ao gerar Termo de Referência:', error);
    throw error;
  }
};
