import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Home as HomeIcon, Coffee, PiggyBank } from "lucide-react";

const formatCLP = (n: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(n)));

const buckets = [
  {
    key: "needs",
    pct: 0.5,
    label: "50% Gastos fijos",
    desc: "Arriendo, comida, transporte, cuentas.",
    icon: HomeIcon,
  },
  {
    key: "wants",
    pct: 0.3,
    label: "30% Gastos personales",
    desc: "Salidas, entretenimiento, hobbies.",
    icon: Coffee,
  },
  {
    key: "save",
    pct: 0.2,
    label: "20% Ahorro e inversión",
    desc: "Tu fondo de emergencia y futuro.",
    icon: PiggyBank,
  },
];

const BudgetRule = () => {
  const [incomeStr, setIncomeStr] = useState("800000");
  const income = useMemo(() => {
    const n = Number(incomeStr.replace(/\D/g, ""));
    return Number.isFinite(n) ? n : 0;
  }, [incomeStr]);

  return (
    <section className="container py-20 md:py-28">
      <div className="max-w-2xl mb-12">
        <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
          ¿Cómo distribuir tu plata?
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-primary text-balance mb-4">
          ¿Cuánto deberías invertir?
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          La regla <strong className="text-primary">50-30-20</strong> es una guía simple para
          ordenar tu sueldo: 50% para lo esencial, 30% para disfrutar y 20% para construir tu
          futuro.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Calculator input */}
        <div className="lg:col-span-2 p-8 rounded-2xl bg-card border border-border shadow-soft">
          <label htmlFor="income" className="block text-sm font-semibold text-primary mb-3">
            Tu ingreso mensual líquido
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              $
            </span>
            <input
              id="income"
              type="text"
              inputMode="numeric"
              value={income ? new Intl.NumberFormat("es-CL").format(income) : ""}
              onChange={(e) => setIncomeStr(e.target.value)}
              placeholder="800.000"
              className="w-full h-14 pl-9 pr-4 rounded-xl border border-input bg-background text-2xl font-display font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-smooth"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Ajusta el monto y mira cómo cambia tu distribución al instante.
          </p>

          <Link
            to="/simulador"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 px-6 py-4 rounded-xl gradient-accent text-accent-foreground font-semibold transition-smooth hover:shadow-glow hover:scale-[1.02]"
          >
            Simula tu 20%
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Buckets */}
        <div className="lg:col-span-3 grid sm:grid-cols-3 gap-4">
          {buckets.map((b) => (
            <div
              key={b.key}
              className="p-6 rounded-2xl bg-card border border-border shadow-soft flex flex-col"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent mb-4">
                <b.icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">{b.label}</p>
              <p className="font-display text-2xl md:text-3xl font-bold text-primary mt-1 break-words">
                {formatCLP(income * b.pct)}
              </p>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BudgetRule;
