import { useBuilder } from "@/context/BuilderContext";
import { MxCell } from "@/MxGraph/MxCell";
import { MxGeometry } from "@/MxGraph/MxGeometry";
import { MxStyle } from "@/MxGraph/MxStyle";
import { ObjectWrapper } from "@/MxGraph/ObjectWrapper";
import { XmlUtils } from "@/MxGraph/xml.utils";
import { generateDrawioId } from "@/utils/drawio";

export function CustomElements() {
  const { builder, mutateBuilder, syncBuilder } = useBuilder();

  function addLayersMenu() {
    if (!builder) return;

    mutateBuilder((builder) => {
      const model = builder.getModel();

      const allLayers = builder.listLayers();

      const menuLayer = builder.addLayer("layers-menu-custom");

      const buttonHeight = 45;
      const totalHeight = allLayers.length * buttonHeight || buttonHeight;

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
        parent: menuLayer.id ?? "1",
        children: new MxGeometry({
          x: "360",
          y: "250",
          width: "100",
          height: totalHeight.toString(),
          as: "geometry"
        })
      });

      model.addCellAfter(menuBackground, builder.rootLayerId);

      const allLayerIds = allLayers.map((layer) => layer.id!);

      allLayers.forEach((layer, index) => {
        const layerId = layer.id!;
        const otherLayerIds = allLayerIds.filter((id) => id !== layerId || id !== menuLayer.id);

        const menuItemId = generateDrawioId(`menu-item-layer-${index}`);

        const linkJson = {
          title: `Show Only ${layer.value || layerId}`,
          actions: [
            { hide: { cells: otherLayerIds } },
            { style: { cells: otherLayerIds, key: "locked", value: "1" } },
            { show: { cells: [layerId] } },
            { style: { cells: [layerId], key: "locked", value: "0" } },
            { style: { tags: ["menu-items-layer"], key: "fillColor", value: "#ffffff" } },
            { style: { cells: [menuItemId], key: "fillColor", value: "#d3d3d3" } }
          ]
        };

        const linkEscaped = `data:action/json,${XmlUtils.escapeString(JSON.stringify(linkJson))}`;

        const menuItemUserObject = new ObjectWrapper({
          id: menuItemId,
          label: layer.value || "Background", // default name is background, beucase is the same name that drawio choose when layer doesnt have value
          tags: ["menu-items-layer"],
          link: linkEscaped
        });

        const menuItemCell = new MxCell({
          id: undefined, // undefined because exists wrapper
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
          children: new MxGeometry({
            y: `${index * buttonHeight}`,
            width: "100",
            height: `${buttonHeight}`,
            as: "geometry"
          }),
          wrapper: menuItemUserObject
        });

        model.addCell(menuItemCell);
      });
    });

    syncBuilder();
  }

  function addTagsMenu() {
    if (!builder) return;

    mutateBuilder((builder) => {
      const model = builder.getModel();

      const menuLayer = builder.addLayer("tags-menu-custom");
      const allTags = builder.listTags();

      const buttonHeight = 45;
      const totalHeight = allTags.length * buttonHeight || buttonHeight;

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
        parent: menuLayer.id ?? "1",
        children: new MxGeometry({
          x: "360",
          y: "250",
          width: "100",
          height: totalHeight.toString(),
          as: "geometry"
        })
      });

      model.addCellAfter(menuBackground, menuLayer.id!);

      allTags.forEach((currentTag, index) => {
        const otherTags = allTags.filter((tag) => tag !== currentTag);

        const menuItemId = generateDrawioId(`menu-item-tag-${index}`);

        const linkJson = {
          title: `Show Only ${currentTag}`,
          actions: [
            {
              hide: { tags: otherTags }
            },
            { show: { tags: [currentTag] } },
            { style: { tags: ["menu-items-tags"], key: "fillColor", value: "#ffffff" } },
            { style: { cells: [menuItemId], key: "fillColor", value: "#d3d3d3" } }
          ]
        };

        const linkEscaped = `data:action/json,${XmlUtils.escapeString(JSON.stringify(linkJson))}`;

        const menuItemUserObject = new ObjectWrapper({
          id: menuItemId,
          label: currentTag,
          tags: ["menu-items-tags"],
          link: linkEscaped
        });

        const menuItemCell = new MxCell({
          id: undefined,
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
          children: new MxGeometry({
            y: `${index * buttonHeight}`,
            width: "100",
            height: `${buttonHeight}`,
            as: "geometry"
          }),
          wrapper: menuItemUserObject
        });

        model.addCell(menuItemCell);
      });
    });

    syncBuilder();
  }

  return (
    <div className="flex items-center space-x-4 px-4 py-2 bg-gray-100 border-b border-gray-300">
      <button
        onClick={addLayersMenu}
        className="text-sm text-gray-800 hover:bg-gray-200 px-2 py-1 rounded transition"
      >
        Add Layer Menu
      </button>

      <button
        onClick={addTagsMenu}
        className="text-sm text-gray-800 hover:bg-gray-200 px-2 py-1 rounded transition"
      >
        Add Tags Menu
      </button>
    </div>
  );
}
