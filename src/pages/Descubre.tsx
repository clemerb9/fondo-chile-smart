import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, ShieldCheck, ExternalLink, RefreshCw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { fondos, type Fondo, type Riesgo } from "@/data/funds";
import { getFundCta } from "@/lib/affiliate";
import { trackEvent } from "@/lib/analytics";

type Goal = "casa" | "viaje" | "emergencia" | "crecer" | "indeciso";
type Horizon = "<1" | "1-3" | "3-5" | ">5";
type RiskAnswer = "agresivo" | "moderado" | "conservador";

const formatCLP = (n: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(n)));

const goalOptions: { id: Goal; emoji: string; label: string; reason: string }[] = [
  { id: "casa", emoji: "🏠", label: "Comprar casa o depto", reason: "Crece de forma estable hacia tu pie." },
  { id: "viaje", emoji: "✈️", label: "Un viaje o meta personal", reason: "Equilibra crecimiento con disponibilidad." },
  { id: "emergencia", emoji: "🛡️", label: "Fondo de emergencias", reason: "Prioriza seguridad y liquidez." },
  { id: "crecer", emoji: "📈", label: "Hacer crecer mi plata", reason: "Maximiza retorno a largo plazo." },
  { id: "indeciso", emoji: "🤷", label: "No tengo claro aún", reason: "Punto de partida balanceado y flexible." },
];

const horizonOptions: { id: Horizon; emoji: string; label: string }[] = [
  { id: "<1", emoji: "⚡", label: "Menos de 1 año" },
  { id: "1-3", emoji: "📅", label: "1 a 3 años" },
  { id: "3-5", emoji: "🗓️", label: "3 a 5 años" },
  { id: ">5", emoji: "🌱", label: "Más de 5 años" },
];

const riskOptions: { id: RiskAnswer; emoji: string; label: string; profile: Riesgo }[] = [
  { id: "agresivo", emoji: "😌", label: "Me da igual, es largo plazo", profile: "Agresivo" },
  { id: "moderado", emoji: "😟", label: "Me preocupa pero aguanto", profile: "Moderado" },
  { id: "conservador", emoji: "😰", label: "Prefiero no arriesgar", profile: "Conservador" },
];

// Compute final profile combining horizon + risk answer
function computeProfile(horizon: Horizon, risk: RiskAnswer): Riesgo {
  const base: Riesgo = riskOptions.find((r) => r.id === risk)!.profile;
  // Short horizon caps risk down
  if (horizon === "<1") return "Conservador";
  if (horizon === "1-3" && base === "Agresivo") return "Moderado";
  // Long horizon nudges up if user said moderado
  if (horizon === ">5" && base === "Moderado") return "Moderado";
  return base;
}

// Expected annual return per profile (used for projection)
const expectedReturn: Record<Riesgo, number> = {
  Conservador: 0.05,
  Moderado: 0.08,
  Agresivo: 0.11,
};

const horizonYears: Record<Horizon, number> = {
  "<1": 1,
  "1-3": 2,
  "3-5": 4,
  ">5": 7,
};

// Compound interest with monthly contributions
function projectFuture(monthly: number, years: number, annualRate: number): number {
  const months = years * 12;
  const r = annualRate / 12;
  if (r === 0) return monthly * months;
  return monthly * ((Math.pow(1 + r, months) - 1) / r);
}

const Descubre = () => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(50000);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [horizon, setHorizon] = useState<Horizon | null>(null);
  const [risk, setRisk] = useState<RiskAnswer | null>(null);

  const totalSteps = 4;
  const progress = step <= totalSteps ? (step / totalSteps) * 100 : 100;

  const profile: Riesgo | null = useMemo(() => {
    if (!horizon || !risk) return null;
    return computeProfile(horizon, risk);
  }, [horizon, risk]);

  const recommendations: Fondo[] = useMemo(() => {
    if (!profile) return [];
    const matches = fondos.filter((f) => f.riesgo === profile);
    // Best by 3y return
    return [...matches].sort((a, b) => b.rent3 - a.rent3).slice(0, 3);
  }, [profile]);

  const projection = useMemo(() => {
    if (!profile || !horizon) return 0;
    return projectFuture(amount, horizonYears[horizon], expectedReturn[profile]);
  }, [amount, horizon, profile]);

  const reset = () => {
    setStep(1);
    setGoal(null);
    setHorizon(null);
    setRisk(null);
  };

  const handleGoal = (g: Goal) => {
    setGoal(g);
    setStep(3);
    trackEvent("simulator_used", { flow: "descubre", step: "goal", value: g });
  };

  const handleHorizon = (h: Horizon) => {
    setHorizon(h);
    setStep(4);
    trackEvent("simulator_used", { flow: "descubre", step: "horizon", value: h });
  };

  const handleRisk = (r: RiskAnswer) => {
    setRisk(r);
    setStep(5);
    trackEvent("simulator_used", { flow: "descubre", step: "risk", value: r });
  };

  return (
    <section className="container py-10 md:py-16 max-w-3xl">
      {/* Progress header */}
      {step <= totalSteps && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider">
              Paso {step} de {totalSteps}
            </p>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-smooth"
              >
                <ArrowLeft className="h-4 w-4" /> Atrás
              </button>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* STEP 1 — Amount */}
      {step === 1 && (
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Inversión a tu medida
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-primary text-balance mb-3">
            ¿Cuánto puedes invertir al mes?
          </h1>
          <p className="text-muted-foreground text-lg mb-10">
            Mueve el deslizador. Vamos a usar este monto para diseñar tu plan.
          </p>

          <div className="p-8 rounded-2xl bg-card border border-border shadow-soft">
            <div className="text-center mb-6">
              <div className="text-sm font-semibold text-muted-foreground mb-1">Aporte mensual</div>
              <div className="font-display text-5xl md:text-6xl font-bold text-primary">
                {formatCLP(amount)}
              </div>
            </div>

            <Slider
              value={[amount]}
              min={10000}
              max={500000}
              step={5000}
              onValueChange={(v) => setAmount(v[0])}
              className="my-8"
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCLP(10000)}</span>
              <span>{formatCLP(500000)}</span>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm font-semibold text-primary mb-4">
                Tu monto bajo la regla 50-30-20 (sobre tu sueldo aproximado de {formatCLP(amount * 5)}):
              </p>
              <div className="grid grid-cols-3 gap-3">
                <BucketMini label="50% Gastos fijos" value={amount * 2.5} />
                <BucketMini label="30% Personales" value={amount * 1.5} />
                <BucketMini label="20% Inversión" value={amount} highlight />
              </div>
              <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                Si tu 20% de ahorro mensual fuera {formatCLP(amount)}, tu sueldo líquido equivalente sería ~{formatCLP(amount * 5)}.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-4 rounded-xl gradient-accent text-accent-foreground font-semibold transition-smooth hover:shadow-glow hover:scale-[1.02]"
          >
            Siguiente <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* STEP 2 — Goal */}
      {step === 2 && (
        <div className="animate-fade-up">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-primary text-balance mb-3">
            ¿Para qué quieres invertir?
          </h1>
          <p className="text-muted-foreground text-lg mb-10">
            Elige la opción que más se acerque a tu objetivo.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {goalOptions.map((opt) => (
              <OptionCard
                key={opt.id}
                emoji={opt.emoji}
                label={opt.label}
                selected={goal === opt.id}
                onClick={() => handleGoal(opt.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 — Horizon */}
      {step === 3 && (
        <div className="animate-fade-up">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-primary text-balance mb-3">
            ¿En cuánto tiempo?
          </h1>
          <p className="text-muted-foreground text-lg mb-10">
            ¿Cuándo crees que vas a necesitar esa plata?
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {horizonOptions.map((opt) => (
              <OptionCard
                key={opt.id}
                emoji={opt.emoji}
                label={opt.label}
                selected={horizon === opt.id}
                onClick={() => handleHorizon(opt.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* STEP 4 — Risk */}
      {step === 4 && (
        <div className="animate-fade-up">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-primary text-balance mb-3">
            ¿Cómo reaccionarías si tu inversión baja un 10% en un mes?
          </h1>
          <p className="text-muted-foreground text-lg mb-10">
            No hay respuesta correcta. Solo elige la que mejor describe cómo te sentirías.
          </p>

          <div className="grid gap-4">
            {riskOptions.map((opt) => (
              <OptionCard
                key={opt.id}
                emoji={opt.emoji}
                label={opt.label}
                selected={risk === opt.id}
                onClick={() => handleRisk(opt.id)}
                wide
              />
            ))}
          </div>
        </div>
      )}

      {/* RESULT */}
      {step === 5 && profile && horizon && (
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Tu resultado
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-primary mb-3">
            Tu perfil: <span className="text-accent">{profile}</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-10">
            En base a tus respuestas, este es el camino que mejor se ajusta a ti.
          </p>

          {/* Projection card */}
          <div className="p-8 rounded-2xl gradient-hero text-primary-foreground shadow-elegant mb-10">
            <p className="text-sm uppercase tracking-wider text-primary-foreground/70 mb-2">
              Proyección estimada
            </p>
            <p className="text-primary-foreground/90 leading-relaxed mb-4">
              Si inviertes <strong>{formatCLP(amount)}</strong> al mes durante{" "}
              <strong>{horizonYears[horizon]} año{horizonYears[horizon] > 1 ? "s" : ""}</strong>{" "}
              en un perfil <strong>{profile.toLowerCase()}</strong>, podrías tener:
            </p>
            <div className="font-display text-4xl md:text-6xl font-bold text-accent">
              {formatCLP(projection)}
            </div>
            <p className="text-xs text-primary-foreground/60 mt-4">
              Estimación con interés compuesto a una rentabilidad anual referencial de{" "}
              {(expectedReturn[profile] * 100).toFixed(0)}%.
            </p>
          </div>

          {/* Recommendations */}
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-5">
            Fondos que calzan con tu perfil
          </h2>
          <div className="grid gap-4 mb-8">
            {recommendations.map((f) => {
              const cta = getFundCta(f);
              const reason = goal
                ? goalOptions.find((g) => g.id === goal)?.reason ?? ""
                : "Buen calce con tu perfil de riesgo.";
              return (
                <div
                  key={f.id}
                  className="p-6 rounded-2xl bg-card border border-border shadow-soft"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        {f.administradora}
                      </p>
                      <h3 className="font-display text-xl font-semibold text-primary mb-2">
                        {f.nombre}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {reason}
                      </p>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                        <span className="text-muted-foreground">
                          Rent. 1 año:{" "}
                          <strong className="text-primary">{f.rent1.toFixed(1)}%</strong>
                        </span>
                        <span className="text-muted-foreground">
                          Rent. 3 años:{" "}
                          <strong className="text-primary">{f.rent3.toFixed(1)}%</strong>
                        </span>
                      </div>
                    </div>
                    <a
                      href={cta.href}
                      target="_blank"
                      rel={cta.isAffiliate ? "noopener sponsored" : "noopener noreferrer"}
                      onClick={() =>
                        trackEvent("fintual_cta_clicked", {
                          source: "descubre",
                          fund: f.nombre,
                          profile,
                        })
                      }
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl gradient-accent text-accent-foreground font-semibold transition-smooth hover:shadow-glow hover:scale-[1.02] whitespace-nowrap"
                    >
                      Invertir aquí <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mb-10">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-muted text-primary font-semibold transition-smooth hover:bg-secondary"
            >
              <RefreshCw className="h-4 w-4" /> Volver a empezar
            </button>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-3 p-5 rounded-xl bg-muted/60 border border-border">
            <ShieldCheck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Esto no es asesoría financiera. Rentabilidades pasadas no garantizan resultados
              futuros.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

const BucketMini = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) => (
  <div
    className={`p-3 rounded-xl border ${
      highlight ? "bg-accent-soft border-accent/30" : "bg-muted/50 border-border"
    }`}
  >
    <p className="text-[11px] font-medium text-muted-foreground leading-tight">{label}</p>
    <p
      className={`font-display font-bold text-base md:text-lg mt-1 break-words ${
        highlight ? "text-accent" : "text-primary"
      }`}
    >
      {formatCLP(value)}
    </p>
  </div>
);

const OptionCard = ({
  emoji,
  label,
  selected,
  onClick,
  wide = false,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
  wide?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`group text-left p-6 rounded-2xl border-2 bg-card transition-smooth hover:-translate-y-0.5 hover:shadow-elegant ${
      selected
        ? "border-accent shadow-glow"
        : "border-border hover:border-accent/50"
    } ${wide ? "flex items-center gap-5" : ""}`}
  >
    <div className={`text-4xl ${wide ? "" : "mb-3"}`}>{emoji}</div>
    <div className="font-display text-lg font-semibold text-primary leading-tight">
      {label}
    </div>
  </button>
);

export default Descubre;
