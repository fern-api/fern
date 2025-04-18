import type { Element } from "hast";
import { visit } from "unist-util-visit";

export function unifiedRemovePositions(): (node: Element) => void {
    return function (node: Element): void {
        return removePositions(node);
    };
}

function removePositions(node: Element): void {
    return visit(node, function (subNode) {
        delete subNode.position;
    });
}
