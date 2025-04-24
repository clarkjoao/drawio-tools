import { MxPoint } from "./MxPoint";

export class MxGeometry {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  relative?: number;
  as: string = "geometry";
  points: MxPoint[] = [];

  constructor(attrs: Partial<MxGeometry> = {}) {
    Object.assign(this, attrs);
  }

  static fromElement(el: Element): MxGeometry {
    const attrs: any = {};
    for (const attr of el?.attributes) {
      attrs[attr.name] = attr.value;
    }

    const geometry = new MxGeometry(attrs);

    const array = el.querySelector('Array[as="points"]');
    if (array) {
      for (const pt of array.getElementsByTagName("mxPoint")) {
        geometry.points.push(MxPoint.fromElement(pt));
      }
    }

    return geometry;
  }

  addPoint(p: MxPoint) {
    this.points.push(p);
  }

  toXmlString(): string {
    let attrs = `as="${this.as}"`;
    if (this.x !== undefined) attrs += ` x="${this.x}"`;
    if (this.y !== undefined) attrs += ` y="${this.y}"`;
    if (this.width !== undefined) attrs += ` width="${this.width}"`;
    if (this.height !== undefined) attrs += ` height="${this.height}"`;
    if (this.relative !== undefined) attrs += ` relative="${this.relative}"`;

    let points = "";
    if (this.points?.length) {
      const pointsXml = this.points.map((p) => p.toXmlString()).join("");
      points = `<Array as="points">${pointsXml}</Array>`;
    }

    return `<mxGeometry ${attrs}>${points}</mxGeometry>`;
  }
}
