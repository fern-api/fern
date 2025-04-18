import type { Element, Root as HastRoot } from "hast";
import { CONTINUE, EXIT, visit } from "unist-util-visit";

export function findSourceElement(root: HastRoot): Element | undefined {
    let sourceElement: Element | undefined = undefined;
    visit(root, "element", function (node) {
        if (node.tagName === "article") {
            if (
                node.properties.className &&
                Array.isArray(node.properties.className) &&
                node.properties.className.includes("rm-Article")
            ) {
                sourceElement = node;
            } else {
                return EXIT;
            }
        }
        return CONTINUE;
    });
    return sourceElement;
}
