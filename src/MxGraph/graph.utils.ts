import { MxCell } from "@/MxGraph/MxCell";
import { MxGeometry } from "@/MxGraph/MxGeometry";
import { UserObject } from "@/MxGraph/UserObject";

export function isUserObject(obj: any): obj is UserObject {
  return obj && typeof obj.getTagsAsString === "function";
}

export function cloneMxCell(cell: MxCell): MxCell {
  return new MxCell({
    id: undefined, // new ID will be generated later
    parent: cell.parent,
    value: cell.value,
    style: cell.style,
    vertex: cell.vertex,
    edge: cell.edge,
    geometry: cell.geometry ? new MxGeometry({ ...cell.geometry }) : undefined
  });
}

export function cloneUserObject(
  original: UserObject,
  clonedCell: MxCell,
  newId: string
): UserObject {
  return new UserObject({
    id: newId,
    label: original.label,
    tags: new Set(original.tags),
    link: original.link,
    cell: clonedCell
  });
}

import { ObjectNode } from "@/MxGraph/ObjectNode";

export function cloneWrapper(wrapper: UserObject | ObjectNode, clonedCell: MxCell, newId: string) {
  if (isUserObject(wrapper)) {
    return new UserObject({
      id: newId,
      label: wrapper.label,
      tags: new Set(wrapper.tags),
      link: wrapper.link,
      cell: clonedCell
    });
  } else {
    return new ObjectNode({
      id: newId,
      label: wrapper.label,
      cell: clonedCell
    });
  }
}
