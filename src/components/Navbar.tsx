import { Link, NavLink, useLocation } from "react-router-dom";
import { TrendingUp, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/descubre", label: "Descúbrelo" },
  { to: "/comparador", label: "Comparador" },
  { to: "/acciones", label: "Analiza una acción" },
  { to: "/simulador", label: "Simulador" },
  { to: "/glosario", label: "Glosario" },
];

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

        <Link
          to="/comparador"
          className="hidden md:inline-flex items-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-smooth hover:bg-primary-glow shadow-soft"
        >
          Comenzar
        </Link>

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
          </nav>
        </div>
      )}
    </header>
  );
};
