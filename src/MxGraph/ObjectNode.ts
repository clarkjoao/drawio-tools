import { XmlUtils } from "./xml.utils";

export class ObjectNode {
  id?: string;
  label?: string;
  link?: string;
  tags?: string;
  tooltip?: string;
  placeholder?: string;
  customAttributes: Record<string, string>;

  constructor(props: Partial<ObjectNode> = {}) {
    this.id = props.id;
    this.label = props.label;
    this.link = props.link;
    this.tags = props.tags;
    this.tooltip = props.tooltip;
    this.placeholder = props.placeholder;
    this.customAttributes = props.customAttributes || {};
  }

  static fromElement(el: Element): ObjectNode {
    const obj = new ObjectNode();
    const knownAttributes = ["id", "label", "link", "tags", "tooltip", "placeholder"];

    Array.from(el.attributes).forEach(({ name, value }) => {
      if (knownAttributes.includes(name)) {
        (obj as any)[name] = XmlUtils.unescapeString(value);
      } else {
        obj.customAttributes[name] = value;
      }
    });

    return obj;
  }

  toObjectElement(doc: Document): Element {
    const el = doc.createElement("object");

    Object.entries(this.customAttributes).forEach(([k, v]) => {
      el.setAttribute(k, XmlUtils.escapeString(v));
    });

    el.setAttribute("label", XmlUtils.escapeString(this.label ?? ""));
    if (this.link) el.setAttribute("link", XmlUtils.escapeString(this.link));
    if (this.tags) el.setAttribute("tags", XmlUtils.escapeString(this.tags));
    if (this.tooltip) el.setAttribute("tooltip", XmlUtils.escapeString(this.tooltip));
    if (this.placeholder) el.setAttribute("placeholder", XmlUtils.escapeString(this.placeholder));

    if (this.id) el.setAttribute("id", this.id);

    return el;
  }
}
