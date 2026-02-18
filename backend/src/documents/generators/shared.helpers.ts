import { TextRun } from 'docx';

/**
 * Converte texto com **negrito** markdown para array de TextRun do docx.
 */
export function parseRichText(
  text: string,
  font: string = 'Garamond',
  size: number = 26,
): TextRun[] {
  if (!text) return [new TextRun({ text: '', font, size })];

  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts
    .filter((part) => part.length > 0)
    .map((part) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return new TextRun({
          text: part.replace(/\*\*/g, ''),
          bold: true,
          font,
          size,
        });
      }
      return new TextRun({ text: part, font, size });
    });
}
