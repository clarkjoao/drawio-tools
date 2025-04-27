import { MxBuilder } from "@/MxGraph/MxBuilder";

export class GraphService {
  private builder: MxBuilder;

  constructor(builder: MxBuilder) {
    this.builder = builder;
  }

  static fromXml(xml: string): GraphService {
    const builder = MxBuilder.fromXml(xml);
    return new GraphService(builder);
  }

  idExists(id: string): boolean {
    const model = this.builder.getModel();
    return model.root.some((cell) => cell.id === id);
  }

  addLayer(name: string) {
    this.builder.addLayer(name);
  }

  addNode(props: {
    value: string;
    x: number;
    y: number;
    width: number;
    height: number;
    style?: Record<string, string>;
    parent?: string;
  }) {
    this.builder.addNode(props);
  }

  moveNode(nodeId: string, newParentId: string) {
    const model = this.builder.getModel();
    const node = model.findCellById(nodeId);
    if (node) {
      node.parent = newParentId;
    }
  }

  updateNodeValue(nodeId: string, newValue: string) {
    const model = this.builder.getModel();
    const node = model.findCellById(nodeId);
    if (node) {
      node.value = newValue;
    }
  }

  updateNodeId(nodeId: string, newId: string) {
    const model = this.builder.getModel();
    const node = model.findCellById(nodeId);
    if (node) {
      node.id = newId;
    }
  }

  updateNodeStyle(nodeId: string, newStyle: Record<string, string>) {
    this.builder.updateNodeStyle(nodeId, newStyle);
  }

  validateGraph(): string[] {
    const errors: string[] = [];
    const model = this.builder.getModel();
    const ids = new Set<string>();

    for (const cell of model.root) {
      if (!cell.id) {
        errors.push("Found a cell without ID.");
        continue;
      }

      if (ids.has(cell.id)) {
        errors.push(`Duplicate ID found: ${cell.id}`);
      } else {
        ids.add(cell.id);
      }

      if (cell.vertex === "1" && cell.edge === "1") {
        errors.push(`Cell ${cell.id} cannot be both vertex and edge.`);
      }

      if (cell.edge === "1" && (!cell.source || !cell.target)) {
        errors.push(`Edge ${cell.id} must have both source and target.`);
      }

      if (cell.parent && !model.findCellById(cell.parent)) {
        errors.push(`Cell ${cell.id} references non-existing parent ${cell.parent}.`);
      }
    }

    return errors;
  }

  toXml(): string {
    return this.builder.toXml();
  }
}
