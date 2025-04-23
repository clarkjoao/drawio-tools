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
