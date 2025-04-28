import { XmlUtils } from "./xml.utils";

export class UserObject {
  id?: string;
  label?: string;
  link?: string;
  tags?: string;
  tooltip?: string;
  placeholder?: string;
  type?: string;
  description?: string;
  customAttributes: Record<string, string>;

  constructor(props: Partial<UserObject> = {}) {
    this.id = props.id;
    this.label = props.label;
    this.link = props.link;
    this.tags = props.tags;
    this.tooltip = props.tooltip;
    this.placeholder = props.placeholder;
    this.type = props.type;
    this.description = props.description;
    this.customAttributes = props.customAttributes || {};
  }

  static fromElement(el: Element): UserObject {
    const user = new UserObject({
      id: el.getAttribute("id") || undefined,
      label: XmlUtils.unescapeString(el.getAttribute("label") || ""),
      link: el.getAttribute("link") || undefined,
      tags: el.getAttribute("tags") || undefined,
      tooltip: el.getAttribute("tooltip") || undefined,
      placeholder: XmlUtils.unescapeString(el.getAttribute("placeholder") || ""),
      type: el.getAttribute("type") || undefined,
      description: el.getAttribute("description") || undefined,
      customAttributes: {}
    });

    Array.from(el.attributes).forEach((attr) => {
      if (
        !["id", "label", "link", "tags", "tooltip", "placeholder", "type", "description"].includes(
          attr.name
        )
      ) {
        user.customAttributes[attr.name] = attr.value;
      }
    });

    return user;
  }

  toUserObjectElement(doc: Document): Element {
    const userEl = doc.createElement("UserObject");

    Object.entries(this.customAttributes).forEach(([k, v]) => {
      userEl.setAttribute(k, XmlUtils.escapeString(v));
    });

    userEl.setAttribute("label", XmlUtils.escapeString(this.label ?? ""));
    if (this.link) userEl.setAttribute("link", XmlUtils.escapeString(this.link));
    if (this.tags) userEl.setAttribute("tags", XmlUtils.escapeString(this.tags));
    if (this.tooltip) userEl.setAttribute("tooltip", XmlUtils.escapeString(this.tooltip));
    if (this.placeholder)
      userEl.setAttribute("placeholder", XmlUtils.escapeString(this.placeholder));
    if (this.type) userEl.setAttribute("type", XmlUtils.escapeString(this.type));
    if (this.description)
      userEl.setAttribute("description", XmlUtils.escapeString(this.description));

    if (this.id) userEl.setAttribute("id", this.id);

    return userEl;
  }
}
