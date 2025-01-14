import type { Element } from "hast";
import { visit } from "unist-util-visit";

export function unifiedRemovePositions() {
    return function (node: Element) {
        return removePositions(node);
    };
}

function removePositions(node: Element) {
    return visit(node, function (subNode) {
        delete subNode.position;
    });
}
