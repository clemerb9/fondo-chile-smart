// Yahoo Finance proxy — fetches /v8/finance/chart/{symbol} server-side to bypass CORS.
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const ALLOWED_RANGES = new Set(["1mo", "3mo", "1y"]);
const ALLOWED_INTERVALS = new Set(["1d", "1wk"]);
// Conservative symbol allow-list pattern: letters, digits, dot, hyphen, ^, =. 1-15 chars.
const SYMBOL_RE = /^[A-Za-z0-9.\-\^=]{1,15}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbol = (url.searchParams.get("symbol") ?? "").trim();
    const range = (url.searchParams.get("range") ?? "1y").trim();
    const interval = (url.searchParams.get("interval") ?? "1d").trim();

    if (!SYMBOL_RE.test(symbol)) {
      return new Response(
        JSON.stringify({ error: "Invalid symbol" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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
