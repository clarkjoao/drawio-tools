import { useBuilder } from "@/context/BuilderContext";
import React from "react";

const NodeProperties: React.FC = () => {
  const { builder, selectedCells } = useBuilder();
  const node = builder?.getModel().findCellById(selectedCells[0]?.id || "");

  if (!node) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 italic">
        No node selected
      </div>
    );
  }

  const wrapperProperties = node.wrapper
    ? Object.entries(node.wrapper).filter(([_, v]) => typeof v === "string" && v !== "")
    : [];

  return (
    <div className="p-2 space-y-4">
      <div>
        <div className="text-sm font-medium text-gray-700">ID</div>
        <div className="text-sm text-gray-900 mt-1 break-words">{node.id}</div>
      </div>

      {node.value !== undefined && (
        <div>
          <div className="text-sm font-medium text-gray-700">Value</div>
          <div className="text-sm text-gray-900 mt-1 break-words">{node.value}</div>
        </div>
      )}

      {node.style && (
        <div>
          <div className="text-sm font-medium text-gray-700">Style</div>
          <div className="text-sm text-gray-900 mt-1 break-words">{node.style.toString()}</div>
        </div>
      )}

      {node.vertex && (
        <div>
          <div className="text-sm font-medium text-gray-700">Vertex</div>
          <div className="text-sm text-gray-900 mt-1">{node.vertex}</div>
        </div>
      )}

      {node.edge && (
        <div>
          <div className="text-sm font-medium text-gray-700">Edge</div>
          <div className="text-sm text-gray-900 mt-1">{node.edge}</div>
        </div>
      )}

      {node.parent && (
        <div>
          <div className="text-sm font-medium text-gray-700">Parent</div>
          <div className="text-sm text-gray-900 mt-1 break-words">{node.parent}</div>
        </div>
      )}

      {wrapperProperties.length > 0 && (
        <>
          <div className="text-sm font-bold text-gray-700 mt-6">Wrapper Properties</div>
          {wrapperProperties.map(([key, value]) => (
            <div key={key}>
              <div className="text-sm font-medium text-gray-700">{key}</div>
              <div className="text-sm text-gray-900 mt-1 break-words">{value}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default NodeProperties;
