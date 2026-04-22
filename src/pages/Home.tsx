import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Calculator, BookOpen, ShieldCheck, Sparkles, TrendingUp, Compass } from "lucide-react";
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

const stats = [
  { value: "8+", label: "Fondos comparados" },
  { value: "30 años", label: "Plazo simulable" },
  { value: "100%", label: "Gratis y en español" },
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

        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-foreground/10 border border-accent-foreground/20 backdrop-blur-sm text-sm mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-primary-foreground/90">Hecho para inversionistas en Chile</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] mb-6 text-balance animate-fade-up">
              Invierte con <span className="text-accent">claridad</span>, no con suerte.
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl text-balance animate-fade-up" style={{ animationDelay: "100ms" }}>
              Compara fondos mutuos chilenos y simula cuánto puede crecer tu dinero. Sin tecnicismos, sin letra chica.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
              <Link
                to="/comparador"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl gradient-accent text-accent-foreground font-semibold transition-smooth hover:shadow-glow hover:scale-[1.02]"
              >
                Comparar fondos ahora
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/simulador"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground font-semibold transition-smooth hover:bg-primary-foreground/20"
              >
                Probar simulador
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 mt-16 max-w-xl animate-fade-up" style={{ animationDelay: "300ms" }}>
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-2xl md:text-4xl font-bold text-accent">{s.value}</div>
                  <div className="text-xs md:text-sm text-primary-foreground/70 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DESCUBRE CTA */}
      <section className="container pt-16 md:pt-20">
        <Link
          to="/descubre"
          className="group relative block overflow-hidden rounded-3xl gradient-accent p-8 md:p-10 shadow-glow transition-smooth hover:scale-[1.01]"
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-primary-foreground/10 blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <div className="flex items-start md:items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-foreground/15 backdrop-blur-sm">
                <Compass className="h-7 w-7 text-accent-foreground" strokeWidth={2.2} />
              </div>
              <div>
                <p className="text-xs font-semibold text-accent-foreground/80 uppercase tracking-wider mb-1">
                  Inversión a tu medida
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-accent-foreground text-balance">
                  ¿No sabes por dónde empezar? Descúbrelo en 2 minutos
                </h2>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-elegant whitespace-nowrap group-hover:bg-primary-glow transition-smooth self-start md:self-auto">
              Empezar test
              <ArrowRight className="h-5 w-5 transition-smooth group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
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
