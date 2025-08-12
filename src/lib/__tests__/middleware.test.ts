import { NextRequest } from "next/server";
import { requireAuth } from "../middleware";

// Mock do Supabase
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe("Middleware - requireAuth", () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = require("@/lib/supabase").supabase;
  });

  it("should return ok response when valid token is provided", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const request = new NextRequest("http://localhost:3000/api/test", {
      headers: {
        authorization: "Bearer valid-token",
      },
    });

    const result = await requireAuth(request);

    expect(result.ok).toBe(true);
    expect(result.userId).toBe("user-123");
    expect(result.email).toBe("test@example.com");
  });

  it("should return error response when no authorization header is provided", async () => {
    const request = new NextRequest("http://localhost:3000/api/test");

    const result = await requireAuth(request);

    expect(result.ok).toBe(false);
    expect(result.response).toBeDefined();

    const response = result.response;
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.message).toBe("Unauthorized");
  });

  it("should return error response when authorization header format is invalid", async () => {
    const request = new NextRequest("http://localhost:3000/api/test", {
      headers: {
        authorization: "InvalidFormat token123",
      },
    });

    const result = await requireAuth(request);

    expect(result.ok).toBe(false);
    expect(result.response).toBeDefined();

    const response = result.response;
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.message).toBe("Unauthorized");
  });

  it("should return error response when token is invalid", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid token" },
    });

    const request = new NextRequest("http://localhost:3000/api/test", {
      headers: {
        authorization: "Bearer invalid-token",
      },
    });

    const result = await requireAuth(request);

    expect(result.ok).toBe(false);
    expect(result.response).toBeDefined();

    const response = result.response;
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.message).toBe("Invalid token");
  });

  it("should return error response when Supabase user verification fails", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "User not found" },
    });

    const request = new NextRequest("http://localhost:3000/api/test", {
      headers: {
        authorization: "Bearer valid-token",
      },
    });

    const result = await requireAuth(request);

    expect(result.ok).toBe(false);
    expect(result.response).toBeDefined();

    const response = result.response;
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.message).toBe("Invalid token");
  });

  it("should return error response when Supabase throws an error", async () => {
    mockSupabase.auth.getUser.mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/test", {
      headers: {
        authorization: "Bearer valid-token",
      },
    });

    const result = await requireAuth(request);

    expect(result.ok).toBe(false);
    expect(result.response).toBeDefined();

    const response = result.response;
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.message).toBe("Invalid token");
  });

  it("should handle malformed JWT token gracefully", async () => {
    mockSupabase.auth.getUser.mockRejectedValue(new Error("jwt malformed"));

    const request = new NextRequest("http://localhost:3000/api/test", {
      headers: {
        authorization: "Bearer malformed-token",
      },
    });

    const result = await requireAuth(request);

    expect(result.ok).toBe(false);
    expect(result.response).toBeDefined();

    const response = result.response;
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.message).toBe("Invalid token");
  });

  it("should handle expired JWT token", async () => {
    mockSupabase.auth.getUser.mockRejectedValue(new Error("jwt expired"));

    const request = new NextRequest("http://localhost:3000/api/test", {
      headers: {
        authorization: "Bearer expired-token",
      },
    });

    const result = await requireAuth(request);

    expect(result.ok).toBe(false);
    expect(result.response).toBeDefined();

    const response = result.response;
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.message).toBe("Invalid token");
  });
});
