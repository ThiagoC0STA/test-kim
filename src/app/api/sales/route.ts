import { requireAuth } from "@/lib/middleware";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateSaleSchema = z.object({
  clientId: z.string().uuid("ID do cliente inválido"),
  value: z.number().positive("Valor deve ser positivo"),
  date: z.string().refine((v) => !isNaN(Date.parse(v)), "Data inválida"),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response!;

  try {
    const json = await req.json();
    const { clientId, value, date } = CreateSaleSchema.parse(json);

    // Verificar se cliente existe
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { message: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Criar venda
    const { data, error } = await supabase
      .from("sales")
      .insert({
        client_id: clientId,
        value,
        date,
      })
      .select("id, client_id, value, date")
      .single();

    if (error) {
      return NextResponse.json(
        { message: "Erro ao criar venda", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        id: data.id,
        clientId: data.client_id,
        value: Number(data.value),
        date: data.date,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
