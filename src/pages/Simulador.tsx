import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fondos } from "@/data/funds";
import { TrendingUp, Wallet, PiggyBank } from "lucide-react";
import { HowToStart } from "@/components/HowToStart";

const formatCLP = (n: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);

const formatCompact = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};

const Simulador = () => {
  const [params] = useSearchParams();
  const fundId = params.get("fund");
  const initialFund = fondos.find((f) => f.id === fundId) ?? fondos[1];

  const [selectedFund, setSelectedFund] = useState(initialFund.id);
  const [montoInicial, setMontoInicial] = useState(500_000);
  const [aporteMensual, setAporteMensual] = useState(100_000);
  const [plazo, setPlazo] = useState(10);
  const [rentabilidad, setRentabilidad] = useState(initialFund.rent1);

  useEffect(() => {
    const f = fondos.find((x) => x.id === selectedFund);
    if (f) setRentabilidad(f.rent1);
  }, [selectedFund]);

  const { data, finalAmount, totalAportado, ganancia } = useMemo(() => {
    const r = rentabilidad / 100;
    const monthlyR = Math.pow(1 + r, 1 / 12) - 1;
    const points: { year: number; valor: number; aportado: number }[] = [];
    let balance = montoInicial;
    let aportado = montoInicial;
    points.push({ year: 0, valor: balance, aportado });
    for (let y = 1; y <= plazo; y++) {
      for (let m = 0; m < 12; m++) {
        balance = balance * (1 + monthlyR) + aporteMensual;
        aportado += aporteMensual;
      }
      points.push({ year: y, valor: Math.round(balance), aportado });
    }
    return {
      data: points,
      finalAmount: Math.round(balance),
      totalAportado: aportado,
      ganancia: Math.round(balance - aportado),
    };
  }, [montoInicial, aporteMensual, plazo, rentabilidad]);

  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-3xl mb-10">
        <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Simulador</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4 text-balance">
          ¿Cuánto puede crecer tu plata?
        </h1>
        <p className="text-lg text-muted-foreground">
          Ajusta los valores y descubre la proyección de tu inversión a lo largo del tiempo.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* FORM */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-soft p-6 md:p-8 space-y-6 h-fit">
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Fondo seleccionado</label>
            <select
              value={selectedFund}
              onChange={(e) => setSelectedFund(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
            >
              {fondos.map((f) => (
                <option key={f.id} value={f.id}>{f.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Monto inicial (CLP)</label>
            <input
              type="number"
              value={montoInicial}
              onChange={(e) => setMontoInicial(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
              step={50000}
            />
            <p className="text-xs text-muted-foreground mt-1.5">{formatCLP(montoInicial)}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Aporte mensual (CLP)</label>
            <input
              type="number"
              value={aporteMensual}
              onChange={(e) => setAporteMensual(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
              step={10000}
            />
            <p className="text-xs text-muted-foreground mt-1.5">{formatCLP(aporteMensual)} cada mes</p>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-sm font-semibold text-primary">Plazo</label>
              <span className="font-display text-lg font-bold text-accent">{plazo} {plazo === 1 ? "año" : "años"}</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={plazo}
              onChange={(e) => setPlazo(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none bg-muted accent-accent cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
              <span>1 año</span>
              <span>30 años</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-sm font-semibold text-primary">Rentabilidad esperada</label>
              <span className="font-display text-lg font-bold text-accent">{rentabilidad.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={0.1}
              value={rentabilidad}
              onChange={(e) => setRentabilidad(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none bg-muted accent-accent cursor-pointer"
            />
          </div>
        </div>

        {/* RESULTS */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-2xl border border-border shadow-soft p-5">
              <Wallet className="h-5 w-5 text-muted-foreground mb-3" />
              <div className="text-xs text-muted-foreground font-medium mb-1">Total aportado</div>
              <div className="font-display text-xl md:text-2xl font-bold text-primary">{formatCLP(totalAportado)}</div>
            </div>
            <div className="bg-card rounded-2xl border border-border shadow-soft p-5">
              <TrendingUp className="h-5 w-5 text-accent mb-3" />
              <div className="text-xs text-muted-foreground font-medium mb-1">Ganancia estimada</div>
              <div className="font-display text-xl md:text-2xl font-bold text-accent">+{formatCLP(ganancia)}</div>
            </div>
            <div className="bg-primary text-primary-foreground rounded-2xl shadow-elegant p-5">
              <PiggyBank className="h-5 w-5 text-accent mb-3" />
              <div className="text-xs text-primary-foreground/70 font-medium mb-1">Monto final</div>
              <div className="font-display text-xl md:text-2xl font-bold">{formatCLP(finalAmount)}</div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-soft p-5 md:p-6">
            <h3 className="font-display text-lg font-semibold text-primary mb-1">Proyección de crecimiento</h3>
            <p className="text-sm text-muted-foreground mb-5">Valor estimado de tu inversión en el tiempo</p>
            <div className="h-72 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAportado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v}a`} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={formatCompact} width={55} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontFamily: "Inter",
                    }}
                    labelFormatter={(v) => `Año ${v}`}
                    formatter={(val: number, name) => [formatCLP(val), name === "valor" ? "Valor proyectado" : "Total aportado"]}
                  />
                  <Area type="monotone" dataKey="aportado" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorAportado)" />
                  <Area type="monotone" dataKey="valor" stroke="hsl(var(--accent))" strokeWidth={3} fill="url(#colorValor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-muted-foreground">Valor proyectado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Total aportado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <HowToStart />
    </div>
  );
};

export default Simulador;
