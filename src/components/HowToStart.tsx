import { UserCheck, FileSearch, Rocket, ArrowRight } from "lucide-react";
import { FINTUAL_AFFILIATE } from "@/lib/affiliate";

const steps = [
  {
    icon: FileSearch,
    title: "1. Define tu perfil",
    desc: "Decide cuánto riesgo estás dispuesto a tomar y por cuánto tiempo puedes dejar tu dinero invertido.",
  },
  {
    icon: UserCheck,
    title: "2. Abre tu cuenta",
    desc: "Solo necesitas tu RUT y un par de minutos. No tienes que ir a una sucursal ni firmar papeles.",
  },
  {
    icon: Rocket,
    title: "3. Haz tu primer aporte",
    desc: "Empieza con el monto que te acomode. Lo importante es la constancia, no el monto inicial.",
  },
];

export const HowToStart = () => {
  return (
    <section className="container py-16 md:py-24">
      <div className="max-w-2xl mb-12">
        <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">¿Cómo empiezo?</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-primary text-balance">
          Tres pasos para empezar a invertir hoy
        </h2>
        <p className="text-lg text-muted-foreground mt-3">
          Invertir en fondos mutuos es más simple de lo que parece. Te lo explicamos sin vueltas.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-10">
        {steps.map((s) => (
          <div key={s.title} className="relative p-6 rounded-2xl bg-card border border-border shadow-soft">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent mb-4">
              <s.icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <h3 className="font-display text-lg font-semibold text-primary mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl gradient-hero p-8 md:p-10 text-primary-foreground flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <h3 className="font-display text-xl md:text-2xl font-bold mb-1.5">
            ¿Quieres dar el primer paso?
          </h3>
          <p className="text-primary-foreground/75 text-sm md:text-base">
            Fintual permite abrir cuenta 100% online y desde $1.000.
          </p>
        </div>
        <a
          href={FINTUAL_AFFILIATE}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl gradient-accent text-accent-foreground font-semibold transition-smooth hover:shadow-glow hover:scale-[1.02] shrink-0"
        >
          Abrir cuenta gratis en Fintual
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center md:text-left">
        Enlace de referido. FondoSmart no es asesor financiero ni recibe depósitos.
      </p>
    </section>
  );
};
