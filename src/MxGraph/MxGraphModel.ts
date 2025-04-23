import { Root } from "./Root";

export class MxGraphModel {
  dx?: number;
  dy?: number;
  grid?: number;
  gridSize?: number;
  guides?: number;
  tooltips?: number;
  connect?: number;
  arrows?: number;
  fold?: number;
  page?: number;
  pageScale?: number;
  pageWidth?: number;
  pageHeight?: number;
  math?: number;
  shadow?: number;

  root: Root;

  constructor(attributes: Partial<MxGraphModel> = {}) {
    Object.assign(this, attributes);
    this.root = new Root();
  }

  toXmlString(): string {
    const attrs = [
      this.dx !== undefined && `dx="${this.dx}"`,
      this.dy !== undefined && `dy="${this.dy}"`,
      this.grid !== undefined && `grid="${this.grid}"`,
      this.gridSize !== undefined && `gridSize="${this.gridSize}"`,
      this.guides !== undefined && `guides="${this.guides}"`,
      this.tooltips !== undefined && `tooltips="${this.tooltips}"`,
      this.connect !== undefined && `connect="${this.connect}"`,
      this.arrows !== undefined && `arrows="${this.arrows}"`,
      this.fold !== undefined && `fold="${this.fold}"`,
      this.page !== undefined && `page="${this.page}"`,
      this.pageScale !== undefined && `pageScale="${this.pageScale}"`,
      this.pageWidth !== undefined && `pageWidth="${this.pageWidth}"`,
      this.pageHeight !== undefined && `pageHeight="${this.pageHeight}"`,
      this.math !== undefined && `math="${this.math}"`,
      this.shadow !== undefined && `shadow="${this.shadow}"`
    ]
      .filter(Boolean)
      .join(" ");

    return `<mxGraphModel ${attrs}>${this.root.toXmlString()}</mxGraphModel>`;
  }
}
