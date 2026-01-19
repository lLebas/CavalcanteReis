// ========== HELPER: CONVERSÃO DE HTML PARA DOCX ==========
// Funções auxiliares para converter HTML simples em elementos da biblioteca docx
// CRUCIAL: Este arquivo garante que todo texto convertido do HTML siga o padrão do documento
// (Garamond 13pt, Preto, Justificado) para manter uniformidade visual

import { Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType } from "docx";
import DOMPurify from "dompurify";

// ========== ESTILO PADRÃO DO DOCUMENTO ==========
// Define o estilo padrão que será aplicado em TODOS os textos convertidos do HTML
// Isso garante uniformidade com o resto do documento (capa, títulos, rodapé)
const defaultStyle = {
  font: "Garamond",
  size: 26, // 13pt (docx usa meios-pontos: 13 * 2 = 26)
  color: "000000", // Preto absoluto (evita cores automáticas do Word)
};

// ========== FUNÇÃO: CONVERTER HTML SIMPLES PARA PARÁGRAFOS ==========
// Converte strings HTML simples (com tags <p>, <strong>) em Paragraphs do Word
// Suporta: parágrafos, negrito, quebras de linha, alinhamento
// IMPORTANTE: Sempre força justificado e estilo padrão para manter uniformidade
export const parseHtmlToDocx = (htmlContent: string): Paragraph[] => {
  if (!htmlContent || !htmlContent.trim()) {
    return [];
  }

  // Sanitiza o HTML removendo scripts e conteúdo perigoso
  const cleanHtml = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['p', 'strong', 'b', 'br', 'em', 'i'],
    ALLOWED_ATTR: []
  });

  // Remove quebras de linha extras que podem atrapalhar o parsing
  let normalizedHtml = cleanHtml.replace(/(\r\n|\n|\r)/gm, " ");

  // Divide por tags </p> para separar parágrafos
  const paragraphs = normalizedHtml
    .split(/<\/p>/i)
    .filter(p => p.trim() !== "" && !p.trim().startsWith('<div') && !p.trim().startsWith('<span'))
    .map(p => {
      // Remove tag de abertura <p> e seus atributos
      let cleanText = p.replace(/<p[^>]*>/i, "").trim();

      // Se não tiver conteúdo, pula
      if (!cleanText) {
        return null;
      }

      // FORÇA ALINHAMENTO JUSTIFICADO (padrão do documento)
      // Mesmo que o HTML tenha outro alinhamento, forçamos justificado para uniformidade
      const alignment = AlignmentType.JUSTIFIED;

      // Processa tags <strong> e <b> para negrito
      // Divide o texto por tags de negrito mantendo a ordem
      // Ex: "Texto normal <strong>negrito</strong> normal." vira array com 3 partes
      const parts = cleanText.split(/(<strong[^>]*>.*?<\/strong>|<b[^>]*>.*?<\/b>)/gi);

      const children = parts
        .filter(part => part.trim() !== "")
        .map(part => {
          // Verifica se a parte contém negrito
          const isBold = /<strong[^>]*>.*?<\/strong>/i.test(part) || /<b[^>]*>.*?<\/b>/i.test(part);

          // Remove todas as tags HTML para sobrar só o texto limpo
          let text = part.replace(/<\/?strong[^>]*>/gi, "")
            .replace(/<\/?b[^>]*>/gi, "")
            .replace(/<\/?em[^>]*>/gi, "")
            .replace(/<\/?i[^>]*>/gi, "")
            .replace(/<br\s*\/?>/gi, " "); // Converte <br> em espaço

          // Remove espaços múltiplos
          text = text.replace(/\s+/g, " ").trim();

          if (!text) return null;

          // Retorna o TextRun com o estilo padrão aplicado
          return new TextRun({
            text: text,
            bold: isBold,
            ...defaultStyle, // Aplica Garamond, 13pt, Preto em TODOS os textos
          });
        })
        .filter(Boolean) as TextRun[];

      // Se não tiver children, retorna parágrafo vazio
      if (children.length === 0) {
        return new Paragraph({
          text: " ",
          alignment,
          spacing: {
            after: 200, // Espaço após parágrafo (200 = 10pt)
            line: 360, // Espaçamento entre linhas (1.5x = 360, melhora legibilidade)
          },
        });
      }

      // Cria o parágrafo com alinhamento justificado e espaçamento adequado
      return new Paragraph({
        children: children,
        alignment, // Sempre JUSTIFICADO para uniformidade
        spacing: {
          after: 200, // Espaço após parágrafo (200 = 10pt)
          line: 360, // Espaçamento entre linhas (1.5x = 360)
        },
      });
    })
    .filter(Boolean) as Paragraph[];

  return paragraphs;
};

// ========== FUNÇÃO: CONVERTER TEXTO SIMPLES PARA PARÁGRAFO ==========
// Cria um parágrafo simples sem HTML
// IMPORTANTE: Usa o estilo padrão (Garamond 13pt, Preto) para manter uniformidade
export const createSimpleParagraph = (
  text: string,
  options?: {
    bold?: boolean;
    alignment?: typeof AlignmentType[keyof typeof AlignmentType];
    size?: number;
    spacingAfter?: number;
  }
): Paragraph => {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        bold: options?.bold || false,
        ...defaultStyle, // Aplica estilo padrão (Garamond, 13pt, Preto)
        size: options?.size || defaultStyle.size, // Permite sobrescrever tamanho se necessário
      }),
    ],
    alignment: options?.alignment || AlignmentType.LEFT,
    spacing: {
      after: options?.spacingAfter || 200,
      line: 360, // Espaçamento entre linhas (1.5x)
    },
  });
};

// ========== FUNÇÃO: CONVERTER TEXTO COM NEGRITO PARCIAL ==========
// Cria um parágrafo com partes em negrito e partes normais
// IMPORTANTE: Usa o estilo padrão (Garamond 13pt, Preto) para manter uniformidade
export const createMixedParagraph = (
  parts: Array<{ text: string; bold?: boolean }>,
  options?: {
    alignment?: typeof AlignmentType[keyof typeof AlignmentType];
    size?: number;
    spacingAfter?: number;
  }
): Paragraph => {
  return new Paragraph({
    children: parts.map(part =>
      new TextRun({
        text: part.text,
        bold: part.bold || false,
        ...defaultStyle, // Aplica estilo padrão (Garamond, 13pt, Preto)
        size: options?.size || defaultStyle.size, // Permite sobrescrever tamanho se necessário
      })
    ),
    alignment: options?.alignment || AlignmentType.LEFT,
    spacing: {
      after: options?.spacingAfter || 200,
      line: 360, // Espaçamento entre linhas (1.5x)
    },
  });
};
