export class MxPoint {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static fromObject(obj: { x: number; y: number }): MxPoint {
    return new MxPoint(obj.x, obj.y);
  }

  clone(): MxPoint {
    return new MxPoint(this.x, this.y);
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}
