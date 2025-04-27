import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  geometryAttributes: { x: string; y: string; width: string; height: string };
  setGeometryAttributes: (
    value: (prev: { x: string; y: string; width: string; height: string }) => {
      x: string;
      y: string;
      width: string;
      height: string;
    }
  ) => void;
}

export const GeometryEditor = ({ geometryAttributes, setGeometryAttributes }: Props) => (
  <div className="pt-4">
    <Label className="text-sm font-medium">Geometry</Label>
    <div className="grid grid-cols-2 gap-2 mt-2">
      <Input
        placeholder="x"
        value={geometryAttributes.x}
        onChange={(e) => setGeometryAttributes((prev) => ({ ...prev, x: e.target.value }))}
        className="h-8"
      />
      <Input
        placeholder="y"
        value={geometryAttributes.y}
        onChange={(e) => setGeometryAttributes((prev) => ({ ...prev, y: e.target.value }))}
        className="h-8"
      />
      <Input
        placeholder="width"
        value={geometryAttributes.width}
        onChange={(e) => setGeometryAttributes((prev) => ({ ...prev, width: e.target.value }))}
        className="h-8"
      />
      <Input
        placeholder="height"
        value={geometryAttributes.height}
        onChange={(e) => setGeometryAttributes((prev) => ({ ...prev, height: e.target.value }))}
        className="h-8"
      />
    </div>
  </div>
);
