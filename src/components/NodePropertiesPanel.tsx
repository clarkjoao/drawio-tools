import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ObjectNode } from "@/MxGraph/ObjectNode";
import { UserObject } from "@/MxGraph/UserObject";
import { NodeInfo } from "@/MxGraph/MxBuilder";
import { NodeManager } from "@/MxGraph/NodeManager";
import { useBuilder } from "@/context/BuilderContext";

interface NodePropertiesPanelProps {
  selectedNode: NodeInfo | null;
  onUpdate?: (updated: NodeInfo) => void;
}

const NodePropertiesPanel = ({ selectedNode, onUpdate }: NodePropertiesPanelProps) => {
  const { builder, refreshBuilder } = useBuilder();
  const [editedLabel, setEditedLabel] = useState("");
  const [editedLink, setEditedLink] = useState("");
  const [editedId, setEditedId] = useState("");
  const [editedParent, setEditedParent] = useState("");

  const manager = builder ? NodeManager(builder) : null;
  if (!manager) return null;

  useEffect(() => {
    if (selectedNode) {
      setEditedId(selectedNode.cell.id || "");
      setEditedParent(selectedNode.cell.parent || "");

      if (
        selectedNode.wrapper instanceof ObjectNode ||
        selectedNode.wrapper instanceof UserObject
      ) {
        setEditedLabel(selectedNode.wrapper.label || "");
        if (selectedNode.wrapper instanceof UserObject) {
          setEditedLink(selectedNode.wrapper.getLink() || "");
        }
      }
    }
  }, [selectedNode]);

  const handleSave = () => {
    if (!selectedNode || !builder) return;

    const currentId = selectedNode.cell.id;
    if (!currentId) return;
    if (editedId && editedId !== currentId) {
      manager.updateNodeId(currentId, editedId);
    }

    if (editedParent && editedParent !== selectedNode.cell.parent) {
      manager.moveNodeToLayer(editedId || currentId, editedParent);
    }

    if (selectedNode.wrapper instanceof ObjectNode || selectedNode.wrapper instanceof UserObject) {
      selectedNode.wrapper.label = editedLabel;
    }

    if (selectedNode.wrapper instanceof UserObject) {
      selectedNode.wrapper.setLink(editedLink);
    }

    const updated = builder.getNode(editedId || currentId);
    if (updated && onUpdate) onUpdate(updated);

    refreshBuilder();
  };

  const renderDetails = () => {
    if (!selectedNode || !builder) return null;

    const { cell, wrapper } = selectedNode;

    const allLayers = builder.listLayers();

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">ID</label>
          <Input value={editedId} onChange={(e) => setEditedId(e.target.value)} />
        </div>

        {(wrapper instanceof ObjectNode || wrapper instanceof UserObject) && (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Label</label>
            <Input value={editedLabel} onChange={(e) => setEditedLabel(e.target.value)} />
          </div>
        )}

        {wrapper instanceof UserObject && (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Link</label>
            <Input value={editedLink} onChange={(e) => setEditedLink(e.target.value)} />
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Parent Layer</label>
          <select
            className="block w-full rounded border-gray-300 text-sm shadow-sm focus:ring focus:ring-blue-200"
            value={editedParent}
            onChange={(e) => setEditedParent(e.target.value)}
          >
            <option value="">-- Select Layer --</option>
            {allLayers.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.label || layer.id}
              </option>
            ))}
          </select>
        </div>

        {cell.value && (
          <div className="text-sm">
            <span className="font-semibold text-gray-700">Value:</span>{" "}
            <span className="text-gray-500">{cell.value}</span>
          </div>
        )}
        {cell.style && (
          <div className="text-sm">
            <span className="font-semibold text-gray-700">Style:</span>{" "}
            <span className="text-gray-500">{cell.style}</span>
          </div>
        )}

        <Button className="mt-4" onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    );
  };

  return (
    <ScrollArea className="flex-1 min-h-[160px]">
      <div className="px-6 py-4 text-left">
        {!selectedNode ? (
          <div className="text-gray-400 italic opacity-50 mt-12 text-center">
            Select a node to view properties
          </div>
        ) : (
          renderDetails()
        )}
      </div>
    </ScrollArea>
  );
};

export default NodePropertiesPanel;
