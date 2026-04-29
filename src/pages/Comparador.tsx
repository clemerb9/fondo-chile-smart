import { Fragment, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink, Filter, Info, AlertTriangle } from "lucide-react";
import { fondos, ULTIMA_ACTUALIZACION, type Riesgo, type Fondo } from "@/data/funds";
import { fetchFintualFunds, type FintualFundQuote } from "@/lib/yahooApi";
import { getFundCta } from "@/lib/affiliate";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { CredibilityBadge } from "@/components/CredibilityBadge";
import { Skeleton } from "@/components/ui/skeleton";

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });

const ACTIVE_WINDOW_DAYS = 30;
const isRecent = (iso: string | null): boolean => {
  if (!iso) return false;
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts <= ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
};

const formatCLP = (n: number | null): string => {
  if (n == null) return "Sin datos";
  // Always show 2 decimals with Chilean format: $1.371,93
  const formatted = new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
  return `$${formatted}`;
};

type SortKey = "rent1" | "rent3" | "comision" | "precio" | null;
type SortDir = "asc" | "desc";

interface FundRow {
  id: string;
  nombre: string;
  administradora: string;
  riesgo: Riesgo;
  rent1: number;
  rent3: number;
  comision: number;
  precio: number | null;
  fecha: string | null;
}

const fromFintual = (f: FintualFundQuote): FundRow => ({
  id: f.id,
  nombre: f.nombre,
  administradora: f.administradora,
  riesgo: f.riesgo,
  rent1: f.rent1,
  rent3: f.rent3,
  comision: f.comision,
  precio: f.precio,
  fecha: f.fecha,
});

const fromMock = (f: Fondo): FundRow => ({
  id: f.id,
  nombre: f.nombre,
  administradora: f.administradora,
  riesgo: f.riesgo,
  rent1: f.rent1,
  rent3: f.rent3,
  comision: f.comision,
  precio: null,
  fecha: null,
});

const riesgoFilters: ("Todos" | Riesgo)[] = ["Todos", "Conservador", "Moderado", "Agresivo"];

const riesgoColor: Record<Riesgo, string> = {
  Conservador: "bg-accent-soft text-accent",
  Moderado: "bg-amber-100 text-amber-800",
  Agresivo: "bg-rose-100 text-rose-700",
};

const Comparador = () => {
  const [riesgo, setRiesgo] = useState<"Todos" | Riesgo>("Todos");
  const [sortKey, setSortKey] = useState<SortKey>("precio");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [rows, setRows] = useState<FundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchFintualFunds(controller.signal)
      .then((funds) => {
        const active = funds
          .filter((fund) => Number.isFinite(fund.precio) && isRecent(fund.fecha))
          .map(fromFintual)
          .sort((a, b) => (a.fecha && b.fecha ? (a.fecha < b.fecha ? 1 : -1) : 0));
        setRows(active);
        setUsingFallback(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.warn("Fintual API failed, using fallback:", err);
        setRows(fondos.map(fromMock));
        setUsingFallback(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const data = useMemo(() => {
    let r = rows.filter((f) => riesgo === "Todos" || f.riesgo === riesgo);
    if (sortKey) {
      r = [...r].sort((a, b) => {
        const av = a[sortKey] ?? -Infinity;
        const bv = b[sortKey] ?? -Infinity;
        const diff = (av as number) - (bv as number);
        return sortDir === "asc" ? diff : -diff;
      });
    } else {
      r = [...r].sort((a, b) => (a.fecha && b.fecha ? (a.fecha < b.fecha ? 1 : -1) : 0));
    }
    return r;
  }, [rows, riesgo, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
    return sortDir === "desc" ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />;
  };

  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-3xl mb-8">
        <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Comparador</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4 text-balance">
          Encuentra el fondo que mejor se adapta a ti
        </h1>
        <p className="text-lg text-muted-foreground">
          Datos en vivo desde Fintual vía Lovable Cloud. Filtra por riesgo y ordena por valor cuota.
        </p>
      </div>

      {/* Aviso fallback */}
      {usingFallback && !loading && (
        <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">Mostrando datos de referencia · cmfchile.cl</p>
            <p className="text-xs text-amber-800 mt-0.5">
              No pudimos conectar con la API de Fintual. Verifica las cifras en{" "}
              <a href="https://www.cmfchile.cl" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                cmfchile.cl
              </a>{" "}
              antes de invertir.
            </p>
          </div>
        </div>
      )}

      {/* Aviso transparencia de datos (cuando hay datos en vivo) */}
      {!usingFallback && !loading && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 mb-6 rounded-xl bg-accent-soft/60 border border-accent/20">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Info className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div>
                <p className="text-sm font-semibold text-primary">Valor cuota en vivo · API Fintual</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                  Mostramos hasta 20 fondos con valor cuota válido y su fecha más reciente disponible.
              </p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground sm:text-right shrink-0 pl-11 sm:pl-0">
            <span className="block font-medium text-primary">Última revisión manual</span>
            <time dateTime={ULTIMA_ACTUALIZACION}>{formatFecha(ULTIMA_ACTUALIZACION)}</time>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Filter className="h-4 w-4 text-accent" />
          Riesgo:
        </div>
        <div className="flex flex-wrap gap-2">
          {riesgoFilters.map((r) => (
            <button
              key={r}
              onClick={() => {
                setRiesgo(r);
                trackEvent("comparador_filtered", { riesgo: r });
              }}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-smooth border",
                riesgo === r
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Contador fondos vigentes */}
      {!loading && !usingFallback && (
        <p className="mb-4 text-sm font-medium text-primary">
          Mostrando {data.length} fondo{data.length === 1 ? "" : "s"} mutuo{data.length === 1 ? "" : "s"} vigente{data.length === 1 ? "" : "s"} en Chile
        </p>
      )}

      {/* Loading skeletons */}
      {loading && (
        <>
          <div className="hidden md:block bg-card rounded-2xl border border-border shadow-soft p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-7 gap-4 items-center">
                <Skeleton className="h-5 col-span-2" />
                <Skeleton className="h-5" />
                <Skeleton className="h-5" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-5" />
                <Skeleton className="h-9 w-24 ml-auto rounded-lg" />
              </div>
            ))}
          </div>
          <div className="md:hidden space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border shadow-soft p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tabla desktop */}
      {!loading && (
        <div className="hidden md:block bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Fondo</th>
                  <th className="px-6 py-4">Administradora</th>
                  <th className="px-6 py-4">
                    <button onClick={() => toggleSort("precio")} className="inline-flex items-center gap-1.5 hover:text-primary transition-smooth">
                      Valor cuota <SortIcon k="precio" />
                    </button>
                  </th>
                  <th className="px-6 py-4">Riesgo</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((f) => {
                  const cta = getFundCta({ ...f } as Fondo);
                  return (
                    <Fragment key={f.id}>
                      <tr className="hover:bg-muted/30 transition-smooth">
                        <td className="px-6 pt-5 pb-2 font-semibold text-primary">{f.nombre}</td>
                        <td className="px-6 pt-5 pb-2 text-muted-foreground">{f.administradora}</td>
                        <td className="px-6 pt-5 pb-2 font-display font-semibold text-primary">
                          {formatCLP(f.precio)}
                          {f.fecha && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-sans font-normal mt-1">
                              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" aria-hidden />
                              <span className="font-medium text-emerald-700">Vigente</span>
                              <span aria-hidden>·</span>
                              <span>Actualizado {formatFecha(f.fecha)}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 pt-5 pb-2">
                          <span className={cn("inline-flex px-3 py-1 rounded-full text-xs font-semibold", riesgoColor[f.riesgo])}>
                            {f.riesgo}
                          </span>
                        </td>
                        <td className="px-6 pt-5 pb-2 text-right">
                          <div className="flex flex-col items-end gap-1.5 mt-1 sm:mt-0">
                            <a
                              href={cta.href}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              onClick={() => cta.isAffiliate && trackEvent("fintual_cta_clicked", { location: "comparador_table", fund: f.nombre })}
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-lg font-semibold transition-all hover:-translate-y-0.5 whitespace-nowrap",
                                cta.isAffiliate
                                  ? "px-5 py-2.5 bg-[#00D18B] hover:bg-[#00B97A] text-white shadow-md hover:shadow-[0_0_15px_rgba(0,209,139,0.4)]"
                                  : "px-4 py-2 bg-secondary text-primary border border-border hover:bg-muted text-sm"
                              )}
                            >
                              {cta.label}
                              {cta.isAffiliate ? "" : <ExternalLink className="h-3.5 w-3.5" />}
                            </a>
                            {cta.isAffiliate && (
                              <p className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                ⏱ 5 min · Desde $1 · Sin comisión
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={5} className="px-6 pb-4 pt-0">
                          <CredibilityBadge />
                        </td>
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cards mobile */}
      {!loading && (
        <div className="md:hidden space-y-3">
          {data.map((f) => {
            const cta = getFundCta({ ...f } as Fondo);
            return (
              <div key={f.id} className="bg-card rounded-2xl border border-border shadow-soft p-5">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-primary leading-tight">{f.nombre}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{f.administradora}</p>
                  </div>
                  <span className={cn("inline-flex px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap", riesgoColor[f.riesgo])}>
                    {f.riesgo}
                  </span>
                </div>
                <div className="py-3 border-y border-border">
                  <div className="text-xs text-muted-foreground">Valor cuota</div>
                  <div className="font-display font-semibold text-primary text-lg">{formatCLP(f.precio)}</div>
                  {f.fecha && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" aria-hidden />
                      <span className="font-medium text-emerald-700">Vigente</span>
                      <span aria-hidden>·</span>
                      <span>Actualizado {formatFecha(f.fecha)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <a
                    href={cta.href}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() => cta.isAffiliate && trackEvent("fintual_cta_clicked", { location: "comparador_card", fund: f.nombre })}
                    className={cn(
                      "inline-flex w-full items-center justify-center gap-1.5 rounded-lg font-semibold transition-all hover:-translate-y-0.5",
                      cta.isAffiliate
                        ? "px-5 py-3.5 bg-[#00D18B] hover:bg-[#00B97A] text-white shadow-md hover:shadow-[0_0_15px_rgba(0,209,139,0.4)]"
                        : "px-4 py-2.5 bg-secondary text-primary border border-border text-sm"
                    )}
                  >
                    {cta.label}
                    {cta.isAffiliate ? "" : <ExternalLink className="h-3.5 w-3.5" />}
                  </a>
                  {cta.isAffiliate && (
                    <p className="text-[11px] font-medium text-center text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded border border-emerald-100">
                      ⏱ Tarda solo 5 minutos · Desde $1 · Sin comisión
                    </p>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <CredibilityBadge />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No hay fondos con este filtro.</div>
      )}

      {/* Footer note */}
      {!loading && (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Fuente: API pública de Fintual
        </p>
      )}
    </div>
  );
};

export default Comparador;
