import type { Fondo, Riesgo } from "@/data/funds";

const API_BASE = "https://fintual.cl/api";

interface AssetProvider {
  id: number | string;
  type: string;
  attributes: { name: string };
}

interface ConceptualAsset {
  id: number | string;
  type: string;
  attributes: {
    name: string;
    symbol?: string;
    category?: string;
    currency?: string | null;
    run?: string;
  };
}

interface RealAsset {
  id: number | string;
  attributes: {
    name?: string;
    symbol?: string;
    last_day?: { price: number; date: string } | null;
  };
}

export interface FintualFund {
  id: string;
  nombre: string;
  administradora: string;
  precio: number | null;
  fecha: string | null;
  moneda: "CLP";
  riesgo: Riesgo;
  rent1: number;
  rent3: number;
  comision: number;
}

const inferRiesgo = (name: string, category?: string): Riesgo => {
  const t = `${name} ${category ?? ""}`.toLowerCase();
  if (/(conservador|deuda|renta fija|money market|liquidez|corto plazo)/.test(t)) return "Conservador";
  if (/(agresivo|arriesgado|acciones|equity|accionario)/.test(t)) return "Agresivo";
  return "Moderado";
};

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return (await res.json()) as T;
}

// Pick the most recent { price, date } across all real_assets of a conceptual asset
async function fetchLatestPrice(
  conceptualId: number | string,
  signal?: AbortSignal,
): Promise<{ price: number; date: string } | null> {
  try {
    const res = await fetchJson<{ data: RealAsset[] }>(
      `${API_BASE}/conceptual_assets/${conceptualId}/real_assets`,
      signal,
    );
    let best: { price: number; date: string } | null = null;
    for (const ra of res.data ?? []) {
      const ld = ra.attributes?.last_day;
      if (ld && typeof ld.price === "number" && ld.date) {
        if (!best || ld.date > best.date) best = { price: ld.price, date: ld.date };
      }
    }
    return best;
  } catch {
    return null;
  }
}

export async function fetchFintualFunds(signal?: AbortSignal): Promise<FintualFund[]> {
  const providersRes = await fetchJson<{ data: AssetProvider[] }>(
    `${API_BASE}/asset_providers`,
    signal,
  );

  const allFunds: FintualFund[] = [];

  const perProvider = await Promise.allSettled(
    providersRes.data.map(async (provider) => {
      const providerName = provider.attributes.name;
      const conceptual = await fetchJson<{ data: ConceptualAsset[] }>(
        `${API_BASE}/asset_providers/${provider.id}/conceptual_assets`,
        signal,
      );

      // Keep only real mutual funds (skip repurchase agreements, etc.)
      const mutualFunds = conceptual.data.filter(
        (ca) => (ca.attributes.category ?? "").toLowerCase() === "mutual_fund",
      );

      const fundsForProvider = await Promise.allSettled(
        mutualFunds.map(async (ca) => {
          const last = await fetchLatestPrice(ca.id, signal);
          const fondo: FintualFund = {
            id: `${provider.id}-${ca.id}`,
            nombre: ca.attributes.name,
            administradora: providerName,
            precio: last?.price ?? null,
            fecha: last?.date ?? null,
            moneda: "CLP",
            riesgo: inferRiesgo(ca.attributes.name, ca.attributes.category),
            rent1: 0,
            rent3: 0,
            comision: 0,
          };
          return fondo;
        }),
      );

      return fundsForProvider
        .filter((r): r is PromiseFulfilledResult<FintualFund> => r.status === "fulfilled")
        .map((r) => r.value);
    }),
  );

  for (const r of perProvider) {
    if (r.status === "fulfilled") allFunds.push(...r.value);
  }

  if (allFunds.length === 0) throw new Error("Fintual API returned no funds");
  return allFunds;
}

export function fintualToFondo(f: FintualFund): Fondo {
  return {
    id: f.id,
    nombre: f.nombre,
    administradora: f.administradora,
    rent1: f.rent1,
    rent3: f.rent3,
    riesgo: f.riesgo,
    comision: f.comision,
  };
}
