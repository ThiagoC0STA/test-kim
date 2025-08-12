export type RawList = {
  data?: { clientes?: Array<any> };
  meta?: any;
  redundante?: any;
};

export function normalizeRawClients(
  raw: RawList
): Array<{ name: string; email: string; birthDate: string }> {
  const items = raw?.data?.clientes ?? [];
  return items
    .map((item) => {
      const nome =
        item?.info?.nomeCompleto || item?.duplicado?.nomeCompleto || "";
      const email = item?.info?.detalhes?.email || "";
      const nascimento = item?.info?.detalhes?.nascimento || "";
      return { name: nome, email, birthDate: nascimento };
    })
    .filter((c) => c.name && c.email);
}
