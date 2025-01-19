import type { Element } from "hast";
import { visit } from "unist-util-visit";

export function unifiedRemoveBreaks(): (node: Element) => void {
    return function (node: Element): void {
        return removeBreaks(node);
    };
}

export function removeBreaks(node: Element): void {
    return visit(node, "element", function (subNode, index, parent) {
        if (subNode.tagName === "br" && parent && typeof index === "number") {
            parent.children.splice(index, 1);
        }
    });
}
