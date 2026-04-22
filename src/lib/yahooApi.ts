export type Range = "1mo" | "3mo" | "1y";

export interface YahooMeta {
  symbol: string;
  longName?: string;
  shortName?: string;
  currency: string;
  exchangeName?: string;
  regularMarketPrice: number;
  chartPreviousClose: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

export interface ChartPoint {
  t: number;
  price: number;
}

export interface ChartResponse {
  meta: YahooMeta;
  points: ChartPoint[];
}

interface YahooRaw {
  chart: {
    result?: Array<{
      meta: YahooMeta;
      timestamp?: number[];
      indicators: {
        quote: Array<{ close?: (number | null)[] }>;
        adjclose?: Array<{ adjclose?: (number | null)[] }>;
      };
    }>;
    error?: { code: string; description: string } | null;
  };
}

export async function fetchYahooChart(
  symbol: string,
  range: Range,
  signal?: AbortSignal,
): Promise<ChartResponse> {
  const interval = "1d";
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  const url = `${SUPABASE_URL}/functions/v1/yahoo-finance?symbol=${encodeURIComponent(
    symbol,
  )}&range=${range}&interval=${interval}`;

  const res = await fetch(url, {
    signal,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.text()).slice(0, 200);
    } catch {
      // ignore
    }
    throw new Error(`No pudimos obtener datos (${res.status}). ${detail}`);
  }
  const json = (await res.json()) as YahooRaw;
  return parseYahoo(json);
}

export interface FinnhubProfile {
  name: string | null;
  finnhubIndustry: string | null;
  country: string | null;
  currency: string | null;
  marketCapitalization: number | null;
  weburl: string | null;
  logo: string | null;
  exchange: string | null;
}

export interface FinnhubData {
  pe: number | null;
  profile: FinnhubProfile | null;
}

export async function fetchFinnhubData(
  symbol: string,
  signal?: AbortSignal,
): Promise<FinnhubData> {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  const url = `${SUPABASE_URL}/functions/v1/yahoo-finance?source=finnhub&symbol=${encodeURIComponent(symbol)}`;

  const res = await fetch(url, {
    signal,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) {
    return { pe: null, profile: null };
  }
  const json = (await res.json()) as Partial<FinnhubData> & { error?: string };
  return {
    pe: typeof json.pe === "number" && Number.isFinite(json.pe) ? json.pe : null,
    profile: json.profile ?? null,
  };
}

function parseYahoo(json: YahooRaw): ChartResponse {
  const r = json.chart?.result?.[0];
  if (!r) throw new Error("Sin datos para este símbolo");

  const ts = r.timestamp ?? [];
  const closes =
    r.indicators?.adjclose?.[0]?.adjclose ?? r.indicators?.quote?.[0]?.close ?? [];

  const points: ChartPoint[] = [];
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i];
    if (typeof c === "number" && Number.isFinite(c)) {
      points.push({ t: ts[i], price: c });
    }
  }

  return { meta: r.meta, points };
}
