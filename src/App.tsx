import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Comparador from "./pages/Comparador";
import Simulador from "./pages/Simulador";
import Glosario from "./pages/Glosario";
import Descubre from "./pages/Descubre";
import Acciones from "./pages/Acciones";
import Comenzar from "./pages/Comenzar";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/comparador" element={<Comparador />} />
            <Route path="/simulador" element={<Simulador />} />
            <Route path="/descubre" element={<Descubre />} />
            <Route path="/acciones" element={<Acciones />} />
            <Route path="/comenzar" element={<Comenzar />} />
            <Route path="/glosario" element={<Glosario />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
