import NodeBrowser from "@/components/NodeBrowser";
import { Button } from "@/components/ui/button";
import { MxCell } from "@/MxGraph/MxCell";
import { ObjectNode } from "@/MxGraph/ObjectNode";
import { MxGeometry } from "@/MxGraph/MxGeometry";
import { generateDrawioId } from "@/utils/drawio";
import { UserObject } from "@/MxGraph/UserObject";
import { useBuilder } from "@/context/BuilderContext";
import XMLEditor from "@/components/XMLEditor";
import { MxStyle } from "@/MxGraph/MxStyle";
import { MxBuilder } from "@/MxGraph/MxBuilder";
import { useEffect, useState } from "react";

export default function App() {
  const [origianlXml, setOriginalXml] = useState<string>("");
  const [parsedXml, setParsedXml] = useState<string>("");

  useEffect(() => {
    console.log("Updated", origianlXml);
    if (origianlXml !== "") {
      setParsedXml(MxBuilder.fromXml(origianlXml).toXmlString());
    }
  }, [origianlXml]);

  return (
    <div className="min-h-screen bg-gray-50 overflow-auto">
      <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-gray-50 from-80% via-white via-100% to-gray-200/80">
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-3xl font-semibold mb-4 px-2 pt-8 text-gray-900">
            Draw.io XML Editor
          </h1>

          <div className="flex flex-row gap-6 my-4 w-full">
            <div className="flex flex-col gap-6 my-4 w-full">
              {!import.meta.env.AS_PLUGIN && (
                <div className="bg-white dark:bg-[#222] border border-gray-200/60 shadow-lg rounded-lg min-h-[420px] flex flex-col">
                  <XMLEditor onExport={() => ""} onParseXml={setOriginalXml} />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-row gap-6 my-4 w-full">
            <div className="flex flex-col gap-6 my-4 w-full">
              {!import.meta.env.AS_PLUGIN && (
                <div className="bg-white dark:bg-[#222] border border-gray-200/60 shadow-lg rounded-lg min-h-[420px] flex flex-col">
                  <XMLEditor onExport={() => ""} onParseXml={() => ""} data={parsedXml} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
