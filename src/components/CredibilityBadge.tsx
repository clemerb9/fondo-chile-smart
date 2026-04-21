import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const CredibilityBadge = () => (
  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
    <span>Datos referenciales · Fuente: CMF Chile · Actualizado: Abril 2026</span>
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Más información sobre los datos"
            className="inline-flex items-center justify-center h-4 w-4 rounded-full text-muted-foreground/70 hover:text-primary transition-smooth"
          >
            <Info className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          Estos datos son referenciales basados en rentabilidades históricas. Verifica en cmfchile.cl
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <span aria-hidden="true">·</span>
    <a
      href="https://www.cmfchile.cl"
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-accent hover:underline"
    >
      Ver en CMF →
    </a>
  </div>
);
