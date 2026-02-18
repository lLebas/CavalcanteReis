// ========== GERADOR DE PARECER JURÍDICO DOCX ==========
import axios from 'axios';
import { saveAs } from 'file-saver';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ========== FUNÇÃO: GERAR E BAIXAR PARECER VIA BACKEND ==========
export const downloadParecerJuridicoViaBackend = async (data: {
  municipio: string;
  processo: string;
  local: string;
  dataFormatada: string;
  assessor: string;
  secoes: Array<{
    numero: number;
    titulo: string;
    conteudo: string;
  }>;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/documents/generate-parecer-docx`,
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

    saveAs(blob, `Parecer_Juridico_${data.municipio.replace(/\//g, '-')}.docx`);

    return true;
  } catch (error) {
    console.error('Erro ao gerar Parecer Jurídico via backend:', error);
    throw error;
  }
};
