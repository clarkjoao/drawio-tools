import { MxCell } from "./MxCell";

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
    if (attributes.link) {
      this.link = this.serializeLink(attributes.link);
    }
    Object.assign(this, attributes);
  }

  static fromElement(el: Element): UserObject {
    const id = el.getAttribute("id") || "";
    const label = el.getAttribute("label") || "";
    const link = el.getAttribute("link") || undefined;
    const cellEl = el.getElementsByTagName("mxCell")[0];
    const cell = cellEl ? MxCell.fromElement(cellEl) : new MxCell({});
    const tagsString = el.getAttribute("tags") || "";
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
      const raw = this.link.slice(17).replace(/&quot;/g, '"');
      return JSON.parse(raw);
    } catch {
      return { actions: [] };
    }
  }

  addAction(action: Action) {
    const data = this.getParsedLink();
    if (!data.actions) data.actions = [];
    data.actions.push(action);
    this.link = this.serializeLink(JSON.stringify(data));
  }

  serializeLink(link: string): string {
    if (!link) return "";

    const alreadyEscaped = /data:action\/json,.*&quot;.*&quot;/.test(link);
    if (alreadyEscaped) return link;

    if (link.startsWith("http") || link.startsWith("https")) {
      return link;
    }

    const prefix = "data:action/json,";
    if (link.startsWith(prefix)) {
      const jsonPart = link.slice(prefix.length);
      const escapedJson = jsonPart.replace(/"/g, "&quot;");
      return `${prefix}${escapedJson}`;
    }

    const escapedJson = link.replace(/"/g, "&quot;");
    return `${prefix}${escapedJson}`;
  }

  toXmlString(): string {
    const escapeXml = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const attrs = [
      this.label !== undefined && `label="${escapeXml(this.label)}"`,
      this.link && `link="${this.serializeLink(this.link)}"`,
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
