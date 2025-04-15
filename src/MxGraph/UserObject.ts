import { MxCell } from './MxCell';

export class UserObject {
  id: string;
  label?: string;
  link?: string;
  cell: MxCell;

  constructor(attrs: { id: string; label?: string; link?: string }, cell: MxCell) {
    this.id = attrs.id;
    this.label = attrs.label;
    this.link = attrs.link;
    this.cell = cell;
  }

  static fromElement(el: Element): UserObject {
    const id = el.getAttribute('id') || '';
    const label = el.getAttribute('label') || '';
    const link = el.getAttribute('link') || '';
    const cellEl = el.getElementsByTagName('mxCell')[0];
    const cell = MxCell.fromElement(cellEl);
    return new UserObject({ id, label, link }, cell);
  }

  setCell(cell: MxCell) {
    this.cell = cell;
  }

  toXmlString(): string {
    const attrs = [`id="${this.id}"`];
    if (this.label) attrs.push(`label="${this.label}"`);
    if (this.link) attrs.push(`link="${this.link}"`);

    return `<UserObject ${attrs.join(' ')}>${this.cell.toXmlString()}</UserObject>`;
  }
}
