import { BookOpen } from "lucide-react";
import { glosario } from "@/data/funds";

const Glosario = () => {
  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-3xl mb-12">
        <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Glosario</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4 text-balance">
          Hablemos en simple
        </h1>
        <p className="text-lg text-muted-foreground">
          Los términos clave para invertir, explicados sin jerga financiera.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {glosario.map((g, i) => (
          <div
            key={g.term}
            className="group p-6 rounded-2xl bg-card border border-border shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-smooth animate-fade-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent mb-4 group-hover:scale-110 transition-smooth">
              <BookOpen className="h-5 w-5" strokeWidth={2} />
            </div>
            <h3 className="font-display text-xl font-semibold text-primary mb-2">{g.term}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{g.def}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Glosario;
