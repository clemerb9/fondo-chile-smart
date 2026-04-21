import type { Fondo, Riesgo } from "@/data/funds";

const API_BASE = "https://fintual.cl/api";

interface AssetProvider {
  id: number;
  type: string;
  attributes: { name: string };
}

interface ConceptualAsset {
  id: number;
  type: string;
  attributes: {
    name: string;
    symbol?: string;
    category?: string;
    run?: string;
  };
}

interface AssetWithPrice {
  id: number;
  attributes: {
    name: string;
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
  if (/(risky|agres|accion|equity|global|emerg)/.test(t)) return "Agresivo";
  if (/(conserv|renta fija|money|ahorro|streep)/.test(t)) return "Conservador";
  return "Moderado";
};

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return (await res.json()) as T;
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

      const fundsForProvider = await Promise.allSettled(
        conceptual.data.slice(0, 8).map(async (ca) => {
          let precio: number | null = null;
          let fecha: string | null = null;
          try {
            const assetsRes = await fetchJson<{ data: AssetWithPrice[] }>(
              `${API_BASE}/conceptual_assets/${ca.id}/assets`,
              signal,
            );
            const last = assetsRes.data[0]?.attributes?.last_day;
            if (last) {
              precio = last.price;
              fecha = last.date;
            }
          } catch {
            // ignore individual asset failures
          }

          const fondo: FintualFund = {
            id: `${provider.id}-${ca.id}`,
            nombre: ca.attributes.name,
            administradora: providerName,
            precio,
            fecha,
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
