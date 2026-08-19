import type { Root as HastRoot } from "hast";
import { CONTINUE, visit } from "unist-util-visit";

export function removeHastComments(root: HastRoot): void {
    visit(root, "comment", function (_, index, parent) {
        if (parent && typeof index === "number") {
            parent.children.splice(index, 1);
            return [CONTINUE, index];
        }
        return CONTINUE;
    });
}

export function rehypeRemoveHastComments(): (root: HastRoot) => void {
    return function (root: HastRoot) {
        return removeHastComments(root);
    };
}
