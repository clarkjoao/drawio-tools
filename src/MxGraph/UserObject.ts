import { MxCell } from "./MxCell";
import { escapeXml, escapeJsonForXmlAttribute, unescapeXml } from "./xml.utils";

type Action =
  | { open: string }
  | { wait: number }
  | { viewbox: { x: number; y: number; width: number; height: number; border?: number } }
  | { tags: { toggle?: string[]; hidden?: string[]; visible?: string[] } }
  | { [key in DrawioCommand]?: Selector };

type DrawioCommand =
  | "toggle"
  | "show"
  | "hide"
  | "style"
  | "toggleStyle"
  | "opacity"
  | "wipeIn"
  | "wipeOut"
  | "fadeIn"
  | "fadeOut"
  | "highlight"
  | "select"
  | "scroll";

type Selector = {
  cells?: string[];
  excludeCells?: string[];
  tags?: string[];
  key?: string;
  value?: string;
  delay?: number;
  steps?: number;
};

export class UserObject {
  id: string;
  label?: string;
  tags: Set<string> = new Set();
  link?: string;
  cell!: MxCell;

  constructor(attributes: Partial<UserObject>) {
    this.id = attributes.id || "";
    if (typeof attributes.tags === "string") {
      this.setTagsFromString(attributes.tags);
    } else if (attributes.tags instanceof Set) {
      this.tags = attributes.tags;
    }
    if (!attributes.cell) {
      throw new Error("Cell is required");
    }
    if (attributes.cell.id === this.id) {
      attributes.cell.id = ""; // remove id from cell if it is the same as the user object
    }
    Object.assign(this, attributes);
  }

  static fromElement(el: Element): UserObject {
    const id = unescapeXml(el.getAttribute("id") || "");
    const label = unescapeXml(el.getAttribute("label") || "");
    const linkRaw = el.getAttribute("link") || undefined;
    let link: string | undefined = undefined;
    if (linkRaw?.startsWith("data:action/json,")) {
      const jsonPart = linkRaw.slice(17);
      link = `data:action/json,${unescapeXml(jsonPart)}`;
    } else if (linkRaw) {
      link = unescapeXml(linkRaw);
    }
    const cellEl = el.getElementsByTagName("mxCell")[0];
    const cell = cellEl ? MxCell.fromElement(cellEl) : new MxCell({});
    const tagsString = unescapeXml(el.getAttribute("tags") || "");
    const tags = new Set<string>();
    if (tagsString) {
      tagsString.split(/\s+/).forEach((tag) => tags.add(tag.trim()));
    }
    return new UserObject({ id, label, tags, link, cell });
  }

  setTagsFromString(tags: string) {
    tags.split(/\s+/).forEach((tag) => this.tags.add(tag.trim()));
  }

  getTagsAsString(): string {
    return [...this.tags].join(" ");
  }

  addTag(tag: string) {
    this.tags.add(tag);
  }

  removeTag(tag: string) {
    this.tags.delete(tag);
  }

  hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  setLink(link: string) {
    this.link = link;
  }

  getLink(): string | undefined {
    return this.link;
  }

  setCell(cell: MxCell) {
    this.cell = cell;
  }

  getParsedLink(): { title?: string; actions: Action[] } {
    if (!this.link?.startsWith("data:action/json,")) return { actions: [] };
    try {
      const raw = this.link.slice(17);
      return JSON.parse(raw);
    } catch {
      return { actions: [] };
    }
  }

  addAction(action: Action) {
    const data = this.getParsedLink();
    if (!data.actions) data.actions = [];
    data.actions.push(action);
    const json = JSON.stringify(data);
    this.link = `data:action/json,${json}`;
  }

  static serializeLink(data: { title?: string; actions: Action[] }): string {
    const json = JSON.stringify(data);
    return `data:action/json,${escapeJsonForXmlAttribute(json)}`;
  }

  static deserializeLink(link: string): { title?: string; actions: Action[] } {
    if (!link.startsWith("data:action/json,")) return { actions: [] };
    const raw = link.slice(17);
    try {
      const json = decodeURIComponent(raw);
      return JSON.parse(json);
    } catch (e) {
      console.error("Failed to parse link:", e);
      return { actions: [] };
    }
  }

  toXmlString(): string {
    const attrs = [
      this.label !== undefined && `label="${escapeXml(this.label)}"`,
      this.link &&
        (this.link.startsWith("data:action/json,")
          ? `link="data:action/json,${escapeJsonForXmlAttribute(this.link.slice(17))}"`
          : `link="${escapeXml(this.link)}"`),
      this.tags.size > 0 && `tags="${escapeXml(this.getTagsAsString())}"`,
      `id="${escapeXml(this.id)}"`
    ]
      .filter(Boolean)
      .join(" ");

    if (this.cell?.id === this.id) {
      this.cell.id = undefined;
    }

    return `<UserObject ${attrs}>${this.cell?.toXmlString() || ""}</UserObject>`;
  }
}
