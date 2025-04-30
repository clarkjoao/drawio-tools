import { MxGraphModel } from "./MxGraphModel";
import { MxCell } from "./MxCell";
import { MxGeometry } from "./MxGeometry";
import { MxStyle } from "./MxStyle";
import { XmlUtils } from "./xml.utils";
import { ObjectWrapper } from "./ObjectWrapper";

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

  get rootLayerId(): string {
    return this.model.rootLayer?.id || "0";
  }

  addLayer(name: string): MxCell {
    const id = this.model.generateNewId("layer-");

    const layer = new MxCell({
      id,
      value: name,
      parent: this.model.rootLayerId || "0",
      style: new MxStyle({
        locked: "1"
      })
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

    const userObject = new ObjectWrapper({
      label: props.value,
      customAttributes: {}
    });

    const cell = new MxCell({
      id,
      style: props.style ? new MxStyle(props.style) : undefined,
      parent: props.parent,
      vertex: "1",
      children: geometry,
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
      children: geometry
    });

    this.model.addCell(group);
    return this;
  }

  moveNode(id: string, targetId: string): this {
    const node = this.model.findCellById(id);
    const targetNode = this.model.findCellById(targetId);

    if (!node) {
      throw new Error(`Node with id ${id} not found.`);
    }

    if (!targetNode) {
      throw new Error(`New parent with id ${targetId} not found.`);
    }

    const rootLayerId = this.model.rootLayer?.id || "0";
    if (!targetNode.isLayer(rootLayerId) && !targetNode.isGroup) {
      throw new Error(`New parent (id ${targetId}) is neither a layer nor a group.`);
    }

    node.parent = targetId;
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
      //TODO: FIX here
      children: original.children ? new MxGeometry({ ...original.children } as any) : undefined
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

  listNodes(layerId?: string): MxCell[] {
    return this.model.root.filter((cell) => {
      const isVisualNode = cell.isVertex || cell.isEdge;
      const notLayer = !cell.isLayer && !cell.isLayerRoot;
      const correctLayer = layerId ? cell.parent === layerId : true;
      return isVisualNode && notLayer && correctLayer;
    });
  }

  listLayers(): MxCell[] {
    const rootId = this.model.root[0].id;

    return this.model.root.filter((cell) => cell.isLayer(rootId) && !cell.isLayerRoot(rootId));
  }

  listGroups(): MxCell[] {
    return this.model.root.filter((cell) => cell.isGroup);
  }

  listTags(): string[] {
    const tags = this.model.root
      .filter((cell) => cell.wrapper)
      .filter((cell) => cell.wrapper && Array.isArray(cell.wrapper.tags))
      .flatMap((cell) => cell.wrapper?.tags || []);

    return Array.from(new Set(tags));
  }

  findCellsByTag(tag: string): MxCell[] {
    return this.model.root.filter((cell) => cell.wrapper?.tags?.includes(tag));
  }

  toXml(): string {
    return XmlUtils.autoFixEscapes(this.model.toXml());
  }
}
