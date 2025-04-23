export class Root {
  children: any[] = [];

  add(element: any) {
    this.children.push(element);
  }

  remove(id: string) {
    this.children = this.children.filter((child) => child.id !== id);
  }

  get(id: string) {
    return this.children.find((child) => child.id === id);
  }

  toXmlString(): string {
    const childrenXml = this.children
      .map((c) => (typeof c.toXmlString === "function" ? c.toXmlString() : ""))
      .join("");
    return `<root>${childrenXml}</root>`;
  }
}
