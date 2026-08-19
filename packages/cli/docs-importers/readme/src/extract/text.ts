import type { Element } from "hast";
import { visit } from "unist-util-visit";

export function getText(element: Element | undefined): string {
    if (!element) {
        return "";
    }
    let text = "";
    visit(element, "text", function (node) {
        text += node.value;
    });
    return text;
}
