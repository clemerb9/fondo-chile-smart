import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink, Filter, Info } from "lucide-react";
import { fondos, ULTIMA_ACTUALIZACION, type Riesgo } from "@/data/funds";
import { getFundCta } from "@/lib/affiliate";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });

type SortKey = "rent1" | "rent3" | "comision" | null;
type SortDir = "asc" | "desc";

const riesgoFilters: ("Todos" | Riesgo)[] = ["Todos", "Conservador", "Moderado", "Agresivo"];

const riesgoColor: Record<Riesgo, string> = {
  Conservador: "bg-accent-soft text-accent",
  Moderado: "bg-amber-100 text-amber-800",
  Agresivo: "bg-rose-100 text-rose-700",
};

const Comparador = () => {
  const [riesgo, setRiesgo] = useState<"Todos" | Riesgo>("Todos");
  const [sortKey, setSortKey] = useState<SortKey>("rent1");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const data = useMemo(() => {
    let r = fondos.filter((f) => riesgo === "Todos" || f.riesgo === riesgo);
    if (sortKey) {
      r = [...r].sort((a, b) => {
        const diff = a[sortKey] - b[sortKey];
        return sortDir === "asc" ? diff : -diff;
      });
    }
    return r;
  }, [riesgo, sortKey, sortDir]);

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
          Filtra por nivel de riesgo y ordena por rentabilidad o comisión.
        </p>
      </div>

      {/* Aviso transparencia de datos */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 mb-6 rounded-xl bg-accent-soft/60 border border-accent/20">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Info className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">Datos de referencia — actualización pendiente</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cifras orientativas basadas en información pública de las administradoras. Verifica en el sitio oficial antes de invertir.
            </p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground sm:text-right shrink-0 pl-11 sm:pl-0">
          <span className="block font-medium text-primary">Última actualización</span>
          <time dateTime={ULTIMA_ACTUALIZACION}>{formatFecha(ULTIMA_ACTUALIZACION)}</time>
        </div>
      </div>

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

      {/* Tabla desktop */}
      <div className="hidden md:block bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="px-6 py-4">Fondo</th>
                <th className="px-6 py-4">Administradora</th>
                <th className="px-6 py-4">
                  <button onClick={() => toggleSort("rent1")} className="inline-flex items-center gap-1.5 hover:text-primary transition-smooth">
                    Rent. 1 año <SortIcon k="rent1" />
                  </button>
                </th>
                <th className="px-6 py-4">
                  <button onClick={() => toggleSort("rent3")} className="inline-flex items-center gap-1.5 hover:text-primary transition-smooth">
                    Rent. 3 años <SortIcon k="rent3" />
                  </button>
                </th>
                <th className="px-6 py-4">Riesgo</th>
                <th className="px-6 py-4">
                  <button onClick={() => toggleSort("comision")} className="inline-flex items-center gap-1.5 hover:text-primary transition-smooth">
                    Comisión <SortIcon k="comision" />
                  </button>
                </th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((f) => (
                <tr key={f.id} className="hover:bg-muted/30 transition-smooth">
                  <td className="px-6 py-5 font-semibold text-primary">{f.nombre}</td>
                  <td className="px-6 py-5 text-muted-foreground">{f.administradora}</td>
                  <td className={cn("px-6 py-5 font-display font-semibold", f.rent1 >= 0 ? "text-accent" : "text-destructive")}>
                    +{f.rent1.toFixed(1)}%
                  </td>
                  <td className={cn("px-6 py-5 font-display font-semibold", f.rent3 >= 0 ? "text-accent" : "text-destructive")}>
                    +{f.rent3.toFixed(1)}%
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn("inline-flex px-3 py-1 rounded-full text-xs font-semibold", riesgoColor[f.riesgo])}>
                      {f.riesgo}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-muted-foreground">{f.comision.toFixed(2)}%</td>
                  <td className="px-6 py-5 text-right">
                    {(() => {
                      const cta = getFundCta(f);
                      return (
                        <a
                          href={cta.href}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          onClick={() => cta.isAffiliate && trackEvent("fintual_cta_clicked", { location: "comparador_table", fund: f.nombre })}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-smooth",
                            cta.isAffiliate
                              ? "bg-primary text-primary-foreground hover:bg-primary-glow"
                              : "bg-secondary text-primary border border-border hover:bg-muted"
                          )}
                        >
                          {cta.label}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards mobile */}
      <div className="md:hidden space-y-3">
        {data.map((f) => (
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
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-border">
              <div>
                <div className="text-xs text-muted-foreground">1 año</div>
                <div className="font-display font-semibold text-accent">+{f.rent1.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">3 años</div>
                <div className="font-display font-semibold text-accent">+{f.rent3.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Comisión</div>
                <div className="font-display font-semibold text-primary">{f.comision.toFixed(2)}%</div>
              </div>
            </div>
            {(() => {
              const cta = getFundCta(f);
              return (
                <a
                  href={cta.href}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() => cta.isAffiliate && trackEvent("fintual_cta_clicked", { location: "comparador_card", fund: f.nombre })}
                  className={cn(
                    "mt-3 inline-flex w-full items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-smooth",
                    cta.isAffiliate
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-primary border border-border"
                  )}
                >
                  {cta.label}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              );
            })()}
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No hay fondos con este filtro.</div>
      )}
    </div>
  );
};

export default Comparador;
