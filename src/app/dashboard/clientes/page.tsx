'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '@/hooks/useApi';
import { firstMissingAlphabetLetter } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// Schemas de validação
const CreateClientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
});

const UpdateClientSchema = CreateClientSchema.partial();

type CreateClientForm = z.infer<typeof CreateClientSchema>;
type UpdateClientForm = z.infer<typeof UpdateClientSchema>;

// Interfaces
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

interface Client {
  id: string;
  name: string;
  email: string;
  birthDate: string;
  missingLetter: string;
}

export default function ClientesPage() {
  const { get, post, patch, delete: del } = useApi();
  const { theme } = useTheme();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [filters, setFilters] = useState({ name: '', email: '' });

  // Formulários
  const createForm = useForm<CreateClientForm>({
    resolver: zodResolver(CreateClientSchema),
    defaultValues: { name: '', email: '', birthDate: '' },
  });

  const updateForm = useForm<UpdateClientForm>({
    resolver: zodResolver(UpdateClientSchema),
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
          id: Math.random().toString(36).substr(2, 9), // ID temporário para frontend
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
      if (filters.name) queryParams.append('name', filters.name);
      if (filters.email) queryParams.append('email', filters.email);

      const response = await get(`/clients?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Erro ao carregar clientes');

      const data = await response.json();
      const normalizedClients = normalizeClients(data);
      setClients(normalizedClients);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  // Criar cliente
  const createClient = async (data: CreateClientForm) => {
    try {
      const response = await post('/clients', data);
      if (!response.ok) throw new Error('Erro ao criar cliente');

      setIsCreateDialogOpen(false);
      createForm.reset();
      loadClients();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar cliente');
    }
  };

  // Atualizar cliente
  const updateClient = async (data: UpdateClientForm) => {
    if (!editingClient) return;

    try {
      const response = await patch(`/clients?id=${editingClient.id}`, data);
      if (!response.ok) throw new Error('Erro ao atualizar cliente');

      setIsEditDialogOpen(false);
      setEditingClient(null);
      updateForm.reset();
      loadClients();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar cliente');
    }
  };

  // Deletar cliente
  const deleteClient = async (clientId: string) => {
    if (!confirm('Tem certeza que deseja deletar este cliente?')) return;

    try {
      const response = await del(`/clients?id=${clientId}`);
      if (!response.ok) throw new Error('Erro ao deletar cliente');

      loadClients();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar cliente');
    }
  };

  // Abrir diálogo de edição
  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    updateForm.reset({
      name: client.name,
      email: client.email,
      birthDate: client.birthDate,
    });
    setIsEditDialogOpen(true);
  };

  // Carregar clientes ao montar componente
  useEffect(() => {
    loadClients();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    loadClients();
  }, [filters]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-3xl font-bold tracking-tight transition-colors duration-200 ${
            theme === 'dark' ? 'text-slate-800' : 'text-gray-900'
          }`}>
            Gerenciar Clientes
          </h2>
          <p className={`mt-2 transition-colors duration-200 ${
            theme === 'dark' ? 'text-slate-600' : 'text-gray-600'
          }`}>
            Cadastre, edite e gerencie todos os clientes da loja
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Cliente</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo cliente
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(createClient)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={theme === 'dark' ? 'text-slate-700' : ''}>
                        Nome Completo
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome do cliente" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={theme === 'dark' ? 'text-slate-700' : ''}>
                        E-mail
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="cliente@email.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={theme === 'dark' ? 'text-slate-700' : ''}>
                        Data de Nascimento
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Criar Cliente</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card className={theme === 'dark' ? 'bg-white/90 border-slate-200/50' : ''}>
        <CardHeader>
          <CardTitle className={theme === 'dark' ? 'text-slate-800' : ''}>
            Filtros
          </CardTitle>
          <CardDescription className={theme === 'dark' ? 'text-slate-600' : ''}>
            Filtre os clientes por nome ou e-mail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name-filter" className={theme === 'dark' ? 'text-slate-700' : ''}>
                Nome
              </Label>
              <Input
                id="name-filter"
                placeholder="Filtrar por nome..."
                value={filters.name}
                onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="email-filter" className={theme === 'dark' ? 'text-slate-700' : ''}>
                E-mail
              </Label>
              <Input
                id="email-filter"
                placeholder="Filtrar por e-mail..."
                value={filters.email}
                onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Erro */}
      {error && (
        <Card className={`transition-colors duration-200 ${
          theme === 'dark'
            ? 'border-red-200 bg-red-50' 
            : 'border-red-200 bg-red-50'
        }`}>
          <CardContent className="pt-6">
            <p className={`font-medium transition-colors duration-200 ${
              theme === 'dark' ? 'text-red-700' : 'text-red-700'
            }`}>
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Clientes */}
      <Card className={theme === 'dark' ? 'bg-white/90 border-slate-200/50' : ''}>
        <CardHeader>
          <CardTitle className={theme === 'dark' ? 'text-slate-800' : ''}>
            Clientes ({clients.length})
          </CardTitle>
          <CardDescription className={theme === 'dark' ? 'text-slate-600' : ''}>
            Lista completa de clientes cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className={`ml-2 transition-colors duration-200 ${
                theme === 'dark' ? 'text-slate-600' : 'text-gray-600'
              }`}>
                Carregando clientes...
              </span>
            </div>
          ) : clients.length === 0 ? (
            <div className={`text-center py-8 transition-colors duration-200 ${
              theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
            }`}>
              Nenhum cliente encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className={theme === 'dark' ? 'border-slate-200' : ''}>
                  <TableHead className={theme === 'dark' ? 'text-slate-700' : ''}>Nome</TableHead>
                  <TableHead className={theme === 'dark' ? 'text-slate-700' : ''}>E-mail</TableHead>
                  <TableHead className={theme === 'dark' ? 'text-slate-700' : ''}>Data de Nascimento</TableHead>
                  <TableHead className={theme === 'dark' ? 'text-slate-700' : ''}>Letra Ausente</TableHead>
                  <TableHead className={`text-right ${theme === 'dark' ? 'text-slate-700' : ''}`}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id} className={theme === 'dark' ? 'border-slate-200' : ''}>
                    <TableCell className={`font-medium transition-colors duration-200 ${
                      theme === 'dark' ? 'text-slate-800' : ''
                    }`}>
                      {client.name}
                    </TableCell>
                    <TableCell className={theme === 'dark' ? 'text-slate-600' : ''}>
                      {client.email}
                    </TableCell>
                    <TableCell className={theme === 'dark' ? 'text-slate-600' : ''}>
                      {new Date(client.birthDate).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.missingLetter === '-' ? 'default' : 'secondary'}>
                        {client.missingLetter}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(client)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteClient(client.id)}
                        >
                          Deletar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Modifique os dados do cliente
            </DialogDescription>
          </DialogHeader>
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(updateClient)} className="space-y-4">
              <FormField
                control={updateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={theme === 'dark' ? 'text-slate-700' : ''}>
                      Nome Completo
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome do cliente" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={theme === 'dark' ? 'text-slate-700' : ''}>
                      E-mail
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="cliente@email.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={theme === 'dark' ? 'text-slate-700' : ''}>
                      Data de Nascimento
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar Alterações</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
