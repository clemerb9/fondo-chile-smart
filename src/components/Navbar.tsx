import { Link, NavLink, useLocation } from "react-router-dom";
import { TrendingUp, Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/descubre", label: "Descúbrelo" },
  { to: "/comparador", label: "Comparador" },
  { to: "/acciones", label: "Analiza una acción" },
  { to: "/simulador", label: "Simulador" },
  { to: "/indicadores", label: "Indicadores" },
  { to: "/glosario", label: "Glosario" },
];

const MiniIndicators = () => {
  const [data, setData] = useState<{ dolar: number; uf: number } | null>(null);

  useEffect(() => {
    fetch("https://mindicador.cl/api")
      .then((res) => res.json())
      .then((json) => {
        setData({
          dolar: json.dolar.valor,
          uf: json.uf.valor,
        });
      })
      .catch((err) => console.error("Error fetching indicators:", err));
  }, []);

  if (!data) return (
    <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-muted-foreground/50 mr-4 border-r border-border/60 pr-4 animate-pulse">
      <div className="h-4 w-12 bg-muted rounded"></div>
      <div className="h-4 w-16 bg-muted rounded"></div>
    </div>
  );

  return (
    <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-muted-foreground mr-4 border-r border-border/60 pr-4">
      <div className="flex items-center gap-1.5" title="Dólar observado">
        <span className="text-primary font-bold">US$</span>
        <span>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(data.dolar)}</span>
      </div>
      <div className="flex items-center gap-1.5" title="Unidad de Fomento">
        <span className="text-primary font-bold">UF</span>
        <span>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(data.uf)}</span>
      </div>
    </div>
  );
};

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-primary">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-accent shadow-glow">
            <TrendingUp className="h-5 w-5 text-accent-foreground" strokeWidth={2.5} />
          </div>
          FondoSmart
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-smooth",
                  isActive
                    ? "text-primary bg-accent/10"
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center">
          <MiniIndicators />
          <Link
            to="/comenzar"
            className="hidden md:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-smooth hover:bg-primary-glow shadow-soft"
          >
            Comenzar <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-primary"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background animate-fade-in">
          <nav className="container flex flex-col py-3 gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-3 text-base font-medium rounded-lg transition-smooth",
                    isActive ? "text-primary bg-accent/10" : "text-muted-foreground"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            
            {/* Mobile Indicators Widget */}
            <div className="mt-4 pt-4 border-t border-border/60">
              <div className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Indicadores de hoy
              </div>
              <MobileIndicators />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

const MobileIndicators = () => {
  const [data, setData] = useState<{ dolar: number; uf: number } | null>(null);

  useEffect(() => {
    fetch("https://mindicador.cl/api")
      .then((res) => res.json())
      .then((json) => {
        setData({
          dolar: json.dolar.valor,
          uf: json.uf.valor,
        });
      })
      .catch((err) => console.error("Error fetching indicators:", err));
  }, []);

  if (!data) return (
    <div className="flex items-center gap-6 px-4 animate-pulse opacity-50">
      <div className="flex flex-col gap-1">
        <div className="h-3 w-8 bg-muted rounded"></div>
        <div className="h-4 w-16 bg-muted rounded"></div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="h-3 w-6 bg-muted rounded"></div>
        <div className="h-4 w-20 bg-muted rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-6 px-4">
      <div className="flex flex-col">
        <span className="text-xs font-bold text-primary">Dólar (US$)</span>
        <span className="text-sm font-medium text-foreground">
          {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(data.dolar)}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-primary">UF</span>
        <span className="text-sm font-medium text-foreground">
          {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(data.uf)}
        </span>
      </div>
    </div>
  );
};
