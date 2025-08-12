'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, signOut } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
        theme === 'dark' 
          ? 'bg-slate-900' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className={`text-lg transition-colors duration-200 ${
            theme === 'dark' ? 'text-slate-200' : 'text-gray-600'
          }`}>
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-sm border-b shadow-sm transition-colors duration-200 ${
        theme === 'dark' 
          ? 'bg-slate-800/90 border-slate-700' 
          : 'bg-white/80 border-gray-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-3 sm:py-0 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h1 className={`text-lg sm:text-xl font-semibold transition-colors duration-200 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Toy Store Admin
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className={`hidden sm:flex items-center space-x-2 px-2 sm:px-3 py-1 rounded-full transition-colors duration-200 ${
                theme === 'dark'
                  ? 'bg-blue-900/30 border border-blue-700'
                  : 'bg-blue-50'
              }`}>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  {user.email}
                </span>
              </div>
              
              {/* Email mobile */}
              <div className={`sm:hidden text-xs font-medium transition-colors duration-200 ${
                theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
              }`}>
                {user.email}
              </div>
              
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  onClick={signOut}
                  size="sm"
                  className={`transition-colors duration-200 ${
                    theme === 'dark'
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <span className="hidden sm:inline">Sair</span>
                  <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`backdrop-blur-sm border-b transition-colors duration-200 ${
        theme === 'dark' 
          ? 'bg-slate-800/60 border-slate-700' 
          : 'bg-white/60 border-gray-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-wrap gap-2 sm:gap-4 lg:gap-8 overflow-x-auto pb-2 sm:pb-0">
            <Link
              href="/dashboard"
              className={`py-2 sm:py-4 px-2 sm:px-1 border-b-2 border-transparent text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                theme === 'dark'
                  ? 'text-slate-300 hover:text-white hover:border-slate-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/clientes"
              className={`py-2 sm:py-4 px-2 sm:px-1 border-b-2 border-transparent text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                theme === 'dark'
                  ? 'text-slate-300 hover:text-white hover:border-slate-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Clientes
            </Link>
            <Link
              href="/dashboard/vendas"
              className={`py-2 sm:py-4 px-2 sm:px-1 border-b-2 border-transparent text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                theme === 'dark'
                  ? 'text-slate-300 hover:text-white hover:border-slate-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vendas
            </Link>
            <Link
              href="/dashboard/estatisticas"
              className={`py-2 sm:py-4 px-2 sm:px-1 border-b-2 border-transparent text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                theme === 'dark'
                  ? 'text-slate-300 hover:text-white hover:border-slate-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Estatísticas
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-2 sm:px-4 lg:px-8">
        {children}
      </main>
    </div>
  );
}
