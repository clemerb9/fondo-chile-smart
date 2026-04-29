import { ArrowRight, Clock } from "lucide-react";
import { FINTUAL_AFFILIATE } from "@/lib/affiliate";
import { trackEvent } from "@/lib/analytics";

export const FintualCtaCard = ({ source = "unknown" }: { source?: string }) => {
  return (
    <div className="w-full bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-3xl p-8 md:p-10 shadow-elegant text-center relative overflow-hidden animate-fade-up">
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#00D18B]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        <div>
          <h2 className="font-display text-3xl font-bold text-primary mb-2">
            ¿Listo para invertir de verdad?
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Abre tu cuenta en Fintual en 5 minutos y empieza desde $1 peso
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <a
            href={FINTUAL_AFFILIATE}
            target="_blank"
            rel="noopener sponsored"
            onClick={() => trackEvent("fintual_cta_clicked", { source })}
            className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl bg-[#00D18B] hover:bg-[#00B97A] text-white font-bold text-lg transition-all hover:shadow-[0_0_20px_rgba(0,209,139,0.4)] hover:-translate-y-1 w-full sm:w-auto"
          >
            Abrir cuenta gratis <ArrowRight className="h-5 w-5" />
          </a>
          
          <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald-800 bg-emerald-100/50 px-4 py-2 rounded-full">
            <Clock className="h-4 w-4 text-emerald-600" />
            ⏱ Tarda solo 5 minutos · Desde $1 peso · Sin comisión de apertura
          </div>
        </div>

        <p className="text-sm font-medium text-muted-foreground/80">
          Más de 100.000 chilenos ya invierten con Fintual
        </p>
      </div>
    </div>
  );
};
