"use client";
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { firstMissingAlphabetLetter } from '@/lib/utils';

type RawList = {
  data: {
    clientes: Array<{
      info?: { nomeCompleto?: string; detalhes?: { email?: string; nascimento?: string } };
      duplicado?: { nomeCompleto?: string };
      estatisticas?: { vendas?: Array<{ data: string; valor: number }> };
    }>;
  };
  meta?: { registroTotal?: number; pagina?: number };
  redundante?: unknown;
};

type Client = { id?: string; name: string; email: string; birthDate: string };

const CreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
});
type CreateValues = z.infer<typeof CreateSchema>;

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{ name?: string; email?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateValues>({ resolver: zodResolver(CreateSchema) });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    const qs = new URLSearchParams();
    if (filters.name) qs.set('name', filters.name);
    if (filters.email) qs.set('email', filters.email);
    const res = await fetch(`/api/clients?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.message || 'Erro ao carregar clientes');
      setLoading(false);
      return;
    }
    const raw: RawList = await res.json();
    const normalized = (raw?.data?.clientes ?? []).map((item) => {
      const nome = item?.info?.nomeCompleto || item?.duplicado?.nomeCompleto || '';
      const email = item?.info?.detalhes?.email || '';
      const nascimento = item?.info?.detalhes?.nascimento || '';
      return { name: nome, email, birthDate: nascimento } satisfies Client;
    }).filter((c) => c.name && c.email);
    setClients(normalized);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filters.name, filters.email]);

  const onSubmit = async (values: CreateValues) => {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.message || 'Erro ao criar cliente');
      return;
    }
    reset();
    fetchClients();
  };

  const withMissingLetter = useMemo(() => {
    return clients.map((c) => ({ ...c, missing: firstMissingAlphabetLetter(c.name) }));
  }, [clients]);

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-semibold">Clientes</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1">Nome</label>
          <input className="w-full border rounded px-3 py-2" value={filters.name ?? ''} onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm mb-1">E-mail</label>
          <input className="w-full border rounded px-3 py-2" value={filters.email ?? ''} onChange={(e) => setFilters((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="flex items-end">
          <button onClick={() => fetchClients()} className="bg-black text-white px-4 py-2 rounded w-full">Filtrar</button>
        </div>
      </div>

      <div className="border rounded p-4">
        <h2 className="font-medium mb-3">Adicionar cliente</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <input placeholder="Nome" className="w-full border rounded px-3 py-2" {...register('name')} />
            {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
          </div>
          <div>
            <input placeholder="E-mail" className="w-full border rounded px-3 py-2" {...register('email')} />
            {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <input type="date" placeholder="Nascimento" className="w-full border rounded px-3 py-2" {...register('birthDate')} />
            {errors.birthDate && <p className="text-red-600 text-sm">{errors.birthDate.message}</p>}
          </div>
          <div>
            <button disabled={isSubmitting} className="bg-black text-white px-4 py-2 rounded w-full">{isSubmitting ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2 border">Nome</th>
              <th className="text-left p-2 border">E-mail</th>
              <th className="text-left p-2 border">Nascimento</th>
              <th className="text-left p-2 border">Letra ausente</th>
              <th className="text-left p-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan={4}>Carregando...</td></tr>
            ) : (
              withMissingLetter.map((c, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-gray-50">
                  <td className="p-2 border">{c.name}</td>
                  <td className="p-2 border">{c.email}</td>
                  <td className="p-2 border">{c.birthDate}</td>
                  <td className="p-2 border font-mono">{c.missing}</td>
                  <td className="p-2 border">
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600"
                        onClick={async () => {
                          const novoNome = prompt('Novo nome', c.name) ?? c.name;
                          const res = await fetch(`/api/clients?email=${encodeURIComponent(c.email)}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ name: novoNome }),
                          });
                          if (res.ok) fetchClients();
                        }}
                      >Editar</button>
                      <button
                        className="text-red-600"
                        onClick={async () => {
                          if (!confirm('Deletar cliente?')) return;
                          const res = await fetch(`/api/clients?email=${encodeURIComponent(c.email)}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (res.ok) fetchClients();
                        }}
                      >Deletar</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


