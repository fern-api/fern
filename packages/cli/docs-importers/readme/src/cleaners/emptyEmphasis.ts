import type { Root as MdastRoot } from "mdast";
import { CONTINUE, visit } from "unist-util-visit";

export function remarkRemoveEmptyEmphases(): (root: MdastRoot) => void {
    return function (root: MdastRoot): void {
        return removeEmptyEmphases(root);
    };
}

function removeEmptyEmphases(root: MdastRoot): void {
    visit(root, function (node, index, parent) {
        if (node.type !== "emphasis" && node.type !== "strong") {
            return CONTINUE;
        }
        if (node.children.length === 0) {
            if (!parent || typeof index !== "number") {
                return CONTINUE;
            }
            parent.children.splice(index, 1);
        }
        return CONTINUE;
    });
}
