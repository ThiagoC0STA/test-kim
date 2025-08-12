import { useAuth } from "@/contexts/AuthContext";

export function useApi() {
  const { session } = useAuth();

  const apiCall = async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const url = `/api${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token && {
          Authorization: `Bearer ${session.access_token}`,
        }),
        ...options.headers,
      },
    };

    return fetch(url, config);
  };

  const get = (endpoint: string) => apiCall(endpoint, { method: "GET" });

  const post = (endpoint: string, data?: any) =>
    apiCall(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });

  const patch = (endpoint: string, data?: any) =>
    apiCall(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });

  const del = (endpoint: string) => apiCall(endpoint, { method: "DELETE" });

  return { get, post, patch, delete: del };
}
