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

export interface Minuta {
  id?: string;
  municipio: string;
  objeto?: string;
  valorContrato?: string;
  prazoVigencia?: string;
  dataAssinatura?: string;
  representante?: string;
  cargo?: string;
  services?: Record<string, boolean>;
  customCabimentos?: Record<string, string>;
  formData?: Record<string, unknown>;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const minutasApi = {
  getAll: async (): Promise<Minuta[]> => {
    const response = await api.get('/minutas');
    return response.data;
  },

  getById: async (id: string): Promise<Minuta> => {
    const response = await api.get(`/minutas/${id}`);
    return response.data;
  },

  create: async (minuta: Omit<Minuta, 'id' | 'createdAt' | 'updatedAt'>): Promise<Minuta> => {
    const response = await api.post('/minutas', minuta);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/minutas/${id}`);
  },
};

export interface EstudoContratacao {
  id?: string;
  municipio: string;
  formData?: Record<string, unknown>;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const estudosApi = {
  getAll: async (): Promise<EstudoContratacao[]> => {
    const response = await api.get('/estudos');
    return response.data;
  },

  getById: async (id: string): Promise<EstudoContratacao> => {
    const response = await api.get(`/estudos/${id}`);
    return response.data;
  },

  create: async (estudo: Omit<EstudoContratacao, 'id' | 'createdAt' | 'updatedAt'>): Promise<EstudoContratacao> => {
    const response = await api.post('/estudos', estudo);
    return response.data;
  },

  update: async (id: string, estudo: Partial<EstudoContratacao>): Promise<EstudoContratacao> => {
    const response = await api.put(`/estudos/${id}`, estudo);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/estudos/${id}`);
  },
};

export interface TermoReferencia {
  id?: string;
  municipio: string;
  formData?: Record<string, unknown>;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const termosApi = {
  getAll: async (): Promise<TermoReferencia[]> => {
    const response = await api.get('/termos');
    return response.data;
  },

  getById: async (id: string): Promise<TermoReferencia> => {
    const response = await api.get(`/termos/${id}`);
    return response.data;
  },

  create: async (termo: Omit<TermoReferencia, 'id' | 'createdAt' | 'updatedAt'>): Promise<TermoReferencia> => {
    const response = await api.post('/termos', termo);
    return response.data;
  },

  update: async (id: string, termo: Partial<TermoReferencia>): Promise<TermoReferencia> => {
    const response = await api.put(`/termos/${id}`, termo);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/termos/${id}`);
  },
};

export interface ParecerJuridico {
  id?: string;
  municipio: string;
  formData?: Record<string, unknown>;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const pareceresApi = {
  getAll: async (): Promise<ParecerJuridico[]> => {
    const response = await api.get('/pareceres');
    return response.data;
  },

  getById: async (id: string): Promise<ParecerJuridico> => {
    const response = await api.get(`/pareceres/${id}`);
    return response.data;
  },

  create: async (parecer: Omit<ParecerJuridico, 'id' | 'createdAt' | 'updatedAt'>): Promise<ParecerJuridico> => {
    const response = await api.post('/pareceres', parecer);
    return response.data;
  },

  update: async (id: string, parecer: Partial<ParecerJuridico>): Promise<ParecerJuridico> => {
    const response = await api.put(`/pareceres/${id}`, parecer);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/pareceres/${id}`);
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

