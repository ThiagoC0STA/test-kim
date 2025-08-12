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

    // Verificar se email já existe
    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { message: "E-mail já cadastrado" },
        { status: 409 }
      );
    }

    // Criar cliente
    const { data, error } = await supabase
      .from("clients")
      .insert({ name, email, birth_date: birthDate })
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

    // Construir query com filtros
    let query = supabase.from("clients").select("id, name, email, birth_date");

    if (name) {
      query = query.ilike("name", `%${name}%`);
    }

    if (email) {
      query = query.ilike("email", `%${email}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { message: "Erro ao listar clientes", error: error.message },
        { status: 500 }
      );
    }

    // Formato "desorganizado" conforme especificado
    const response = {
      data: {
        clientes: data.map((client) => ({
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
            vendas: [], // Será populado quando implementarmos vendas
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
    return NextResponse.json(
      { message: "Erro interno do servidor" },
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

    // Preparar dados para atualização
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.birthDate) updateData.birth_date = updates.birthDate;

    // Atualizar cliente
    const { data, error } = await supabase
      .from("clients")
      .update(updateData)
      .eq("id", id)
      .select("id, name, email, birth_date")
      .single();

    if (error) {
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

    // Deletar cliente
    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { message: "Erro ao deletar cliente", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Cliente deletado com sucesso" });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
