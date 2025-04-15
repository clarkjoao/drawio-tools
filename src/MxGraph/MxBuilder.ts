import { MxGraphModel } from './MxGraphModel';
import { MxCell } from './MxCell';
import { MxGeometry } from './MxGeometry';
import { MxPoint } from './MxPoint';
import { UserObject } from './UserObject';
import { ObjectNode } from './ObjectNode';

export class MxBuilder {
  model: MxGraphModel;

  constructor(model?: MxGraphModel) {
    this.model = model || new MxGraphModel();
  }

  static fromXml(xml: string): MxBuilder {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const graphModelElement = doc.getElementsByTagName('mxGraphModel')[0];
    const rootElement = graphModelElement.getElementsByTagName('root')[0];

    const attrs: Record<string, any> = {};
    for (const attr of graphModelElement.attributes) {
      attrs[attr.name] = attr.value;
    }

    const builder = new MxBuilder(new MxGraphModel(attrs));

    for (const child of rootElement.children) {
      switch (child.tagName) {
        case 'mxCell':
          builder.model.root.add(MxCell.fromElement(child));
          break;
        case 'UserObject':
          builder.model.root.add(UserObject.fromElement(child));
          break;
        case 'object':
          builder.model.root.add(ObjectNode.fromElement(child));
          break;
        default:
          console.warn('Elemento desconhecido em <root>:', child.tagName);
      }
    }
    debugger;
    return builder;
  }

  addTemplate(id: string, x: number, y: number): this {
    const cell = new MxCell({
      id,
      value: 'Novo Template',
      style: 'rounded=1;whiteSpace=wrap;html=1;',
      vertex: 1,
      parent: '1'
    });
    cell.setGeometry(new MxGeometry({ x, y, width: 100, height: 40 }));
    this.model.root.add(cell);
    return this;
  }

  toXmlString(): string {
    return this.model.toXmlString();
  }
}
