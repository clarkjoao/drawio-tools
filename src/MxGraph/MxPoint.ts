export class MxPoint {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static fromElement(el: Element): MxPoint {
    const x = parseFloat(el.getAttribute("x") || "0");
    const y = parseFloat(el.getAttribute("y") || "0");
    return new MxPoint(x, y);
  }

  toXmlString(tagName = "mxPoint"): string {
    return `<${tagName} x="${this.x}" y="${this.y}" />`;
  }
}
