'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '@/hooks/useApi';
import { firstMissingAlphabetLetter } from '@/lib/utils';

// Schema para criação de cliente
const CreateClientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
});

type CreateClientForm = z.infer<typeof CreateClientSchema>;

// Interface para cliente normalizado
interface Client {
  id: string;
  name: string;
  email: string;
  birthDate: string;
  missingLetter: string;
}

// Interface para resposta "desorganizada" da API
interface RawClientResponse {
  data: {
    clientes: Array<{
      info?: {
        nomeCompleto?: string;
        detalhes?: {
          email?: string;
          nascimento?: string;
        };
      };
      duplicado?: {
        nomeCompleto?: string;
      };
      estatisticas?: {
        vendas?: Array<{ data: string; valor: number }>;
      };
    }>;
  };
  meta?: {
    registroTotal?: number;
    pagina?: number;
  };
  redundante?: any;
}

export default function ClientesPage() {
  const { get, post, patch, delete: del } = useApi();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ name: '', email: '' });
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateClientForm>({
    resolver: zodResolver(CreateClientSchema),
  });

  // Normalizar dados da API
  const normalizeClients = (rawData: RawClientResponse): Client[] => {
    return (rawData.data?.clientes || [])
      .map((item) => {
        const name = item.info?.nomeCompleto || item.duplicado?.nomeCompleto || '';
        const email = item.info?.detalhes?.email || '';
        const birthDate = item.info?.detalhes?.nascimento || '';
        
        if (!name || !email) return null;
        
        return {
          id: Math.random().toString(36).substr(2, 9), // ID temporário
          name,
          email,
          birthDate,
          missingLetter: firstMissingAlphabetLetter(name),
        };
      })
      .filter(Boolean) as Client[];
  };

  // Carregar clientes
  const loadClients = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (filters.name) queryParams.set('name', filters.name);
      if (filters.email) queryParams.set('email', filters.email);

      const response = await get(`/clients?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao carregar clientes');
      }

      const rawData: RawClientResponse = await response.json();
      const normalizedClients = normalizeClients(rawData);
      setClients(normalizedClients);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Criar cliente
  const onCreateClient = async (data: CreateClientForm) => {
    try {
      const response = await post('/clients', data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar cliente');
      }

      reset();
      loadClients();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Editar cliente
  const onEditClient = async (client: Client) => {
    setEditingClient(client);
  };

  // Salvar edição
  const onSaveEdit = async (data: CreateClientForm) => {
    if (!editingClient) return;

    try {
      const response = await patch(`/clients?id=${editingClient.id}`, data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar cliente');
      }

      setEditingClient(null);
      loadClients();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Deletar cliente
  const onDeleteClient = async (client: Client) => {
    if (!confirm(`Tem certeza que deseja deletar ${client.name}?`)) return;

    try {
      const response = await del(`/clients?id=${client.id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao deletar cliente');
      }

      loadClients();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Carregar clientes quando filtros mudarem
  useEffect(() => {
    loadClients();
  }, [filters.name, filters.email]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Clientes</h2>
        <p className="mt-1 text-sm text-gray-500">
          Adicione, edite e gerencie os clientes da sua loja
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome
            </label>
            <input
              type="text"
              value={filters.name}
              onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Filtrar por nome..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={filters.email}
              onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Filtrar por e-mail..."
            />
          </div>
        </div>
      </div>

      {/* Formulário de criação */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {editingClient ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
        </h3>
        
        <form onSubmit={handleSubmit(editingClient ? onSaveEdit : onCreateClient)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                {...register('name')}
                defaultValue={editingClient?.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome do cliente"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                {...register('email')}
                defaultValue={editingClient?.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento
              </label>
              <input
                {...register('birthDate')}
                type="date"
                defaultValue={editingClient?.birthDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvando...' : (editingClient ? 'Atualizar' : 'Adicionar')}
            </button>
            
            {editingClient && (
              <button
                type="button"
                onClick={() => {
                  setEditingClient(null);
                  reset();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de clientes */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Clientes ({clients.length})
          </h3>
        </div>

        {error && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-mail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nascimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Letra Ausente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Carregando clientes...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(client.birthDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 font-mono">
                        {client.missingLetter}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => onEditClient(client)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDeleteClient(client)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
