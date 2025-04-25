import { MxCell } from "./MxCell";
import { MxStyle } from "./MxStyle";

export type LinkAction = {
  type: string;
  [key: string]: any;
};

export class UserObject {
  id: string;
  label: string;
  tags: Set<string> = new Set();
  link?: string;
  cell?: MxCell;

  constructor(attrs: { id: string; label: string; tags?: string; link?: string }, cell?: MxCell) {
    this.id = attrs.id;
    this.label = attrs.label;
    if (attrs.tags) this.setTagsFromString(attrs.tags);
    if (attrs.link) this.link = this.escapeXml(attrs.link);
    this.cell = cell;
  }

  setLink(link: string | LinkAction): this {
    if (typeof link === "string") {
      this.setUrlLink(link);
    } else {
      this.setActionLink(link);
    }
    return this;
  }

  private setUrlLink(url: string): void {
    if (!this.isValidUrl(url)) {
      throw new Error(`Invalid URL: ${url}. Must start with http:// or https://`);
    }
    this.link = this.escapeXml(url);
    this.updateCellLink();
  }

  private setActionLink(action: LinkAction): void {
    this.link = this.escapeXml(this.serializeAction(action));
    this.updateCellLink();
  }

  private updateCellLink(): void {
    if (this.cell) {
      this.cell.style ??= new MxStyle();
      this.cell.style.set("link", this.link || "");
    }
  }

  private escapeXml(unsafe: string): string {
    return unsafe.replace(
      /[<>&'"]/g,
      (c) =>
        ({
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          "'": "&apos;",
          '"': "&quot;"
        })[c] || c
    );
  }

  private unescapeXml(safe: string): string {
    return safe
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"');
  }

  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  private serializeAction(action: LinkAction): string {
    return `action:${JSON.stringify(action)}`;
  }

  static parseActionLink(link: string): LinkAction | null {
    if (!link.startsWith("action:")) return null;
    try {
      return JSON.parse(link.slice(7));
    } catch {
      return null;
    }
  }

  getAction(): LinkAction | null {
    if (!this.link || !this.link.startsWith("action:")) return null;
    try {
      return UserObject.parseActionLink(this.unescapeXml(this.link));
    } catch {
      return null;
    }
  }

  getUrl(): string | null {
    if (!this.link || this.link.startsWith("action:")) return null;
    return this.unescapeXml(this.link);
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

  setCell(cell: MxCell) {
    this.cell = cell;
  }

  toXmlString(): string {
    const attrs = [
      `id="${this.id}"`,
      `label="${this.escapeXml(this.label)}"`,
      this.tags.size > 0 && `tags="${this.getTagsAsString()}"`,
      this.link && `link="${this.link}"`
    ]
      .filter(Boolean)
      .join(" ");

    if (this.cell?.id === this.id) {
      this.cell.id = undefined;
    }

    return `<UserObject ${attrs}>${this.cell?.toXmlString() || ""}</UserObject>`;
  }

  static fromElement(el: Element): UserObject {
    const id = el.getAttribute("id") || "";
    const label = el.getAttribute("label") || "";
    const tags = el.getAttribute("tags") || undefined;
    const link = el.getAttribute("link") || undefined;

    const cellEl = el.getElementsByTagName("mxCell")[0];
    const cell = cellEl ? MxCell.fromElement(cellEl) : undefined;

    return new UserObject({ id, label, tags, link }, cell);
  }
}
