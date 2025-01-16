import type { Element, ElementContent } from "hast";

import type { HastNode, HastNodeIndex, HastNodeParent } from "../types/hastTypes";

export function scrapeAccordionGroup(
    node: HastNode,
    index: HastNodeIndex,
    parent: HastNodeParent
): Element | undefined {
    if (node.tagName !== "Accordion") {
        return undefined;
    }
    if (!parent || typeof index !== "number") {
        return undefined;
    }

    let accordionCount = 0;
    while (parent.children[index]) {
        const child = parent.children[index];
        if (!child || child.type !== "element" || child.tagName !== "Accordion") {
            break;
        }
        accordionCount++;
        index++;
    }

    index -= accordionCount;

    if (accordionCount > 1) {
        const children = parent.children.splice(index, accordionCount);
        const newNode = {
            type: "element" as const,
            tagName: "AccordionGroup",
            properties: {},
            children: children as Array<ElementContent>
        };
        parent.children.splice(index, 0, newNode);
    }

    return undefined;
}
