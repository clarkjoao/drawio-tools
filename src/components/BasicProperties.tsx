import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  localAttributes: { id: string; value: string; label: string };
  setLocalAttributes: (
    value: (prev: { id: string; value: string; label: string }) => {
      id: string;
      value: string;
      label: string;
    }
  ) => void;
}

export const BasicProperties = ({ localAttributes, setLocalAttributes }: Props) => (
  <>
    <div>
      <Label className="text-sm font-medium">ID</Label>
      <Input
        value={localAttributes.id}
        onChange={(e) => setLocalAttributes((prev) => ({ ...prev, id: e.target.value }))}
        className="mt-1"
      />
    </div>

    <div>
      <Label className="text-sm font-medium">Name (Label)</Label>
      <Input
        value={localAttributes.label}
        onChange={(e) => setLocalAttributes((prev) => ({ ...prev, label: e.target.value }))}
        className="mt-1"
      />
    </div>

    <div>
      <Label className="text-sm font-medium">Value</Label>
      <Input
        value={localAttributes.value}
        onChange={(e) => setLocalAttributes((prev) => ({ ...prev, value: e.target.value }))}
        className="mt-1"
      />
    </div>
  </>
);
