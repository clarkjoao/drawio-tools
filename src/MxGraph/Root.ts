export class Root {
  children: any[] = [];

  add(element: any) {
    this.children.push(element);
  }

  toXmlString(): string {
    const childrenXml = this.children.map(c =>
      typeof c.toXmlString === 'function' ? c.toXmlString() : ''
    ).join('');
    return `<root>${childrenXml}</root>`;
  }
  
}
