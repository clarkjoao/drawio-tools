import { MxCell } from "./MxCell";

export class MxGraphModel {
  root: MxCell[];
  rootLayer?: MxCell;
  attributes: Record<string, string>;

  constructor(root: MxCell[] = [], attributes: Record<string, string> = {}) {
    this.root = root;
    // NOTE: May we can improve this way to find root element;
    this.rootLayer = root.find(
      (cell) => !cell.isVertex && !cell.isEdge && cell.parent === undefined
    );
    this.attributes = attributes;
  }

  get rootLayerId(): string {
    return this.rootLayer?.id || "0";
  }

  static fromXml(xml: string): MxGraphModel {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const modelNode = doc.querySelector("mxGraphModel");
    const rootNode = modelNode?.querySelector("root");
    const cells: MxCell[] = [];
    const attrs: Record<string, string> = {};

    if (modelNode) {
      for (const attr of Array.from(modelNode.attributes)) {
        attrs[attr.name] = attr.value;
      }
    }

    if (rootNode) {
      rootNode.childNodes.forEach((node: any) => {
        // Check if the node is an element node
        // and not a text node or comment
        if (node.nodeType === 1) {
          cells.push(MxCell.fromElement(node as Element));
        }
      });
    }

    return new MxGraphModel(cells, attrs);
  }

  toXml(): string {
    const doc = document.implementation.createDocument("", "", null);
    const modelElement = doc.createElement("mxGraphModel");

    Object.entries(this.attributes).forEach(([key, value]) => {
      modelElement.setAttribute(key, value);
    });

    const rootElement = doc.createElement("root");
    this.root.forEach((cell) => {
      rootElement.appendChild(cell.toElement(doc));
    });

    modelElement.appendChild(rootElement);
    doc.appendChild(modelElement);

    return new XMLSerializer().serializeToString(doc);
  }

  addCell(cell: MxCell) {
    this.root.push(cell);
  }

  addCellAfter(cell: MxCell, referenceCellId: string): void {
    const index = this.root.findIndex((c) => c.id === referenceCellId);
    if (index !== -1) {
      this.root.splice(index + 1, 0, cell);
    } else {
      this.root.push(cell);
    }
  }

  addCellBefore(cell: MxCell, referenceCellId: string): void {
    const index = this.root.findIndex((c) => c.id === referenceCellId);
    if (index !== -1) {
      this.root.splice(index, 0, cell);
    } else {
      this.root.push(cell);
    }
  }

  findCellById(id: string): MxCell | undefined {
    return this.root.find((cell) => cell.id === id);
  }

  generateNewId(prefix?: string): string {
    const randomPart = Math.random().toString(36).substring(2, 12);
    const numberPart = Math.floor(Math.random() * 1000);
    return `${prefix ?? ""}${randomPart}-${numberPart}`;
  }
}
