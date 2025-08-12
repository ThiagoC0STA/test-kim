"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// Interfaces
interface DailySale {
  date: string;
  total: number;
}

interface ClientHighlight {
  client_id: string;
  name: string;
  email: string;
  total_value?: number;
  avg_value?: number;
  unique_days?: number;
}

interface HighlightsResponse {
  topVolume: ClientHighlight | null;
  topAverage: ClientHighlight | null;
  topFrequency: ClientHighlight | null;
}

export default function EstatisticasPage() {
  const { get } = useApi();
  const { theme } = useTheme();
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [highlights, setHighlights] = useState<HighlightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados
  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Carregar vendas diárias
      const salesResponse = await get("/stats/daily-sales");
      if (!salesResponse.ok) throw new Error("Erro ao carregar vendas diárias");
      const salesData = await salesResponse.json();
      setDailySales(salesData);

      // Carregar destaques
      const highlightsResponse = await get("/stats/highlights");
      if (!highlightsResponse.ok) throw new Error("Erro ao carregar destaques");
      const highlightsData = await highlightsResponse.json();
      setHighlights(highlightsData);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar estatísticas");
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados ao montar componente
  useEffect(() => {
    loadData();
  }, []);

  // Calcular estatísticas
  const totalSales = dailySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalDays = dailySales.length;
  const avgDailySales = totalDays > 0 ? totalSales / totalDays : 0;

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Formatar dados para o gráfico
  const chartData = dailySales.map((sale) => ({
    ...sale,
    formattedDate: formatDate(sale.date),
    formattedValue: formatCurrency(sale.total),
  }));

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="h-10 w-80 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        {/* Cards de Resumo Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} showHeader={false} contentLines={2} />
          ))}
        </div>

        {/* Gráficos Skeleton - Versão simplificada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 px-4">
          <div className="space-y-4">
            <Skeleton className="h-5 w-32 mx-auto" />
            <div className="h-72 w-full bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4">
              <div className="flex items-end justify-between h-full space-x-2">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                    <Skeleton className="w-full rounded-t" style={{ height: `${Math.random() * 60 + 20}%` }} />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-5 w-32 mx-auto" />
            <div className="h-72 w-full bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4">
              <div className="flex items-end justify-between h-full space-x-2">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                    <Skeleton className="w-full rounded-t" style={{ height: `${Math.random() * 60 + 20}%` }} />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabela Skeleton */}
        <CardSkeleton showHeader={true} showDescription={true} contentLines={6} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 px-4">
        <h2
          className={`text-2xl sm:text-3xl font-bold tracking-tight transition-colors duration-200 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Estatísticas da Loja
        </h2>
        <p
          className={`text-base sm:text-lg md:text-xl max-w-2xl mx-auto transition-colors duration-200 ${
            theme === "dark" ? "text-slate-300" : "text-gray-600"
          }`}
        >
          Acompanhe o desempenho e visualize métricas importantes da sua loja de
          brinquedos
        </p>
      </div>

      {/* Erro */}
      {error && (
        <Card
          className={`transition-colors duration-200 ${
            theme === "dark"
              ? "bg-red-900/20 border-red-700"
              : "bg-red-50 border-red-200"
          }`}
        >
          <CardContent className="pt-6">
            <p
              className={`font-medium transition-colors duration-200 ${
                theme === "dark" ? "text-red-300" : "text-red-700"
              }`}
            >
              {error}
            </p>
            <Button
              variant="outline"
              className={`mt-3 transition-colors duration-200 ${
                theme === "dark"
                  ? "border-slate-600 text-slate-200 hover:bg-slate-700"
                  : ""
              }`}
              onClick={loadData}
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 md:px-0">
        <Card
          className={`text-center transition-colors duration-200 ${
            theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white"
          }`}
        >
          <CardContent className="pt-6">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 transition-colors duration-200 ${
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-blue-600">{totalDays}</div>
            <div
              className={`text-sm transition-colors duration-200 ${
                theme === "dark" ? "text-slate-300" : "text-gray-600"
              }`}
            >
              Dias com Vendas
            </div>
          </CardContent>
        </Card>

        <Card
          className={`text-center transition-colors duration-200 ${
            theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white"
          }`}
        >
          <CardContent className="pt-6">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 transition-colors duration-200 ${
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalSales)}
            </div>
            <div
              className={`text-sm transition-colors duration-200 ${
                theme === "dark" ? "text-slate-300" : "text-gray-600"
              }`}
            >
              Total Vendido
            </div>
          </CardContent>
        </Card>

        <Card
          className={`text-center transition-colors duration-200 ${
            theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white"
          }`}
        >
          <CardContent className="pt-6">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 transition-colors duration-200 ${
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(avgDailySales)}
            </div>
            <div
              className={`text-sm transition-colors duration-200 ${
                theme === "dark" ? "text-slate-300" : "text-gray-600"
              }`}
            >
              Média Diária
            </div>
          </CardContent>
        </Card>

        <Card
          className={`text-center transition-colors duration-200 ${
            theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white"
          }`}
        >
          <CardContent className="pt-6">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 transition-colors duration-200 ${
                theme === "dark" ? "bg-orange-900/30" : "bg-orange-100"
              }`}
            >
              <svg
                className="w-6 h-6 text-orange-600"
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
            <div className="text-2xl font-bold text-orange-600">
              {highlights?.topVolume ? 1 : 0}
            </div>
            <div
              className={`text-sm transition-colors duration-200 ${
                theme === "dark" ? "text-slate-300" : "text-gray-600"
              }`}
            >
              Clientes Destaque
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Destaques */}
      {highlights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Maior Volume */}
          <Card
            className={`border-l-4 border-l-blue-500 transition-colors duration-200 ${
              theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                    theme === "dark" ? "bg-blue-900/30" : "bg-blue-100"
                  }`}
                >
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <CardTitle
                  className={`text-lg transition-colors duration-200 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Maior Volume
                </CardTitle>
              </div>
              <CardDescription
                className={theme === "dark" ? "text-slate-300" : ""}
              >
                Cliente com maior volume de vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {highlights.topVolume ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium transition-colors duration-200 ${
                        theme === "dark" ? "text-slate-300" : "text-gray-900"
                      }`}
                    >
                      {highlights.topVolume.name}
                    </span>
                    <Badge variant="secondary">
                      {highlights.topVolume.email}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(highlights.topVolume.total_value || 0)}
                  </div>
                  <p
                    className={`text-xs transition-colors duration-200 ${
                      theme === "dark" ? "text-slate-500" : "text-gray-500"
                    }`}
                  >
                    Total em vendas
                  </p>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">Nenhum cliente com vendas</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Maior Média */}
          <Card
            className={`border-l-4 border-l-green-500 transition-colors duration-200 ${
              theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                    theme === "dark" ? "bg-green-900/30" : "bg-green-100"
                  }`}
                >
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <CardTitle
                  className={`text-lg transition-colors duration-200 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Maior Média
                </CardTitle>
              </div>
              <CardDescription
                className={theme === "dark" ? "text-slate-300" : ""}
              >
                Cliente com maior ticket médio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {highlights.topAverage ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium transition-colors duration-200 ${
                        theme === "dark" ? "text-slate-300" : "text-gray-900"
                      }`}
                    >
                      {highlights.topAverage.name}
                    </span>
                    <Badge variant="secondary">
                      {highlights.topAverage.email}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(highlights.topAverage.avg_value || 0)}
                  </div>
                  <p
                    className={`text-xs transition-colors duration-200 ${
                      theme === "dark" ? "text-slate-500" : "text-gray-500"
                    }`}
                  >
                    Ticket médio por venda
                  </p>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">Nenhum cliente com vendas</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Maior Frequência */}
          <Card
            className={`border-l-4 border-l-purple-500 transition-colors duration-200 ${
              theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                    theme === "dark" ? "bg-purple-900/30" : "bg-purple-100"
                  }`}
                >
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <CardTitle
                  className={`text-lg transition-colors duration-200 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Maior Frequência
                </CardTitle>
              </div>
              <CardDescription
                className={theme === "dark" ? "text-slate-300" : ""}
              >
                Cliente com mais dias de compra
              </CardDescription>
            </CardHeader>
            <CardContent>
              {highlights.topFrequency ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium transition-colors duration-200 ${
                        theme === "dark" ? "text-slate-300" : "text-gray-900"
                      }`}
                    >
                      {highlights.topFrequency.name}
                    </span>
                    <Badge variant="secondary">
                      {highlights.topFrequency.email}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {highlights.topFrequency.unique_days || 0}
                  </div>
                  <p
                    className={`text-xs transition-colors duration-200 ${
                      theme === "dark" ? "text-slate-500" : "text-gray-500"
                    }`}
                  >
                    Dias únicos com compras
                  </p>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">Nenhum cliente com vendas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico de Vendas Diárias */}
      <Card
        className={`transition-colors duration-200 ${
          theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white"
        }`}
      >
        <CardHeader>
          <CardTitle
            className={`text-xl transition-colors duration-200 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Vendas por Dia
          </CardTitle>
          <CardDescription className={theme === "dark" ? "text-slate-300" : ""}>
            Evolução das vendas ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dailySales.length > 0 ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 px-4">
                {/* Gráfico de Barras */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold text-center transition-colors duration-200 ${
                    theme === "dark" ? "text-slate-200" : "text-gray-700"
                  }`}>
                    Vendas por Dia (Barras)
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={theme === "dark" ? "#475569" : "#e2e8f0"}
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey="formattedDate"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{
                            fontSize: 11,
                            fill: theme === "dark" ? "#94a3b8" : "#64748b",
                            fontWeight: 500,
                          }}
                          axisLine={{ 
                            stroke: theme === "dark" ? "#475569" : "#cbd5e1",
                            strokeWidth: 1 
                          }}
                        />
                        <YAxis
                          tickFormatter={(value) => `R$ ${value}`}
                          tick={{
                            fontSize: 11,
                            fill: theme === "dark" ? "#94a3b8" : "#64748b",
                            fontWeight: 500,
                          }}
                          axisLine={{ 
                            stroke: theme === "dark" ? "#475569" : "#cbd5e1",
                            strokeWidth: 1 
                          }}
                        />
                        <Tooltip
                          formatter={(value: number) => [
                            formatCurrency(value),
                            "Valor",
                          ]}
                          labelFormatter={(label) => `Data: ${label}`}
                          contentStyle={{
                            backgroundColor: theme === "dark" ? "#1e293b" : "white",
                            border: theme === "dark" ? "1px solid #475569" : "1px solid #e2e8f0",
                            borderRadius: "12px",
                            boxShadow: theme === "dark" 
                              ? "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
                              : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                            color: theme === "dark" ? "#f1f5f9" : "#1e293b",
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                          cursor={{ fill: theme === "dark" ? "rgba(148, 163, 184, 0.1)" : "rgba(148, 163, 184, 0.1)" }}
                        />
                        <Bar
                          dataKey="total"
                          fill="url(#colorGradient)"
                          radius={[4, 4, 0, 0]}
                          stroke={theme === "dark" ? "#1e40af" : "#3b82f6"}
                          strokeWidth={1}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico de Linha */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold text-center transition-colors duration-200 ${
                    theme === "dark" ? "text-slate-200" : "text-gray-700"
                  }`}>
                    Evolução Temporal (Linha)
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={theme === "dark" ? "#475569" : "#e2e8f0"}
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey="formattedDate"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{
                            fontSize: 11,
                            fill: theme === "dark" ? "#94a3b8" : "#64748b",
                            fontWeight: 500,
                          }}
                          axisLine={{ 
                            stroke: theme === "dark" ? "#475569" : "#cbd5e1",
                            strokeWidth: 1 
                          }}
                        />
                        <YAxis
                          tickFormatter={(value) => `R$ ${value}`}
                          tick={{
                            fontSize: 11,
                            fill: theme === "dark" ? "#94a3b8" : "#64748b",
                            fontWeight: 500,
                          }}
                          axisLine={{ 
                            stroke: theme === "dark" ? "#475569" : "#cbd5e1",
                            strokeWidth: 1 
                          }}
                        />
                        <Tooltip
                          formatter={(value: number) => [
                            formatCurrency(value),
                            "Valor",
                          ]}
                          labelFormatter={(label) => `Data: ${label}`}
                          contentStyle={{
                            backgroundColor: theme === "dark" ? "#1e293b" : "white",
                            border: theme === "dark" ? "1px solid #475569" : "1px solid #e2e8f0",
                            borderRadius: "12px",
                            boxShadow: theme === "dark" 
                              ? "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
                              : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                            color: theme === "dark" ? "#f1f5f9" : "#1e293b",
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                          cursor={{ fill: theme === "dark" ? "rgba(148, 163, 184, 0.1)" : "rgba(148, 163, 184, 0.1)" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke={theme === "dark" ? "#60a5fa" : "#3b82f6"}
                          strokeWidth={3}
                          dot={{ 
                            fill: theme === "dark" ? "#60a5fa" : "#3b82f6", 
                            strokeWidth: 2, 
                            r: 4,
                            stroke: theme === "dark" ? "#1e293b" : "white"
                          }}
                          activeDot={{ 
                            r: 6, 
                            stroke: theme === "dark" ? "#60a5fa" : "#3b82f6", 
                            strokeWidth: 2,
                            fill: theme === "dark" ? "#60a5fa" : "#3b82f6"
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Gradiente para as barras */}
              <svg width="0" height="0">
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={theme === "dark" ? "#60a5fa" : "#3b82f6"} />
                    <stop offset="50%" stopColor={theme === "dark" ? "#3b82f6" : "#2563eb"} />
                    <stop offset="100%" stopColor={theme === "dark" ? "#1d4ed8" : "#1d4ed8"} />
                  </linearGradient>
                </defs>
              </svg>
            </>
          ) : (
            <div className={`text-center py-12 transition-colors duration-200 ${
              theme === "dark" ? "text-slate-400" : "text-gray-500"
            }`}>
              <svg
                className={`w-16 h-16 mx-auto mb-4 transition-colors duration-200 ${
                  theme === "dark" ? "text-slate-600" : "text-gray-300"
                }`}
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
              <p className={`text-lg font-medium transition-colors duration-200 ${
                theme === "dark" ? "text-slate-300" : "text-gray-700"
              }`}>
                Nenhuma venda registrada
              </p>
              <p className={`text-sm transition-colors duration-200 ${
                theme === "dark" ? "text-slate-400" : "text-gray-500"
              }`}>
                As vendas aparecerão aqui quando forem cadastradas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Vendas Diárias */}
      {dailySales.length > 0 && (
        <Card
          className={`transition-colors duration-200 mx-4 ${
            theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white"
          }`}
        >
          <CardHeader>
            <CardTitle
              className={`text-xl transition-colors duration-200 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Detalhamento por Dia
            </CardTitle>
            <CardDescription
              className={theme === "dark" ? "text-slate-300" : ""}
            >
              Lista completa de vendas organizadas por data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className={`border-b transition-colors duration-200 ${
                      theme === "dark" ? "border-slate-700" : "border-gray-200"
                    }`}
                  >
                    <th
                      className={`text-left py-3 px-4 font-medium transition-colors duration-200 ${
                        theme === "dark" ? "text-slate-200" : "text-gray-700"
                      }`}
                    >
                      Data
                    </th>
                    <th
                      className={`text-right py-3 px-4 font-medium transition-colors duration-200 ${
                        theme === "dark" ? "text-slate-200" : "text-gray-700"
                      }`}
                    >
                      Total Vendido
                    </th>
                    <th
                      className={`text-right py-3 px-4 font-medium transition-colors duration-200 ${
                        theme === "dark" ? "text-slate-200" : "text-gray-700"
                      }`}
                    >
                      % do Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dailySales.map((sale, index) => (
                    <tr
                      key={sale.date}
                      className={`border-b transition-colors duration-200 ${
                        theme === "dark"
                          ? "border-slate-700 hover:bg-slate-700/50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <td
                        className={`py-3 px-4 transition-colors duration-200 ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatDate(sale.date)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium transition-colors duration-200 ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatCurrency(sale.total)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right transition-colors duration-200 ${
                          theme === "dark" ? "text-slate-300" : "text-gray-500"
                        }`}
                      >
                        {totalSales > 0
                          ? ((sale.total / totalSales) * 100).toFixed(1)
                          : 0}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr
                    className={`font-medium transition-colors duration-200 ${
                      theme === "dark" ? "bg-slate-700" : "bg-gray-50"
                    }`}
                  >
                    <td
                      className={`py-3 px-4 transition-colors duration-200 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Total Geral
                    </td>
                    <td
                      className={`py-3 px-4 text-right transition-colors duration-200 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(totalSales)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right transition-colors duration-200 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão de Atualizar */}
      <div className="text-center">
        <Button
          onClick={loadData}
          variant="outline"
          className={`transition-colors duration-200 ${
            theme === "dark"
              ? "border-slate-600 text-slate-200 hover:bg-slate-700"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Atualizar Estatísticas
        </Button>
      </div>
    </div>
  );
}
