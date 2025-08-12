'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '@/hooks/useApi';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Schema de validação
const CreateSaleSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  value: z.string().min(1, 'Valor é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
});

type CreateSaleForm = z.infer<typeof CreateSaleSchema>;

// Interfaces
interface Client {
  id: string;
  name: string;
  email: string;
}

interface Sale {
  id: string;
  clientId: string;
  clientName: string;
  value: number;
  date: string;
}

export default function VendasPage() {
  const { get, post } = useApi();
  const { theme } = useTheme();
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Formulário
  const form = useForm<CreateSaleForm>({
    resolver: zodResolver(CreateSaleSchema),
    defaultValues: { clientId: '', value: '', date: '' },
  });

  // Carregar clientes
  const loadClients = async () => {
    try {
      const response = await get('/clients');
      if (!response.ok) throw new Error('Erro ao carregar clientes');
      
      const data = await response.json();
      // Usar os IDs reais retornados pela API
      const normalizedClients = data.data?.clientes?.map((item: any) => ({
        id: item.id, // Usar o ID real do Supabase
        name: item.info?.nomeCompleto || item.duplicado?.nomeCompleto || '',
        email: item.info?.detalhes?.email || '',
      })).filter((client: any) => client.name && client.email) || [];
      
      setClients(normalizedClients);
    } catch (err: any) {
      setError('Erro ao carregar clientes: ' + err.message);
    }
  };

  // Carregar vendas
  const loadSales = async () => {
    try {
      const response = await get('/sales');
      if (!response.ok) throw new Error('Erro ao carregar vendas');
      
      const data = await response.json();
      setSales(data);
    } catch (err: any) {
      setError('Erro ao carregar vendas: ' + err.message);
    }
  };

  // Criar venda
  const createSale = async (data: CreateSaleForm) => {
    try {
      const saleData = {
        ...data,
        value: parseFloat(data.value)
      };
      
      const response = await post('/sales', saleData);
      if (!response.ok) throw new Error('Erro ao criar venda');

      setIsCreateDialogOpen(false);
      form.reset();
      loadSales(); // Recarregar vendas
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar venda');
    }
  };

  // Carregar dados ao montar componente
  useEffect(() => {
    loadClients();
    loadSales();
  }, []);

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-3xl font-bold tracking-tight transition-colors duration-200 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Gerenciar Vendas
          </h2>
          <p className={`mt-2 transition-colors duration-200 ${
            theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
          }`}>
            Cadastre e acompanhe todas as vendas da loja
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Nova Venda</DialogTitle>
              <DialogDescription>
                Preencha os dados da nova venda
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(createSale)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} ({client.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          placeholder="0.00" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Venda</FormLabel>
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
                    disabled={form.formState.isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Registrando...' : 'Registrar Venda'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

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

      {/* Resumo */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <CardSkeleton key={index} showHeader={false} contentLines={2} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className={`text-center transition-colors duration-200 ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'
          }`}>
            <CardContent className="pt-6">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 transition-colors duration-200 ${
                theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}>
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-blue-600">{sales.length}</div>
              <div className={`text-sm transition-colors duration-200 ${
                theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
              }`}>
                Total de Vendas
              </div>
            </CardContent>
          </Card>

          <Card className={`text-center transition-colors duration-200 ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'
          }`}>
            <CardContent className="pt-6">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 transition-colors duration-200 ${
                theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'
              }`}>
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(sales.reduce((sum, sale) => sum + sale.value, 0))}
              </div>
              <div className={`text-sm transition-colors duration-200 ${
                theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
              }`}>
                Valor Total
              </div>
            </CardContent>
          </Card>

          <Card className={`text-center transition-colors duration-200 ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'
          }`}>
            <CardContent className="pt-6">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 transition-colors duration-200 ${
                theme === 'dark' ? 'bg-purple-900/30' : 'bg-green-100'
              }`}>
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {sales.length > 0 ? sales.length : 0}
              </div>
              <div className={`text-sm transition-colors duration-200 ${
                theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
              }`}>
                Clientes Atendidos
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Vendas */}
      <Card className={`transition-colors duration-200 ${
        theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'
      }`}>
        <CardHeader>
          <CardTitle className={theme === 'dark' ? 'text-white' : ''}>
            Histórico de Vendas
          </CardTitle>
          <CardDescription className={theme === 'dark' ? 'text-slate-300' : ''}>
            Todas as vendas registradas na loja
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={6} columns={4} />
          ) : sales.length === 0 ? (
            <div className={`text-center py-8 transition-colors duration-200 ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
            }`}>
              <svg className={`w-16 h-16 mx-auto mb-4 transition-colors duration-200 ${
                theme === 'dark' ? 'text-slate-600' : 'text-gray-300'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className={`text-lg font-medium transition-colors duration-200 ${
                theme === 'dark' ? 'text-slate-300' : ''
              }`}>
                Nenhuma venda registrada
              </p>
              <p className={`text-sm transition-colors duration-200 ${
                theme === 'dark' ? 'text-slate-400' : ''
              }`}>
                As vendas aparecerão aqui quando forem cadastradas
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className={theme === 'dark' ? 'border-slate-700' : ''}>
                  <TableHead className={theme === 'dark' ? 'text-slate-200' : ''}>Cliente</TableHead>
                  <TableHead className={theme === 'dark' ? 'text-slate-200' : ''}>Valor</TableHead>
                  <TableHead className={theme === 'dark' ? 'text-slate-200' : ''}>Data</TableHead>
                  <TableHead className={theme === 'dark' ? 'text-slate-200' : ''}>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id} className={theme === 'dark' ? 'border-slate-700 hover:bg-slate-700/50' : ''}>
                    <TableCell className={`font-medium transition-colors duration-200 ${
                      theme === 'dark' ? 'text-white' : ''
                    }`}>
                      {sale.clientName}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(sale.value)}
                    </TableCell>
                    <TableCell className={theme === 'dark' ? 'text-slate-300' : ''}>
                      {formatDate(sale.date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className={theme === 'dark' ? 'bg-green-900/30 text-green-300 border-green-700' : 'bg-green-100 text-green-800'}>
                        Concluída
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
