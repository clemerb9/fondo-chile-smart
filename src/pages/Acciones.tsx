import { useEffect, useMemo, useRef, useState } from "react";
import { Search, TrendingUp, TrendingDown, Info, ExternalLink, ShieldAlert, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchYahooChart, fetchFinnhubData, type ChartResponse, type FinnhubData, type Range } from "@/lib/yahooApi";
import { FINTUAL_AFFILIATE } from "@/lib/affiliate";
import { trackEvent } from "@/lib/analytics";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
} from "recharts";

type StockMeta = { symbol: string; label: string; sector: string; description: string };

const POPULAR: StockMeta[] = [
  { symbol: "AAPL", label: "Apple", sector: "Tecnología",
    description: "Fabricante del iPhone, Mac y servicios digitales. Una de las marcas más valiosas del mundo." },
  { symbol: "AMZN", label: "Amazon", sector: "Comercio / Tecnología",
    description: "Gigante del e-commerce y la nube (AWS). Vende de todo y aloja gran parte de internet." },
  { symbol: "GOOGL", label: "Alphabet (Google)", sector: "Tecnología",
    description: "Dueña de Google, YouTube y Android. Su negocio principal es la publicidad digital." },
  { symbol: "MSFT", label: "Microsoft", sector: "Tecnología",
    description: "Windows, Office, Xbox y la nube Azure. Uno de los pilares del software corporativo." },
  { symbol: "TSLA", label: "Tesla", sector: "Automotriz / Energía",
    description: "Fabricante de autos eléctricos y baterías. Famosa por su volatilidad bursátil." },
  { symbol: "FALABELLA.SN", label: "Falabella", sector: "Retail",
    description: "Cadena chilena de retail con tiendas, banco y marketplace en varios países de la región." },
  { symbol: "COPEC.SN", label: "Empresas Copec", sector: "Energía / Forestal",
    description: "Conglomerado chileno con combustibles, forestal (Arauco) y energía." },
  { symbol: "BSANTANDER.SN", label: "Banco Santander Chile", sector: "Banca",
    description: "Uno de los bancos más grandes de Chile, filial del Grupo Santander." },
  { symbol: "ENELCHILE.SN", label: "Enel Chile", sector: "Energía",
    description: "Principal generadora y distribuidora eléctrica del país." },
  { symbol: "CENCOSUD.SN", label: "Cencosud", sector: "Retail",
    description: "Dueña de Jumbo, Santa Isabel, Easy y París. Retail multiformato en Latinoamérica." },
];

const formatPrice = (n: number, currency: string) => {
  try {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
};

const formatDate = (t: number) =>
  new Date(t * 1000).toLocaleDateString("es-CL", { day: "2-digit", month: "short" });

type Signal = "green" | "yellow" | "red";

function computeSignal(data: ChartResponse): { color: Signal; label: string; reasons: string[] } {
  const { meta, points } = data;
  const price = meta.regularMarketPrice;
  const reasons: string[] = [];

  // 52-week average from points (approx — uses close prices in range)
  const avg = points.length ? points.reduce((s, p) => s + p.price, 0) / points.length : price;
  const high52 = meta.fiftyTwoWeekHigh ?? Math.max(...points.map((p) => p.price), price);

  // 30-day change
  const lastIdx = points.length - 1;
  const idx30 = Math.max(0, lastIdx - 22); // ~22 trading days ≈ 30 calendar days
  const price30Ago = points[idx30]?.price ?? price;
  const change30 = ((price - price30Ago) / price30Ago) * 100;

  // 3-month trend
  const idx90 = Math.max(0, lastIdx - 65);
  const price90Ago = points[idx90]?.price ?? price;
  const change90 = ((price - price90Ago) / price90Ago) * 100;

  const nearHigh = (high52 - price) / high52 < 0.05;
  const belowAvg = price < avg;

  // Red conditions
  if (change30 < -10) reasons.push(`Cayó ${change30.toFixed(1)}% en 30 días`);
  if (change90 < -5) reasons.push(`Tendencia 3M negativa (${change90.toFixed(1)}%)`);
  if (change30 < -10 || change90 < -8) {
    return { color: "red", label: "Alta volatilidad, proceder con cautela", reasons };
  }

  // Yellow conditions
  if (nearHigh) reasons.push("Cerca del máximo de 52 semanas");
  const mixedTrend = Math.abs(change90) < 3;
  if (mixedTrend) reasons.push("Tendencia 3M mixta");
  if (nearHigh || mixedTrend) {
    return { color: "yellow", label: "Observar antes de invertir", reasons };
  }

  // Green
  if (belowAvg) reasons.push("Precio bajo el promedio del periodo");
  if (change90 > 0) reasons.push(`Tendencia 3M positiva (+${change90.toFixed(1)}%)`);
  return { color: "green", label: "Momento razonable para considerar", reasons };
}

function computeRisk(points: { price: number }[]): { level: "Bajo" | "Medio" | "Alto"; pct: number } {
  if (points.length < 2) return { level: "Medio", pct: 50 };
  const returns: number[] = [];
  for (let i = 1; i < points.length; i++) {
    returns.push((points[i].price - points[i - 1].price) / points[i - 1].price);
  }
  const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
  const stdev = Math.sqrt(variance) * Math.sqrt(252) * 100; // annualized %
  if (stdev < 20) return { level: "Bajo", pct: Math.min(100, (stdev / 20) * 33) };
  if (stdev < 40) return { level: "Medio", pct: 33 + ((stdev - 20) / 20) * 33 };
  return { level: "Alto", pct: Math.min(100, 66 + ((stdev - 40) / 40) * 34) };
}

function marketCapBand(symbol: string): string {
  // Heuristic: large US tech and Chilean blue chips. Without fundamentals API, classify by known list.
  const giants = ["AAPL", "MSFT", "GOOGL", "AMZN"];
  const big = ["TSLA", "BSANTANDER.SN", "ENELCHILE.SN", "COPEC.SN"];
  if (giants.includes(symbol)) return "Empresa gigante";
  if (big.includes(symbol)) return "Empresa grande";
  return "Empresa mediana";
}

const Acciones = () => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<StockMeta | null>(null);
  const [range, setRange] = useState<Range>("1y");
  const [data, setData] = useState<ChartResponse | null>(null);
  const [finnhub, setFinnhub] = useState<FinnhubData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const filteredPopular = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return POPULAR;
    return POPULAR.filter(
      (s) => s.label.toLowerCase().includes(q) || s.symbol.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (!selected) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setErr(null);
    setData(null);
    setFinnhub(null);
    fetchYahooChart(selected.symbol, range, ctrl.signal)
      .then((res) => setData(res))
      .catch((e) => {
        if (ctrl.signal.aborted) return;
        setErr(e instanceof Error ? e.message : "Error al cargar datos");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    // Finnhub runs in parallel; failures are silent (we just show "Sin datos").
    fetchFinnhubData(selected.symbol, ctrl.signal)
      .then((res) => {
        if (!ctrl.signal.aborted) setFinnhub(res);
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setFinnhub({ pe: null, profile: null });
      });
    return () => ctrl.abort();
  }, [selected, range]);

  const handleSelect = (s: StockMeta) => {
    setSelected(s);
    setRange("1y");
    trackEvent("simulator_used", { flow: "acciones", symbol: s.symbol });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const match =
      POPULAR.find((s) => s.symbol.toLowerCase() === q.toLowerCase()) ??
      POPULAR.find((s) => s.label.toLowerCase().includes(q.toLowerCase()));
    if (match) {
      handleSelect(match);
      return;
    }
    // Allow free-form symbol search
    const sym = q.toUpperCase().replace(/[^A-Z0-9.\-^=]/g, "");
    if (sym) {
      handleSelect({
        symbol: sym,
        label: sym,
        sector: "—",
        description: "Acción buscada manualmente. Datos en vivo desde Yahoo Finance.",
      });
    }
  };

  return (
    <TooltipProvider>
      <section className="container py-10 md:py-16 max-w-5xl">
        <div className="mb-10">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
            Analiza una acción
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-primary text-balance mb-3">
            ¿Vale la pena esa acción?
          </h1>
          <p className="text-muted-foreground text-lg">
            Mira precio, riesgo y un semáforo simple para entender si es un momento razonable.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit} className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca una acción: Apple, Falabella, Amazon, COPEC..."
            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-input bg-card text-base text-primary placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-smooth shadow-soft"
          />
        </form>

        {/* Popular chips */}
        <div className="flex flex-wrap gap-2 mb-10">
          {filteredPopular.map((s) => {
            const active = selected?.symbol === s.symbol;
            return (
              <button
                key={s.symbol}
                onClick={() => handleSelect(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-smooth ${
                  active
                    ? "bg-accent text-accent-foreground border-accent shadow-glow"
                    : "bg-card border-border text-primary hover:border-accent/50 hover:bg-accent-soft"
                }`}
              >
                {s.symbol}
              </button>
            );
          })}
          {filteredPopular.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Presiona Enter para buscar "{query}" como símbolo.
            </p>
          )}
        </div>

        {/* Detail */}
        {!selected && (
          <div className="p-10 rounded-2xl bg-card border border-dashed border-border text-center">
            <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Selecciona una acción para ver su análisis completo.
            </p>
          </div>
        )}

        {selected && (
          <StockDetail
            stock={selected}
            data={data}
            finnhub={finnhub}
            loading={loading}
            err={err}
            range={range}
            setRange={setRange}
            onOpenInvest={() => setShowModal(true)}
          />
        )}

        {/* Modal */}
        {showModal && selected && (
          <div
            className="fixed inset-0 z-[100] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowModal(false)}
          >
            <div
              className="relative bg-card rounded-2xl shadow-elegant max-w-md w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-primary"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="font-display text-2xl font-bold text-primary mb-3">
                Cómo invertir en {selected.label} desde Chile
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Puedes invertir en esta acción a través de <strong className="text-primary">Fintual</strong>{" "}
                (fondos diversificados que la incluyen) o de un <strong className="text-primary">bróker
                internacional</strong> que opere acciones individuales.
              </p>
              <a
                href={FINTUAL_AFFILIATE}
                target="_blank"
                rel="noopener sponsored"
                onClick={() =>
                  trackEvent("fintual_cta_clicked", {
                    source: "acciones_modal",
                    symbol: selected.symbol,
                  })
                }
                className="inline-flex w-full items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-accent text-accent-foreground font-semibold transition-smooth hover:shadow-glow"
              >
                Ver opciones <ExternalLink className="h-4 w-4" />
              </a>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Esto no es asesoría financiera.
              </p>
            </div>
          </div>
        )}
      </section>
    </TooltipProvider>
  );
};

const StockDetail = ({
  stock,
  data,
  loading,
  err,
  range,
  setRange,
  onOpenInvest,
}: {
  stock: StockMeta;
  data: ChartResponse | null;
  loading: boolean;
  err: string | null;
  range: Range;
  setRange: (r: Range) => void;
  onOpenInvest: () => void;
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className="p-8 rounded-2xl bg-destructive/5 border border-destructive/20 text-center">
        <ShieldAlert className="h-10 w-10 text-destructive mx-auto mb-3" />
        <p className="font-semibold text-primary mb-1">No pudimos cargar los datos</p>
        <p className="text-sm text-muted-foreground">{err ?? "Intenta con otra acción."}</p>
      </div>
    );
  }

  const { meta, points } = data;
  const change = meta.regularMarketPrice - meta.chartPreviousClose;
  const changePct = (change / meta.chartPreviousClose) * 100;
  const positive = change >= 0;

  const signal = computeSignal(data);
  const risk = computeRisk(points);

  // Approx P/E unavailable from chart endpoint — use heuristic via 1y growth as a proxy is not honest.
  // Show "Sin datos" for P/E and explain.
  const peValue: string = "Sin datos";

  const high52 = meta.fiftyTwoWeekHigh;
  const low52 = meta.fiftyTwoWeekLow;

  const signalStyles: Record<Signal, { bg: string; text: string; dot: string; emoji: string }> = {
    green: {
      bg: "bg-accent-soft border-accent/40",
      text: "text-accent",
      dot: "bg-accent",
      emoji: "🟢",
    },
    yellow: {
      bg: "bg-warning/10 border-warning/40",
      text: "text-[hsl(var(--warning))]",
      dot: "bg-[hsl(var(--warning))]",
      emoji: "🟡",
    },
    red: {
      bg: "bg-destructive/10 border-destructive/40",
      text: "text-destructive",
      dot: "bg-destructive",
      emoji: "🔴",
    },
  };

  const sig = signalStyles[signal.color];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="p-7 rounded-2xl bg-card border border-border shadow-soft">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {stock.symbol} · {meta.exchangeName ?? "—"}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
              {stock.label}
            </h2>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl md:text-4xl font-bold text-primary">
              {formatPrice(meta.regularMarketPrice, meta.currency)}
            </div>
            <div
              className={`mt-1 inline-flex items-center gap-1 text-sm font-semibold ${
                positive ? "text-accent" : "text-destructive"
              }`}
            >
              {positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {positive ? "+" : ""}
              {change.toFixed(2)} ({positive ? "+" : ""}
              {changePct.toFixed(2)}%) hoy
            </div>
          </div>
        </div>
      </div>

      {/* CHART */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-display text-lg font-semibold text-primary">Precio histórico</h3>
          <div className="inline-flex p-1 rounded-xl bg-muted">
            {(["1mo", "3mo", "1y"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-smooth ${
                  range === r
                    ? "bg-card text-primary shadow-soft"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {r === "1mo" ? "1M" : r === "3mo" ? "3M" : "1A"}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points.map((p) => ({ date: formatDate(p.t), price: p.price }))}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(v) => Number(v).toFixed(0)}
                width={50}
              />
              <RTooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v: number) => [formatPrice(v, meta.currency), "Precio"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                fill="url(#priceGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* COMPANY */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
        <h3 className="font-display text-lg font-semibold text-primary mb-2">¿Qué es esta empresa?</h3>
        <p className="text-muted-foreground leading-relaxed mb-3">{stock.description}</p>
        <span className="inline-block px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold">
          Sector: {stock.sector}
        </span>
      </div>

      {/* METRICS */}
      <div className="grid sm:grid-cols-3 gap-4">
        <MetricCard
          label="P/E Ratio"
          value={peValue}
          tooltip="Qué tan cara está vs sus ganancias. Bajo = más barato."
        />
        <MetricCard
          label="Rango 52 semanas"
          value={
            high52 && low52
              ? `${formatPrice(low52, meta.currency)} – ${formatPrice(high52, meta.currency)}`
              : "Sin datos"
          }
          tooltip="El precio más alto y más bajo del último año."
        />
        <MetricCard
          label="Tamaño de empresa"
          value={marketCapBand(stock.symbol)}
          tooltip="Clasificación referencial por capitalización de mercado."
        />
      </div>

      {/* RISK */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-display text-lg font-semibold text-primary">Nivel de riesgo</h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              risk.level === "Bajo"
                ? "bg-accent-soft text-accent"
                : risk.level === "Medio"
                ? "bg-warning/15 text-[hsl(var(--warning))]"
                : "bg-destructive/15 text-destructive"
            }`}
          >
            {risk.level}
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              risk.level === "Bajo"
                ? "bg-accent"
                : risk.level === "Medio"
                ? "bg-[hsl(var(--warning))]"
                : "bg-destructive"
            }`}
            style={{ width: `${Math.max(8, risk.pct)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Calculado a partir de la volatilidad anualizada del periodo seleccionado.
        </p>
      </div>

      {/* SIGNAL */}
      <div className={`p-6 rounded-2xl border-2 ${sig.bg}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{sig.emoji}</span>
          <h3 className={`font-display text-xl font-bold ${sig.text}`}>{signal.label}</h3>
        </div>
        {signal.reasons.length > 0 && (
          <ul className="text-sm text-primary/80 space-y-1 ml-9 list-disc">
            {signal.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground mt-4 ml-9">
          ⚠️ Esto es orientativo, no asesoría financiera.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onOpenInvest}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl gradient-accent text-accent-foreground font-semibold text-base transition-smooth hover:shadow-glow hover:scale-[1.01]"
      >
        ¿Cómo invertir en {stock.label} desde Chile? <ExternalLink className="h-5 w-5" />
      </button>
    </div>
  );
};

const MetricCard = ({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string;
  tooltip: string;
}) => (
  <div className="p-5 rounded-2xl bg-card border border-border shadow-soft">
    <div className="flex items-center gap-1.5 mb-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="text-muted-foreground hover:text-primary">
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </div>
    <p className="font-display text-lg font-semibold text-primary">{value}</p>
  </div>
);

export default Acciones;
