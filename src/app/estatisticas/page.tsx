"use client";
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type Daily = { date: string; total: number };
type Highlights = {
  topVolume: { client_id: string; name: string; email: string; total_value: number } | null;
  topAverage: { client_id: string; name: string; email: string; avg_value: number } | null;
  topFrequency: { client_id: string; name: string; email: string; unique_days: number } | null;
};

export default function EstatisticasPage() {
  const [daily, setDaily] = useState<Daily[]>([]);
  const [highlights, setHighlights] = useState<Highlights | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchAll = async () => {
      setError(null);
      const [d1, d2] = await Promise.all([
        fetch('/api/stats/daily-sales', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/stats/highlights', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!d1.ok) { setError('Erro ao carregar vendas diárias'); return; }
      if (!d2.ok) { setError('Erro ao carregar destaques'); return; }
      setDaily(await d1.json());
      setHighlights(await d2.json());
    };
    fetchAll();
  }, [token]);

  const chartData = {
    labels: daily.map((d) => d.date),
    datasets: [
      { label: 'Total por dia', data: daily.map((d) => d.total), borderColor: 'rgb(59,130,246)' },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-semibold">Estatísticas</h1>
      {error && <p className="text-red-600">{error}</p>}
      <div className="bg-white border rounded p-4">
        <Line data={chartData} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded p-4">
          <h2 className="font-medium mb-2">Maior volume</h2>
          <p className="text-sm text-gray-600">{highlights?.topVolume ? `${highlights.topVolume.name} — R$ ${Number(highlights.topVolume.total_value).toFixed(2)}` : '-'}</p>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-medium mb-2">Maior média</h2>
          <p className="text-sm text-gray-600">{highlights?.topAverage ? `${highlights.topAverage.name} — R$ ${Number(highlights.topAverage.avg_value).toFixed(2)}` : '-'}</p>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-medium mb-2">Maior frequência</h2>
          <p className="text-sm text-gray-600">{highlights?.topFrequency ? `${highlights.topFrequency.name} — ${highlights.topFrequency.unique_days} dias` : '-'}</p>
        </div>
      </div>
    </div>
  );
}


