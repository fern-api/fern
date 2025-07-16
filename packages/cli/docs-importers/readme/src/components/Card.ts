import type { Element, ElementContent } from "hast";
import { CONTINUE, EXIT, visit } from "unist-util-visit";

import { assertIsDefined } from "../assert";
import { convertHastChildrenToMdast } from "../customComponents/children";
import { findTitle } from "../extract/title";
import type { HastNode, HastNodeIndex, HastNodeParent } from "../types/hastTypes";

export function scrapeCard(node: HastNode, _: HastNodeIndex, parent: HastNodeParent): Element | undefined {
    if (
        (node.tagName !== "div" && node.tagName !== "a") ||
        !node.properties.className ||
        !Array.isArray(node.properties.className) ||
        (!node.properties.className.includes("Tile") &&
            !node.properties.className.includes("card") &&
            !node.properties.className.includes("Card") &&
            !node.properties.className.includes("docs-card") &&
            !node.properties.className.includes("next-steps__step") &&
            !node.properties.className.join(" ").includes("_card") &&
            !node.properties.className.join(" ").includes("-card") &&
            !node.properties.className.includes("starter-card"))
    ) {
        return undefined;
    }

    const title = findTitle(node);

    let href: string | undefined = undefined;
    if (node.properties.href) {
        href = node.properties.href as string;
    } else if (node.properties.onclick && typeof node.properties.onclick === "string") {
        const str = node.properties.onclick.split("'")[1];
        href = str ? `./${str}` : undefined;
    } else {
        visit(node, "element", function (subNode) {
            if (subNode.properties.href) {
                href = subNode.properties.href as string;
                return EXIT;
            } else if (subNode.properties.onclick && typeof node.properties.onclick === "string") {
                const str = node.properties.onclick.split("'")[1];
                href = str ? `./${str}` : undefined;
                return EXIT;
            }
            return CONTINUE;
        });
    }

    assertIsDefined(parent);
    const newNode: Element = {
        type: "element",
        tagName: "Card",
        properties: {
            title,
            href
        },
        children: convertHastChildrenToMdast(node.children as Array<Element>) as Array<ElementContent>
    };

    return newNode;
}
