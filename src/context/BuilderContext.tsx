import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { MxBuilder } from "@/MxGraph/MxBuilder";

interface BuilderContextProps {
  builder: MxBuilder | null;
  setBuilder: (builder: MxBuilder) => void;
  refreshBuilder: () => void;
  sendToDrawio: () => void;
}

const BuilderContext = createContext<BuilderContextProps | undefined>(undefined);

export const BuilderProvider = ({ children }: { children: React.ReactNode }) => {
  const [builder, setBuilderState] = useState<MxBuilder | null>(null);

  const setBuilder = useCallback((newBuilder: MxBuilder) => {
    setBuilderState(newBuilder);
  }, []);

  const refreshBuilder = useCallback(() => {
    console.log("Refreshing builder", !!builder);
    if (builder) {
      const cloned = MxBuilder.fromXml(builder.toXmlString());
      setBuilderState(cloned);
      const xmlString = cloned.toXmlString();
      window.postMessage({ type: "react-xml-update", payload: xmlString }, "*");
      console.log("📤 XML enviado para draw.io", xmlString);
    }
  }, [builder]);

  const sendToDrawio = useCallback(() => {
    if (builder) {
      const xmlString = builder.toXmlString();
      window.postMessage({ type: "react-xml-update", payload: xmlString }, "*");
      console.log("📤 XML enviado para draw.io", xmlString);
    }
  }, [builder]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "drawio-xml-update") {
        try {
          const xmlString = event.data.payload;
          const newBuilder = MxBuilder.fromXml(xmlString);

          // Força criação de nova instância
          const cloned = MxBuilder.fromXml(newBuilder.toXmlString());
          setBuilderState(cloned);

          console.log("📥 XML recebido e builder atualizado do draw.io");
        } catch (err) {
          console.error("❌ Erro ao processar XML do draw.io:", err);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <BuilderContext.Provider value={{ builder, setBuilder, refreshBuilder, sendToDrawio }}>
      {children}
    </BuilderContext.Provider>
  );
};

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) throw new Error("useBuilder must be used within BuilderProvider");
  return context;
};
