import { Injectable } from '@nestjs/common';
import * as mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun } from 'docx';

import { generatePropostaDocx } from './generators/proposta.generator';
import { generateMinutaDocx } from './generators/minuta.generator';
import { generateEstudoDocx } from './generators/estudo.generator';
import { generateTermoDocx } from './generators/termo.generator';
import { generateParecerDocx } from './generators/parecer.generator';

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
    return generatePropostaDocx(data);
  }

  async generateMinutaDocx(data: any): Promise<Buffer> {
    return generateMinutaDocx(data);
  }

  async generateEstudoDocx(dados: any): Promise<Buffer> {
    return generateEstudoDocx(dados);
  }

  async generateTermoDocx(dados: any): Promise<Buffer> {
    return generateTermoDocx(dados);
  }

  async generateParecerDocx(dados: any): Promise<Buffer> {
    return generateParecerDocx(dados);
  }
}
