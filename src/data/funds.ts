export type Riesgo = "Conservador" | "Moderado" | "Agresivo";

export interface Fondo {
  id: string;
  nombre: string;
  administradora: string;
  rent1: number;
  rent3: number;
  riesgo: Riesgo;
  comision: number;
}

// Datos referenciales basados en información pública de las administradoras.
// Última revisión manual:
export const ULTIMA_ACTUALIZACION = "2025-03-01";

export const fondos: Fondo[] = [
  { id: "1", nombre: "Fintual Conservador Streep", administradora: "Fintual", rent1: 5.8, rent3: 4.9, riesgo: "Conservador", comision: 0.49 },
  { id: "2", nombre: "Fintual Moderate Pit", administradora: "Fintual", rent1: 9.4, rent3: 7.6, riesgo: "Moderado", comision: 0.69 },
  { id: "3", nombre: "Fintual Risky Norris", administradora: "Fintual", rent1: 14.2, rent3: 11.3, riesgo: "Agresivo", comision: 0.89 },
  { id: "4", nombre: "BICE Renta Fija Local", administradora: "BICE", rent1: 4.7, rent3: 3.8, riesgo: "Conservador", comision: 0.95 },
  { id: "5", nombre: "Santander Acciones Globales", administradora: "Santander", rent1: 12.6, rent3: 9.8, riesgo: "Agresivo", comision: 1.45 },
  { id: "6", nombre: "BancoEstado Ahorro Plus", administradora: "BancoEstado", rent1: 5.2, rent3: 4.5, riesgo: "Conservador", comision: 0.75 },
  { id: "7", nombre: "LarrainVial Balanceado", administradora: "LarrainVial", rent1: 8.9, rent3: 7.2, riesgo: "Moderado", comision: 1.10 },
  { id: "8", nombre: "Banchile Acciones Chile", administradora: "Banchile", rent1: 11.7, rent3: 8.4, riesgo: "Agresivo", comision: 1.25 },
];

export const glosario = [
  { term: "Rentabilidad", def: "Es la ganancia o pérdida que obtienes con tu inversión, expresada en porcentaje. Si inviertes $100.000 y al año tienes $108.000, tu rentabilidad fue del 8%." },
  { term: "Volatilidad", def: "Mide cuánto sube y baja el valor de un fondo. A mayor volatilidad, mayor incertidumbre, pero también mayor potencial de ganancia." },
  { term: "Fondo Mutuo", def: "Es una bolsa común donde muchas personas juntan su dinero, y un experto lo invierte en acciones, bonos u otros instrumentos para hacerlo crecer." },
  { term: "Diversificación", def: "Significa no poner todos los huevos en la misma canasta. Repartir tu inversión en distintos activos reduce el riesgo total." },
  { term: "Riesgo", def: "La posibilidad de que tu inversión pierda valor. En Chile se clasifica como conservador (bajo), moderado (medio) o agresivo (alto)." },
  { term: "Comisión", def: "Lo que cobra la administradora por gestionar tu dinero. Se descuenta automáticamente y afecta tu rentabilidad final." },
  { term: "Portafolio", def: "El conjunto total de tus inversiones. Un buen portafolio combina distintos fondos según tus objetivos y tolerancia al riesgo." },
  { term: "Inflación", def: "El aumento general de los precios con el tiempo. Si tu inversión rinde menos que la inflación, en realidad estás perdiendo poder de compra." },
];
