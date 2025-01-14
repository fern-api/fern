import type { Element } from "hast";
import { visit } from "unist-util-visit";

export function unifiedRemoveSuggestEdits() {
    return function (node: Element) {
        return removeSuggestEdits(node);
    };
}

export function removeSuggestEdits(node: Element) {
    return visit(node, "element", function (subNode, index, parent) {
        if (
            subNode.tagName === "a" &&
            subNode.properties.className &&
            Array.isArray(subNode.properties.className) &&
            subNode.properties.className.includes("suggestEdits") &&
            parent &&
            typeof index === "number"
        ) {
            parent.children.splice(index, 1);
        }
    });
}
