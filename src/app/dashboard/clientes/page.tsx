'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '@/hooks/useApi';
import { firstMissingAlphabetLetter, normalizeClients, type RawClientResponse } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { CardSkeleton } from '@/components/ui/card-skeleton';
import { FormSkeleton } from '@/components/ui/form-skeleton';

// Schemas de validação
const CreateClientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
});

const UpdateClientSchema = CreateClientSchema.partial();

type CreateClientForm = z.infer<typeof CreateClientSchema>;
type UpdateClientForm = z.infer<typeof UpdateClientSchema>;



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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
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

  // Abrir diálogo de confirmação de exclusão
  const openDeleteDialog = (client: Client) => {
    setDeletingClient(client);
    setIsDeleteDialogOpen(true);
  };

  // Deletar cliente
  const deleteClient = async () => {
    if (!deletingClient) return;

    try {
      console.log('Tentando deletar cliente:', deletingClient.id, deletingClient.name);
      const response = await del(`/clients?id=${deletingClient.id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro na resposta:', errorData);
        throw new Error(errorData.message || 'Erro ao deletar cliente');
      }

      loadClients();
      setIsDeleteDialogOpen(false);
      setDeletingClient(null);
    } catch (err: any) {
      console.error('Erro ao deletar cliente:', err);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 px-4 md:px-0">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight transition-colors duration-200 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Gerenciar Clientes
          </h2>
          <p className={`mt-2 text-sm sm:text-base transition-colors duration-200 ${
            theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
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
          <DialogContent className={`sm:max-w-md transition-colors duration-200 ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700' : ''
          }`}>
            <DialogHeader>
              <DialogTitle className={theme === 'dark' ? 'text-white' : ''}>
                Adicionar Novo Cliente
              </DialogTitle>
              <DialogDescription className={theme === 'dark' ? 'text-slate-300' : ''}>
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
                      <FormLabel className={theme === 'dark' ? 'text-slate-200' : ''}>
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
                      <FormLabel className={theme === 'dark' ? 'text-slate-200' : ''}>
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
                      <FormLabel className={theme === 'dark' ? 'text-slate-200' : ''}>
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
                    className={theme === 'dark' ? 'border-slate-600 text-slate-200 hover:bg-slate-700' : ''}
                    disabled={createForm.formState.isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createForm.formState.isSubmitting}
                    className={theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    {createForm.formState.isSubmitting ? 'Criando...' : 'Criar Cliente'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card className={`transition-colors duration-200 ${
        theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'
      }`}>
        <CardHeader>
          <CardTitle className={`text-lg transition-colors duration-200 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Filtros
          </CardTitle>
          <CardDescription className={theme === 'dark' ? 'text-slate-300' : ''}>
            Filtre os clientes por nome ou e-mail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="name-filter" className={theme === 'dark' ? 'text-slate-200' : ''}>
                Nome
              </Label>
              <Input
                id="name-filter"
                placeholder="Filtrar por nome..."
                value={filters.name}
                onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-filter" className={theme === 'dark' ? 'text-slate-200' : ''}>
                E-mail
              </Label>
              <Input
                id="email-filter"
                placeholder="Filtrar por e-mail..."
                value={filters.email}
                onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Erro */}
      {error && (
        <Card className={`transition-colors duration-200 ${
          theme === 'dark'
            ? 'bg-red-900/20 border-red-700' 
            : 'bg-red-50 border-red-200'
        }`}>
          <CardContent className="pt-6">
            <p className={`font-medium transition-colors duration-200 ${
              theme === 'dark' ? 'text-red-300' : 'text-red-700'
            }`}>
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Clientes */}
      <Card className={`transition-colors duration-200 ${
        theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'
      }`}>
        <CardHeader>
          <CardTitle className={`text-lg transition-colors duration-200 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Clientes ({clients.length})
          </CardTitle>
          <CardDescription className={theme === 'dark' ? 'text-slate-300' : ''}>
            Lista completa de clientes cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
                  {isLoading ? (
          <TableSkeleton rows={8} columns={5} />
        ) : clients.length === 0 ? (
            <div className={`text-center py-8 transition-colors duration-200 ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
            }`}>
              Nenhum cliente encontrado
            </div>
          ) : (
                        <Table>
              <TableHeader>
                <TableRow className={theme === 'dark' ? 'border-slate-700' : ''}>
                  <TableHead className={theme === 'dark' ? 'text-slate-200' : ''}>Nome</TableHead>
                  <TableHead className={theme === 'dark' ? 'text-slate-200' : ''}>E-mail</TableHead>
                  <TableHead className={theme === 'dark' ? 'text-slate-200' : ''}>Data de Nascimento</TableHead>
                  <TableHead className={theme === 'dark' ? 'text-slate-200' : ''}>Letra Ausente</TableHead>
                  <TableHead className={`text-right ${theme === 'dark' ? 'text-slate-200' : ''}`}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id} className={theme === 'dark' ? 'border-slate-700 hover:bg-slate-700/50' : ''}>
                    <TableCell className={`font-medium transition-colors duration-200 ${
                      theme === 'dark' ? 'text-white' : ''
                    }`}>
                      {client.name}
                    </TableCell>
                    <TableCell className={theme === 'dark' ? 'text-slate-300' : ''}>
                      {client.email}
                    </TableCell>
                    <TableCell className={theme === 'dark' ? 'text-slate-300' : ''}>
                      {new Date(client.birthDate).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.missingLetter === '-' ? 'default' : 'secondary'} className={theme === 'dark' ? 'bg-slate-700 text-slate-200 border-slate-600' : ''}>
                        {client.missingLetter}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(client)}
                          className={theme === 'dark' ? 'border-slate-600 text-slate-200 hover:bg-slate-700' : ''}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(client)}
                          className="bg-red-600 hover:bg-red-700 text-white"
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
        <DialogContent className={`sm:max-w-md transition-colors duration-200 ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : ''
        }`}>
          <DialogHeader>
            <DialogTitle className={theme === 'dark' ? 'text-white' : ''}>
              Editar Cliente
            </DialogTitle>
            <DialogDescription className={theme === 'dark' ? 'text-slate-300' : ''}>
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
                                                                <FormLabel className={theme === 'dark' ? 'text-slate-200' : ''}>
                        Nome Completo
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome do cliente" className="h-10" />
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
                      <FormLabel className={theme === 'dark' ? 'text-slate-200' : ''}>
                        E-mail
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="cliente@email.com" className="h-10" />
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
                      <FormLabel className={theme === 'dark' ? 'text-slate-200' : ''}>
                        Data de Nascimento
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className="h-10" />
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
                  className={theme === 'dark' ? 'border-slate-600 text-slate-200 hover:bg-slate-700' : ''}
                  disabled={updateForm.formState.isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={updateForm.formState.isSubmitting}
                  className={theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  {updateForm.formState.isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className={`sm:max-w-md transition-colors duration-200 ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : ''
        }`}>
          <DialogHeader>
            <DialogTitle className={theme === 'dark' ? 'text-white' : ''}>
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription className={theme === 'dark' ? 'text-slate-300' : ''}>
              Tem certeza que deseja deletar este cliente?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border transition-colors duration-200 ${
              theme === 'dark' ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-2">
                <p className={`font-medium transition-colors duration-200 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {deletingClient?.name}
                </p>
                <p className={`text-sm transition-colors duration-200 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  {deletingClient?.email}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeletingClient(null);
                }}
                className={theme === 'dark' ? 'border-slate-600 text-slate-200 hover:bg-slate-700' : ''}
              >
                Cancelar
              </Button>
              <Button 
                type="button"
                variant="destructive"
                onClick={deleteClient}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Deletar Cliente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
