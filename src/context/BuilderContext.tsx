import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { MxBuilder } from "@/MxGraph/MxBuilder";
import { MxEvents } from "@/MxGraph/MxEvents";
import { MxCell } from "@/MxGraph/MxCell";
import { calculateHash } from "@/utils/xml";
interface BuilderContextProps {
  builder: MxBuilder | null;
  selectedCells: MxCell[];
  selectedCellIds: string[];
  setBuilder: (builder: MxBuilder) => void;
  refreshBuilder: () => void;
  selectCellsInDrawio: (cellIds: string[]) => void;
}

const BuilderContext = createContext<BuilderContextProps | undefined>(undefined);

export const BuilderProvider = ({ children }: { children: React.ReactNode }) => {
  const [builder, setBuilderState] = useState<MxBuilder | null>(null);
  const [selectedCellIds, setSelectedCellIds] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<MxCell[]>([]);

  const lastXmlHash = useRef<string | null>(null);
  const sendTimeout = useRef<NodeJS.Timeout | null>(null);

  const setBuilder = useCallback((newBuilder: MxBuilder) => {
    setBuilderState(newBuilder);
  }, []);

  const refreshBuilder = useCallback(() => {
    if (builder) {
      scheduleSendToDrawio(builder);
    }
  }, [builder]);

  const scheduleSendToDrawio = (builderToSend: MxBuilder) => {
    if (sendTimeout.current) {
      clearTimeout(sendTimeout.current);
    }

    sendTimeout.current = setTimeout(async () => {
      const xmlString = builderToSend.toXml();
      const currentHash = await calculateHash(xmlString);

      if (lastXmlHash.current === currentHash) {
        console.log("XML unchanged (hash matched), not sending to Draw.io");
        return;
      }

      lastXmlHash.current = currentHash;

      window.postMessage({ type: MxEvents.REACT_XML_UPDATE, payload: xmlString }, "*");
      console.log("XML sent to Draw.io (hash updated)");
    }, 300);
  };

  const selectCellsInDrawio = useCallback((cellIds: string[]) => {
    if (!Array.isArray(cellIds)) return;
    updateSelectedCells(cellIds);
    window.postMessage({ type: MxEvents.REACT_SELECT_CELLS, payload: cellIds }, "*");
    console.log("Selection sent to Draw.io:", cellIds);
  }, []);

  const updateSelectedCells = useCallback(
    (ids: string[]) => {
      setSelectedCellIds(ids);

      if (builder) {
        const cells = ids
          .map((id) => builder.getModel().findCellById(id))
          .filter((cell): cell is MxCell => !!cell);

        setSelectedCells(cells);
        console.log("Selected cells updated in context:", cells);
      }
    },
    [builder]
  );

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (!event.data?.type) return;

      switch (event.data.type) {
        case MxEvents.DRAWIO_XML_UPDATE:
          try {
            const xmlString = event.data.payload;
            const incomingHash = await calculateHash(xmlString);

            if (!xmlString || lastXmlHash.current === incomingHash) {
              console.log("Received XML identical to current (hash matched), skipping update");
              return;
            }

            const newBuilder = MxBuilder.fromXml(xmlString);
            setBuilderState(newBuilder);
            lastXmlHash.current = incomingHash;

            console.log("New XML received from Draw.io and builder updated (hash updated)");
          } catch (err) {
            console.error("Error processing XML from Draw.io:", err);
          }
          break;

        case MxEvents.DRAWIO_SELECTION_CHANGED:
          console.log("Selection IDs received:", event.data.payload);
          updateSelectedCells(event.data.payload || []);
          break;

        default:
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [updateSelectedCells]);

  return (
    <BuilderContext.Provider
      value={{
        builder,
        selectedCells,
        selectedCellIds,
        setBuilder,
        refreshBuilder,
        selectCellsInDrawio
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
