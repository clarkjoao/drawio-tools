import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, File } from "lucide-react";
import { MxBuilder, NodeInfo } from "@/MxGraph/MxBuilder";
import NodePropertiesPanel from "./NodePropertiesPanel";

interface NodeBrowserProps {
  data: MxBuilder;
  onSelectNode?: (node: NodeInfo) => void;
}

const NodeBrowser = ({ data, onSelectNode }: NodeBrowserProps) => {
  const layers = useMemo(() => data.listLayers(), [data]);
  const [selectedLayer, setSelectedLayer] = useState<string>(layers[0]?.id || "");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const allNodes = useMemo(() => data.listNodes(), [data]);

  const nodesInLayer = useMemo(() => {
    if (!selectedLayer) return [];

    return allNodes.filter((node) => node.cell.parent === selectedLayer);
  }, [selectedLayer, allNodes]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return allNodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, allNodes]);

  return (
    <div className="flex w-full min-h-[420px] max-h-[500px] bg-gradient-to-br from-gray-100 via-gray-50 to-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <div className="w-1/4 bg-gradient-to-tr from-gray-100 via-gray-50 to-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="text-xs font-bold text-gray-600 tracking-wide px-4 py-3 border-b border-gray-200 bg-white/70">
            LAYERS
          </div>
          <ScrollArea className="flex-1">
            <ul className="py-2">
              {layers.map((layer) => (
                <li
                  key={layer.id}
                  className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors mb-1
                    ${
                      selectedLayer === layer.id
                        ? "bg-gray-200 ring-2 ring-gray-300 text-gray-800"
                        : "hover:bg-gray-100 hover:text-gray-700 text-gray-600"
                    }
                  `}
                  onClick={() => {
                    setSelectedLayer(layer.id);
                    setSelectedNodeId(null);
                  }}
                >
                  <span>
                    <Folder className="h-4 w-4 mr-2 text-gray-500" strokeWidth={2.2} />
                  </span>
                  <span className="truncate font-medium">{layer.label}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      </div>

      <div className="w-1/3 bg-gradient-to-b from-gray-50 via-white to-gray-100 flex flex-col border-r border-l border-gray-200">
        <div>
          <div className="text-xs font-bold text-gray-600 tracking-wide px-4 py-3 border-b border-gray-200 bg-white/70">
            NODES
          </div>
          <ScrollArea className="flex-1">
            <ul className="py-2">
              {nodesInLayer.map((node) => (
                <li
                  key={node.id}
                  className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors mb-1
                    ${
                      selectedNodeId === node.id
                        ? "bg-gray-200 ring-2 ring-gray-300 text-gray-900 animate-pulse"
                        : "hover:bg-gray-100 text-gray-700"
                    }
                  `}
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    if (onSelectNode) onSelectNode(node);
                  }}
                >
                  <File className="h-4 w-4 mr-2 text-gray-500" strokeWidth={2.2} />
                  <span className="truncate">
                    {node.wrapper?.label || node.cell.value || `Node ${node.id}`}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      </div>

      <div className="w-5/12 bg-gradient-to-t from-gray-50 via-white to-gray-100 flex flex-col">
        <div>
          <div className="text-xs font-bold text-gray-600 tracking-wide px-4 py-3 border-b border-gray-200 bg-white/70">
            NODE PROPERTIES
          </div>
          <NodePropertiesPanel selectedNode={selectedNode} builder={data} />
        </div>
      </div>
    </div>
  );
};

export default NodeBrowser;
