export interface XmlSerializable {
  toXml(doc: Document): Element;
}