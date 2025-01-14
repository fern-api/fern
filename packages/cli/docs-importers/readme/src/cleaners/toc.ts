import type { Element } from "hast";
import { visit } from "unist-util-visit";

export function unifiedRemoveTableOfContents() {
    return function (node: Element) {
        return removeTableOfContents(node);
    };
}

export function removeTableOfContents(node: Element) {
    return visit(node, "element", function (subNode, index, parent) {
        if (
            subNode.tagName === "section" &&
            subNode.properties.className &&
            Array.isArray(subNode.properties.className) &&
            subNode.properties.className.includes("content-toc") &&
            parent &&
            typeof index === "number"
        ) {
            parent.children.splice(index, 1);
        }
    });
}
