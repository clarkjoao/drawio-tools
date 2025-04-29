import React, { useState } from "react";
import { ChevronRight, ChevronDown, Layers, Folder, File } from "lucide-react";
import { useBuilder } from "@/context/BuilderContext";
import { MxCell } from "@/MxGraph/MxCell";

const NodeTree: React.FC = () => {
  const { builder, selectedCellIds, selectCellsInDrawio } = useBuilder();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  if (!builder) {
    return <div className="text-gray-500 text-sm">Loading builder...</div>;
  }

  const rootLayerId = builder.getModel().rootLayer?.id;

  const treeRoots = builder.getModel().root.filter((cell) => cell.parent === rootLayerId);

  const nodesByParent: Record<string, MxCell[]> = {};
  builder.getModel().root.forEach((cell) => {
    if (!cell.id) return;
    const parentId = cell.parent || rootLayerId || "0";
    if (!nodesByParent[parentId]) nodesByParent[parentId] = [];
    nodesByParent[parentId].push(cell);
  });

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) newSet.delete(nodeId);
      else newSet.add(nodeId);
      return newSet;
    });
  };

  const handleSelectNode = (node: MxCell) => {
    if (!node.id) return;
    selectCellsInDrawio([node.id]);

    if (node.parent) {
      window.postMessage(
        {
          type: "DRAWIO_LAYER_CHANGED",
          payload: node.parent
        },
        "*"
      );
    }
  };

  const onDragStart = (event: React.DragEvent, nodeId: string) => {
    event.dataTransfer.setData("application/node-id", nodeId);
  };

  const onDrop = (event: React.DragEvent, targetId: string) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("application/node-id");
    if (!sourceId || !builder || sourceId === targetId) return;

    // Is Happing some error
    alert("not working yet");
    // mutateBuilder((builder) => {
    //   builder.moveNode(sourceId, targetId);
    // });

    // syncBuilder();
    // if (builder.moveNode(sourceId, targetId)) {
    //   refreshBuilder();
    // }
  };

  const allowDrop = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const getIcon = (cell: MxCell) => {
    if (cell.isLayer(rootLayerId)) return <Layers className="h-4 w-4" />;
    if (cell.isGroup) return <Folder className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getTypeTag = (cell: MxCell) => {
    if (cell.isLayer(rootLayerId)) return "Layer";
    if (cell.isGroup) return "Group";
    return "Node";
  };

  const getCellDisplayName = (cell: MxCell) => {
    if (typeof cell.value === "string" && cell.value.trim() !== "") return cell.value;
    if (cell.style?.shape) return cell.style.shape;
    if (cell.isGroup) return "Group";
    if (cell.isLayer(rootLayerId)) return "Layer";
    return "Unnamed";
  };

  const getExtraLabels = (cell: MxCell) => {
    const extras: string[] = [];
    if (cell.isVertex) extras.push("(V)");
    if (cell.isEdge) extras.push("(E)");
    if (cell.connectable === "0") extras.push("(NC)");
    return extras;
  };

  const renderNode = (node: MxCell, level: number = 0): React.ReactNode => {
    if (!node.id || !builder) return null;
    const id = node.id;
    const isExpanded = expandedNodes.has(id);
    const isSelected = selectedCellIds.includes(id);
    const isHiddenOrLocked = node.style?.isLocked || node.style?.isHidden;
    const label = getCellDisplayName(node);

    const children = nodesByParent[node.id] || [];
    const hasChildren = children.length > 0;

    return (
      <div
        key={node.id}
        className="mb-1"
        onDragOver={allowDrop}
        onDrop={(e) => onDrop(e, node.id!)}
      >
        <div
          className={`flex items-center py-1 px-1 rounded text-sm ${
            isSelected
              ? "bg-blue-100 text-blue-800"
              : isHiddenOrLocked
                ? "bg-gray-100 text-red-800"
                : "hover:bg-gray-100"
          }`}
          draggable
          onDragStart={(e) => onDragStart(e, node.id!)}
        >
          <div
            className="w-5 flex items-center justify-center cursor-pointer"
            onClick={() => hasChildren && toggleNode(id)}
          >
            {hasChildren && (
              <button className="focus:outline-none">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            )}
          </div>

          <div
            className="ml-1 cursor-pointer flex-grow truncate"
            style={{ paddingLeft: `${level * 8}px` }}
            onClick={() => !isHiddenOrLocked && handleSelectNode(node)}
            title={label}
          >
            <div className="flex items-center gap-2">
              {getIcon(node)}
              <span className="text-xs text-gray-600 bg-gray-200 rounded px-1">
                {getTypeTag(node)}
              </span>
              {getExtraLabels(node).map((label, idx) => (
                <span key={idx} className="text-xs text-gray-500 bg-gray-200 rounded px-1 ml-1">
                  {label}
                </span>
              ))}
            </div>
            <div className="text-sm font-medium text-gray-800">{label}</div>
          </div>
        </div>

        {hasChildren && isExpanded && !isHiddenOrLocked && (
          <div className="ml-4">{children.map((child) => renderNode(child, level + 1))}</div>
        )}
      </div>
    );
  };

  return <div className="text-gray-800">{treeRoots.map((layer) => renderNode(layer))}</div>;
};

export default NodeTree;
