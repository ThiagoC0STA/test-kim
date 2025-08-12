"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useApi } from "@/hooks/useApi";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { get } = useApi();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalDays: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar estatísticas
  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar clientes
      const clientsResponse = await get('/clients');
      
      if (!clientsResponse.ok) {
        throw new Error(`Erro ao buscar clientes: ${clientsResponse.status}`);
      }
      
      const clientsData = await clientsResponse.json();
      const totalClients = clientsData?.data?.clientes?.length || 0;

      // Buscar vendas
      const salesResponse = await get('/sales');
      
      if (!salesResponse.ok) {
        throw new Error(`Erro ao buscar vendas: ${salesResponse.status}`);
      }
      
      const salesData = await salesResponse.json();
      const totalSales = salesData?.length || 0;
      
      // Calcular receita total
      const totalRevenue = salesData?.reduce((sum: number, sale: any) => 
        sum + (sale.value || 0), 0) || 0;

      // Calcular dias com vendas
      const salesDates = salesData?.map((sale: any) => sale.date) || [];
      const uniqueDates = [...new Set(salesDates)];
      const totalDays = uniqueDates.length;

      setStats({
        totalClients,
        totalSales,
        totalRevenue,
        totalDays
      });
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas:', err);
      setError(err.message || 'Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h2
          className={`text-4xl font-bold tracking-tight transition-colors duration-200 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Bem-vindo ao Toy Store Admin
        </h2>
        <p
          className={`text-xl max-w-2xl mx-auto transition-colors duration-200 ${
            theme === "dark" ? "text-slate-300" : "text-gray-600"
          }`}
        >
          Gerencie clientes e visualize estatísticas da sua loja de brinquedos
          de forma simples e eficiente
        </p>
        
        {/* Botão de Atualizar */}
        <div className="flex justify-center">
          <Button
            onClick={loadStats}
            variant="outline"
            disabled={isLoading}
            className={`transition-colors duration-200 ${
              theme === 'dark'
                ? 'border-slate-600 text-slate-200 hover:bg-slate-700'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Atualizando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Atualizar Estatísticas</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className={`hover:shadow-lg transition-all duration-200 ${
            theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white"
          }`}
        >
          <CardHeader className="pb-3">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 transition-colors duration-200 ${
                theme === "dark" ? "bg-blue-900/30" : "bg-blue-100"
              }`}
            >
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <CardTitle
              className={`text-lg transition-colors duration-200 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Gerenciar Clientes
            </CardTitle>
            <CardDescription
              className={theme === "dark" ? "text-slate-300" : ""}
            >
              Adicione, edite e visualize todos os clientes da loja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              variant="outline"
              className={`w-full transition-colors duration-200 ${
                theme === "dark"
                  ? "border-slate-600 text-slate-800 hover:text-slate-900 !bg-white"
                  : ""
              }`}
            >
              <Link href="/dashboard/clientes">Ver Clientes</Link>
            </Button>
          </CardContent>
        </Card>

        <Card
          className={`hover:shadow-lg transition-all duration-200 ${
            theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white"
          }`}
        >
          <CardHeader className="pb-3">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 transition-colors duration-200 ${
                theme === "dark" ? "bg-green-900/30" : "bg-green-100"
              }`}
            >
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <CardTitle
              className={`text-lg transition-colors duration-200 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Visualizar Estatísticas
            </CardTitle>
            <CardDescription
              className={theme === "dark" ? "text-slate-300" : ""}
            >
              Acompanhe vendas e métricas de performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              variant="outline"
              className={`w-full transition-colors duration-200 ${
                theme === "dark"
                  ? "border-slate-600 text-slate-200 hover:bg-slate-700"
                  : ""
              }`}
            >
              <Link href="/dashboard/estatisticas">Ver Estatísticas</Link>
            </Button>
          </CardContent>
        </Card>

        <Card
          className={`hover:shadow-lg transition-all duration-200 ${
            theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white"
          }`}
        >
          <CardHeader className="pb-3">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 transition-colors duration-200 ${
                theme === "dark" ? "bg-purple-900/30" : "bg-purple-100"
              }`}
            >
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <CardTitle
              className={`text-lg transition-colors duration-200 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Registrar Vendas
            </CardTitle>
            <CardDescription
              className={theme === "dark" ? "text-slate-300" : ""}
            >
              Cadastre novas vendas para os clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              variant="outline"
              className={`w-full transition-colors duration-200 ${
                theme === "dark"
                  ? "border-slate-600 text-slate-200 hover:bg-slate-700"
                  : ""
              }`}
            >
              <Link href="/dashboard/vendas">Nova Venda</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Account Info */}
      <Card
        className={`backdrop-blur-sm transition-colors duration-200 ${
          theme === "dark" ? "bg-slate-800/60 border-slate-700" : "bg-white/60"
        }`}
      >
        <CardHeader>
          <CardTitle
            className={`text-xl transition-colors duration-200 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Informações da Conta
          </CardTitle>
          <CardDescription className={theme === "dark" ? "text-slate-300" : ""}>
            Detalhes da sua conta de administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p
                className={`text-sm font-medium transition-colors duration-200 ${
                  theme === "dark" ? "text-slate-400" : "text-gray-500"
                }`}
              >
                E-mail
              </p>
              <p
                className={`text-lg font-medium transition-colors duration-200 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {user?.email}
              </p>
            </div>
            <div className="space-y-2">
              <p
                className={`text-sm font-medium transition-colors duration-200 ${
                  theme === "dark" ? "text-slate-400" : "text-gray-500"
                }`}
              >
                Status
              </p>
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                  theme === "dark"
                    ? "bg-green-900/30 text-green-300 border border-green-700"
                    : "bg-green-100 text-green-800"
                }`}
              >
                <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                Ativo
              </div>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Quick Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className={`text-center p-6 transition-colors duration-200 ${
                theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white"
              }`}
            >
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto mb-2"></div>
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto"></div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className={`transition-colors duration-200 ${
          theme === 'dark' ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
        }`}>
          <CardContent className="pt-6">
            <p className={`font-medium transition-colors duration-200 ${
              theme === 'dark' ? 'text-red-300' : 'text-red-700'
            }`}>
              {error}
            </p>
            <Button
              variant="outline"
              className={`mt-3 transition-colors duration-200 ${
                theme === 'dark' ? 'border-slate-600 text-slate-200 hover:bg-slate-700' : ''
              }`}
              onClick={loadStats}
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card
            className={`text-center p-6 transition-colors duration-200 ${
              theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white"
            }`}
          >
            <div className="text-2xl font-bold text-blue-600">{stats.totalClients}</div>
            <div
              className={`text-sm transition-colors duration-200 ${
                theme === "dark" ? "text-slate-300" : "text-gray-600"
              }`}
            >
              Clientes
            </div>
          </Card>
          <Card
            className={`text-center p-6 transition-colors duration-200 ${
              theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white"
            }`}
          >
            <div className="text-2xl font-bold text-green-600">{stats.totalSales}</div>
            <div
              className={`text-sm transition-colors duration-200 ${
                theme === "dark" ? "text-slate-300" : "text-gray-600"
              }`}
            >
              Vendas
            </div>
          </Card>
          <Card
            className={`text-center p-6 transition-colors duration-200 ${
              theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white"
            }`}
          >
            <div className="text-2xl font-bold text-purple-600">
              R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div
              className={`text-sm transition-colors duration-200 ${
                theme === "dark" ? "text-slate-300" : "text-gray-600"
              }`}
            >
              Total
            </div>
          </Card>
          <Card
            className={`text-center p-6 transition-colors duration-200 ${
              theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white"
            }`}
          >
            <div className="text-2xl font-bold text-orange-600">{stats.totalDays}</div>
            <div
              className={`text-sm transition-colors duration-200 ${
                theme === "dark" ? "text-slate-300" : "text-gray-600"
              }`}
            >
              Dias
          </div>
          </Card>
        </div>
      )}
    </div>
  );
}
