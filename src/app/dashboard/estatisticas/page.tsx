'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DailySale {
  date: string;
  total: number;
}

interface Highlights {
  topVolume: {
    client_id: string;
    name: string;
    email: string;
    total_value: number;
  } | null;
  topAverage: {
    client_id: string;
    name: string;
    email: string;
    avg_value: number;
  } | null;
  topFrequency: {
    client_id: string;
    name: string;
    email: string;
    unique_days: number;
  } | null;
}

export default function EstatisticasPage() {
  const { get } = useApi();
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [highlights, setHighlights] = useState<Highlights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar estatísticas
  const loadStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [dailyResponse, highlightsResponse] = await Promise.all([
        get('/stats/daily-sales'),
        get('/stats/highlights'),
      ]);

      if (!dailyResponse.ok) {
        const errorData = await dailyResponse.json();
        throw new Error(errorData.message || 'Erro ao carregar vendas diárias');
      }

      if (!highlightsResponse.ok) {
        const errorData = await highlightsResponse.json();
        throw new Error(errorData.message || 'Erro ao carregar destaques');
      }

      const dailyData = await dailyResponse.json();
      const highlightsData = await highlightsResponse.json();

      setDailySales(dailyData);
      setHighlights(highlightsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Configuração do gráfico
  const chartData = {
    labels: dailySales.map((sale) => new Date(sale.date).toLocaleDateString('pt-BR')),
    datasets: [
      {
        label: 'Total de Vendas por Dia',
        data: dailySales.map((sale) => sale.total),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Vendas Diárias',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return `R$ ${value.toFixed(2)}`;
          },
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">Carregando estatísticas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Estatísticas</h2>
        <p className="mt-1 text-sm text-gray-500">
          Visualize o desempenho da sua loja através de gráficos e métricas
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={loadStats}
            className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Gráfico de vendas diárias */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Vendas por Dia</h3>
        {dailySales.length > 0 ? (
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            Nenhuma venda registrada ainda
          </div>
        )}
      </div>

      {/* Destaques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Maior volume de vendas */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Maior Volume</h4>
              {highlights?.topVolume ? (
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {highlights.topVolume.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    R$ {highlights.topVolume.total_value.toFixed(2)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum dado disponível</p>
              )}
            </div>
          </div>
        </div>

        {/* Maior média por venda */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Maior Média</h4>
              {highlights?.topAverage ? (
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {highlights.topAverage.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    R$ {highlights.topAverage.avg_value.toFixed(2)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum dado disponível</p>
              )}
            </div>
          </div>
        </div>

        {/* Maior frequência de compra */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Maior Frequência</h4>
              {highlights?.topFrequency ? (
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {highlights.topFrequency.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {highlights.topFrequency.unique_days} dias únicos
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum dado disponível</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resumo das vendas */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo das Vendas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Total de dias com vendas</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {dailySales.length}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Valor total vendido</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              R$ {dailySales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
}
