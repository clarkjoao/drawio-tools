import { useBuilder } from "@/context/BuilderContext";
import React from "react";
import ActionBuilderPanel from "./ActionBuilderPanel";

const NodeActions: React.FC = () => {
  const { builder, selectedCells } = useBuilder();
  const node = builder?.getModel().findCellById(selectedCells[0]?.id || "");

  if (!node || selectedCells.length > 1) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 italic">
        No node selected
      </div>
    );
  }

  return (
    <div className="p-2 space-y-4">
      <ActionBuilderPanel />
    </div>
  );
};

export default NodeActions;
