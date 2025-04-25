import { MxCell } from "./MxCell";

export class Root {
  cells: MxCell[] = [];

  constructor(cells: MxCell[] = []) {
    this.cells = cells;
  }

  add(cell: MxCell) {
    this.cells.push(cell);
  }

  remove(cell: MxCell) {
    const index = this.cells.indexOf(cell);
    if (index !== -1) {
      this.cells.splice(index, 1);
    }
  }

  toXml(doc: Document): Element {
    const root = doc.createElement("root");
    this.cells.forEach((cell) => root.appendChild(cell.toElement(doc)));
    return root;
  }
}
