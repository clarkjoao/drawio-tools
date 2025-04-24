import { createContext, useContext, useState, useCallback } from "react";
import { MxBuilder } from "@/MxGraph/MxBuilder";

interface BuilderContextProps {
  builder: MxBuilder | null;
  setBuilder: (builder: MxBuilder) => void;
  refreshBuilder: () => void;
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
    }
  }, [builder]);

  return (
    <BuilderContext.Provider value={{ builder, setBuilder, refreshBuilder }}>
      {children}
    </BuilderContext.Provider>
  );
};

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) throw new Error("useBuilder must be used within BuilderProvider");
  return context;
};
