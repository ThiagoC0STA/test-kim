import { z } from "zod";

// Schemas de validação
const CreateClientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
});

const UpdateClientSchema = CreateClientSchema.partial();

const CreateSaleSchema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório"),
  value: z.string().min(1, "Valor é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
});

describe("Validation Schemas", () => {
  describe("CreateClientSchema", () => {
    it("should validate valid client data", () => {
      const validData = {
        name: "João Silva",
        email: "joao@example.com",
        birthDate: "1990-01-01",
      };

      const result = CreateClientSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const invalidData = {
        name: "",
        email: "joao@example.com",
        birthDate: "1990-01-01",
      };

      const result = CreateClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Nome é obrigatório");
        expect(result.error.issues[0].path).toEqual(["name"]);
      }
    });

    it("should reject invalid email format", () => {
      const invalidData = {
        name: "João Silva",
        email: "invalid-email",
        birthDate: "1990-01-01",
      };

      const result = CreateClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe("E-mail inválido");
        expect(result.error.issues[0].path).toEqual(["email"]);
      }
    });

    it("should reject empty birthDate", () => {
      const invalidData = {
        name: "João Silva",
        email: "joao@example.com",
        birthDate: "",
      };

      const result = CreateClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Data de nascimento é obrigatória"
        );
        expect(result.error.issues[0].path).toEqual(["birthDate"]);
      }
    });

    it("should reject missing required fields", () => {
      const invalidData = {
        name: "João Silva",
        // email missing
        // birthDate missing
      };

      const result = CreateClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
        expect(
          result.error.issues.some((issue) => issue.path.includes("email"))
        ).toBe(true);
        expect(
          result.error.issues.some((issue) => issue.path.includes("birthDate"))
        ).toBe(true);
      }
    });

    it("should reject invalid email formats", () => {
      const invalidEmails = [
        "joao",
        "joao@",
        "@example.com",
        "joao.example.com",
        "joao@example",
        "joao @example.com",
        "joao@ example.com",
      ];

      invalidEmails.forEach((email) => {
        const invalidData = {
          name: "João Silva",
          email,
          birthDate: "1990-01-01",
        };

        const result = CreateClientSchema.safeParse(invalidData);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe("E-mail inválido");
          expect(result.error.issues[0].path).toEqual(["email"]);
        }
      });
    });

    it("should accept valid email formats", () => {
      const validEmails = [
        "joao@example.com",
        "joao.silva@example.com",
        "joao+tag@example.com",
        "joao@example.co.uk",
        "joao@example-domain.com",
        "joao123@example.com",
        "joao_silva@example.com",
      ];

      validEmails.forEach((email) => {
        const validData = {
          name: "João Silva",
          email,
          birthDate: "1990-01-01",
        };

        const result = CreateClientSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("UpdateClientSchema", () => {
    it("should validate partial client data", () => {
      const partialData = {
        name: "João Silva Atualizado",
        // email and birthDate missing (optional in update)
      };

      const result = UpdateClientSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it("should validate complete client data", () => {
      const completeData = {
        name: "João Silva Atualizado",
        email: "joao.novo@example.com",
        birthDate: "1990-01-01",
      };

      const result = UpdateClientSchema.safeParse(completeData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email in partial update", () => {
      const invalidData = {
        name: "João Silva Atualizado",
        email: "invalid-email",
      };

      const result = UpdateClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe("E-mail inválido");
        expect(result.error.issues[0].path).toEqual(["email"]);
      }
    });

    it("should accept empty object (no updates)", () => {
      const emptyData = {};

      const result = UpdateClientSchema.safeParse(emptyData);
      expect(result.success).toBe(true);
    });
  });

  describe("CreateSaleSchema", () => {
    it("should validate valid sale data", () => {
      const validData = {
        clientId: "client-uuid",
        value: "150.50",
        date: "2024-01-15",
      };

      const result = CreateSaleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty clientId", () => {
      const invalidData = {
        clientId: "",
        value: "150.50",
        date: "2024-01-15",
      };

      const result = CreateSaleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Cliente é obrigatório");
        expect(result.error.issues[0].path).toEqual(["clientId"]);
      }
    });

    it("should reject empty value", () => {
      const invalidData = {
        clientId: "client-uuid",
        value: "",
        date: "2024-01-15",
      };

      const result = CreateSaleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Valor é obrigatório");
        expect(result.error.issues[0].path).toEqual(["value"]);
      }
    });

    it("should reject empty date", () => {
      const invalidData = {
        clientId: "client-uuid",
        value: "150.50",
        date: "",
      };

      const result = CreateSaleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Data é obrigatória");
        expect(result.error.issues[0].path).toEqual(["date"]);
      }
    });

    it("should reject missing required fields", () => {
      const invalidData = {
        // clientId missing
        value: "150.50",
        // date missing
      };

      const result = CreateSaleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
        expect(
          result.error.issues.some((issue) => issue.path.includes("clientId"))
        ).toBe(true);
        expect(
          result.error.issues.some((issue) => issue.path.includes("date"))
        ).toBe(true);
      }
    });

    it("should accept valid UUID format for clientId", () => {
      const validData = {
        clientId: "123e4567-e89b-12d3-a456-426614174000",
        value: "150.50",
        date: "2024-01-15",
      };

      const result = CreateSaleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept numeric string for value", () => {
      const validData = {
        clientId: "client-uuid",
        value: "0.01",
        date: "2024-01-15",
      };

      const result = CreateSaleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept valid date format", () => {
      const validData = {
        clientId: "client-uuid",
        value: "150.50",
        date: "2024-12-31",
      };

      const result = CreateSaleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
