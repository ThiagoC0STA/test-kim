import { requireAuth } from "@/lib/middleware";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  birthDate: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response!;
  try {
    const json = await req.json();
    const body = UpdateSchema.parse(json);
    const update: any = {};
    if (body.name) update.name = body.name;
    if (body.email) update.email = body.email;
    if (body.birthDate) update.birth_date = body.birthDate;
    const { data, error } = await supabase
      .from("clients")
      .update(update)
      .eq("id", params.id)
      .select("id, name, email, birth_date")
      .single();
    if (error)
      return NextResponse.json(
        { message: "Erro ao atualizar", error: error.message },
        { status: 400 }
      );
    return NextResponse.json({
      id: data.id,
      name: data.name,
      email: data.email,
      birthDate: data.birth_date,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Erro", error: err?.message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response!;
  const { error } = await supabase.from("clients").delete().eq("id", params.id);
  if (error)
    return NextResponse.json(
      { message: "Erro ao deletar", error: error.message },
      { status: 400 }
    );
  return NextResponse.json({ ok: true });
}
