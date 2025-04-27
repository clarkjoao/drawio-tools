import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBuilder } from "@/context/BuilderContext";
import { GraphService } from "@/MxGraph/GraphService";
import { BasicProperties } from "./BasicProperties";
import { StyleEditor } from "./StyleEditor";
import { GeometryEditor } from "./GeometryEditor";
import { Button } from "./ui/button";

export const PropertyPanel: React.FC = () => {
  const { builder, selectedCellIds, refreshBuilder } = useBuilder();

  const [localAttributes, setLocalAttributes] = useState<{
    id: string;
    value: string;
    label: string;
  }>({
    id: "",
    value: "",
    label: ""
  });

  const [geometryAttributes, setGeometryAttributes] = useState<{
    x: string;
    y: string;
    width: string;
    height: string;
  }>({
    x: "",
    y: "",
    width: "",
    height: ""
  });
  const [styleEntries, setStyleEntries] = useState<{ key: string; value: string }[]>([]);

  const selected = builder?.getModel().findCellById(selectedCellIds[0] || "") || null;

  useEffect(() => {
    if (selected && selected.id) {
      setLocalAttributes({
        id: selected.id,
        value: selected.value ?? "",
        label: typeof selected.value === "string" ? selected.value : ""
      });

      const styleObject = selected.style ?? {};
      setStyleEntries(
        Object.entries(styleObject).map(([key, value]) => ({ key, value: String(value) }))
      );

      if (selected.geometry) {
        setGeometryAttributes({
          x: selected.geometry.x ?? "",
          y: selected.geometry.y ?? "",
          width: selected.geometry.width ?? "",
          height: selected.geometry.height ?? ""
        });
      } else {
        setGeometryAttributes({ x: "", y: "", width: "", height: "" });
      }
    } else {
      setLocalAttributes({ id: "", value: "", label: "" });
      setGeometryAttributes({ x: "", y: "", width: "", height: "" });
      setStyleEntries([]);
    }
  }, [selected]);

  if (!selected) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-center p-4">
        Select an element to view its properties
      </div>
    );
  }

  const service = new GraphService(builder!);

  const handleSave = () => {
    if (!builder || !selected.id) return;

    if (localAttributes.id !== selected.id && service.idExists(localAttributes.id)) {
      alert(`ID "${localAttributes.id}" already exists. Please choose another.`);
      return;
    }

    if (localAttributes.id !== selected.id) {
      service.updateNodeId(selected.id, localAttributes.id);
    }
    if (localAttributes.value !== selected.value) {
      service.updateNodeValue(selected.id, localAttributes.value);
    }
    if (localAttributes.label !== selected.value) {
      service.updateNodeValue(selected.id, localAttributes.label);
    }

    const styleObject: Record<string, string> = {};
    for (const entry of styleEntries) {
      if (entry.key) {
        styleObject[entry.key] = entry.value;
      }
    }
    service.updateNodeStyle(selected.id, styleObject);

    if (selected.geometry) {
      selected.geometry.x = geometryAttributes.x;
      selected.geometry.y = geometryAttributes.y;
      selected.geometry.width = geometryAttributes.width;
      selected.geometry.height = geometryAttributes.height;
    }

    refreshBuilder();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>
          Properties - {selected.isLayer ? "Layer" : selected.isGroup ? "Group" : "Node"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-auto flex-1">
        <BasicProperties
          localAttributes={localAttributes}
          setLocalAttributes={setLocalAttributes}
        />
        {!selected.isLayer && (
          <StyleEditor styleEntries={styleEntries} setStyleEntries={setStyleEntries} />
        )}
        {selected.geometry && (
          <GeometryEditor
            geometryAttributes={geometryAttributes}
            setGeometryAttributes={setGeometryAttributes}
          />
        )}
      </CardContent>
      <div className="p-4">
        <Button className="w-full" onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </Card>
  );
};
