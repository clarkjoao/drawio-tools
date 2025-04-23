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
  }
});