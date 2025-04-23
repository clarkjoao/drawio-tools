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
    Object.assign(this, attributes);
  }

  static fromElement(el: Element): UserObject {
    const id = el.getAttribute("id") || "";
    const label = el.getAttribute("label") || "";
    const link = el.getAttribute("link") || undefined;
    const cellEl = el.getElementsByTagName("mxCell")[0];
    const cell = MxCell.fromElement(cellEl);
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
    this.link = UserObject.serializeLink(data);
  }

  static serializeLink(data: { title?: string; actions: Action[] }): string {
    const json = JSON.stringify(data);
    const escaped = json.replace(/"/g, "&quot;");
    return `data:action/json,${escaped}`;
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
      this.link && `link="${this.link}"`,
      this.tags.size > 0 && `tags="${escapeXml(this.getTagsAsString())}"`,
      `id="${escapeXml(this.id)}"`
    ]
      .filter(Boolean)
      .join(" ");

    // Remove ID duplicado na célula se for o mesmo do UserObject
    if (this.cell?.id === this.id) {
      this.cell.id = undefined;
    }

    return `<UserObject ${attrs}>${this.cell?.toXmlString() || ""}</UserObject>`;
  }
}
