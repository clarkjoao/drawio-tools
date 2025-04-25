import React from "react";
import { ChevronRight, ChevronDown, Layers, Folder, File } from "lucide-react";
import { useBuilder } from "@/context/BuilderContext";
import { MxCell } from "@/MxGraph/MxCell";
import { Button } from "@/components/ui/button";

export const ElementTree: React.FC = () => {
  const { builder, selectedCellIds, selectCellsInDrawio } = useBuilder();
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = React.useState(false);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelect = (cell: MxCell) => {
    if (!cell.id) return;
    selectCellsInDrawio([cell.id]);
  };

  const expandAll = () => {
    if (!builder) return;
    const allIds = builder
      .getModel()
      .root.map((cell) => cell.id!)
      .filter(Boolean);
    setExpandedNodes(new Set(allIds));
    setAllExpanded(true);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
    setAllExpanded(false);
  };

  const handleExpandCollapseClick = () => {
    if (allExpanded) {
      collapseAll();
    } else {
      expandAll();
    }
  };

  const renderElement = (cell: MxCell, depth = 0) => {
    if (!builder) return null;

    const id = cell.id || "";
    const isExpanded = expandedNodes.has(id);
    const isSelected = selectedCellIds.includes(id);

    const children = builder.getModel().root.filter((c) => c.parent === id);

    const hasChildren = (cell.isLayer || cell.isGroup) && children.length > 0;

    return (
      <div key={id} style={{ marginLeft: `${depth * 20}px` }}>
        <div
          className={`flex items-center py-1 px-2 cursor-pointer rounded hover:bg-gray-100 ${
            isSelected ? "bg-blue-100" : ""
          }`}
          onClick={() => handleSelect(cell)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(id);
              }}
              className="mr-1 p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}
          <span className="flex items-center gap-2 font-mono">
            {cell.isLayer ? (
              <Layers className="h-4 w-4" />
            ) : cell.isGroup ? (
              <Folder className="h-4 w-4" />
            ) : (
              <File className="h-4 w-4" />
            )}
            {typeof cell.value === "string" && cell.value.trim() !== "" ? cell.value : "Unnamed"}
            {id && <span className="text-gray-500 ml-2">#{id}</span>}
          </span>
        </div>

        {hasChildren && isExpanded && children.map((child) => renderElement(child, depth + 1))}
      </div>
    );
  };

  if (!builder) {
    return <div className="text-gray-500">No XML loaded.</div>;
  }

  const layers = builder.listLayers();

  if (layers.length === 0) {
    return <div className="text-gray-500">No layers found.</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end mb-2">
        <button
          onClick={handleExpandCollapseClick}
          className="text-sm px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-100 transition-colors"
        >
          {allExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>

      <div>{layers.map((layer) => renderElement(layer))}</div>
    </div>
  );
};
