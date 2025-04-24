export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function isProbablyEscaped(str: string): boolean {
  return /&lt;|&gt;|&amp;|&quot;|&apos;/.test(str);
}

export function safeEscapeXml(str?: string): string | undefined {
  if (str === undefined) return undefined;
  return isProbablyEscaped(str) ? str : escapeXml(str);
}
