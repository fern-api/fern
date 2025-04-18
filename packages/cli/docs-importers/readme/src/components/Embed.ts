import type { Element } from "hast";
import { CONTINUE, visit } from "unist-util-visit";

import { assertIsDefined, assertIsNumber } from "../assert";
import type { HastNode, HastNodeIndex, HastNodeParent } from "../types/hastTypes";

export function scrapeEmbed(node: HastNode, index: HastNodeIndex, parent: HastNodeParent): Element | undefined {
    if (
        node.tagName !== "div" ||
        !node.properties.className ||
        !(node.properties.className as Array<string>).includes("embed")
    ) {
        return undefined;
    }

    assertIsNumber(index);
    assertIsDefined(parent);

    if (parent == null) {
        return undefined;
    }

    let embedSrc: string | undefined;
    visit(node, "element", function (child) {
        if (child.tagName !== "iframe") {
            return CONTINUE;
        }
        const src = child.properties.src as string;
        if (!src) {
            return CONTINUE;
        }

        const urlMatch = src.match(/src=([^&]+)/);
        if (urlMatch?.[1]) {
            embedSrc = decodeURIComponent(urlMatch[1]);
        } else {
            embedSrc = src;
        }
        return CONTINUE;
    });

    if (!embedSrc) {
        return undefined;
    }

    const newNode: Element = {
        type: "element",
        tagName: "Embed",
        properties: {
            url: embedSrc
        },
        children: []
    };

    return newNode;
}
