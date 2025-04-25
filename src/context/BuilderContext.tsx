import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { MxBuilder } from "@/MxGraph/MxBuilder";
import { LayerInfo } from "@/MxGraph/MxBuilder";

interface BuilderContextProps {
  builder: MxBuilder | null;
  setBuilder: (builder: MxBuilder) => void;
  refreshBuilder: () => void;
  sendToDrawio: () => void;
  createGroup: (id: string, childrenIds: string[], layer?: LayerInfo) => void;
  updateCellStyle: (
    cellId: string,
    styleKey: string,
    styleValue: string | number | boolean
  ) => void;
}

const BuilderContext = createContext<BuilderContextProps | undefined>(undefined);

export const BuilderProvider = ({ children }: { children: React.ReactNode }) => {
  const [builder, setBuilderState] = useState<MxBuilder | null>(null);

  const setBuilder = useCallback((newBuilder: MxBuilder) => {
    setBuilderState(newBuilder);
  }, []);

  const refreshBuilder = useCallback(() => {
    if (builder) {
      const cloned = MxBuilder.fromXml(builder.toXmlString());
      setBuilderState(cloned);
      sendXmlToDrawio(cloned.toXmlString());
    }
  }, [builder]);

  const sendToDrawio = useCallback(() => {
    if (builder) {
      sendXmlToDrawio(builder.toXmlString());
    }
  }, [builder]);

  const createGroup = useCallback(
    (id: string, childrenIds: string[], layer?: LayerInfo) => {
      if (builder) {
        builder.createGroup(id, childrenIds, layer);
        refreshBuilder();
      }
    },
    [builder, refreshBuilder]
  );

  const updateCellStyle = useCallback(
    (cellId: string, styleKey: string, styleValue: string | number | boolean) => {
      if (builder) {
        const cell = builder.findCellById(cellId);
        if (cell) {
          cell.updateStyle(styleKey, styleValue);
          refreshBuilder();
        }
      }
    },
    [builder, refreshBuilder]
  );

  const sendXmlToDrawio = (xmlString: string) => {
    window.postMessage({ type: "react-xml-update", payload: xmlString }, "*");
    console.log("📤 XML enviado para draw.io", xmlString);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "drawio-xml-update") {
        try {
          const xmlString = event.data.payload;
          const newBuilder = MxBuilder.fromXml(xmlString);
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
    <BuilderContext.Provider
      value={{
        builder,
        setBuilder,
        refreshBuilder,
        sendToDrawio,
        createGroup,
        updateCellStyle
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) throw new Error("useBuilder must be used within BuilderProvider");
  return context;
};
