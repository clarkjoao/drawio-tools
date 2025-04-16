import { MxCell } from './MxCell';

export class UserObject {
  id: string;
  label: string;
  tags: Set<string> = new Set();
  link?: string;
  cell?: MxCell;

  constructor(attrs: { id: string; label: string; tags?: string; link?: string }, cell?: MxCell) {
    this.id = attrs.id;
    this.label = attrs.label;
    this.link = attrs.link;
    if (attrs.tags) {
      this.setTagsFromString(attrs.tags);
    }
    this.cell = cell;
  }

  static fromElement(el: Element): UserObject {
    const id = el.getAttribute('id') || '';
    const label = el.getAttribute('label') || '';
    const tags = el.getAttribute('tags') || undefined;
    const link = el.getAttribute('link') || undefined;

    const cellEl = el.getElementsByTagName('mxCell')[0];
    const cell = MxCell.fromElement(cellEl);

    return new UserObject({ id, label, tags, link }, cell);
  }

  setTagsFromString(tags: string) {
    tags.split(/\s+/).forEach(tag => this.tags.add(tag.trim()));
  }

  getTagsAsString(): string {
    return [...this.tags].join(' ');
  }

  addTag(tag: string) {
    this.tags.add(tag);
  }

  removeTag(tag: string) {
    this.tags.delete(tag);
  }

  hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  setCell(cell: MxCell) {
    this.cell = cell;
  }

  toXmlString(): string {
    const attrs = [
      `id="${this.id}"`,
      `label="${this.label}"`,
      this.tags.size > 0 && `tags="${this.getTagsAsString()}"`,
      this.link && `link="${this.link}"`
    ].filter(Boolean).join(' ');

    if (this.cell?.id === this.id) {
      this.cell.id = undefined;
    }

    return `<UserObject ${attrs}>${this.cell?.toXmlString() || ''}</UserObject>`;
  }
}
