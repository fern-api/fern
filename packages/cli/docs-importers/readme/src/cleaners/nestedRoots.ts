import type { Root as MdastRoot } from "mdast";
import { CONTINUE, visit } from "unist-util-visit";

export function unifiedRemoveNestedRoots() {
    return function (node: MdastRoot) {
        return removeNestedRoots(node);
    };
}

function removeNestedRoots(root: MdastRoot) {
    visit(root, "root", function (node, _, parent) {
        if (!parent) {return CONTINUE;}
        (parent as MdastRoot).children = node.children;
        return CONTINUE;
    });
}
