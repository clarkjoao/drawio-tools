import React, { useEffect } from "react";
import { ChevronRight, ChevronDown, Layers, Folder, File, MoveDiagonal } from "lucide-react";
import { useBuilder } from "@/context/BuilderContext";
import { MxCell } from "@/MxGraph/MxCell";

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

  const getTypeTag = (cell: MxCell) => {
    if (cell.isLayer) return "Layer";
    if (cell.isGroup) return "Group";
    return "Node";
  };

  const getIcon = (cell: MxCell) => {
    if (cell.isLayer) return <Layers className="h-4 w-4" />;
    if (cell.isGroup) return <Folder className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getExtraLabels = (cell: MxCell) => {
    const extras: string[] = [];
    if (cell.vertex === "1") extras.push("(V)");
    if (cell.edge === "1") extras.push("(E)");
    if (cell.connectable === "0") extras.push("(NC)");
    return extras;
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
            {getIcon(cell)}
            {typeof cell.value === "string" && cell.value.trim() !== "" ? cell.value : "Unnamed"}
            <span className="text-xs text-white bg-gray-500 rounded px-1 ml-2">
              {getTypeTag(cell)}
            </span>
            {getExtraLabels(cell).map((label, idx) => (
              <span key={idx} className="text-xs text-gray-500 bg-gray-200 rounded px-1 ml-1">
                {label}
              </span>
            ))}
          </span>
        </div>

        {hasChildren && isExpanded && children.map((child) => renderElement(child, depth + 1))}
      </div>
    );
  };

  useEffect(() => {
    if (!builder) return;
    if (selectedCellIds.length === 0) return;

    const model = builder.getModel();
    const newExpanded = new Set<string>();

    selectedCellIds.forEach((selectedId) => {
      let current = model.findCellById(selectedId);
      while (current) {
        if (current.parent) {
          newExpanded.add(current.parent);
          current = model.findCellById(current.parent);
        } else {
          break;
        }
      }
    });

    setExpandedNodes((prev) => {
      const combined = new Set(prev);
      newExpanded.forEach((id) => combined.add(id));
      return combined;
    });
  }, [selectedCellIds, builder]);

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
