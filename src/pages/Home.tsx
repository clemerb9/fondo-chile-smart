import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Calculator, BookOpen, ShieldCheck, TrendingUp } from "lucide-react";
import BudgetRule from "@/components/BudgetRule";

const features = [
  {
    icon: BarChart3,
    title: "Compara fondos",
    desc: "Visualiza rentabilidades, riesgo y comisiones de los principales fondos mutuos chilenos en una sola tabla.",
  },
  {
    icon: Calculator,
    title: "Simula tu inversión",
    desc: "Proyecta cuánto puede crecer tu dinero con aportes mensuales y distintos plazos.",
  },
  {
    icon: BookOpen,
    title: "Aprende lo esencial",
    desc: "Glosario claro en español sobre rentabilidad, volatilidad, diversificación y más.",
  },
];

const Home = () => {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden gradient-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 -left-20 w-80 h-80 rounded-full bg-accent blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-primary-glow blur-3xl" />
        </div>

        <div className="container relative py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] mb-5 text-balance animate-fade-up">
              Invierte con <span className="text-accent">claridad</span>, no con suerte
            </h1>
            <p className="text-lg md:text-2xl text-primary-foreground/80 mb-12 text-balance animate-fade-up" style={{ animationDelay: "100ms" }}>
              ¿Por dónde quieres empezar?
            </p>
          </div>

          {/* Two path cards */}
          <div className="grid md:grid-cols-2 gap-5 md:gap-6 max-w-5xl mx-auto animate-fade-up" style={{ animationDelay: "200ms" }}>
            {/* CARD 1 — Empezar desde cero (green/accent) */}
            <Link
              to="/descubre"
              className="group relative overflow-hidden rounded-3xl bg-card p-8 md:p-10 shadow-elegant border-2 border-accent/30 hover:border-accent transition-smooth hover:-translate-y-1"
            >
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-accent/15 blur-2xl transition-smooth group-hover:bg-accent/25" />
              <div className="relative">
                <div className="text-5xl mb-5">👶</div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-3 text-balance">
                  Estoy empezando desde cero
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-7 md:min-h-[3.5rem]">
                  Descubre en 2 minutos en qué invertir según tus metas y perfil.
                </p>
                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-accent text-accent-foreground font-semibold shadow-soft transition-smooth group-hover:shadow-glow">
                  Empezar
                  <ArrowRight className="h-5 w-5 transition-smooth group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            {/* CARD 2 — Analizar inversión (blue/primary) */}
            <Link
              to="/acciones"
              className="group relative overflow-hidden rounded-3xl bg-card p-8 md:p-10 shadow-elegant border-2 border-primary/30 hover:border-primary transition-smooth hover:-translate-y-1"
            >
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-primary/15 blur-2xl transition-smooth group-hover:bg-primary/25" />
              <div className="relative">
                <div className="text-5xl mb-5">🔍</div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-3 text-balance">
                  Quiero analizar una inversión
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-7 md:min-h-[3.5rem]">
                  Busca cualquier acción o fondo y ve si es buen momento para invertir.
                </p>
                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-soft transition-smooth group-hover:bg-primary-glow">
                  Buscar
                  <ArrowRight className="h-5 w-5 transition-smooth group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* BUDGET RULE 50-30-20 */}
      <BudgetRule />

      {/* FEATURES */}
      <section className="container py-20 md:py-28">
        <div className="max-w-2xl mb-14">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Todo lo que necesitas</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary text-balance">
            Decisiones financieras más inteligentes
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group p-8 rounded-2xl bg-card border border-border shadow-soft hover:shadow-elegant transition-smooth hover:-translate-y-1"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent mb-5 group-hover:scale-110 transition-smooth">
                <f.icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary mb-2">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-3xl gradient-hero p-10 md:p-16 text-center">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accent blur-3xl" />
          </div>
          <div className="relative max-w-2xl mx-auto">
            <ShieldCheck className="h-12 w-12 text-accent mx-auto mb-5" strokeWidth={2} />
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4 text-balance">
              Tu plata, tu decisión.
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Empieza a comparar en menos de un minuto. Datos reales, lenguaje claro.
            </p>
            <Link
              to="/comparador"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-accent text-accent-foreground font-semibold transition-smooth hover:shadow-glow hover:scale-[1.02]"
            >
              Comparar fondos
              <TrendingUp className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
