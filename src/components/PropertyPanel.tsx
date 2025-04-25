import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useBuilder } from "@/context/BuilderContext";

export const PropertyPanel: React.FC = () => {
  const { selectedCells } = useBuilder();
  const selected = selectedCells[0] || null;

  if (!selected) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select an element to view its properties
      </div>
    );
  }

  const attributes = {
    id: selected.id,
    value: selected.value,
    style: selected.style ? selected.style.toString() : undefined
    // ...(selected.attributes || {})
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Properties - {selected.constructor.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(attributes).map(
          ([key, value]) =>
            value !== undefined && (
              <div key={key}>
                <Label className="text-sm font-medium">{key}</Label>
                <Input
                  value={value !== undefined && value !== null ? String(value) : ""}
                  readOnly
                  className="mt-1"
                />
              </div>
            )
        )}
      </CardContent>
    </Card>
  );
};
