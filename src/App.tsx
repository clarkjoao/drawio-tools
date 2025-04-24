import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { BuilderProvider } from "./context/BuilderContext";

const App = () => (
  <TooltipProvider>
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <BuilderProvider>
              <Index />
            </BuilderProvider>
          }
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<h1>not found</h1>} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
