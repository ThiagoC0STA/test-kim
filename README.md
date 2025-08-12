# Toy Store Admin - Sistema de Administração

Sistema completo de administração para loja de brinquedos com API REST, autenticação Supabase, frontend moderno e testes automatizados.

## 🚀 Funcionalidades

### Backend (API REST)
- **Autenticação**: Login/registro integrado com Supabase Auth
- **Clientes**: CRUD completo com filtros por nome e email
- **Vendas**: Cadastro de vendas por cliente
- **Estatísticas**: 
  - Total de vendas por dia
  - Cliente com maior volume de vendas
  - Cliente com maior média por venda
  - Cliente com maior frequência de compras

### Frontend
- **Dashboard**: Visão geral com navegação intuitiva
- **Login/Registro**: Interface moderna com validação e criação de conta
- **Clientes**: Gerenciamento completo com tabela responsiva
- **Estatísticas**: Gráficos interativos e métricas visuais
- **Design**: Interface moderna com Tailwind CSS

## 🛠️ Tecnologias

- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth)
- **Frontend**: Next.js 15, React 19, TypeScript
- **Autenticação**: Supabase Auth (login, registro, sessões)
- **Validação**: Zod
- **Formulários**: React Hook Form
- **Gráficos**: Chart.js
- **Estilização**: Tailwind CSS
- **Testes**: Jest, ts-jest

## 📋 Pré-requisitos

- Node.js 18+
- Yarn
- Conta no Supabase

## ⚙️ Configuração

### 1. Clone o repositório
```bash
git clone <repository-url>
cd test-kim
```

### 2. Instale as dependências
```bash
yarn install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 4. Configure o banco de dados
Execute o seguinte SQL no SQL Editor do Supabase:

```sql
-- Extensão para UUIDs
create extension if not exists "pgcrypto";

-- Tabela de clientes
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  birth_date date not null,
  created_at timestamptz not null default now()
);

-- Tabela de vendas
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  value numeric(12,2) not null check (value >= 0),
  date date not null,
  created_at timestamptz not null default now()
);

-- Índices
create index if not exists idx_clients_name on public.clients (name);
create index if not exists idx_clients_email on public.clients (email);
create index if not exists idx_sales_client_id on public.sales (client_id);
create index if not exists idx_sales_date on public.sales (date);

-- Desabilitar RLS (Row Level Security)
alter table public.clients disable row level security;
alter table public.sales disable row level security;
```

### 5. Configure o Supabase Auth
No painel do Supabase:
1. Vá para Authentication > Settings
2. Desabilite "Enable email confirmations" para desenvolvimento
3. Configure as URLs de redirecionamento se necessário

## 🚀 Executando o Projeto

### 1. Inicie o servidor de desenvolvimento
```bash
yarn dev
```

### 2. Acesse a aplicação
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### 3. Crie sua conta
Use a funcionalidade de registro para criar uma nova conta.

### 4. Faça login
Use as credenciais criadas para acessar o sistema.

## 🧪 Testes

### Executar todos os testes
```bash
yarn test
```

### Executar testes em modo watch
```bash
yarn test:watch
```

### Executar testes com cobertura
```bash
yarn test:coverage
```

## 📱 Uso da Aplicação

### Dashboard
- Visão geral do sistema
- Navegação entre módulos
- Informações da conta

### Clientes
- **Adicionar**: Formulário para criar novos clientes
- **Listar**: Tabela com todos os clientes
- **Filtrar**: Busca por nome ou email
- **Editar**: Modificar informações dos clientes
- **Deletar**: Remover clientes do sistema
- **Letra Ausente**: Campo visual mostrando a primeira letra do alfabeto que não aparece no nome

### Estatísticas
- **Gráfico**: Vendas diárias com Chart.js
- **Destaques**: 
  - Cliente com maior volume total
  - Cliente com maior ticket médio
  - Cliente com maior frequência de compras
- **Resumo**: Total de dias com vendas e valor total

## 🔌 API Endpoints

### Clientes
- `POST /api/clients` - Criar cliente
- `GET /api/clients` - Listar clientes (com filtros)
- `PATCH /api/clients` - Atualizar cliente
- `DELETE /api/clients` - Deletar cliente

### Vendas
- `POST /api/sales` - Criar venda

### Estatísticas
- `GET /api/stats/daily-sales` - Vendas por dia
- `GET /api/stats/highlights` - Destaques de clientes

## 🔒 Segurança

- Todas as rotas da API requerem autenticação via Supabase
- Tokens de acesso gerenciados automaticamente pelo Supabase
- Validação de dados com Zod
- Proteção contra SQL injection via Supabase

## 📊 Estrutura de Dados

### Formato de Resposta da API de Clientes
A API retorna dados no formato "desorganizado" conforme especificado:

```json
{
  "data": {
    "clientes": [
      {
        "info": {
          "nomeCompleto": "Ana Beatriz",
          "detalhes": {
            "email": "ana.b@example.com",
            "nascimento": "1992-05-01"
          }
        },
        "estatisticas": {
          "vendas": [
            { "data": "2024-01-01", "valor": 150 },
            { "data": "2024-01-02", "valor": 50 }
          ]
        }
      }
    ]
  },
  "meta": {
    "registroTotal": 1,
    "pagina": 1
  },
  "redundante": {
    "status": "ok"
  }
}
```

O frontend normaliza esses dados para exibição na interface.

## 🎯 Características Técnicas

- **Arquitetura**: API Routes do Next.js
- **Banco**: PostgreSQL via Supabase
- **Auth**: Supabase Auth integrado
- **Estado**: Context API + React Hooks
- **Formulários**: React Hook Form + Zod
- **Validação**: Validação em tempo real
- **Responsividade**: Design mobile-first
- **Performance**: Otimizações do Next.js 15

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
