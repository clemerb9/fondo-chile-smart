// Lightweight GA4 event helper
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type GAEvent =
  | "fintual_cta_clicked"
  | "simulator_used"
  | "comparador_filtered";

export function trackEvent(event: GAEvent, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, params ?? {});
  } catch {
    // no-op
  }
}
