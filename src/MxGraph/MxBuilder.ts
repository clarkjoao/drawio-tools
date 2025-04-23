import { MxGraphModel } from "./MxGraphModel";
import { MxCell } from "./MxCell";
import { UserObject } from "./UserObject";
import { ObjectNode } from "./ObjectNode";
import { generateDrawioId } from "../utils/drawio";

export interface NodeInfo {
  id: string;
  label: string;
  cell: MxCell;
  wrapper?: UserObject | ObjectNode;
}

export interface LayerInfo {
  id: string;
  label: string;
  node: ObjectNode;
}

export class MxBuilder {
  model: MxGraphModel;
  private layers: LayerInfo[] = [];

  constructor(model?: MxGraphModel) {
    this.model = model || new MxGraphModel();
  }

  static fromXml(xml: string): MxBuilder {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const graphModelElement = doc.getElementsByTagName("mxGraphModel")[0];
    const rootElement = graphModelElement.getElementsByTagName("root")[0];

    const attrs: Record<string, any> = {};
    for (const attr of graphModelElement.attributes) {
      attrs[attr.name] = attr.value;
    }

    const builder = new MxBuilder(new MxGraphModel(attrs));

    for (const child of rootElement.children) {
      switch (child.tagName) {
        case "mxCell": {
          const cell = MxCell.fromElement(child);
          debugger;
          if (cell.isLayer && cell.id == "0") {
            // add default layer to the model
            // builder.model.root.add(cell);
            break;
          }
          // we are avoiding to add the default layer, that is the one with id 0
          else if (cell.isLayer && cell.id !== "0") {
            // Here we are defaulting to a layer id if the cell id is not set
            const wrapped = new ObjectNode({ id: cell.id ?? generateDrawioId("layer"), cell });
            builder.model.root.add(wrapped);

            builder.layers.push({
              id: wrapped.id,
              label: wrapped.label || cell.value || wrapped.id,
              node: wrapped
            });
          } else {
            const wrapper = new UserObject({ id: cell.id, cell });

            debugger;
            builder.model.root.add(wrapper);
          }
          break;
        }

        case "object": {
          const node = ObjectNode.fromElement(child);
          builder.model.root.add(node);

          const isLayer = node.cell.isLayer;

          if (isLayer) {
            builder.layers.push({
              id: node.id,
              label: node.label || child.getAttribute("label") || node.id,
              node
            });
          }
          break;
        }

        case "UserObject":
          builder.model.root.add(UserObject.fromElement(child));
          break;
      }
    }

    return builder;
  }

  listNodes(layerId?: string): NodeInfo[] {
    const result: NodeInfo[] = [];

    for (const child of this.model.root.children) {
      if (
        (child instanceof ObjectNode && (child.cell?.isLayer || child.cell?.parent === "0")) ||
        (child instanceof MxCell && (child.isLayer || child.parent === "0"))
      )
        continue;

      const parentId =
        child instanceof ObjectNode || child instanceof UserObject
          ? child.cell?.parent
          : child instanceof MxCell
            ? child.parent
            : undefined;

      if (layerId && parentId !== layerId) continue;

      const label =
        child instanceof ObjectNode || child instanceof UserObject ? child.label : child.value;
      const cell = child instanceof MxCell ? child : child.cell;

      result.push({
        id: child.id,
        label,
        cell,
        wrapper: child instanceof MxCell ? undefined : child
      });
    }

    return result;
  }

  ensureUserObject(nodeId: string): UserObject {
    const child = this.model.root.children.find((c) => c.id === nodeId);
    if (!child) throw new Error("Node not found: " + nodeId);

    if (child instanceof UserObject) return child;

    if (child instanceof MxCell) {
      const userObj = new UserObject({ id: child.id, cell: child });
      if (child.id) {
        this.model.root.remove(child.id);
      } else {
        throw new Error("Child ID is undefined");
      }
      this.model.root.add(userObj);
      return userObj;
    }

    throw new Error("Node cannot be wrapped");
  }

  listLayers(): LayerInfo[] {
    return this.layers;
  }

  listTags(): string[] {
    const tags = new Set<string>();
    for (const child of this.model.root.children) {
      if (child instanceof UserObject) {
        child.tags.forEach((tag) => tags.add(tag));
      }
    }
    return [...tags];
  }

  toXmlString(): string {
    return this.model.toXmlString();
  }
}
