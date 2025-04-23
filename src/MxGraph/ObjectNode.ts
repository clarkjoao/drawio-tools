import { MxCell } from "./MxCell";

export class ObjectNode {
  id!: string;
  label?: string;
  cell!: MxCell;

  constructor(attributes: Partial<ObjectNode>) {
    // if id is 0, is default layer
    Object.assign(this, attributes);
  }

  static fromElement(el: Element): ObjectNode {
    const id = el.getAttribute("id") || "";
    const label = el.getAttribute("label") || undefined;
    const cellEl = el.getElementsByTagName("mxCell")[0];

    const cell = MxCell?.fromElement(cellEl);

    if (cell.isLayer) {
      cell.id = ""; // remove id from cell because it is a layer and have a object wrapped
    }

    return new ObjectNode({ id, cell, label });
  }

  setCell(cell: MxCell) {
    this.cell = cell;
  }

  toXmlString(): string {
    // Remove the id from the cell if it matches the object node's id and the cell's parent is '0'
    if (this.id === this.cell.id && this.cell.parent === "0") {
      this.cell.id = undefined;
      this.cell.isLayer = true;
    }

    return `<object id="${this.id}">${this.cell.toXmlString()}</object>`;
  }
}
