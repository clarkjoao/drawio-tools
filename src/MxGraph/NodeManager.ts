import { cloneMxCell, cloneUserObject, cloneWrapper } from "./graph.utils";
import { MxBuilder } from "./MxBuilder";

export const NodeManager = (builder: MxBuilder) => ({
  addTag(nodeId: string, tag: string) {
    const userObj = builder.ensureUserObject(nodeId);
    userObj.addTag(tag);
  },

  removeTag(nodeId: string, tag: string) {
    const userObj = builder.ensureUserObject(nodeId);
    userObj.removeTag(tag);
  },

  setLink(nodeId: string, link: string) {
    const userObj = builder.ensureUserObject(nodeId);
    userObj.setLink(link);
  },

  clearLink(nodeId: string) {
    const userObj = builder.ensureUserObject(nodeId);
    userObj.setLink("");
  },

  removeLayer(layerId: string) {
    const allNodes = builder.listNodes();
    for (const node of allNodes) {
      if (node.cell.parent === layerId) {
        if (node.wrapper) builder.model.root.remove(node.wrapper.id);
        if (node.cell.id) {
          builder.model.root.remove(node.cell.id);
        }
      }
    }
    builder.model.root.remove(layerId);
  },

  updateNodeId(oldId: string, newId: string) {
    const node = builder.getNode(oldId);
    if (!node) return;

    node.cell.id = newId;
    if (node.wrapper) node.wrapper.id = newId;

    const allNodes = builder.listNodes();
    for (const other of allNodes) {
      if (other.cell.parent === oldId) {
        other.cell.parent = newId;
      }
    }
  },

  moveNodeToLayer(nodeId: string, targetLayerId: string) {
    const node = builder.getNode(nodeId);
    if (!node) return;
    node.cell.parent = targetLayerId;
  },

  cloneNode(nodeId: string, newId: string) {
    const original = builder.getNode(nodeId);
    if (!original) return;

    const clonedCell = cloneMxCell(original.cell);
    clonedCell.id = newId;
    builder.model.root.add(clonedCell);

    if (original.wrapper) {
      const clonedWrapper = cloneWrapper(original.wrapper, clonedCell, newId);
      builder.model.root.add(clonedWrapper);
    }
  },

  getChildrenOf(parentId: string) {
    return builder.listNodes().filter((n) => n.cell.parent === parentId);
  },

  hideNode(nodeId: string) {
    const node = builder.getNode(nodeId);
    if (!node) return;
    node.cell.style = `${node.cell.style};visible=0`;
  },

  showNode(nodeId: string) {
    const node = builder.getNode(nodeId);
    if (!node) return;
    if (node.cell.style) {
      node.cell.style = node.cell.style.replace(/visible=0/g, "visible=1");
    } else {
      node.cell.style = "visible=1";
    }
  }
});
