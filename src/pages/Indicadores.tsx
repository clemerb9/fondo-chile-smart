import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

type IndicatorData = {
  codigo: string;
  nombre: string;
  unidad_medida: string;
  serie: {
    fecha: string;
    valor: number;
  }[];
};

type ProcessedIndicator = {
  codigo: string;
  nombre: string;
  valor: number;
  unidad_medida: string;
  fecha: string;
  variacion: number;
  variacionPorcentual: number;
};

const INDICATORS_TO_FETCH = ["dolar", "euro", "uf", "utm", "ipc"];

const FRECUENCIA_ACTUALIZACION: Record<string, string> = {
  dolar: "Se actualiza en días hábiles",
  euro: "Se actualiza en días hábiles",
  uf: "Se actualiza diariamente",
  utm: "Se actualiza mensualmente",
  ipc: "Se publica mensualmente por el INE",
};

export default function Indicadores() {
  const [data, setData] = useState<ProcessedIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        const promises = INDICATORS_TO_FETCH.map((codigo) =>
          fetch(`https://mindicador.cl/api/${codigo}`).then((res) => {
            if (!res.ok) throw new Error(`Error fetching ${codigo}`);
            return res.json() as Promise<IndicatorData>;
          })
        );

        const results = await Promise.all(promises);

        const processed: ProcessedIndicator[] = results.map((ind) => {
          const current = ind.serie[0];
          const previous = ind.serie[1] || current; // Fallback if no previous
          
          const variacion = current.valor - previous.valor;
          const variacionPorcentual = previous.valor !== 0 ? (variacion / previous.valor) * 100 : 0;

          return {
            codigo: ind.codigo,
            nombre: ind.nombre,
            valor: current.valor,
            unidad_medida: ind.unidad_medida,
            fecha: current.fecha,
            variacion,
            variacionPorcentual,
          };
        });

        setData(processed);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los indicadores económicos.");
      } finally {
        setLoading(false);
      }
    };

    fetchIndicators();
  }, []);

  const formatValue = (valor: number, unidad: string) => {
    if (unidad.toLowerCase() === "pesos") {
      return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
      }).format(valor);
    }
    return `${valor.toLocaleString("es-CL", { minimumFractionDigits: 2 })}%`;
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="container py-12 animate-fade-in min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">
            Indicadores Económicos
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Mantente al día con los principales indicadores de la economía chilena en tiempo real.
          </p>
        </div>

        {error && (
          <div className="p-4 mb-8 bg-red-50 text-red-600 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border/50 bg-card p-6 shadow-soft animate-pulse flex flex-col gap-4"
                >
                  <div className="h-5 w-24 bg-muted rounded"></div>
                  <div className="h-8 w-32 bg-muted rounded"></div>
                  <div className="h-4 w-20 bg-muted rounded"></div>
                  <div className="h-4 w-full bg-muted rounded mt-2"></div>
                </div>
              ))
            : data.map((ind) => (
                <div
                  key={ind.codigo}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 md:p-6 shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <DollarSign className="w-24 h-24" />
                  </div>
                  
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center justify-between">
                    {ind.nombre}
                  </h3>
                  
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                      {formatValue(ind.valor, ind.unidad_medida)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 mt-4 text-xs md:text-sm">
                    <div
                      className={cn(
                        "flex items-center gap-1 font-medium",
                        ind.variacion > 0
                          ? "text-emerald-600 bg-emerald-50 w-max px-2 py-1 rounded-md"
                          : ind.variacion < 0
                          ? "text-red-600 bg-red-50 w-max px-2 py-1 rounded-md"
                          : "text-muted-foreground bg-muted w-max px-2 py-1 rounded-md"
                      )}
                    >
                      {ind.variacion > 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : ind.variacion < 0 ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : null}
                      <span className="truncate">
                        {ind.variacion > 0 ? "+" : ""}
                        {formatValue(ind.variacion, ind.unidad_medida)} (
                        {ind.variacion > 0 ? "+" : ""}
                        {ind.variacionPorcentual.toFixed(2)}%)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground/80 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="truncate">{formatDate(ind.fecha)}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground/60 mt-1.5">
                      {FRECUENCIA_ACTUALIZACION[ind.codigo]}
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>

      <div className="mt-16 text-center text-sm text-muted-foreground/60 border-t border-border/50 pt-8 pb-4">
        Fuente: Banco Central de Chile · mindicador.cl
      </div>
    </div>
  );
}
