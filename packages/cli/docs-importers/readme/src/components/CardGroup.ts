import type { Element } from "hast";

import type { HastNode, HastNodeIndex, HastNodeParent } from "../types/hastTypes.ts";

export function scrapeCardGroup(node: HastNode, _: HastNodeIndex, parent: HastNodeParent): Element | undefined {
    if (node.tagName !== "Card") {
        return undefined;
    }
    if (!parent) {
        return undefined;
    }

    let cardCount = 0;
    for (const child of parent.children) {
        if (child.type === "element" && child.tagName === "Card") {
            cardCount++;
        }
    }

    if (cardCount === parent.children.length) {
        parent.type = "element";
        (parent as Element).tagName = "CardGroup";
    }

    return undefined;
}
