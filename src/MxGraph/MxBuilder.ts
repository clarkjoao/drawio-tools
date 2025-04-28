import { MxGraphModel } from "./MxGraphModel";
import { MxCell } from "./MxCell";
import { MxGeometry } from "./MxGeometry";
import { UserObject } from "./UserObject";
import { MxStyle } from "./MxStyle";
import { XmlUtils } from "./xml.utils";

export class MxBuilder {
  private model: MxGraphModel;

  constructor(model?: MxGraphModel) {
    this.model = model ?? new MxGraphModel();
  }

  static create(): MxBuilder {
    return new MxBuilder();
  }

  static fromXml(xml: string): MxBuilder {
    const model = MxGraphModel.fromXml(xml);
    return new MxBuilder(model);
  }

  addLayer(name: string): MxCell {
    const id = this.model.generateNewId();
    const rootCell = this.model.root[0];
    const layer = new MxCell({
      id,
      value: name,
      parent: rootCell.id || "0"
    });
    this.model.addCell(layer);
    return layer;
  }

  addNode(props: {
    value: string;
    x: number;
    y: number;
    width: number;
    height: number;
    style?: Record<string, string>;
    parent?: string;
  }): MxCell {
    const id = this.model.generateNewId();

    const geometry = new MxGeometry({
      x: props.x.toString(),
      y: props.y.toString(),
      width: props.width.toString(),
      height: props.height.toString()
    });

    const userObject = new UserObject({
      label: props.value,
      customAttributes: {}
    });

    const cell = new MxCell({
      id,
      style: props.style ? new MxStyle(props.style) : undefined,
      parent: props.parent,
      vertex: "1",
      geometry,
      wrapper: userObject
    });

    this.model.addCell(cell);
    return cell;
  }

  addEdge(props: {
    sourceId: string;
    targetId: string;
    style?: Record<string, string>;
    parent?: string;
    value?: string;
  }): this {
    const id = this.model.generateNewId();
    const edge = new MxCell({
      id,
      value: props.value,
      style: props.style ? new MxStyle({ ...props.style }) : undefined,
      parent: props.parent,
      edge: "1",
      source: props.sourceId,
      target: props.targetId
    });

    this.model.addCell(edge);
    return this;
  }

  addGroup(props: {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    parent?: string;
  }): this {
    const id = this.model.generateNewId();

    const geometry = new MxGeometry({
      x: props.x.toString(),
      y: props.y.toString(),
      width: props.width.toString(),
      height: props.height.toString()
    });

    const group = new MxCell({
      id,
      value: props.name,
      style: new MxStyle({ shape: "group" }),
      parent: props.parent,
      vertex: "1",
      connectable: "0",
      geometry
    });

    this.model.addCell(group);
    return this;
  }

  moveNode(id: string, newParentId: string): this {
    const node = this.model.findCellById(id);
    const newParent = this.model.findCellById(newParentId);

    if (!node) {
      throw new Error(`Node with id ${id} not found.`);
    }

    if (!newParent) {
      throw new Error(`New parent with id ${newParentId} not found.`);
    }

    if (!newParent.isLayer && !newParent.isGroup) {
      throw new Error(`New parent (id ${newParentId}) is neither a layer nor a group.`);
    }

    node.parent = newParentId;
    return this;
  }

  removeNode(id: string): this {
    this.model.root = this.model.root.filter((cell) => cell.id !== id && cell.parent !== id);
    return this;
  }

  cloneNode(id: string, newParentId: string): this {
    const original = this.model.findCellById(id);
    if (!original) return this;

    const newId = this.model.generateNewId();
    const clone = new MxCell({
      ...original,
      id: newId,
      parent: newParentId,
      geometry: original.geometry ? new MxGeometry({ ...original.geometry }) : undefined
    });

    this.model.addCell(clone);
    return this;
  }

  updateNodeStyle(id: string, styleUpdates: Record<string, string>): this {
    const node = this.model.findCellById(id);
    if (!node) return this;
    node.style = new MxStyle({
      ...(node.style?.toObject() ?? {}),
      custom: { ...(node.style?.custom ?? {}) },
      ...styleUpdates
    });
    return this;
  }

  findNodeByValue(value: string): MxCell | undefined {
    return this.model.root.find((cell) => cell.value === value);
  }

  getModel(): MxGraphModel {
    return this.model;
  }

  listLayers(): MxCell[] {
    return this.model.root.filter((cell) => cell.isLayer).filter((cell) => !cell.isLayerRoot);
  }

  listGroups(): MxCell[] {
    return this.model.root.filter((cell) => cell.isGroup);
  }

  toXml(): string {
    return XmlUtils.autoFixEscapes(this.model.toXml());
  }
}
