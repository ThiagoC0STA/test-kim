import { normalizeClients } from "../utils";

describe("normalizeClients", () => {
  it("should normalize client data correctly", () => {
    const rawData = {
      data: {
        clientes: [
          {
            info: {
              nomeCompleto: "Ana Beatriz",
              detalhes: {
                email: "ana@example.com",
                nascimento: "1992-05-01",
              },
            },
            estatisticas: {
              vendas: [
                { data: "2024-01-01", valor: 150 },
                { data: "2024-01-02", valor: 50 },
              ],
            },
          },
          {
            info: {
              nomeCompleto: "Carlos Eduardo",
              detalhes: {
                email: "carlos@example.com",
                nascimento: "1987-08-15",
              },
            },
            duplicado: {
              nomeCompleto: "Carlos Eduardo",
            },
            estatisticas: {
              vendas: [],
            },
          },
        ],
      },
      meta: {
        registroTotal: 2,
        pagina: 1,
      },
      redundante: {
        status: "ok",
      },
    };

    const result = normalizeClients(rawData);

    expect(result).toEqual([
      {
        id: expect.any(String),
        name: "Ana Beatriz",
        email: "ana@example.com",
        birthDate: "1992-05-01",
        missingLetter: "c",
      },
      {
        id: expect.any(String),
        name: "Carlos Eduardo",
        email: "carlos@example.com",
        birthDate: "1987-08-15",
        missingLetter: "b",
      },
    ]);
  });

  it("should handle clients with real Supabase IDs", () => {
    const rawData = {
      data: {
        clientes: [
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            info: {
              nomeCompleto: "João Silva",
              detalhes: {
                email: "joao@example.com",
                nascimento: "1990-01-01",
              },
            },
            estatisticas: {
              vendas: [],
            },
          },
        ],
      },
      meta: {
        registroTotal: 1,
        pagina: 1,
      },
    };

    const result = normalizeClients(rawData);

    expect(result[0].id).toBe("123e4567-e89b-12d3-a456-426614174000");
    expect(result[0].name).toBe("João Silva");
    expect(result[0].email).toBe("joao@example.com");
    expect(result[0].birthDate).toBe("1990-01-01");
    expect(result[0].missingLetter).toBe("b");
  });

  it("should generate temporary IDs when no ID is provided", () => {
    const rawData = {
      data: {
        clientes: [
          {
            info: {
              nomeCompleto: "Maria Santos",
              detalhes: {
                email: "maria@example.com",
                nascimento: "1985-03-20",
              },
            },
            estatisticas: {
              vendas: [],
            },
          },
        ],
      },
      meta: {
        registroTotal: 1,
        pagina: 1,
      },
    };

    const result = normalizeClients(rawData);

    expect(result[0].id).toMatch(/^[a-z0-9]{9}$/);
    expect(result[0].name).toBe("Maria Santos");
    expect(result[0].email).toBe("maria@example.com");
    expect(result[0].birthDate).toBe("1985-03-20");
    expect(result[0].missingLetter).toBe("b");
  });

  it("should handle empty client list", () => {
    const rawData = {
      data: {
        clientes: [],
      },
      meta: {
        registroTotal: 0,
        pagina: 1,
      },
    };

    const result = normalizeClients(rawData);

    expect(result).toEqual([]);
  });

  it("should handle missing optional fields gracefully", () => {
    const rawData = {
      data: {
        clientes: [
          {
            info: {
              nomeCompleto: "Pedro Costa",
              detalhes: {
                email: "pedro@example.com",
                // nascimento missing
              },
            },
            estatisticas: {
              vendas: [],
            },
          },
        ],
      },
      meta: {
        registroTotal: 1,
        pagina: 1,
      },
    };

    const result = normalizeClients(rawData);

    expect(result[0].name).toBe("Pedro Costa");
    expect(result[0].email).toBe("pedro@example.com");
    expect(result[0].birthDate).toBe("");
    expect(result[0].missingLetter).toBe("b");
  });

  it("should handle clients with all alphabet letters", () => {
    const rawData = {
      data: {
        clientes: [
          {
            info: {
              nomeCompleto: "abcdefghijklmnopqrstuvwxyz",
              detalhes: {
                email: "complete@example.com",
                nascimento: "1990-01-01",
              },
            },
            estatisticas: {
              vendas: [],
            },
          },
        ],
      },
      meta: {
        registroTotal: 1,
        pagina: 1,
      },
    };

    const result = normalizeClients(rawData);

    expect(result[0].missingLetter).toBe("-");
  });

  it("should handle clients with mixed case names", () => {
    const rawData = {
      data: {
        clientes: [
          {
            info: {
              nomeCompleto: "JoÃO SiLvA",
              detalhes: {
                email: "joao@example.com",
                nascimento: "1990-01-01",
              },
            },
            estatisticas: {
              vendas: [],
            },
          },
        ],
      },
      meta: {
        registroTotal: 1,
        pagina: 1,
      },
    };

    const result = normalizeClients(rawData);

    expect(result[0].missingLetter).toBe("b");
  });

  it("should handle clients with special characters in names", () => {
    const rawData = {
      data: {
        clientes: [
          {
            info: {
              nomeCompleto: "José-Maria d'Ávila",
              detalhes: {
                email: "jose@example.com",
                nascimento: "1990-01-01",
              },
            },
            estatisticas: {
              vendas: [],
            },
          },
        ],
      },
      meta: {
        registroTotal: 1,
        pagina: 1,
      },
    };

    const result = normalizeClients(rawData);

    expect(result[0].missingLetter).toBe("b");
  });

  it("should preserve meta information", () => {
    const rawData = {
      data: {
        clientes: [],
      },
      meta: {
        registroTotal: 0,
        pagina: 1,
        totalPaginas: 1,
        filtros: { status: "ativo" },
      },
      redundante: {
        status: "ok",
        timestamp: "2024-01-01T00:00:00Z",
      },
    };

    const result = normalizeClients(rawData);

    expect(result).toEqual([]);
  });

  it("should handle malformed data gracefully", () => {
    const rawData = {
      data: {
        clientes: [
          {
            // Missing info object
            estatisticas: {
              vendas: [],
            },
          },
          {
            info: {
              // Missing nomeCompleto
              detalhes: {
                email: "test@example.com",
                nascimento: "1990-01-01",
              },
            },
            estatisticas: {
              vendas: [],
            },
          },
        ],
      },
      meta: {
        registroTotal: 2,
        pagina: 1,
      },
    };

    const result = normalizeClients(rawData);

    expect(result).toHaveLength(0);
  });
});
