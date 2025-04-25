import { MxAlign, MxOverflow, MxShape, MxVerticalAlign, MxWhiteSpace } from "./mx.types";

export class MxStyle {
  shape?: MxShape;
  perimeter?: string;
  html?: "0" | "1";
  whiteSpace?: MxWhiteSpace;
  overflow?: MxOverflow;
  rounded?: "0" | "1";
  fillColor?: string;
  strokeColor?: string;
  fontSize?: string;
  fontColor?: string;
  align?: MxAlign;
  verticalAlign?: MxVerticalAlign;

  custom: Record<string, string> = {};

  private static readonly knownAttributes = [
    "shape",
    "perimeter",
    "html",
    "whiteSpace",
    "overflow",
    "rounded",
    "fillColor",
    "strokeColor",
    "fontSize",
    "fontColor",
    "align",
    "verticalAlign"
  ] as const;

  constructor(
    props: Partial<Record<(typeof MxStyle.knownAttributes)[number] | string, string>> = {}
  ) {
    for (const [key, value] of Object.entries(props)) {
      if ((MxStyle.knownAttributes as readonly string[]).includes(key)) {
        (this as any)[key] = value;
      } else if (value !== undefined) {
        this.custom[key] = value;
      }
    }
  }

  static parse(styleStr: string): MxStyle {
    const style = new MxStyle();
    if (!styleStr) return style;

    const pairs = styleStr.split(";").filter(Boolean);

    for (const pair of pairs) {
      const [rawKey, rawValue] = pair.split("=");
      const key = rawKey.trim();
      const value = (rawValue ?? "").trim();

      if ((MxStyle.knownAttributes as readonly string[]).includes(key)) {
        (style as any)[key] = value;
      } else {
        style.custom[key] = value;
      }
    }

    return style;
  }

  static stringify(style: MxStyle): string {
    const entries: string[] = [];

    for (const key of MxStyle.knownAttributes) {
      const value = style[key];
      if (value !== undefined) {
        entries.push(`${key}=${value}`);
      }
    }

    for (const [key, value] of Object.entries(style.custom)) {
      entries.push(value === "" ? key : `${key}=${value}`);
    }

    return entries.join(";");
  }
}
