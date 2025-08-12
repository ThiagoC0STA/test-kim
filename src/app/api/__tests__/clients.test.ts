import { NextRequest } from "next/server";
import { DELETE, GET, PATCH, POST } from "../clients/route";

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

describe("API Clients", () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = require("@/lib/supabase").supabase;
  });

  describe("POST /api/clients", () => {
    it("should create a new client successfully", async () => {
      const mockClient = {
        id: "test-uuid",
        name: "João Silva",
        email: "joao@example.com",
        birth_date: "1990-01-01",
      };

      // Mock para verificar se email existe (não existe)
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => ({
                data: null,
                error: null,
              })),
            })),
          })),
        })),
      });

      // Mock para inserir cliente
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: mockClient,
              error: null,
            })),
          })),
        })),
      });

      const request = new NextRequest("http://localhost:3000/api/clients", {
        method: "POST",
        body: JSON.stringify({
          name: "João Silva",
          email: "joao@example.com",
          birthDate: "1990-01-01",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("João Silva");
      expect(data.email).toBe("joao@example.com");
      expect(data.birthDate).toBe("1990-01-01");
    });

    it("should return error when email already exists", async () => {
      // Mock para verificar se email existe (já existe)
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => ({
                data: { id: "existing-id" },
                error: null,
              })),
            })),
          })),
        })),
      });

      const request = new NextRequest("http://localhost:3000/api/clients", {
        method: "POST",
        body: JSON.stringify({
          name: "João Silva",
          email: "joao@example.com",
          birthDate: "1990-01-01",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.message).toBe("E-mail já cadastrado");
    });

    it("should return error for invalid data", async () => {
      const request = new NextRequest("http://localhost:3000/api/clients", {
        method: "POST",
        body: JSON.stringify({
          name: "", // Nome vazio
          email: "invalid-email", // Email inválido
          birthDate: "invalid-date", // Data inválida
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("Dados inválidos");
    });
  });

  describe("GET /api/clients", () => {
    it("should list all clients without filters", async () => {
      const mockClients = [
        {
          id: "uuid-1",
          name: "Ana Beatriz",
          email: "ana@example.com",
          birth_date: "1992-05-01",
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: mockClients,
            error: null,
          })),
        })),
      });

      const request = new NextRequest("http://localhost:3000/api/clients");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.clientes).toBeDefined();
      expect(data.data.clientes[0].info.nomeCompleto).toBe("Ana Beatriz");
    });

    it("should filter clients by name", async () => {
      const mockClients = [
        {
          id: "uuid-1",
          name: "Ana Beatriz",
          email: "ana@example.com",
          birth_date: "1992-05-01",
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            ilike: jest.fn(() => ({
              data: mockClients,
              error: null,
            })),
          })),
        })),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/clients?name=Ana"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.clientes).toBeDefined();
      expect(data.data.clientes[0].info.nomeCompleto).toBe("Ana Beatriz");
    });

    it("should return error when database fails", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: null,
            error: { message: "Database connection failed" },
          })),
        })),
      });

      const request = new NextRequest("http://localhost:3000/api/clients");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe("Erro ao listar clientes");
    });
  });

  describe("PATCH /api/clients", () => {
    it("should return error when ID is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/clients", {
        method: "PATCH",
        body: JSON.stringify({
          name: "João Silva Atualizado",
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("ID do cliente é obrigatório");
    });

    it("should return error for invalid UUID format", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/clients?id=invalid-uuid",
        {
          method: "PATCH",
          body: JSON.stringify({
            name: "João Silva Atualizado",
          }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("ID do cliente inválido");
      expect(data.error).toBe("Formato de UUID inválido");
    });
  });

  describe("DELETE /api/clients", () => {
    it("should return error when ID is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/clients");
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("ID do cliente é obrigatório");
    });

    it("should return error for invalid UUID format", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/clients?id=invalid-uuid"
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("ID do cliente inválido");
      expect(data.error).toBe("Formato de UUID inválido");
    });
  });
});
