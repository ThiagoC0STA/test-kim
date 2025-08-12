import { NextRequest } from "next/server";
import { GET as getDailySales } from "../stats/daily-sales/route";
import { GET as getHighlights } from "../stats/highlights/route";

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
    userId: "test-user-id",
    email: "test@example.com",
  })),
}));

describe("API Stats", () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = require("@/lib/supabase").supabase;
  });

  describe("GET /api/stats/daily-sales", () => {
    it("should return error when database query fails", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: null,
              error: { message: "Query failed" },
            })),
          })),
        })),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/stats/daily-sales"
      );
      const response = await getDailySales(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe("Erro ao carregar estatísticas");
    });
  });

  describe("GET /api/stats/highlights", () => {
    it("should return error when first query fails", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: null,
            error: { message: "First query failed" },
          })),
        })),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/stats/highlights"
      );
      const response = await getHighlights(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe("Erro ao carregar clientes");
    });

    it("should return error when second query fails", async () => {
      // Primeira query sucesso
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              data: [{ client_id: "client-1", name: "Ana" }],
              error: null,
            })),
          })),
        })
        // Segunda query falha
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              data: null,
              error: { message: "Second query failed" },
            })),
          })),
        });

      const request = new NextRequest(
        "http://localhost:3000/api/stats/highlights"
      );
      const response = await getHighlights(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe("Erro ao carregar vendas");
    });
  });
});
