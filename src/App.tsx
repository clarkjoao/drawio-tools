import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import { BuilderProvider } from "./context/BuilderContext";
import "./index.css";

const App = () => (
  <TooltipProvider>
    <Sonner />
    <BuilderProvider>
      <Index />
    </BuilderProvider>
  </TooltipProvider>
);

export default App;
