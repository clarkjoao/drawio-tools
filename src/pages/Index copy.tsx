import NodeBrowser from "@/components/NodeBrowser";
import { Button } from "@/components/ui/button";
import { MxCell } from "@/MxGraph/MxCell";
import { ObjectNode } from "@/MxGraph/ObjectNode";
import { MxGeometry } from "@/MxGraph/MxGeometry";
import { generateDrawioId } from "@/utils/drawio";
import { UserObject } from "@/MxGraph/UserObject";
import { useBuilder } from "@/context/BuilderContext";
import XMLEditor from "@/components/XMLEditor";
import { MxStyle } from "@/MxGraph/MxStyle";
import { MxBuilder } from "@/MxGraph/MxBuilder";

export default function App() {
  const { builder, setBuilder, refreshBuilder, createGroup, updateCellStyle } = useBuilder();

  const handleParseXml = (xmlString: string) => {
    try {
      const newBuilder = MxBuilder.fromXml(xmlString);
      setBuilder(newBuilder);
    } catch (e) {
      console.error("Erro ao fazer parse do XML", e);
    }
  };

  const handleExport = () => {
    if (!builder) {
      console.error("No builder available to export");
      return "";
    }
    return builder.toXmlString();
  };

  // const createNewLayer = (): ObjectNode | undefined => {
  //   if (!builder) return;

  //   // Remove existing custom menu layer if exists
  //   builder.removeNodeById("layer-custom-menu");

  //   const layerCell = new MxCell({
  //     id: "layer-custom-menu",
  //     parent: "0",
  //     value: "Custom Menu",
  //     style: new MxStyle("locked=1")
  //   });

  //   const newLayer = new ObjectNode({ id: "layer-custom-menu" }, layerCell);
  //   builder.model.root.add(newLayer);
  //   return newLayer;
  // };

  // const addCustomMenu = () => {
  //   if (!builder) return;

  //   const currentLayers = builder.listLayers();
  //   const layerExists = currentLayers.filter((layer) => layer.node.cell.id !== "0");

  //   const newLayer = createNewLayer();
  //   const layerId = newLayer?.cell.id ?? "layer-custom-menu";

  //   const buttonHeight = 45;
  //   const totalHeight = layerExists.length * buttonHeight;

  //   // Create menu container
  //   const menuComponent = new MxCell({
  //     id: generateDrawioId("menu-background"),
  //     value: "",
  //     style: new MxStyle(
  //       "swimlane;shape=rect;strokeColor=#eeeeee;fillColor=#ffffff;" +
  //         "fontColor=#000000;fontStyle=0;childLayout=stackLayout;horizontal=1;" +
  //         "startSize=0;horizontalStack=0;resizeParent=1;resizeParentMax=0;" +
  //         "resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;shadow=1"
  //     ),
  //     vertex: 1,
  //     parent: layerId,
  //     geometry: new MxGeometry({
  //       x: 360,
  //       y: 250,
  //       width: 100,
  //       height: totalHeight || buttonHeight
  //     })
  //   });

  //   builder.model.root.add(menuComponent);

  //   const allLayerIds = layerExists.map((layer) => layer.node.id);

  //   // Add menu items for each layer
  //   layerExists.forEach((layer, i) => {
  //     const layerToShow = layer.node.id;
  //     const otherLayers = allLayerIds.filter((id) => id !== layerToShow);

  //     const menuItemId = generateDrawioId("menu-item-layer");

  //     const link = UserObject.serializeLink({
  //       title: `Show Only ${layerToShow}`,
  //       actions: [
  //         { hide: { cells: otherLayers } },
  //         { style: { cells: otherLayers, key: "locked", value: "1" } },
  //         { show: { cells: [layerToShow] } },
  //         { style: { cells: [layerToShow], key: "locked", value: "0" } },
  //         { style: { tags: ["menu-items"], key: "fillColor", value: "#ffffff" } },
  //         { style: { cells: [menuItemId], key: "fillColor", value: "#d3d3d3" } }
  //       ]
  //     });

  //     const menuItemLayer = new UserObject({
  //       id: menuItemId,
  //       label: layer.node.cell.value || layer.node.id,
  //       link,
  //       tags: ["menu-items"],
  //       cell: new MxCell({
  //         style: new MxStyle(
  //           "text;strokeColor=none;align=left;verticalAlign=middle;" +
  //             "spacingLeft=10;spacingRight=10;overflow=hidden;" +
  //             "points=[[0,0.5],[1,0.5]];portConstraint=eastwest;" +
  //             "rotatable=0;whiteSpace=wrap;html=1;rSize=5;" +
  //             "fillColor=none;fontColor=inherit;fontSize=14"
  //         ),
  //         vertex: 1,
  //         parent: menuComponent.id,
  //         geometry: new MxGeometry({
  //           y: i * buttonHeight,
  //           width: 100,
  //           height: buttonHeight
  //         })
  //       })
  //     });

  //     builder.model.root.add(menuItemLayer);
  //   });

  //   // Add "Show All" button
  //   const showAllId = generateDrawioId("menu-item-show-all");
  //   const showAllLink = UserObject.serializeLink({
  //     title: "Show All",
  //     actions: [
  //       { show: { cells: allLayerIds } },
  //       { style: { tags: ["menu-items"], key: "fillColor", value: "#ffffff" } },
  //       { style: { cells: [showAllId], key: "fillColor", value: "#d3d3d3" } }
  //     ]
  //   });

  //   const showAllLayer = new UserObject({
  //     id: showAllId,
  //     label: "Show All",
  //     link: showAllLink,
  //     tags: ["menu-items"],
  //     cell: new MxCell({
  //       style: new MxStyle(
  //         "text;strokeColor=none;align=left;verticalAlign=middle;" +
  //           "spacingLeft=10;spacingRight=10;overflow=hidden;" +
  //           "points=[[0,0.5],[1,0.5]];portConstraint=eastwest;" +
  //           "rotatable=0;whiteSpace=wrap;html=1;rSize=5;" +
  //           "fillColor=none;fontColor=inherit;fontSize=14"
  //       ),
  //       vertex: 1,
  //       parent: menuComponent.id,
  //       geometry: new MxGeometry({
  //         y: layerExists.length * buttonHeight,
  //         width: 100,
  //         height: buttonHeight
  //       })
  //     })
  //   });

  //   builder.model.root.add(showAllLayer);
  //   refreshBuilder();
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-gray-50 from-80% via-white via-100% to-gray-200/80">
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-3xl font-semibold mb-4 px-2 pt-8 text-gray-900">
            Draw.io XML Editor
          </h1>

          {/* <div className="flex flex-row gap-6 my-4 w-full">
            <div className="flex flex-col gap-6 my-4 w-full">
              {!import.meta.env.AS_PLUGIN && (
                <div className="bg-white dark:bg-[#222] border border-gray-200/60 shadow-lg rounded-lg min-h-[420px] flex flex-col">
                  <XMLEditor onParseXml={handleParseXml} onExport={handleExport} />
                </div>
              )}

              <div className="col-span-1 bg-white dark:bg-[#222] border border-gray-200/60 shadow-lg rounded-lg min-h-[420px] flex flex-col">
                <div className="border-b border-gray-100 py-3 px-4 bg-gray-50/80 rounded-t-lg">
                  <h2 className="text-lg font-bold text-gray-800 tracking-tight">Node Browser</h2>
                </div>
                <div className="flex-1 px-2 pt-3">
                  {builder ? (
                    <NodeBrowser
                      data={builder}
                      onSelectNode={(node) => {
                        console.log("Selected node:", node);
                        // Example of updating style
                        if (node.cell) {
                          updateCellStyle(node.id, "fillColor", "#ff0000");
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 font-semibold mt-24 text-xl">
                      No diagram loaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
