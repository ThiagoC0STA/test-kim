import { verifyToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export function requireAuth(req: NextRequest): {
  ok: boolean;
  userId?: string;
  email?: string;
  response?: NextResponse;
} {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }
  const token = auth.slice("Bearer ".length);
  try {
    const payload = verifyToken(token);
    return { ok: true, userId: payload.sub, email: payload.email };
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
