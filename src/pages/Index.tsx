import { useState } from "react";
import { useBuilder } from "@/context/BuilderContext";
import { ElementTree } from "@/components/ElementTree";
import { PropertyPanel } from "@/components/PropertyPanel";
import XMLEditor from "@/components/XMLEditor";
import { MxBuilder } from "@/MxGraph/MxBuilder";
import { ScrollArea } from "@radix-ui/react-scroll-area";

export default function App() {
  const { builder, setBuilder } = useBuilder();
  const [originalXml, setOriginalXml] = useState<string>("");

  const handleExport = () => {
    return builder?.toXml() || "";
  };

  const handleParseXml = (xml: string) => {
    setOriginalXml(xml);
    setBuilder(MxBuilder.fromXml(xml));
  };

  const isPlugin = import.meta.env.AS_PLUGIN;

  if (isPlugin) {
    return (
      <div className="flex flex-col w-full h-full bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
          <h2 className="text-lg font-semibold text-gray-700">Nodes</h2>
        </div>

        <div className="flex flex-1 overflow-hidden max-h-[400px]">
          <div className="flex flex-col w-1/2 border-r border-gray-200">
            <div className="p-2">
              <ScrollArea className="max-h-[400px] overflow-auto border rounded">
                <ElementTree />
              </ScrollArea>
            </div>
          </div>

          <div className="flex flex-col w-1/2">
            <div className="p-2">
              <ScrollArea className="h-full">
                <PropertyPanel />
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-7xl mx-auto w-full p-4 flex flex-col gap-6">
        <h1 className="text-3xl font-semibold mb-6 text-gray-900">Draw.io XML Editor</h1>

        <div className="grid grid-cols-2 gap-6">
          {!isPlugin && (
            <div className="col-span-2 bg-white dark:bg-[#222] border border-gray-200/60 shadow-lg rounded-lg p-4">
              <XMLEditor onExport={handleExport} onParseXml={handleParseXml} />
            </div>
          )}

          <div className="flex flex-col bg-white dark:bg-[#222] border border-gray-200/60 shadow-lg rounded-lg p-4 h-[600px]">
            <ScrollArea className="flex-1 overflow-auto">
              <ElementTree />
            </ScrollArea>
          </div>

          <div className="flex flex-col bg-white dark:bg-[#222] border border-gray-200/60 shadow-lg rounded-lg p-4 h-[600px]">
            <ScrollArea className="flex-1 overflow-auto">
              <PropertyPanel />
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
