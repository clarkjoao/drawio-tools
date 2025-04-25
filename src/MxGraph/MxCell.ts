import { MxGeometry } from "./MxGeometry";
import { ObjectNode } from "./ObjectNode";
import { UserObject } from "./UserObject";
import { XmlUtils } from "./xml.utils";
import { MxStyle } from "./MxStyle";

export class MxCell {
  id?: string;
  value?: string;
  style?: MxStyle;
  vertex?: "0" | "1";
  edge?: "0" | "1";
  parent?: string;
  source?: string;
  target?: string;
  connectable?: "0" | "1";
  collapsed?: "0" | "1";
  geometry?: MxGeometry;
  wrapper?: UserObject | ObjectNode;

  constructor(props: Partial<MxCell> = {}) {
    if (props.style && !(props.style instanceof MxStyle)) {
      throw new Error("Property 'style' must be an instance of MxStyle");
    }

    Object.assign(this, props);

    if (this.vertex === "1" && this.edge === "1") {
      throw new Error(`Cell cannot be both a vertex and an edge (id: ${this.id})`);
    }
  }

  static fromElement(el: Element): MxCell {
    if (el.nodeName === "UserObject" || el.nodeName === "object") {
      const isUserObject = el.nodeName === "UserObject";

      const wrapper = isUserObject ? UserObject.fromElement(el) : ObjectNode.fromElement(el);

      const innerCellEl = Array.from(el.children).find((c) => c.nodeName === "mxCell") as
        | Element
        | undefined;
      if (!innerCellEl) {
        throw new Error(`<${el.nodeName}> is missing an inner <mxCell>`);
      }

      const cell = MxCell.fromElement(innerCellEl);
      cell.wrapper = wrapper;

      // Because the wrapper is a parent of the cell, we need to set the cell's parent to undefined
      cell.id = undefined;

      return cell;
    }

    const styleAttr = el.getAttribute("style") || "";

    const cell = new MxCell({
      id: el.getAttribute("id") || undefined,
      value: el.getAttribute("value") || undefined,
      style: MxStyle.parse(styleAttr),
      vertex: el.getAttribute("vertex") as "0" | "1" | undefined,
      edge: el.getAttribute("edge") as "0" | "1" | undefined,
      parent: el.getAttribute("parent") || undefined,
      source: el.getAttribute("source") || undefined,
      target: el.getAttribute("target") || undefined,
      connectable: el.getAttribute("connectable") as "0" | "1" | undefined,
      collapsed: el.getAttribute("collapsed") as "0" | "1" | undefined
    });

    for (const child of Array.from(el.children)) {
      if (child.nodeName === "mxGeometry") {
        cell.geometry = MxGeometry.fromElement(child);
      }
    }

    return cell;
  }

  get isLayer(): boolean {
    return this.vertex !== "1" && this.edge !== "1" && !this.wrapper;
  }

  get isLayerRoot(): boolean {
    return this.isLayer && this.parent === undefined;
  }

  get isGroup(): boolean {
    return (this.style?.shape === "group" || this.connectable === "0") && this.vertex === "1";
  }

  toElement(doc: Document): Element {
    const cellEl = doc.createElement("mxCell");

    if (this.id) {
      cellEl.setAttribute("id", this.id);
    }

    const safeValue = typeof this.value === "string" ? this.value : String(this.value ?? "");
    cellEl.setAttribute("value", XmlUtils.escapeString(safeValue));

    if (this.style) {
      const styleStr = MxStyle.stringify(this.style);
      if (styleStr.length > 0) {
        cellEl.setAttribute("style", styleStr);
      }
    }

    if (this.vertex) cellEl.setAttribute("vertex", this.vertex);
    if (this.edge) cellEl.setAttribute("edge", this.edge);
    if (this.connectable) cellEl.setAttribute("connectable", this.connectable);
    if (this.collapsed) cellEl.setAttribute("collapsed", this.collapsed);
    if (this.parent) cellEl.setAttribute("parent", this.parent);
    if (this.source) cellEl.setAttribute("source", this.source);
    if (this.target) cellEl.setAttribute("target", this.target);

    if (this.geometry) {
      cellEl.appendChild(this.geometry.toElement(doc));
    }

    if (this.wrapper) {
      const wrapperEl =
        this.wrapper instanceof UserObject
          ? this.wrapper.toUserObjectElement(doc)
          : this.wrapper.toObjectElement(doc);

      wrapperEl.appendChild(cellEl);
      return wrapperEl;
    }

    return cellEl;
  }
}
