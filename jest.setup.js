// Jest setup file
const { TextEncoder, TextDecoder } = require("util");

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock global fetch
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock Next.js server components
jest.mock("next/server", () => ({
  NextRequest: class MockNextRequest {
    constructor(url, options = {}) {
      this.url = url;
      this.method = options.method || "GET";
      this.body = options.body || null;
      this.headers = new Map();

      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          this.headers.set(key, value);
        });
      }
    }

    json() {
      return Promise.resolve(JSON.parse(this.body || "{}"));
    }
  },
  NextResponse: {
    json: jest.fn((body, options = {}) => ({
      body,
      status: options.status || 200,
      headers: options.headers || {},
      json: () => Promise.resolve(body),
    })),
  },
}));

// Mock environment variables
process.env.JWT_SECRET = "test-secret";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
