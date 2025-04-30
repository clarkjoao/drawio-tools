import React, { useState } from "react";
import { MxActions, MxAction } from "@/MxGraph/MxActions";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { useBuilder } from "@/context/BuilderContext";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const ACTION_TYPES = [
  "show",
  "hide",
  "style",
  "toggleStyle",
  "select",
  "highlight",
  "scroll",
  "viewbox"
] as (keyof MxAction)[];

const TARGET_TYPES: Record<string, string[]> = {
  show: ["cells", "tags"],
  hide: ["cells", "tags"],
  style: ["cells"],
  toggleStyle: ["cells"],
  select: ["cells"],
  highlight: ["cells"],
  scroll: ["cells"],
  viewbox: ["cells"]
};

const ActionBuilderPanel: React.FC = () => {
  const { builder } = useBuilder();
  const [mxActions, setMxActions] = useState(() => new MxActions("Custom Action Set"));

  const allTags = Array.from(
    new Set(builder?.getModel().root.flatMap((cell) => cell.wrapper?.tags || []) ?? [])
  );

  const allIds =
    builder
      ?.getModel()
      .root.map((cell) => cell.id)
      .filter(Boolean) ?? [];

  const setActions = (next: MxAction[]) => {
    const nextInstance = new MxActions(mxActions.toJSON().title);
    next.forEach((a) => nextInstance.add(a));
    setMxActions(nextInstance);
  };

  const addNewAction = () => {
    setActions([...mxActions.getActions(), { show: { cells: [allIds[0] || ""] } }]);
  };

  const updateFullAction = (
    index: number,
    actionType: keyof MxAction,
    targetType: string,
    targetValue: string | string[]
  ) => {
    const updated: MxAction[] = mxActions.getActions().map((a, i) => {
      if (i !== index) return a;

      const values = Array.isArray(targetValue) ? targetValue : [targetValue];
      const newConfig: any = {};

      if (actionType === "style") {
        newConfig[actionType] = { cells: values, key: "fillColor", value: "#ffffff" };
      } else if (actionType === "toggleStyle") {
        newConfig[actionType] = { cells: values, key: "fillColor", defaultValue: "#ffffff" };
      } else if (actionType === "highlight") {
        newConfig[actionType] = { cells: values, color: "#ff0000", duration: 2000 };
      } else if (actionType === "viewbox") {
        newConfig[actionType] = { cells: values, fitWindow: true };
      } else if (actionType === "select" || actionType === "scroll") {
        newConfig[actionType] = { cells: values };
      } else {
        newConfig[actionType] = { [targetType]: values };
      }

      return newConfig as MxAction;
    });

    setActions(updated);
  };

  const deleteAction = (index: number) => {
    const updated = mxActions.getActions().filter((_, i) => i !== index);
    setActions(updated);
  };

  return (
    <div className="space-y-6 w-full">
      <h2 className="text-2xl font-semibold">Action Builder Panel</h2>

      {mxActions.getActions().map((action, index) => {
        const actionType = Object.keys(action)[0] as keyof MxAction;
        const config = (action as any)[actionType];
        const isCell = config.cells !== undefined;
        const targetType = isCell ? "cells" : "tags";
        const currentValues: string[] = config[targetType] ?? [];
        const options = targetType === "cells" ? allIds : allTags;

        return (
          <div key={index} className="p-4 border bg-gray-50 rounded-md space-y-2 flex flex-col">
            <div className="grid grid-cols-[auto_auto_1fr_auto] gap-2 items-center">
              <Select
                value={actionType}
                onValueChange={(val) =>
                  updateFullAction(index, val as keyof MxAction, targetType, currentValues)
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={targetType}
                onValueChange={(val) => updateFullAction(index, actionType, val, currentValues)}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Target" />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_TYPES[actionType].map((target) => (
                    <SelectItem key={target} value={target}>
                      {target}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    {currentValues.length > 0 ? currentValues.join(", ") : "Select values"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-ful max-w[20px] max-h-[200px] overflow-auto z-[9999]">
                  <div className="flex flex-col space-y-1">
                    {options
                      .filter((opt): opt is string => !!opt)
                      .map((opt) => {
                        const checked = currentValues.includes(opt);
                        return (
                          <label key={opt} className="flex items-center space-x-2">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(checked) => {
                                const next = checked
                                  ? [...currentValues, opt]
                                  : currentValues.filter((v) => v !== opt);
                                updateFullAction(index, actionType, targetType, next);
                              }}
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteAction(index)}
                className="justify-self-end"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        );
      })}

      <div className="flex gap-2">
        <Button variant="default" onClick={addNewAction}>
          <PlusCircle className="w-4 h-4 mr-2" /> Add Action
        </Button>
      </div>
    </div>
  );
};

export default ActionBuilderPanel;
