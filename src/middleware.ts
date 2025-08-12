import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const isApi = pathname.startsWith("/api");
  if (!isApi) return NextResponse.next();

  // Deixa públicas apenas rotas de auth
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // Leitura de token só no client; aqui não temos acesso ao localStorage.
  // Então as rotas de API checam o header Authorization diretamente (já implementado).
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
