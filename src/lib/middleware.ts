import { NextRequest, NextResponse } from "next/server";
import { supabase } from "./supabase";

export async function requireAuth(req: NextRequest): Promise<{
  ok: boolean;
  userId?: string;
  email?: string;
  response?: NextResponse;
}> {
  const auth = req.headers.get("authorization");

  if (!auth?.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  const token = auth.slice("Bearer ".length);

  try {
    // Verificar token com Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        ok: false,
        response: NextResponse.json(
          { message: "Invalid token" },
          { status: 401 }
        ),
      };
    }

    return { ok: true, userId: user.id, email: user.email };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      ),
    };
  }
}
