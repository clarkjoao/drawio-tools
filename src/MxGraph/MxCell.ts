import { MxGeometry } from './MxGeometry';

export type MxCellChild = { toXmlString: () => string } | string;

export class MxCell {
  id?: string;
  label?: string;
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
    // if id is 0, is default layer
    // if parent is 0, is default layer
    if(attributes.id === '0' || attributes.parent === '0') {
      attributes.isLayer = true;
    }

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
      cell.isLayer = false; // Set isLayer to false if geometry is present
    }

    return cell;
  }

  setGeometry(geometry: MxGeometry) {
    if(this.isLayer){
      throw new Error('Cannot set geometry for a layer cell');
    }

    this.geometry = geometry;
  }

  addChild(child: MxCellChild) {
    if (this.isLayer) {
      throw new Error('Cannot add child to a layer cell');
    }
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
