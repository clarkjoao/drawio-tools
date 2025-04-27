import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Props {
  styleEntries: { key: string; value: string }[];
  setStyleEntries: (entries: { key: string; value: string }[]) => void;
}

export const StyleEditor = ({ styleEntries, setStyleEntries }: Props) => {
  const handleStyleChange = (index: number, key: string, value: string) => {
    const updated = [...styleEntries];
    updated[index] = { key, value };
    setStyleEntries(updated);
  };

  const addStyleField = () => {
    setStyleEntries([...styleEntries, { key: "", value: "" }]);
  };

  const removeStyleField = (index: number) => {
    setStyleEntries(styleEntries.filter((_, i) => i !== index));
  };

  return (
    <div className="pt-2">
      <Label className="text-sm font-medium">Style</Label>
      <div className="flex flex-col gap-2 mt-2 max-h-[400px] overflow-auto">
        {styleEntries.map((entry, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
            <Input
              placeholder="key"
              value={entry.key}
              onChange={(e) => handleStyleChange(index, e.target.value, entry.value)}
              className="h-8"
            />
            <Input
              placeholder="value"
              value={entry.value}
              onChange={(e) => handleStyleChange(index, entry.key, e.target.value)}
              className="h-8"
            />
            <Button
              variant="destructive"
              size="icon"
              onClick={() => removeStyleField(index)}
              className="w-8 h-8 p-0"
            >
              ×
            </Button>
          </div>
        ))}
        <Button variant="secondary" onClick={addStyleField} size="sm" className="mt-2">
          + Add Style
        </Button>
      </div>
    </div>
  );
};
