import { supabase } from "@/integrations/supabase/client";

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
  t: number; // unix seconds
  price: number;
}

export interface ChartResponse {
  meta: YahooMeta;
  points: ChartPoint[];
}

interface YahooRaw {
  chart: {
    result?: Array<{
      meta: YahooMeta & { regularMarketPrice: number };
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
  const interval = range === "1mo" ? "1d" : range === "3mo" ? "1d" : "1d";
  const { data, error } = await supabase.functions.invoke<YahooRaw>("yahoo-finance", {
    method: "GET",
    body: undefined,
    // supabase-js builds the URL; pass query via headers workaround:
    headers: {},
    // The invoke helper does not support query params directly across versions; use raw fetch instead.
  });

  // Fallback: supabase.functions.invoke does not always pass query params reliably.
  // Use a direct fetch to the function URL instead.
  if (error || !data) {
    return await fetchYahooChartDirect(symbol, range, interval, signal);
  }
  return parseYahoo(data);
}

async function fetchYahooChartDirect(
  symbol: string,
  range: Range,
  interval: string,
  signal?: AbortSignal,
): Promise<ChartResponse> {
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
    throw new Error(`Yahoo proxy failed (${res.status})`);
  }
  const json = (await res.json()) as YahooRaw;
  return parseYahoo(json);
}

function parseYahoo(json: YahooRaw): ChartResponse {
  const r = json.chart?.result?.[0];
  if (!r) throw new Error("Sin datos para este símbolo");

  const ts = r.timestamp ?? [];
  const closes = r.indicators?.adjclose?.[0]?.adjclose ?? r.indicators?.quote?.[0]?.close ?? [];

  const points: ChartPoint[] = [];
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i];
    if (typeof c === "number" && Number.isFinite(c)) {
      points.push({ t: ts[i], price: c });
    }
  }

  return { meta: r.meta, points };
}
