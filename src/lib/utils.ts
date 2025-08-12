import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function firstMissingAlphabetLetter(fullName: string): string {
  const letters = fullName.toLowerCase().replace(/[^a-z]/g, "");
  const uniqueLetters = new Set(letters);

  for (let i = 97; i <= 122; i++) {
    const letter = String.fromCharCode(i);
    if (!uniqueLetters.has(letter)) {
      return letter;
    }
  }
  return "-";
}

// Interfaces para normalização de clientes
export interface RawClientInfo {
  nomeCompleto?: string;
  detalhes?: {
    email?: string;
    nascimento?: string;
  };
}

export interface RawClientItem {
  id?: string;
  info?: RawClientInfo;
  duplicado?: {
    nomeCompleto?: string;
  };
  estatisticas?: {
    vendas?: any[];
  };
}

export interface RawClientResponse {
  data?: {
    clientes?: RawClientItem[];
  };
  meta?: any;
  redundante?: any;
}

export interface NormalizedClient {
  id: string;
  name: string;
  email: string;
  birthDate: string;
  missingLetter: string;
}

// Função para normalizar dados de clientes da API
export function normalizeClients(
  rawData: RawClientResponse
): NormalizedClient[] {
  return (rawData.data?.clientes || [])
    .map((item) => {
      const name =
        item.info?.nomeCompleto || item.duplicado?.nomeCompleto || "";
      const email = item.info?.detalhes?.email || "";
      const birthDate = item.info?.detalhes?.nascimento || "";

      if (!name || !email) return null;

      return {
        id: item.id || Math.random().toString(36).substr(2, 9), // Usar ID real do Supabase se disponível
        name,
        email,
        birthDate,
        missingLetter: firstMissingAlphabetLetter(name),
      };
    })
    .filter(Boolean) as NormalizedClient[];
}
