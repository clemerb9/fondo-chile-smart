import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { FINTUAL_AFFILIATE } from "@/lib/affiliate";

const STORAGE_KEY = "fs-affiliate-banner-dismissed";

export const StickyAffiliateBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
  };

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 p-3 pointer-events-none">
      <div className="pointer-events-auto rounded-2xl bg-primary text-primary-foreground shadow-elegant border border-primary-glow/40 flex items-center gap-3 p-3 animate-fade-up">
        <a
          href={FINTUAL_AFFILIATE}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex-1 flex items-center justify-between gap-2"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight">¿Listo para invertir?</p>
            <p className="text-xs text-primary-foreground/75 leading-tight mt-0.5">
              Abre tu cuenta en Fintual gratis →
            </p>
          </div>
          <span className="shrink-0 px-3 py-2 rounded-lg gradient-accent text-accent-foreground text-xs font-semibold">
            Abrir
          </span>
        </a>
        <button
          onClick={dismiss}
          aria-label="Cerrar"
          className="shrink-0 p-1.5 rounded-lg text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-smooth"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
