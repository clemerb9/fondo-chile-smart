import { TrendingUp } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border/60 bg-muted/30 mt-20">
    <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-accent">
          <TrendingUp className="h-4 w-4 text-accent-foreground" strokeWidth={2.5} />
        </div>
        <span className="font-display font-semibold text-primary">FondoSmart</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
      <p className="text-xs text-muted-foreground text-center md:text-right max-w-md">
        Datos referenciales con fines educativos. Las rentabilidades pasadas no garantizan resultados futuros.
      </p>
    </div>
  </footer>
);
