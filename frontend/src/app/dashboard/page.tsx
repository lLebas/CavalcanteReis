'use client';

import React, { useState, useEffect } from 'react';
import {
  estudosApi,
  termosApi,
  pareceresApi,
  minutasApi,
  propostasApi
} from '@/lib/api';
import { useRouter } from 'next/navigation';

type DocumentType = 'estudos' | 'termos' | 'pareceres' | 'minutas' | 'propostas';

interface Document {
  id: string;
  municipio: string;
  processo?: string;
  created_at: string;
  updated_at: string;
}

const DOCUMENT_TYPES = {
  estudos: {
    label: 'Estudos de Contratação',
    api: estudosApi,
    route: '/estudo-contratacao'
  },
  termos: {
    label: 'Termos de Referência',
    api: termosApi,
    route: '/termo-referencia'
  },
  pareceres: {
    label: 'Pareceres Jurídicos',
    api: pareceresApi,
    route: '/parecer-juridico'
  },
  minutas: {
    label: 'Minutas',
    api: minutasApi,
    route: '/minuta-generator'
  },
  propostas: {
    label: 'Propostas',
    api: propostasApi,
    route: '/proposal-generator'
  },
};

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DocumentType>('estudos');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [activeTab]);

  const loadDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const api = DOCUMENT_TYPES[activeTab].api;
      const response = await api.getAll();

      // A API retorna diretamente o array, não um objeto com .data
      const sortedDocs = (response as any[]).sort((a: Document, b: Document) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      setDocuments(sortedDocs);
    } catch (err: any) {
      console.error('Erro ao carregar documentos:', err);
      setError(err.message || 'Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }

    try {
      const api = DOCUMENT_TYPES[activeTab].api;
      await api.delete(id);
      await loadDocuments();
    } catch (err: any) {
      console.error('Erro ao excluir documento:', err);
      alert('Erro ao excluir documento: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handleOpen = (id: string) => {
    const route = DOCUMENT_TYPES[activeTab].route;
    router.push(`${route}?id=${id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard de Documentos</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gerencie todos os seus documentos salvos
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as DocumentType)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {value.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum documento encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando um novo {DOCUMENT_TYPES[activeTab].label.toLowerCase()}.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push(DOCUMENT_TYPES[activeTab].route)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Criar Novo
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Município
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Atualizado em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {doc.municipio}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.processo || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(doc.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(doc.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpen(doc.id)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Abrir
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {documents.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Total: {documents.length} {documents.length === 1 ? 'documento' : 'documentos'}
          </div>
        )}
      </div>
    </div>
  );
}
