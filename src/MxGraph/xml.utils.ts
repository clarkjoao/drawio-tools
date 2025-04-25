export class XmlUtils {
  static escapeString(value: string): string {
    if (value == null) return "";

    if (/&(?:amp|lt|gt|quot|apos|#\w+);/.test(value)) {
      return value;
    }

    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
      .replace(/\n/g, "&#xa;");
  }

  static unescapeString(value: string): string {
    if (value == null) return "";

    return value
      .replace(/&#xa;/g, "\n")
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&gt;/g, ">")
      .replace(/&lt;/g, "<")
      .replace(/&amp;/g, "&");
  }

  static needsEscaping(value: string): boolean {
    if (value == null || value === "") return false;
    return /[<>&"'\n]/.test(value) && !/&(?:amp|lt|gt|quot|apos|#\w+);/.test(value);
  }
}
