import type { Root as MdastRoot } from "mdast";
import { CONTINUE, EXIT, visit } from "unist-util-visit";

export function remarkRemoveUpdatedAt(): (root: MdastRoot) => void {
    return function (root: MdastRoot): void {
        return removeUpdatedAt(root);
    };
}

function removeUpdatedAt(root: MdastRoot): void {
    visit(root, "paragraph", function (node) {
        visit(node, "text", function (subNode, index, parent) {
            if (
                (subNode.value.trim().startsWith("Updated") || subNode.value.trim().startsWith("Last updated")) &&
                subNode.value.endsWith("ago")
            ) {
                if (parent && typeof index === "number") {
                    parent.children.splice(index, 1);
                    return [CONTINUE, index];
                }
            }
            return EXIT;
        });
    });
}
