export function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/\n/g, "&#xa;"); // escape de quebra de linha
}

export function escapeJsonForXmlAttribute(json: string): string {
  return json
    .replace(/&/g, "&amp;") // necessário para & em valores
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "&#xa;"); // escape de quebra de linha em JSON também
}

export function unescapeXml(str: string): string {
  return str
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/&#10;/g, "\n"); // desserializa quebra de linha
}

export function isProbablyEscaped(str: string): boolean {
  return /&lt;|&gt;|&amp;|&quot;|&apos;/.test(str);
}

export function safeEscapeXml(str?: string): string | undefined {
  if (str === undefined) return undefined;
  return isProbablyEscaped(str) ? str : escapeXml(str);
}
