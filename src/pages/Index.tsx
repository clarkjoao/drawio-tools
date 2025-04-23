import { useState } from "react";
import { MxBuilder } from "../MxGraph/MxBuilder";
import XMLEditor from "@/components/XMLEditor";
import NodeBrowser from "@/components/NodeBrowser";

export default function App() {
  const [builder, setBuilder] = useState<MxBuilder | null>(null);

  const handleParseXml = (xmlString: string) => {
    try {
      const newBuilder = MxBuilder.fromXml(xmlString);
      console.log("Parsed XML:", newBuilder);
      setBuilder(newBuilder);
    } catch (e) {
      console.error("Erro ao fazer parse do XML", e);
    }
  };

  const handleExport = () => {
    if (!builder) {
      console.error("No builder available to export");
      return "";
    }

    return builder.toXmlString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-gray-50 from-80% via-white via-100% to-gray-200/80">
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-3xl font-semibold mb-4 px-2 pt-8 text-gray-900">
            Draw.io XML Editor
          </h1>

          <div className="flex flex-row gap-6 my-4 w-full">
            <div className="flex flex-col gap-6 my-4 w-full">
              <div className="bg-white dark:bg-[#222] border border-gray-200/60 shadow-lg rounded-lg min-h-[420px] flex flex-col">
                <XMLEditor onParseXml={handleParseXml} onExport={handleExport} />
              </div>

              <div
                className={`col-span-1 bg-white dark:bg-[#222] border border-gray-200/60 shadow-lg rounded-lg min-h-[420px] flex flex-col`}
              >
                <div className="border-b border-gray-100 py-3 px-4 bg-gray-50/80 rounded-t-lg">
                  <h2 className="text-lg font-bold text-gray-800 tracking-tight">Node Browser</h2>
                </div>
                <div className="flex-1 px-2 pt-3">
                  {builder ? (
                    <NodeBrowser
                      data={builder}
                      onSelectNode={(node) => {
                        console.log("Selected node:", node);
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 font-semibold mt-24 text-xl">
                      No diagram loaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
