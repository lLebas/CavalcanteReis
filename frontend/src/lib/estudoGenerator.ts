// ========== GERADOR DE ESTUDO DE CONTRATAÇÃO DOCX ==========
import { Document, Packer, Paragraph, TextRun, ImageRun, Header, Footer, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { generateEstudoContratacaoContent } from "./docxHelper";
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
              width: largura * 9525, // Converte pt para EMUs
              height: (largura * 9525) * 0.34, // Proporção aproximada
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

// ========== FUNÇÃO: GERAR E BAIXAR ESTUDO DE CONTRATAÇÃO (VIA BACKEND) ==========
export const downloadEstudoContratacaoViaBackend = async (data: {
  municipio: string;
  processo: string;
  localAssinatura?: string;
  dia: string;
  mes: string;
  ano: string;
  topicos: Array<{ titulo: string; texto: string }>;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/documents/generate-estudo-docx`,
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

    saveAs(blob, `Estudo_Contratacao_${data.municipio.replace(/\//g, '-')}.docx`);

    return true;
  } catch (error) {
    console.error('Erro ao gerar Estudo de Contratação via backend:', error);
    throw error;
  }
};

// ========== FUNÇÃO LEGADA: GERAR E BAIXAR ESTUDO DE CONTRATAÇÃO (FRONTEND) ==========
// Mantida para compatibilidade, mas use downloadEstudoContratacaoViaBackend para melhor resultado
export const downloadEstudoContratacao = async (data: {
  municipio: string;
  processo: string;
  data: string;
  introducao: string;
  necessidade: string;
  objetivos: string;
  viabilidade: string;
}) => {
  try {
    // Carrega a logo
    const logoBuffer = await loadImageAsBuffer('/barrocas.png');

    // Cria o cabeçalho e rodapé
    const header = createLogoHeader(logoBuffer);
    const footer = createHorizontalFooter();

    // Gera o conteúdo do documento
    const content = generateEstudoContratacaoContent(data);

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
    saveAs(blob, `Estudo_Contratacao_${data.municipio.replace(/\//g, '-')}.docx`);

    return true;
  } catch (error) {
    console.error('Erro ao gerar Estudo de Contratação:', error);
    throw error;
  }
};
