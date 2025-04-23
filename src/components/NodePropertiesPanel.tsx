import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ObjectNode } from "@/MxGraph/ObjectNode";
import { UserObject } from "@/MxGraph/UserObject";
import { NodeInfo } from "@/MxGraph/MxBuilder";

interface NodePropertiesPanelProps {
  selectedNode: NodeInfo | null;
  onUpdate?: (updated: NodeInfo) => void;
}

const NodePropertiesPanel = ({ selectedNode, onUpdate }: NodePropertiesPanelProps) => {
  const [editedLabel, setEditedLabel] = useState("");
  const [editedLink, setEditedLink] = useState("");
  const [editedId, setEditedId] = useState("");

  useEffect(() => {
    if (selectedNode) {
      setEditedId(selectedNode.cell.id || "");

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
    if (!selectedNode) return;

    const updated = { ...selectedNode };
    updated.cell.id = editedId;

    if (updated.wrapper instanceof ObjectNode || updated.wrapper instanceof UserObject) {
      updated.wrapper.label = editedLabel;
      if (updated.wrapper instanceof UserObject) {
        updated.wrapper.setLink(editedLink);
      }
    }

    onUpdate?.(updated);
  };

  const renderDetails = () => {
    if (!selectedNode) return null;

    const { cell, wrapper } = selectedNode;

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
        {cell.parent && (
          <div className="text-sm">
            <span className="font-semibold text-gray-700">Parent:</span>{" "}
            <span className="text-gray-500">{cell.parent}</span>
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
