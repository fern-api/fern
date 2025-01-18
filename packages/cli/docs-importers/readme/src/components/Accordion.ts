import type { Element, ElementContent } from "hast";

import { assertIsDefined, assertIsNumber } from "../assert";
import { convertHastChildrenToMdast } from "../customComponents/children";
import { findTitle } from "../extract/title";
import type { HastNode, HastNodeIndex, HastNodeParent } from "../types/hastTypes";

export function scrapeAccordion(node: HastNode, index: HastNodeIndex, parent: HastNodeParent): Element | undefined {
    if (
        node.tagName !== "button" ||
        !node.properties.className ||
        !(node.properties.className as Array<string>).includes("accordion")
    ) {
        return undefined;
    }

    assertIsNumber(index);
    assertIsDefined(parent);

    const title = findTitle(node);

    if (parent == null) {
        return undefined;
    }

    parent.children.shift();

    const newNode: Element = {
        type: "element",
        tagName: "Accordion",
        properties: {
            title
        },
        children: convertHastChildrenToMdast(parent.children) as Array<ElementContent>
    };

    return newNode;
}
