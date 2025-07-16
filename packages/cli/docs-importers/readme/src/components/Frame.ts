import type { Element } from "hast";

import { findTitle } from "../extract/title";
import type { HastNode, HastNodeIndex, HastNodeParent } from "../types/hastTypes";

export function scrapeFrame(node: HastNode, _: HastNodeIndex, __: HastNodeParent): Element | undefined {
    if (
        (node.tagName === "figure" &&
            node.children.find((subNode) => subNode.type === "element" && subNode.tagName === "picture")) ||
        (node.tagName !== "picture" && node.tagName !== "figure")
    ) {
        return undefined;
    }

    const imgNode = node.children.find(
        (child): child is Element =>
            child.type === "element" &&
            (child.tagName === "img" ||
                (child.tagName === "picture" &&
                    child.children.some((c) => c.type === "element" && c.tagName === "img")))
    );

    if (!imgNode) {
        return undefined;
    }

    const imgSrc =
        imgNode.tagName === "img"
            ? (imgNode.properties.src as string)
            : ((imgNode.children.find((c) => c.type === "element" && c.tagName === "img") as Element)?.properties
                  ?.src as string);

    if (!imgSrc) {
        return undefined;
    }

    const caption = findTitle(node);

    return {
        type: "element",
        tagName: "paragraph",
        properties: {},
        children: [
            {
                type: "element",
                tagName: "image",
                properties: {
                    url: imgSrc,
                    alt: caption || ""
                },
                children: []
            }
        ]
    };
}
