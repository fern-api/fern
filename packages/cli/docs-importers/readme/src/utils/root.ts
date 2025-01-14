import type { Element, Root as HastRoot } from "hast";
import { CONTINUE, EXIT, visit } from "unist-util-visit";

export function retrieveRootContent(rootNode: HastRoot): Element | undefined {
    let element: Element | undefined = undefined;
    visit(rootNode, "element", function (node) {
        if (node.tagName === "article") {
            if (
                node.properties.className &&
                Array.isArray(node.properties.className) &&
                node.properties.className.includes("rm-Article")
            ) {
                element = node;
            } else {
                return EXIT;
            }
        }
        return CONTINUE;
    });

    return element;
}
