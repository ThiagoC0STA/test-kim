import { requireAuth } from "@/lib/middleware";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response!;

  try {
    // Buscar vendas do usuário agrupadas por dia
    const { data, error } = await supabase
      .from("sales")
      .select("date, value")
      .eq("user_id", auth.userId) // ← REATIVADO: FILTRO OBRIGATÓRIO POR USUÁRIO
      .order("date");

    if (error) {
      return NextResponse.json(
        { message: "Erro ao carregar estatísticas", error: error.message },
        { status: 500 }
      );
    }

    // Agrupar por dia e somar valores
    const dailyTotals = data.reduce((acc, sale) => {
      const date = sale.date;
      acc[date] = (acc[date] || 0) + Number(sale.value);
      return acc;
    }, {} as Record<string, number>);

    // Converter para array e ordenar por data
    const result = Object.entries(dailyTotals)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
