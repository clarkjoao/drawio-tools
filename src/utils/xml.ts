export function formatXml(xml: string): string {
  try {
    const xmlDoc = new DOMParser().parseFromString(xml, "application/xml");
    const xsltDoc = new DOMParser().parseFromString(
      `
        <xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
          <xsl:output method="xml" indent="yes"/>
          <xsl:strip-space elements="*"/>
          <xsl:template match="node()|@*">
            <xsl:copy>
              <xsl:apply-templates select="node()|@*"/>
            </xsl:copy>
          </xsl:template>
        </xsl:stylesheet>
      `,
      "application/xml"
    );

    const processor = new XSLTProcessor();
    processor.importStylesheet(xsltDoc);
    const resultDoc = processor.transformToDocument(xmlDoc);
    const resultXml = new XMLSerializer().serializeToString(resultDoc);
    return resultXml;
  } catch (e) {
    alert("Erro ao formatar XML: " + (e as Error).message);
    return xml;
  }
}

export async function calculateHash(xml: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(xml);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return hashHex;
}
