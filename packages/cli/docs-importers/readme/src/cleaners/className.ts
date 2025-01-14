import type { Element } from "hast";
import { visit } from "unist-util-visit";

export function unifiedRemoveClassNames() {
    return function (node: Element) {
        return removeClassNames(node);
    };
}

function removeClassNames(node: Element) {
    return visit(node, "element", function (subNode) {
        if ("properties" in subNode) {delete subNode.properties.className;}
    });
}
