import type { Element } from "hast";
import { CONTINUE, EXIT, visit } from "unist-util-visit";

export function getFirstChild({ node, tagName }: { node: Element; tagName: string }): Element | undefined {
    let element: Element | undefined = undefined;
    visit(node, "element", function (subNode) {
        if (subNode.tagName === tagName) {
            element = subNode;
            return EXIT;
        }
        return CONTINUE;
    });
    return element;
}
