import { MxGraphModel } from './MxGraphModel';
import { MxCell } from './MxCell';
import { MxGeometry } from './MxGeometry';
import { UserObject } from './UserObject';
import { ObjectNode } from './ObjectNode';
import { generateDrawioId } from '../utils/drawio';

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
        case 'mxCell': {
          const cell = MxCell.fromElement(child);
          const isLayer = cell.parent === '0';
        
          if (isLayer) {
            const cellId = cell.id || generateDrawioId('layer_');
            const wrapped = new ObjectNode({ id: cellId }, cell);
            builder.model.root.add(wrapped);
        
            builder.layers.push({
              id: cellId,
              label: cell.value || cellId,
              node: wrapped
            });
          } else {
            builder.model.root.add(cell);
          }
        
          break;
        }

        case 'object': {
          const node = ObjectNode.fromElement(child);
          builder.model.root.add(node);
        
          const innerCell = node.cell;
          const isLayer = innerCell?.parent === '0';
            
          if (isLayer) {
            builder.layers.push({
              id: node.id,
              label: child.getAttribute('label') || node.id,
              node
            });
          }
        
          break;
        }

        case 'UserObject':
          builder.model.root.add(UserObject.fromElement(child));
          break;

        default:
          console.warn('Elemento desconhecido em <root>:', child.tagName);
      }
    }

    return builder;
  }

  listLayers(): LayerInfo[] {
    return this.layers;
  }

  addTemplate(id: string, x: number, y: number, layer?: LayerInfo): this {
    const parentId = layer?.id ?? '1';

    const cell = new MxCell({
      id,
      value: 'Novo Template',
      style: 'rounded=1;whiteSpace=wrap;html=1;',
      vertex: 1,
      parent: parentId
    });

    cell.setGeometry(new MxGeometry({ x, y, width: 100, height: 40 }));
    this.model.root.add(cell);
    return this;
  }

  createTaggedTemplate(
    id: string,
    x: number,
    y: number,
    layer: LayerInfo | undefined,
    tags: string[]
  ): UserObject {
    const parentId = layer?.id ?? '1';
  
    const cell = new MxCell({
      id,
      value: 'Novo Template',
      style: 'rounded=1;whiteSpace=wrap;html=1;',
      vertex: 1,
      parent: parentId
    });
  
    cell.setGeometry(new MxGeometry({ x, y, width: 100, height: 40 }));
  
    return new UserObject(
      {
        id,
        label: '',
        tags: tags.join(' ')
      },
      cell
    );
  }

  
  listTags(): string[] {
    const tags = new Set<string>();
    for (const child of this.model.root.children) {
      if (child instanceof UserObject) {
        child.tags.forEach(tag => tags.add(tag));
      }
    }
    return [...tags];
  }
  
  addTagToUserObject(id: string, tag: string): boolean {
    const userObj = this.model.root.children.find(
      (c): c is UserObject => c instanceof UserObject && c.id === id
    );
    if (!userObj) return false;
    userObj.addTag(tag);
    return true;
  }
  
  removeTagFromUserObject(id: string, tag: string): boolean {
    const userObj = this.model.root.children.find(
      (c): c is UserObject => c instanceof UserObject && c.id === id
    );
    if (!userObj) return false;
    userObj.removeTag(tag);
    return true;
  }

  wrapAsUserObject(id: string, cell: MxCell, options?: { tags?: string[] }): UserObject {
    return new UserObject({
      id,
      label: '',
      tags: options?.tags?.join(' '),
    }, cell);
  }
  

  toXmlString(): string {
    return this.model.toXmlString();
  }
}
