import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
} from "recharts";
import { FINTUAL_AFFILIATE } from "@/lib/affiliate";
import { trackEvent } from "@/lib/analytics";

// --- Datos del formulario ---

const GOALS = [
  { id: "casa", emoji: "🏠", title: "Comprar casa o depto", desc: "Meta a largo plazo" },
  { id: "viaje", emoji: "✈️", title: "Un viaje o meta personal", desc: "Meta a mediano plazo" },
  { id: "emergencia", emoji: "🛡️", title: "Fondo de emergencias", desc: "Seguridad ante imprevistos" },
  { id: "crecer", emoji: "📈", title: "Hacer crecer mi plata", desc: "Sin meta específica" },
  { id: "nose", emoji: "🤷", title: "No tengo claro aún", desc: "Te ayudamos a decidir" },
];

const TIMES = [
  { id: "corto", emoji: "⚡", title: "Menos de 1 año", desc: "Corto plazo" },
  { id: "mediano", emoji: "📅", title: "1 a 3 años", desc: "Mediano plazo" },
  { id: "largo", emoji: "🗓️", title: "3 a 5 años", desc: "Buen horizonte" },
  { id: "muy_largo", emoji: "🌱", title: "Más de 5 años", desc: "Largo plazo" },
];

const REACTIONS = [
  { id: "agresivo", emoji: "😌", title: "Me da igual, es largo plazo", profile: "Agresivo" },
  { id: "moderado", emoji: "😟", title: "Me preocupa pero aguanto", profile: "Moderado" },
  { id: "conservador", emoji: "😰", title: "Prefiero no arriesgar", profile: "Conservador" },
];

const FUNDS = {
  Conservador: [
    { name: "Very Conservative Streep", why: "Fondo de muy bajo riesgo, invierte en renta fija y depósitos a plazo.", return: "4% - 6% anual aprox" },
    { name: "Conservative Clooney", why: "Bajo riesgo, ideal para proteger tu dinero de la inflación a corto plazo.", return: "5% - 7% anual aprox" },
  ],
  Moderado: [
    { name: "Moderate Pitt", why: "Riesgo medio, balance perfecto entre renta fija y acciones globales.", return: "6% - 9% anual aprox" },
    { name: "Conservative Clooney", why: "Si prefieres un toque más de seguridad, pero manteniendo algo de rentabilidad.", return: "5% - 7% anual aprox" },
  ],
  Agresivo: [
    { name: "Risky Norris", why: "Alto riesgo, invierte 100% en acciones globales para maximizar el crecimiento a largo plazo.", return: "8% - 12% anual aprox" },
    { name: "Moderate Pitt", why: "Como segunda opción, para tener un poco más de estabilidad.", return: "6% - 9% anual aprox" },
  ],
};

const formatCLP = (amount: number) => {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(amount);
};

const Comenzar = () => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(50000);
  const [goal, setGoal] = useState("");
  const [time, setTime] = useState("");
  const [reaction, setReaction] = useState("");

  const handleNext = () => {
    setStep((s) => Math.min(s + 1, 5));
    if (step === 4) {
      trackEvent("beginner_flow_completed", { profile, amount });
    }
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const profile = useMemo(() => {
    if (!reaction) return "Moderado";
    return REACTIONS.find((r) => r.id === reaction)?.profile || "Moderado";
  }, [reaction]);

  const chartData = useMemo(() => {
    const years = time === "corto" ? 1 : time === "mediano" ? 3 : time === "largo" ? 5 : 10;
    const rate = profile === "Conservador" ? 0.05 : profile === "Moderado" ? 0.08 : 0.10;
    
    const data = [];
    let total = 0;
    for (let m = 0; m <= years * 12; m++) {
      if (m > 0) {
        total = total * (1 + rate / 12) + amount;
      }
      if (m % 12 === 0 || m === years * 12) {
        data.push({
          year: m / 12,
          amount: Math.round(total),
          label: m === 0 ? "Hoy" : `Año ${m / 12}`,
        });
      }
    }
    return data;
  }, [amount, time, profile]);

  const finalAmount = chartData[chartData.length - 1]?.amount || 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex flex-col">
      {/* Progress Bar */}
      {step < 5 && (
        <div className="w-full bg-card border-b border-border p-4 sticky top-16 z-40">
          <div className="container max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`p-2 rounded-lg transition-smooth ${
                step === 1 ? "opacity-0 cursor-default" : "hover:bg-muted text-muted-foreground hover:text-primary"
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Paso {step} de 4
              </span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-8 rounded-full transition-all duration-500 ${
                      i <= step ? "bg-accent" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="w-9" /> {/* Spacer */}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 container max-w-2xl py-12 md:py-20 animate-fade-in">
        {step === 1 && (
          <div className="space-y-10 animate-fade-up">
            <div className="text-center space-y-4">
              <h1 className="font-display text-3xl md:text-5xl font-bold text-primary">
                ¿Cuánto puedes invertir al mes?
              </h1>
              <p className="text-lg text-muted-foreground">
                No necesitas ser millonario para empezar. Cualquier monto suma.
              </p>
            </div>

            <div className="bg-card border border-border p-8 md:p-12 rounded-3xl shadow-soft text-center space-y-10">
              <div className="text-5xl md:text-6xl font-display font-bold text-primary">
                {formatCLP(amount)}
              </div>
              
              <div className="space-y-6">
                <input
                  type="range"
                  min="10000"
                  max="500000"
                  step="10000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-sm font-medium text-muted-foreground">
                  <span>$10.000</span>
                  <span>$500.000+</span>
                </div>
              </div>

              <div className="p-4 bg-accent-soft rounded-2xl inline-block">
                <p className="text-sm font-semibold text-accent">
                  💡 Tu 20% de ahorro recomendado: {formatCLP(amount * 5)} de sueldo
                </p>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-semibold text-lg flex justify-center items-center gap-2 hover:shadow-glow transition-smooth"
            >
              Siguiente <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-fade-up">
            <div className="text-center space-y-4">
              <h1 className="font-display text-3xl md:text-5xl font-bold text-primary">
                ¿Para qué quieres invertir?
              </h1>
              <p className="text-lg text-muted-foreground">
                Tener un objetivo claro te ayudará a mantenerte enfocado.
              </p>
            </div>

            <div className="grid gap-3">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setGoal(g.id);
                    handleNext();
                  }}
                  className={`flex items-center text-left p-5 rounded-2xl border-2 transition-smooth ${
                    goal === g.id
                      ? "border-accent bg-accent/5 shadow-soft"
                      : "border-transparent bg-card hover:border-accent/30 hover:bg-accent-soft shadow-sm"
                  }`}
                >
                  <span className="text-4xl mr-5">{g.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary text-lg">{g.title}</h3>
                    <p className="text-sm text-muted-foreground">{g.desc}</p>
                  </div>
                  <ChevronRight className={`h-5 w-5 ${goal === g.id ? "text-accent" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 animate-fade-up">
            <div className="text-center space-y-4">
              <h1 className="font-display text-3xl md:text-5xl font-bold text-primary">
                ¿En cuánto tiempo?
              </h1>
              <p className="text-lg text-muted-foreground">
                El tiempo es tu mejor aliado para multiplicar tu dinero.
              </p>
            </div>

            <div className="grid gap-3">
              {TIMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTime(t.id);
                    handleNext();
                  }}
                  className={`flex items-center text-left p-5 rounded-2xl border-2 transition-smooth ${
                    time === t.id
                      ? "border-accent bg-accent/5 shadow-soft"
                      : "border-transparent bg-card hover:border-accent/30 hover:bg-accent-soft shadow-sm"
                  }`}
                >
                  <span className="text-4xl mr-5">{t.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary text-lg">{t.title}</h3>
                    <p className="text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                  <ChevronRight className={`h-5 w-5 ${time === t.id ? "text-accent" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-10 animate-fade-up">
            <div className="text-center space-y-4">
              <h1 className="font-display text-3xl md:text-5xl font-bold text-primary">
                ¿Cómo reaccionarías si tu inversión baja 10%?
              </h1>
              <p className="text-lg text-muted-foreground">
                Esto define qué tan riesgosos pueden ser los fondos que elijas.
              </p>
            </div>

            <div className="grid gap-4">
              {REACTIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setReaction(r.id);
                    handleNext();
                  }}
                  className={`flex items-center text-left p-5 rounded-2xl border-2 transition-smooth ${
                    reaction === r.id
                      ? "border-accent bg-accent/5 shadow-soft"
                      : "border-transparent bg-card hover:border-accent/30 hover:bg-accent-soft shadow-sm"
                  }`}
                >
                  <span className="text-4xl mr-5">{r.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary text-lg">{r.title}</h3>
                  </div>
                  <ChevronRight className={`h-5 w-5 ${reaction === r.id ? "text-accent" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-12 animate-fade-up">
            {/* Header Result */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-soft text-accent font-semibold text-sm mb-2">
                <CheckCircle2 className="h-4 w-4" /> ¡Análisis completo!
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary">
                Tu perfil es <span className="text-accent">{profile}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                {profile === "Conservador" && "Prefieres ir a lo seguro. Te sugerimos inversiones estables que no den sorpresas y le ganen a la inflación."}
                {profile === "Moderado" && "Buscas un balance. Estás dispuesto a asumir un riesgo controlado para obtener mejores ganancias."}
                {profile === "Agresivo" && "Tienes la vista en el largo plazo. Las caídas no te asustan porque sabes que el mercado siempre sube."}
              </p>
            </div>

            {/* Simulation Chart */}
            <div className="bg-card border border-border p-6 md:p-8 rounded-3xl shadow-soft">
              <div className="mb-6">
                <h3 className="font-display text-xl font-bold text-primary mb-2">Proyección estimada</h3>
                <p className="text-muted-foreground">
                  Si inviertes <strong className="text-primary">{formatCLP(amount)}</strong> mensualmente, podrías tener <strong className="text-accent text-xl">{formatCLP(finalAmount)}</strong>.
                </p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      width={60}
                    />
                    <RTooltip 
                      formatter={(value: number) => [formatCLP(value), "Monto proyectado"]}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "1px solid hsl(var(--border))" }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="hsl(var(--accent))" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                *Proyección usando interés compuesto con retorno anual estimado del {profile === "Conservador" ? "5%" : profile === "Moderado" ? "8%" : "10%"}.
              </p>
            </div>

            {/* Recommendations */}
            <div className="space-y-6">
              <h3 className="font-display text-2xl font-bold text-primary">Fondos recomendados en Fintual</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {FUNDS[profile as keyof typeof FUNDS].map((fund) => (
                  <div key={fund.name} className="p-6 rounded-2xl bg-muted/40 border border-border">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h4 className="font-semibold text-lg text-primary">{fund.name}</h4>
                      <ShieldCheck className="h-6 w-6 text-accent shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{fund.why}</p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border shadow-sm text-sm font-medium text-primary">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      {fund.return}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center space-y-6 pt-4 border-t border-border">
              <a
                href={FINTUAL_AFFILIATE}
                target="_blank"
                rel="noopener sponsored"
                onClick={() => trackEvent("fintual_cta_clicked", { source: "comenzar_results" })}
                className="inline-flex w-full md:w-auto items-center justify-center gap-2 px-10 py-5 rounded-2xl bg-[#00D18B] hover:bg-[#00B97A] text-white font-bold text-lg transition-all hover:shadow-[0_0_20px_rgba(0,209,139,0.4)] hover:-translate-y-1"
              >
                Invertir en Fintual <ArrowRight className="h-5 w-5" />
              </a>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Esto no es asesoría financiera. Rentabilidades pasadas no garantizan resultados futuros. · Infórmate en CMF Chile
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Comenzar;
