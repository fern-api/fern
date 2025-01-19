import type { Element, ElementContent } from "hast";

import { assertIsStringArray } from "../assert";
import type { HastNode, HastNodeIndex, HastNodeParent } from "../types/hastTypes";

export function scrapeCallout(node: HastNode, _: HastNodeIndex, __: HastNodeParent): Element | undefined {
    if (
        node.tagName !== "blockquote" ||
        !node.properties.className ||
        !Array.isArray(node.properties.className) ||
        !node.properties.className.includes("callout")
    ) {
        return undefined;
    }

    assertIsStringArray(node.properties.className);
    const calloutClassNames = node.properties.className.filter((className) => className.includes("callout_"));
    const calloutClassName: string = calloutClassNames[0] ? calloutClassNames[0] : "callout_info";

    let tagName = "Note";
    switch (calloutClassName) {
        case "callout_default":
        case "callout_info":
            tagName = "Info";
            break;
        case "callout_warn":
        case "callout_error":
            tagName = "Warning";
            break;
        case "callout_okay":
            tagName = "Check";
            break;
        default:
            tagName = "Info";
            break;
    }

    let icon: string | undefined;
    for (const child of node.children) {
        if (
            child.type === "element" &&
            child.tagName === "h2" &&
            Array.isArray(child.properties?.className) &&
            child.properties?.className.includes("callout-heading")
        ) {
            const iconSpan = child.children?.find(
                (c) =>
                    c.type === "element" &&
                    c.tagName === "span" &&
                    Array.isArray(c.properties?.className) &&
                    c.properties?.className.includes("callout-icon")
            );
            if (iconSpan && iconSpan.type === "element" && iconSpan.children?.[0] && "value" in iconSpan.children[0]) {
                icon = String(iconSpan.children[0].value);
            }
            break;
        }
    }

    const newNode: Element = {
        type: "element",
        tagName,
        properties: {
            ...(icon && { icon })
        },
        children: node.children.filter(
            (child) =>
                !(
                    child.type === "element" &&
                    child.tagName === "h2" &&
                    Array.isArray(child.properties?.className) &&
                    child.properties?.className.includes("callout-heading")
                )
        ) as Array<ElementContent>
    };

    return newNode;
}
