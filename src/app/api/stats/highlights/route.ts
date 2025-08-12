import { requireAuth } from "@/lib/middleware";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response!;

  try {
    // Buscar todos os clientes com suas vendas
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("id, name, email");

    if (clientsError) {
      return NextResponse.json(
        { message: "Erro ao carregar clientes", error: clientsError.message },
        { status: 500 }
      );
    }

    // Buscar todas as vendas
    const { data: sales, error: salesError } = await supabase
      .from("sales")
      .select("client_id, value, date");

    if (salesError) {
      return NextResponse.json(
        { message: "Erro ao carregar vendas", error: salesError.message },
        { status: 500 }
      );
    }

    // Calcular métricas por cliente
    const clientMetrics = clients.map((client) => {
      const clientSales = sales.filter((sale) => sale.client_id === client.id);
      const totalValue = clientSales.reduce(
        (sum, sale) => sum + Number(sale.value),
        0
      );
      const avgValue =
        clientSales.length > 0 ? totalValue / clientSales.length : 0;
      const uniqueDays = new Set(clientSales.map((sale) => sale.date)).size;

      return {
        client_id: client.id,
        name: client.name,
        email: client.email,
        totalValue,
        avgValue,
        uniqueDays,
        saleCount: clientSales.length,
      };
    });

    // Encontrar destaques
    const topVolume =
      clientMetrics
        .filter((c) => c.saleCount > 0)
        .sort((a, b) => b.totalValue - a.totalValue)[0] || null;

    const topAverage =
      clientMetrics
        .filter((c) => c.saleCount > 0)
        .sort((a, b) => b.avgValue - a.avgValue)[0] || null;

    const topFrequency =
      clientMetrics
        .filter((c) => c.saleCount > 0)
        .sort((a, b) => b.uniqueDays - a.uniqueDays)[0] || null;

    return NextResponse.json({
      topVolume: topVolume
        ? {
            client_id: topVolume.client_id,
            name: topVolume.name,
            email: topVolume.email,
            total_value: topVolume.totalValue,
          }
        : null,
      topAverage: topAverage
        ? {
            client_id: topAverage.client_id,
            name: topAverage.name,
            email: topAverage.email,
            avg_value: topAverage.avgValue,
          }
        : null,
      topFrequency: topFrequency
        ? {
            client_id: topFrequency.client_id,
            name: topFrequency.name,
            email: topFrequency.email,
            unique_days: topFrequency.uniqueDays,
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
