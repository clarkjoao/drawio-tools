export type StyleValue = string | number | boolean;

export class MxStyle {
  private styles: Map<string, StyleValue> = new Map();

  constructor(styleString: string = "") {
    this.parse(styleString);
  }

  parse(styleString: string): void {
    styleString.split(";").forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key && value !== undefined) {
        this.styles.set(key.trim(), this.parseValue(value));
      }
    });
  }

  private parseValue(value: string): StyleValue {
    if (value === "true") return true;
    if (value === "false") return false;
    if (!isNaN(Number(value))) return Number(value);
    return value;
  }

  get(key: string): StyleValue | undefined {
    return this.styles.get(key);
  }

  set(key: string, value: StyleValue): void {
    this.styles.set(key, value);
  }

  remove(key: string): boolean {
    return this.styles.delete(key);
  }

  toString(): string {
    return Array.from(this.styles.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join(";");
  }

  merge(style: MxStyle): void {
    style.styles.forEach((value, key) => {
      this.styles.set(key, value);
    });
  }

  clone(): MxStyle {
    const newStyle = new MxStyle();
    this.styles.forEach((value, key) => {
      newStyle.styles.set(key, value);
    });
    return newStyle;
  }
}
