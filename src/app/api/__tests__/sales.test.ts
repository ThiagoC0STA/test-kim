import { NextRequest } from "next/server";
import { GET, POST } from "../sales/route";

// Mock do Supabase
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock do middleware de autenticação
jest.mock("@/lib/middleware", () => ({
  requireAuth: jest.fn(() => ({
    ok: true,
    user: { id: "test-user-id" },
  })),
}));

describe("API Sales", () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = require("@/lib/supabase").supabase;
  });

  describe("POST /api/sales", () => {
    it("should return error for invalid data", async () => {
      const request = new NextRequest("http://localhost:3000/api/sales", {
        method: "POST",
        body: JSON.stringify({
          clientId: "", // Cliente obrigatório
          value: -50, // Valor negativo
          date: "invalid-date", // Data inválida
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("Dados inválidos");
    });
  });

  describe("GET /api/sales", () => {
    it("should return error when database select fails", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          data: null,
          error: { message: "Select failed" },
        })),
      });

      const request = new NextRequest("http://localhost:3000/api/sales");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe("Erro interno do servidor");
    });
  });
});
