import { useState } from "react";
import { useBuilder } from "@/context/BuilderContext";
import { ElementTree } from "@/components/ElementTree";
import { PropertyPanel } from "@/components/PropertyPanel";
import XMLEditor from "@/components/XMLEditor";
import { MxBuilder } from "@/MxGraph/MxBuilder";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Button } from "@/components/ui/button";
import { GraphService } from "@/MxGraph/GraphService";
import { MxCell } from "@/MxGraph/MxCell";
import { MxStyle } from "@/MxGraph/MxStyle";
import { MxGeometry } from "@/MxGraph/MxGeometry";
import { XmlUtils } from "@/MxGraph/xml.utils";
import { UserObject } from "@/MxGraph/UserObject";
import { generateDrawioId } from "@/utils/drawio";

export default function App() {
  const { builder, setBuilder, refreshBuilder } = useBuilder();
  const [originalXml, setOriginalXml] = useState<string>("");

  const handleExport = () => {
    return builder?.toXml() || "";
  };

  const handleParseXml = (xml: string) => {
    setOriginalXml(xml);
    setBuilder(MxBuilder.fromXml(xml));
  };

  function addCustomMenu() {
    if (!builder) return;
    const service = new GraphService(builder);
    const xml = service.getBuilder();
    const model = xml.getModel();

    const currentLayers = builder.listLayers();
    const validLayers = currentLayers.filter((layer) => layer.id !== "0");

    const buttonHeight = 45;
    const totalHeight = validLayers.length * buttonHeight || buttonHeight;

    const menuBackground = new MxCell({
      id: generateDrawioId("menu-background"),
      style: new MxStyle({
        shape: "rect",
        strokeColor: "#eeeeee",
        fillColor: "#ffffff",
        fontColor: "#000000",
        fontStyle: "0",
        childLayout: "stackLayout",
        horizontal: "1",
        startSize: "0",
        horizontalStack: "0",
        resizeParent: "1",
        resizeParentMax: "0",
        resizeLast: "0",
        collapsible: "0",
        marginBottom: "0",
        whiteSpace: "wrap",
        html: "1",
        shadow: "1"
      }),
      vertex: "1",
      parent: validLayers[0]?.parent ?? "1",
      geometry: new MxGeometry({
        x: "360",
        y: "250",
        width: "100",
        height: totalHeight.toString(),
        as: "geometry"
      })
    });

    model.addCell(menuBackground);

    const allLayerIds = validLayers.map((layer) => layer.id!);

    validLayers.forEach((layer, i) => {
      const layerId = layer.id!;
      const otherLayerIds = allLayerIds.filter((id) => id !== layerId);

      const menuItemId = generateDrawioId("menu-item-layer");

      const linkJson = {
        title: `Show Only ${layerId}`,
        actions: [
          { hide: { cells: otherLayerIds } },
          { style: { cells: otherLayerIds, key: "locked", value: "1" } },
          { show: { cells: [layerId] } },
          { style: { cells: [layerId], key: "locked", value: "0" } },
          { style: { tags: ["menu-items"], key: "fillColor", value: "#ffffff" } },
          { style: { cells: [menuItemId], key: "fillColor", value: "#d3d3d3" } }
        ]
      };

      const linkEscaped = `data:action/json,${XmlUtils.escapeString(JSON.stringify(linkJson))}`;

      const menuItemUserObject = new UserObject({
        id: menuItemId,
        label: layer.value || layer.id,
        link: linkEscaped,
        customAttributes: { placeholders: "1" }
      });

      const menuItemCell = new MxCell({
        style: new MxStyle({
          shape: "text",
          strokeColor: "none",
          align: "left",
          verticalAlign: "middle",
          spacingLeft: "10",
          spacingRight: "10",
          overflow: "hidden",
          portConstraint: "eastwest",
          rotatable: "0",
          whiteSpace: "wrap",
          html: "1",
          rSize: "5",
          fillColor: "none",
          fontColor: "inherit",
          fontSize: "14"
        }),
        vertex: "1",
        parent: menuBackground.id,
        geometry: new MxGeometry({
          y: `${i * buttonHeight}`,
          width: "100",
          height: `${buttonHeight}`,
          as: "geometry"
        }),
        wrapper: menuItemUserObject
      });

      model.addCell(menuItemCell);
    });

    refreshBuilder();
  }

  const isPlugin = import.meta.env.AS_PLUGIN;

  if (isPlugin) {
    return (
      <div className="flex flex-col w-full h-full bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
          <h2 className="text-lg font-semibold text-gray-700">Nodes</h2>
        </div>

        <Button onClick={addCustomMenu}>add Layer Menu</Button>
        <div className="flex flex-1 overflow-hidden max-h-[400px]">
          <div className="flex flex-col w-1/2 border-r border-gray-200">
            <div className="p-2">
              <ScrollArea className="max-h-[400px] overflow-auto border rounded">
                <ElementTree />
              </ScrollArea>
            </div>
          </div>

          <div className="flex flex-col w-1/2">
            <div className="p-2">
              <ScrollArea className="h-full">
                <PropertyPanel />
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-7xl mx-auto w-full p-4 flex flex-col gap-6">
        <h1 className="text-3xl font-semibold mb-6 text-gray-900">Draw.io XML Editor</h1>
        <Button onClick={addCustomMenu}>add Layer Menu</Button>
        <div className="grid grid-cols-2 gap-6">
          {!isPlugin && (
            <div className="col-span-2 bg-white dark:bg-[#222] border border-gray-200/60 shadow-lg rounded-lg p-4">
              <XMLEditor onExport={handleExport} onParseXml={handleParseXml} />
            </div>
          )}

          <div className="flex flex-col bg-white dark:bg-[#222] border border-gray-200/60 shadow-lg rounded-lg p-4 h-[600px]">
            <ScrollArea className="flex-1 overflow-auto">
              <ElementTree />
            </ScrollArea>
          </div>

          <div className="flex flex-col bg-white dark:bg-[#222] border border-gray-200/60 shadow-lg rounded-lg p-4 h-[600px]">
            <ScrollArea className="flex-1 overflow-auto">
              <PropertyPanel />
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
