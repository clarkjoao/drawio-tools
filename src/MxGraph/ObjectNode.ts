import { MxCell } from "./MxCell";

export class ObjectNode {
  id: string;
  cell: MxCell;

  constructor(attrs: { id: string }, cell: MxCell) {
    this.id = attrs.id;
    this.cell = cell;
  }

  static fromElement(el: Element): ObjectNode {
    const id = el.getAttribute("id") || "";
    const cellEl = el.getElementsByTagName("mxCell")[0];
    const cell = MxCell.fromElement(cellEl);
    return new ObjectNode({ id }, cell);
  }

  setCell(cell: MxCell) {
    this.cell = cell;
  }

  toXmlString(): string {
    if (this.id === this.cell.id && this.cell.parent === "0") {
      this.cell.id = undefined;
      this.cell.isLayer = true;
    }

    return `<object id="${this.id}">${this.cell.toXmlString()}</object>`;
  }
}
