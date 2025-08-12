import { requireAuth } from "@/lib/middleware";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateClientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  birthDate: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), "Data de nascimento inválida"),
});

const UpdateClientSchema = CreateClientSchema.partial();

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response!;

  try {
    const json = await req.json();
    const { name, email, birthDate } = CreateClientSchema.parse(json);

    // Verificar se email já existe PARA ESTE USUÁRIO
    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .eq("email", email)
      .eq("user_id", auth.userId) // ← REATIVADO: FILTRO POR USUÁRIO
      .single();

    if (existing) {
      return NextResponse.json(
        { message: "E-mail já cadastrado" },
        { status: 409 }
      );
    }

    // Criar cliente COM user_id
    const { data, error } = await supabase
      .from("clients")
      .insert({
        name,
        email,
        birth_date: birthDate,
        user_id: auth.userId, // ← REATIVADO: ASSOCIAR AO USUÁRIO
      })
      .select("id, name, email, birth_date")
      .single();

    if (error) {
      return NextResponse.json(
        { message: "Erro ao criar cliente", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        id: data.id,
        name: data.name,
        email: data.email,
        birthDate: data.birth_date,
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

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    const email = searchParams.get("email");

    console.log("🔍 Buscando clientes para usuário:", auth.userId);

    // SEMPRE filtrar por user_id para isolar dados
    let query = supabase
      .from("clients")
      .select("id, name, email, birth_date")
      .eq("user_id", auth.userId); // ← REATIVADO: FILTRO OBRIGATÓRIO POR USUÁRIO

    if (name) {
      query = query.ilike("name", `%${name}%`);
    }

    if (email) {
      query = query.ilike("email", `%${email}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Erro do Supabase:", error);
      return NextResponse.json(
        { message: "Erro ao listar clientes", error: error.message },
        { status: 500 }
      );
    }

    console.log("✅ Clientes encontrados:", data?.length || 0);

    const response = {
      data: {
        clientes: data.map((client) => ({
          id: client.id,
          info: {
            nomeCompleto: client.name,
            detalhes: {
              email: client.email,
              nascimento: client.birth_date,
            },
          },
          duplicado: {
            nomeCompleto: client.name,
          },
          estatisticas: {
            vendas: [],
          },
        })),
      },
      meta: {
        registroTotal: data.length,
        pagina: 1,
      },
      redundante: {
        status: "ok",
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("💥 Erro inesperado:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response!;

  try {
    const json = await req.json();
    const updates = UpdateClientSchema.parse(json);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "ID do cliente é obrigatório" },
        { status: 400 }
      );
    }

    // Validar se o ID é um UUID válido
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        {
          message: "ID do cliente inválido",
          error: "Formato de UUID inválido",
        },
        { status: 400 }
      );
    }

    // Verificar se o cliente pertence ao usuário ANTES de atualizar
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("id", id)
      .eq("user_id", auth.userId) // ← VERIFICAR PROPRIEDADE
      .single();

    if (!existingClient) {
      return NextResponse.json(
        { message: "Cliente não encontrado ou não pertence ao usuário" },
        { status: 404 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.birthDate) updateData.birth_date = updates.birthDate;

    // Atualizar cliente (já verificado que pertence ao usuário)
    const { data, error } = await supabase
      .from("clients")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", auth.userId) // ← DUPLA VERIFICAÇÃO
      .select("id, name, email, birth_date")
      .single();

    if (error) {
      console.error("Erro do Supabase:", error);
      return NextResponse.json(
        { message: "Erro ao atualizar cliente", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      email: data.email,
      birthDate: data.birth_date,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos", errors: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro interno:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "ID do cliente é obrigatório" },
        { status: 400 }
      );
    }

    // Validar se o ID é um UUID válido
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        {
          message: "ID do cliente inválido",
          error: "Formato de UUID inválido",
        },
        { status: 400 }
      );
    }

    // Verificar se o cliente pertence ao usuário ANTES de deletar
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("id", id)
      .eq("user_id", auth.userId) // ← VERIFICAR PROPRIEDADE
      .single();

    if (!existingClient) {
      return NextResponse.json(
        { message: "Cliente não encontrado ou não pertence ao usuário" },
        { status: 404 }
      );
    }

    // Deletar cliente (já verificado que pertence ao usuário)
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.userId); // ← DUPLA VERIFICAÇÃO

    if (error) {
      return NextResponse.json(
        { message: "Erro ao deletar cliente", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Cliente deletado com sucesso" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
