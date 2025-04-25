import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, File, Group } from "lucide-react";
import { MxBuilder, LayerInfo } from "@/MxGraph/MxBuilder";
import NodePropertiesPanel from "./NodePropertiesPanel";
import { useBuilder } from "../context/BuilderContext";

interface NodeBrowserProps {
  data: MxBuilder;
  onSelectNode?: (node: NodeInfo) => void;
}

const NodeBrowser = ({ data, onSelectNode }: NodeBrowserProps) => {
  const { createGroup } = useBuilder();
  const layers = useMemo(() => data.listLayers(), [data]);
  const [selectedLayer, setSelectedLayer] = useState<string>(layers[0]?.id || "");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  const listNodes = (): NodeInfo[] => {
    const nodes: NodeInfo[] = [];
    for (const child of data.model.root.children) {
      if (child instanceof MxCell && child.vertex) {
        nodes.push({ id: child.id || '', cell: child });
      } else if (child instanceof UserObject && child.cell?.vertex) {
        nodes.push({ id: child.id, cell: child.cell, wrapper: child });
      } else if (child instanceof ObjectNode && child.cell.vertex) {
        nodes.push({ id: child.id, cell: child.cell, wrapper: child });
      }
    }
    return nodes;
  };

  const allNodes = useMemo(listNodes, [data]);
  const nodesInLayer = useMemo(() => {
    return selectedLayer ? allNodes.filter(node => node.cell.parent === selectedLayer) : [];
  }, [selectedLayer, allNodes]);

  const selectedNode = useMemo(() => 
    selectedNodeId ? allNodes.find(n => n.id === selectedNodeId) || null : null
  , [selectedNodeId, allNodes]);

  const handleCreateGroup = () => {
    if (selectedNodes.length > 1) {
      const groupId = `group_${Date.now()}`;
      createGroup(groupId, selectedNodes, layers.find(l => l.id === selectedLayer));
      setSelectedNodes([]);
    }
  };

  return (
    <div className="flex w-full min-h-[420px] max-h-[500px] bg-gradient-to-br from-gray-100 via-gray-50 to-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
      {/* Layers Panel */}
      <div className="w-1/4 bg-gradient-to-tr from-gray-100 via-gray-50 to-white border-r border-gray-200 flex flex-col">
        <div className="text-xs font-bold text-gray-600 tracking-wide px-4 py-3 border-b border-gray-200 bg-white/70">
          LAYERS
        </div>
        <ScrollArea className="flex-1">
          <ul className="py-2">
            {layers.map((layer) => (
              <LayerItem 
                key={layer.id}
                layer={layer}
                isSelected={selectedLayer === layer.id}
                onClick={() => {
                  setSelectedLayer(layer.id);
                  setSelectedNodeId(null);
                  setSelectedNodes([]);
                }}
              />
            ))}
          </ul>
        </ScrollArea>
      </div>

      {/* Nodes Panel */}
      <div className="w-1/3 bg-gradient-to-b from-gray-50 via-white to-gray-100 flex flex-col border-r border-gray-200">
        <div className="text-xs font-bold text-gray-600 tracking-wide px-4 py-3 border-b border-gray-200 bg-white/70">
          NODES
          {selectedNodes.length > 1 && (
            <button 
              onClick={handleCreateGroup}
              className="ml-auto flex items-center text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
            >
              <Group className="h-3 w-3 mr-1" />
              Group ({selectedNodes.length})
            </button>
          )}
        </div>
        <ScrollArea className="flex-1">
          <ul className="py-2">
            {nodesInLayer.map((node) => (
              <NodeItem
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                isMultiSelected={selectedNodes.includes(node.id)}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  if (onSelectNode) onSelectNode(node);
                }}
                onMultiSelect={(checked) => {
                  setSelectedNodes(prev => 
                    checked 
                      ? [...prev, node.id] 
                      : prev.filter(id => id !== node.id)
                }}
              />
            ))}
          </ul>
        </ScrollArea>
      </div>

      {/* Properties Panel */}
      <div className="w-5/12 bg-gradient-to-t from-gray-50 via-white to-gray-100 flex flex-col">
        <div className="text-xs font-bold text-gray-600 tracking-wide px-4 py-3 border-b border-gray-200 bg-white/70">
          NODE PROPERTIES
        </div>
        <NodePropertiesPanel 
          selectedNode={selectedNode} 
          updateStyle={(key, value) => {
            if (selectedNodeId) {
              data.findCellById(selectedNodeId)?.updateStyle(key, value);
            }
          }}
        />
      </div>
    </div>
  );
};

const LayerItem = ({ layer, isSelected, onClick }: { 
  layer: LayerInfo; 
  isSelected: boolean; 
  onClick: () => void 
}) => (
  <li
    className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors mb-1 ${
      isSelected
        ? "bg-gray-200 ring-2 ring-gray-300 text-gray-800"
        : "hover:bg-gray-100 hover:text-gray-700 text-gray-600"
    }`}
    onClick={onClick}
  >
    <Folder className="h-4 w-4 mr-2 text-gray-500" strokeWidth={2.2} />
    <span className="truncate font-medium">
      {layer.label || layer.node.label || layer.node.id}
    </span>
  </li>
);

const NodeItem = ({ node, isSelected, isMultiSelected, onClick, onMultiSelect }: { 
  node: NodeInfo;
  isSelected: boolean;
  isMultiSelected: boolean;
  onClick: () => void;
  onMultiSelect: (checked: boolean) => void;
}) => (
  <li
    className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors mb-1 ${
      isSelected
        ? "bg-gray-200 ring-2 ring-gray-300 text-gray-900"
        : isMultiSelected
          ? "bg-blue-100 ring-2 ring-blue-200 text-blue-900"
          : "hover:bg-gray-100 text-gray-700"
    }`}
    onClick={(e) => {
      if (e.ctrlKey || e.metaKey) {
        onMultiSelect(!isMultiSelected);
      } else {
        onClick();
      }
    }}
  >
    <File className="h-4 w-4 mr-2 text-gray-500" strokeWidth={2.2} />
    <span className="truncate">
      {node.wrapper?.label || node.cell.value || `Node ${node.id}`}
    </span>
    {isMultiSelected && (
      <span className="ml-auto bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
        {isMultiSelected}
      </span>
    )}
  </li>
);

export default NodeBrowser;