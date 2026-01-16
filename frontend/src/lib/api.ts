import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Proposta {
  id?: string;
  municipio: string;
  data?: string;
  destinatario?: string;
  prazo?: string;
  services?: Record<string, boolean>;
  customCabimentos?: Record<string, string>;
  customEstimates?: Record<string, string>;
  footerOffices?: Record<string, any>;
  paymentValue?: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const propostasApi = {
  getAll: async (): Promise<Proposta[]> => {
    const response = await api.get('/propostas');
    return response.data;
  },

  getById: async (id: string): Promise<Proposta> => {
    const response = await api.get(`/propostas/${id}`);
    return response.data;
  },

  create: async (proposta: Omit<Proposta, 'id' | 'createdAt' | 'updatedAt'>): Promise<Proposta> => {
    const response = await api.post('/propostas', proposta);
    return response.data;
  },

  update: async (id: string, proposta: Partial<Proposta>): Promise<Proposta> => {
    const response = await api.put(`/propostas/${id}`, proposta);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/propostas/${id}`);
  },
};

export const documentsApi = {
  processDocx: async (file: File, municipio?: string, data?: string): Promise<Blob> => {
    const formData = new FormData();
    formData.append('file', file);
    if (municipio) formData.append('municipio', municipio);
    if (data) formData.append('data', data);

    const response = await api.post('/documents/process-docx', formData, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  generatePropostaDocx: async (data: any): Promise<Blob> => {
    const response = await api.post('/documents/generate-proposta-docx', data, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  generateMinutaDocx: async (data: any): Promise<Blob> => {
    const response = await api.post('/documents/generate-minuta-docx', data, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
};

