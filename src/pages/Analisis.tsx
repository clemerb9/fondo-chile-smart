import { useState } from "react";
import { Sparkles, Search, Loader2, Copy, Check, AlertCircle } from "lucide-react";

export default function Analisis() {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;
    
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Eres StockTrace PRO, un analista bursátil experto.
      Analiza la acción ${ticker} en español simple para 
      chilenos sin experiencia financiera.
      Incluye: precio aproximado actual, tendencia reciente,
      si está cara o barata, veredicto (🟢/🟡/🔴), 
      y próximos eventos importantes.
      Máximo 400 palabras.
      Termina con: 'Esto no es asesoría financiera.'`
            }]
          }]
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || "Error al conectar con la IA");
      }

      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (textContent) {
        setResult(textContent);
      } else {
        throw new Error("No se pudo obtener el texto de la respuesta.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container py-12 md:py-16 max-w-3xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          StockTrace PRO
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4 text-balance">
          Análisis profundo con IA
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Ingresa el símbolo de una acción y nuestra IA buscará datos en vivo para darte un análisis completo en segundos.
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="mb-8">
        <div className="relative max-w-xl mx-auto flex items-center">
          <div className="absolute left-4 text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Ej: NVDA, AAPL, MSFT..."
            className="w-full h-14 pl-12 pr-32 sm:pr-40 rounded-2xl border-2 border-border bg-card text-lg text-primary placeholder:text-muted-foreground focus:outline-none focus:border-[#00D18B] transition-smooth shadow-sm uppercase font-semibold tracking-wider"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !ticker.trim()}
            className="absolute right-2 top-2 bottom-2 bg-[#00D18B] hover:bg-[#00B97A] text-white px-4 sm:px-5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> <span className="hidden sm:inline">IA...</span>
              </>
            ) : (
              "Analizar"
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="max-w-xl mx-auto p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 mb-8 animate-fade-in">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error al analizar la acción</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="max-w-2xl mx-auto p-12 text-center rounded-3xl bg-card border border-border shadow-soft animate-pulse flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-10 w-10 text-[#00D18B] animate-spin mb-4" />
          <h3 className="font-display font-semibold text-lg text-primary">Analizando con IA...</h3>
          <p className="text-sm text-muted-foreground mt-2">Buscando datos en tiempo real y evaluando catalizadores.</p>
        </div>
      )}

      {result && !loading && (
        <div className="rounded-3xl bg-card border-2 border-emerald-100 shadow-elegant overflow-hidden animate-fade-up">
          <div className="bg-gradient-to-r from-emerald-50 to-white px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <h3 className="font-display font-bold text-lg text-emerald-900">Análisis: {ticker}</h3>
            </div>
            <button
              onClick={copyToClipboard}
              className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
              title="Copiar análisis"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Compartir
                </>
              )}
            </button>
          </div>
          
          <div className="p-6 md:p-8 prose prose-emerald max-w-none prose-p:leading-relaxed prose-headings:font-display prose-headings:text-primary whitespace-pre-wrap">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
