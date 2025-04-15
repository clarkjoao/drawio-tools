import { MxGeometry } from './MxGeometry';

export type MxCellChild = { toXmlString: () => string } | string;

export class MxCell {
  id?: string;
  value?: string;
  style?: string;
  parent?: string;
  vertex?: number;
  edge?: number;
  source?: string;
  target?: string;
  connectable?: number;

  isLayer: boolean = false;

  geometry?: MxGeometry;
  children: MxCellChild[] = [];

  constructor(attributes: Partial<MxCell>) {
    Object.assign(this, attributes);
  }

  static fromElement(el: Element): MxCell {
    const attrs: Record<string, any> = {};
    for (const attr of el.attributes) {
      attrs[attr.name] = attr.value;
    }

    const cell = new MxCell(attrs);

    const geometryEl = el.getElementsByTagName('mxGeometry')[0];
    if (geometryEl) {
      cell.setGeometry(MxGeometry.fromElement(geometryEl));
    }

    return cell;
  }

  setGeometry(geometry: MxGeometry) {
    this.geometry = geometry;
  }

  addChild(child: MxCellChild) {
    this.children.push(child);
  }

  toXmlString(): string {
    const attrs = [
      this.id && `id="${this.id}"`,
      this.value !== undefined && `value="${this.value}"`,
      this.style && `style="${this.style}"`,
      this.parent && `parent="${this.parent}"`,
      this.vertex !== undefined && `vertex="${this.vertex}"`,
      this.edge !== undefined && `edge="${this.edge}"`,
      this.source && `source="${this.source}"`,
      this.target !== undefined && `target="${this.target}"`,
      this.connectable !== undefined && `connectable="${this.connectable}"`
    ].filter(Boolean).join(' ');

    const geometryXml = this.geometry?.toXmlString() || '';
    const childrenXml = this.children
      .map(child => typeof child === 'string' ? child : child.toXmlString())
      .join('');

    return `<mxCell ${attrs}>${geometryXml}${childrenXml}</mxCell>`;
  }
}
