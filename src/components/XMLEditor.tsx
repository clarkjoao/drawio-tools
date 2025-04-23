import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { MxBuilder } from "@/MxGraph/MxBuilder";

export interface IXMLEditor {
  onParseXml: (builder: MxBuilder) => void;
  builder: MxBuilder;
}

export default function XMLEditor({ onParseXml, onExportXml }: IXMLEditor) {
  const monacoEditorRef = useRef<any>(null);
  const [xmlInput, setXmlInput] = useState<string>("");

  const parseXml = () => {
    try {
      if (!xmlInput.trim()) {
        return;
      }
      onParseXml(MxBuilder.fromXml(xmlInput));
    } catch (error) {
      console.error("Error parsing XML:", error);
    }
  };

  const exportXml = () => {
    try {
      if (!onExportXml) {
        return;
      }
      const xml = builder.toXmlString();
      setXmlInput(xml);
    } catch (error) {
      console.error("Error exporting XML:", error);
    }
  };

  useEffect(() => {
    if (builder) onParse(builder);
  }, [builder]);

  return (
    <>
      <div className="border-b border-gray-100 py-3 px-4 bg-gray-50/80 rounded-t-lg">
        <h2 className="text-lg font-bold text-gray-800 tracking-tight">Code Editor</h2>
      </div>
      <div className="flex-1 px-4 pt-3 pb-0">
        <Editor
          height="215px"
          defaultLanguage="xml"
          value={"xmlInput"}
          onChange={(value) => setXmlInput(value || "")}
          onMount={(editor) => {
            monacoEditorRef.current = editor;
          }}
          options={{
            minimap: { enabled: false },
            wordWrap: "on",
            fontSize: 14,
            theme: "vs-light"
          }}
        />
      </div>
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
        <Button variant="outline" className="w-full" onClick={parseXml}>
          Parse XML
        </Button>
        <Button variant="secondary" className="w-full" onClick={exportXml} disabled={false}>
          Export XML
        </Button>
      </div>
    </>
  );
}
