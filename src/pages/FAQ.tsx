import { Link } from "react-router-dom";
import { ArrowRight, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Qué es un fondo mutuo?",
    answer: "Es una inversión colectiva donde muchas personas juntan su dinero para invertirlo en distintos activos (acciones, bonos, etc.). Una administradora profesional lo gestiona por ti. Es ideal para principiantes porque no necesitas saber invertir."
  },
  {
    question: "¿Es seguro invertir en fondos mutuos en Chile?",
    answer: "Los fondos mutuos en Chile están regulados por la CMF (Comisión para el Mercado Financiero). Tu dinero está separado del patrimonio de la administradora, lo que significa que si la empresa quiebra, tu plata está protegida."
  },
  {
    question: "¿Cuánto dinero necesito para empezar?",
    answer: "Depende del fondo. Fintual permite partir desde $1 peso. Otros fondos tienen montos mínimos de $5.000 a $50.000 CLP. No necesitas mucho para empezar."
  },
  {
    question: "¿Puedo perder toda mi plata?",
    answer: "En fondos mutuos diversificados es muy difícil perder todo. Sí puedes ver caídas temporales, especialmente en fondos agresivos. Por eso es importante elegir un fondo acorde a tu perfil de riesgo."
  },
  {
    question: "¿Cuándo puedo retirar mi dinero?",
    answer: "La mayoría de los fondos mutuos en Chile permiten rescatar tu dinero en 1 a 3 días hábiles. No estás obligado a dejarlo por un plazo fijo."
  },
  {
    question: "¿Qué es la UF?",
    answer: "La Unidad de Fomento es una unidad de cuenta chilena que se reajusta diariamente según la inflación. Muchos fondos y productos financieros se expresan en UF para mantener su valor real."
  },
  {
    question: "¿Qué diferencia hay entre un fondo conservador, moderado y agresivo?",
    answer: "Conservador invierte en renta fija (bonos, depósitos), tiene menos riesgo pero también menos rentabilidad. Moderado mezcla renta fija y variable. Agresivo invierte principalmente en acciones, tiene más riesgo pero mayor potencial de ganancia a largo plazo."
  },
  {
    question: "¿Tengo que pagar impuestos por mis inversiones?",
    answer: "En Chile, las ganancias de fondos mutuos tributan como impuesto a la renta. Si eres persona natural, pagas impuesto solo cuando rescatas y tienes ganancias. Te recomendamos consultar con un contador para tu situación específica."
  },
  {
    question: "¿Qué es el P/E ratio?",
    answer: "Es la relación entre el precio de una acción y sus ganancias por acción. Un P/E bajo puede indicar que la acción está barata, uno alto que está cara. Se usa para comparar empresas del mismo sector."
  },
  {
    question: "¿Cómo puedo invertir en acciones desde Chile?",
    answer: "Puedes hacerlo a través de corredoras como Fintual, BTG Pactual, o brokers internacionales. Algunas permiten comprar fracciones de acciones desde montos pequeños."
  }
];

export default function FAQ() {
  return (
    <div className="container py-12 animate-fade-in min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto w-full">
        <div className="mb-10 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 mb-6 text-primary">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-muted-foreground text-lg">
            Todo lo que necesitas saber sobre invertir en Chile.
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-4 md:p-8 shadow-soft">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-16 text-center bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 border border-primary/10 shadow-soft relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl md:text-2xl font-bold text-primary mb-4">
              ¿Listo para empezar?
            </h3>
            <Link
              to="/comenzar"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold transition-smooth hover:bg-primary-glow shadow-glow"
            >
              Descubre tu perfil inversor <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
