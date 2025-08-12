# Sistema de Dark Mode - Toy Store Admin

## 🎨 Visão Geral

Este projeto agora inclui um sistema completo de dark mode que permite aos usuários alternar entre os temas claro e escuro. O sistema é responsivo, acessível e mantém a preferência do usuário no localStorage.

## ✨ Funcionalidades

- **Toggle de Tema**: Botão para alternar entre light e dark mode
- **Persistência**: A preferência do usuário é salva no localStorage
- **Detecção Automática**: Detecta a preferência do sistema operacional
- **Transições Suaves**: Animações de transição entre os temas
- **Responsivo**: Funciona em todos os dispositivos e tamanhos de tela

## 🏗️ Arquitetura

### 1. Contexto do Tema (`ThemeContext.tsx`)

O contexto gerencia o estado do tema e fornece métodos para:
- Alternar entre temas
- Definir um tema específico
- Persistir a preferência no localStorage
- Detectar a preferência do sistema

### 2. Hook Personalizado (`useTheme`)

Hook que fornece acesso ao contexto do tema:
```typescript
const { theme, toggleTheme, setTheme } = useTheme();
```

### 3. Componente de Toggle (`ThemeToggle.tsx`)

Componente reutilizável que exibe o botão de alternância:
- Ícone de lua para modo claro
- Ícone de sol para modo escuro
- Acessibilidade com aria-label
- Variantes de estilo configuráveis

## 🎯 Como Usar

### 1. Importar o Hook

```typescript
import { useTheme } from '@/contexts/ThemeContext';

export default function MinhaPagina() {
  const { theme, toggleTheme } = useTheme();
  // ... resto do código
}
```

### 2. Aplicar Classes Condicionais

```typescript
<div className={`transition-colors duration-200 ${
  theme === 'dark' 
    ? 'bg-slate-800 text-white' 
    : 'bg-white text-gray-900'
}`}>
  Conteúdo da página
</div>
```

### 3. Adicionar o Toggle

```typescript
import { ThemeToggle } from '@/components/ui/theme-toggle';

// No JSX
<ThemeToggle />
```

## 🎨 Paleta de Cores

### Light Mode (Padrão)
- **Background**: `bg-white`, `bg-slate-50`
- **Text**: `text-gray-900`, `text-gray-600`
- **Borders**: `border-gray-200`
- **Cards**: `bg-white`

### Dark Mode
- **Background**: `bg-slate-800`, `bg-slate-900`
- **Text**: `text-white`, `text-gray-300`
- **Borders**: `border-slate-700`
- **Cards**: `bg-slate-800`

## 🔧 Configuração

### 1. Layout Principal

O `ThemeProvider` deve envolver toda a aplicação no layout principal:

```typescript
// src/app/layout.tsx
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 2. CSS Global

As variáveis CSS para dark mode já estão configuradas em `globals.css`:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... outras variáveis */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... outras variáveis */
}
```

## 📱 Páginas Atualizadas

As seguintes páginas já incluem suporte completo ao dark mode:

- ✅ **Login** (`/login`)
- ✅ **Dashboard** (`/dashboard`)
- ✅ **Clientes** (`/dashboard/clientes`)
- ✅ **Estatísticas** (`/dashboard/estatisticas`)
- ✅ **Layout do Dashboard** (`/dashboard/layout`)

## 🚀 Melhorias Futuras

### 1. Temas Personalizados
- Permitir que usuários criem temas customizados
- Seleção de cores primárias
- Temas sazonais ou corporativos

### 2. Animações Avançadas
- Transições mais elaboradas entre temas
- Efeitos de partículas ou gradientes
- Animações de entrada/saída

### 3. Acessibilidade
- Suporte a preferências de alto contraste
- Temas para daltonismo
- Tamanhos de fonte ajustáveis

## 🐛 Solução de Problemas

### 1. Hidratação Incorreta
O contexto inclui proteção contra problemas de hidratação:
```typescript
if (!mounted) {
  return <div className="light">{children}</div>;
}
```

### 2. Transições Suaves
Use sempre a classe `transition-colors duration-200` para transições suaves:
```typescript
className={`transition-colors duration-200 ${
  theme === 'dark' ? 'bg-slate-800' : 'bg-white'
}`}
```

### 3. Ícones Responsivos
Os ícones do toggle se adaptam automaticamente ao tema:
- 🌙 Lua para modo claro (indicando que pode alternar para escuro)
- ☀️ Sol para modo escuro (indicando que pode alternar para claro)

## 📚 Recursos Adicionais

- **Tailwind CSS**: Classes utilitárias para cores e transições
- **Lucide React**: Ícones consistentes e acessíveis
- **React Hook Form**: Formulários com validação
- **Zod**: Validação de esquemas TypeScript

## 🤝 Contribuição

Para adicionar dark mode a uma nova página:

1. Importe o hook `useTheme`
2. Use o estado `theme` para aplicar classes condicionais
3. Adicione o componente `ThemeToggle` no header
4. Teste em ambos os temas
5. Verifique a acessibilidade

---

**Desenvolvido com ❤️ para melhorar a experiência do usuário**
