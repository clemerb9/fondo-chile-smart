import type { Fondo } from "@/data/funds";

const UTM = "utm_source=fondosmart&utm_medium=referral";

const SITES: Record<string, string> = {
  Fintual: "https://fintual.cl",
  BICE: "https://www.bice.cl/personas/inversiones/fondos-mutuos",
  Santander: "https://banco.santander.cl/personas/inversiones/fondos-mutuos",
  BancoEstado: "https://www.bancoestado.cl/personas/inversiones/fondos-mutuos",
  LarrainVial: "https://www.larrainvial.com/asset-management/fondos-mutuos",
  Banchile: "https://www.banchileinversiones.cl/wps/wcm/connect/portal/inversiones/home/productos/fondos-mutuos",
};

export const FINTUAL_AFFILIATE = "https://fintual.cl/r/clementer9b";

export function getFundCta(f: Fondo): { href: string; label: string; isAffiliate: boolean } {
  if (f.administradora === "Fintual") {
    return { href: FINTUAL_AFFILIATE, label: "Invertir", isAffiliate: true };
  }
  const base = SITES[f.administradora] ?? "https://www.cmfchile.cl";
  const sep = base.includes("?") ? "&" : "?";
  return { href: `${base}${sep}${UTM}`, label: "Ver más", isAffiliate: false };
}
