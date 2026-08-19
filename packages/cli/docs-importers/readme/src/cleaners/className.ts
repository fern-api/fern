import type { Element } from "hast";
import { visit } from "unist-util-visit";

export function unifiedRemoveClassNames(): (node: Element) => void {
    return function (node: Element): void {
        return removeClassNames(node);
    };
}

function removeClassNames(node: Element): void {
    return visit(node, "element", function (subNode) {
        if ("properties" in subNode) {
            delete subNode.properties.className;
        }
    });
}
