import type { Root as MdastRoot } from "mdast";
import { CONTINUE, visit } from "unist-util-visit";

export function unifiedRemoveNestedRoots(): (node: MdastRoot) => void {
    return function (node: MdastRoot): void {
        return removeNestedRoots(node);
    };
}

function removeNestedRoots(root: MdastRoot): void {
    visit(root, "root", function (node, _, parent) {
        if (!parent) {
            return CONTINUE;
        }
        (parent as MdastRoot).children = node.children;
        return CONTINUE;
    });
}
