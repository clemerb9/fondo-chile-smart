// Yahoo Finance + Finnhub proxy.
// - Default: fetches /v8/finance/chart/{symbol} from Yahoo Finance.
// - source=finnhub: fetches P/E (metric) and company profile (profile2) from Finnhub.
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const ALLOWED_RANGES = new Set(["1mo", "3mo", "1y"]);
const ALLOWED_INTERVALS = new Set(["1d", "1wk"]);
const FINTUAL_API_BASE = "https://fintual.cl/api";
const FINTUAL_MAX_FUNDS = 20;
const FINTUAL_ACTIVE_DAYS = 30;
// Conservative symbol allow-list pattern: letters, digits, dot, hyphen, ^, =. 1-15 chars.
const SYMBOL_RE = /^[A-Za-z0-9.\-\^=]{1,15}$/;

type FintualRiesgo = "Conservador" | "Moderado" | "Agresivo";

interface AssetProvider {
  id: number | string;
  attributes: { name: string };
}

interface ConceptualAsset {
  id: number | string;
  attributes: {
    name: string;
    category?: string;
    symbol?: string;
  };
}

interface RealAsset {
  attributes?: {
    last_day?: {
      price?: number | null;
      net_asset_value?: number | null;
      date?: string | null;
    } | null;
  };
}

function inferRiesgo(name: string, category?: string): FintualRiesgo {
  const text = `${name} ${category ?? ""}`.toLowerCase();
  if (/(conservador|deuda|renta fija|money market|liquidez|corto plazo)/.test(text)) return "Conservador";
  if (/(agresivo|arriesgado|acciones|equity|accionario)/.test(text)) return "Agresivo";
  return "Moderado";
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} on ${url}`);
  }

  return await res.json() as T;
}

async function handleFinnhub(symbol: string): Promise<Response> {
  const apiKey = Deno.env.get("FINNHUB_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "FINNHUB_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const metricUrl = `https://finnhub.io/api/v1/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${apiKey}`;
  const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;

  try {
    const [metricRes, profileRes] = await Promise.all([
      fetch(metricUrl),
      fetch(profileUrl),
    ]);

    const metricJson = metricRes.ok ? await metricRes.json() : null;
    const profileJson = profileRes.ok ? await profileRes.json() : null;

    const peNormalizedAnnual =
      metricJson?.metric?.peNormalizedAnnual ??
      metricJson?.metric?.peBasicExclExtraTTM ??
      null;

    const payload = {
      pe: typeof peNormalizedAnnual === "number" && Number.isFinite(peNormalizedAnnual)
        ? peNormalizedAnnual
        : null,
      profile: profileJson && profileJson.name
        ? {
            name: profileJson.name ?? null,
            finnhubIndustry: profileJson.finnhubIndustry ?? null,
            country: profileJson.country ?? null,
            currency: profileJson.currency ?? null,
            marketCapitalization: profileJson.marketCapitalization ?? null,
            weburl: profileJson.weburl ?? null,
            logo: profileJson.logo ?? null,
            exchange: profileJson.exchange ?? null,
          }
        : null,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Finnhub request failed";
    return new Response(
      JSON.stringify({ error: msg, pe: null, profile: null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}

async function fetchLatestFintualPrice(conceptualId: number | string): Promise<{ price: number; date: string } | null> {
  try {
    const res = await fetchJson<{ data?: RealAsset[] }>(
      `${FINTUAL_API_BASE}/conceptual_assets/${conceptualId}/real_assets`,
    );

    let latest: { price: number; date: string } | null = null;
    for (const asset of res.data ?? []) {
      const lastDay = asset.attributes?.last_day;
      const value =
        typeof lastDay?.net_asset_value === "number" && Number.isFinite(lastDay.net_asset_value)
          ? lastDay.net_asset_value
          : typeof lastDay?.price === "number" && Number.isFinite(lastDay.price)
            ? lastDay.price
            : null;
      if (
        lastDay &&
        value !== null &&
        typeof lastDay.date === "string" &&
        lastDay.date
      ) {
        if (!latest || lastDay.date > latest.date) {
          latest = { price: value, date: lastDay.date };
        }
      }
    }

    return latest;
  } catch {
    return null;
  }
}

async function handleFintual(): Promise<Response> {
  try {
    const providersRes = await fetchJson<{ data?: AssetProvider[] }>(`${FINTUAL_API_BASE}/asset_providers`);
    const providers = providersRes.data ?? [];
    const cutoffMs = Date.now() - FINTUAL_ACTIVE_DAYS * 24 * 60 * 60 * 1000;
    const funds: Array<{
      id: string;
      nombre: string;
      administradora: string;
      precio: number;
      fecha: string;
      moneda: "CLP";
      riesgo: FintualRiesgo;
      rent1: number;
      rent3: number;
      comision: number;
    }> = [];

    for (let i = 0; i < providers.length && funds.length < FINTUAL_MAX_FUNDS; i += 8) {
      const providerBatch = providers.slice(i, i + 8);
      const conceptualBatch = await Promise.allSettled(
        providerBatch.map(async (provider) => {
          const conceptual = await fetchJson<{ data?: ConceptualAsset[] }>(
            `${FINTUAL_API_BASE}/asset_providers/${provider.id}/conceptual_assets`,
          );

          return (conceptual.data ?? []).map((asset) => ({
            providerId: provider.id,
            providerName: provider.attributes.name,
            asset,
          }));
        }),
      );

      const conceptualFunds = conceptualBatch.flatMap((result) =>
        result.status === "fulfilled" ? result.value : []
      );

      const pricedBatch = await Promise.allSettled(
        conceptualFunds.map(async ({ providerId, providerName, asset }) => {
          const latest = await fetchLatestFintualPrice(asset.id);
          if (!latest) return null;

          return {
            id: `${providerId}-${asset.id}`,
            nombre: asset.attributes.name,
            administradora: providerName,
            precio: latest.price,
            fecha: latest.date,
            moneda: "CLP" as const,
            riesgo: inferRiesgo(asset.attributes.name, asset.attributes.category),
            rent1: 0,
            rent3: 0,
            comision: 0,
          };
        }),
      );

      for (const result of pricedBatch) {
        if (funds.length >= FINTUAL_MAX_FUNDS) break;
        if (result.status === "fulfilled" && result.value) {
          const ts = Date.parse(result.value.fecha);
          if (Number.isFinite(ts) && ts >= cutoffMs) {
            funds.push(result.value);
          }
        }
      }
    }

    funds.sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));

    return new Response(JSON.stringify({ funds }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Fintual request failed";
    return new Response(
      JSON.stringify({ error: msg, funds: [] }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const source = (url.searchParams.get("source") ?? "yahoo").trim();

    if (source === "fintual") {
      return await handleFintual();
    }

    const symbol = (url.searchParams.get("symbol") ?? "").trim();
    const range = (url.searchParams.get("range") ?? "1y").trim();
    const interval = (url.searchParams.get("interval") ?? "1d").trim();

    if (!SYMBOL_RE.test(symbol)) {
      return new Response(
        JSON.stringify({ error: "Invalid symbol" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (source === "finnhub") {
      return await handleFinnhub(symbol);
    }

    if (!ALLOWED_RANGES.has(range) || !ALLOWED_INTERVALS.has(interval)) {
      return new Response(
        JSON.stringify({ error: "Invalid range or interval" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const yahooUrl =
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
      `?range=${range}&interval=${interval}&includePrePost=false`;

    const upstream = await fetch(yahooUrl, {
      headers: {
        // Yahoo blocks default fetch UAs; mimic a browser.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept": "application/json,text/plain,*/*",
      },
    });

    const text = await upstream.text();
    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: `Yahoo upstream ${upstream.status}`, body: text.slice(0, 500) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(text, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("yahoo-finance error", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
