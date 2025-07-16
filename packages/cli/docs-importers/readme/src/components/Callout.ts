import type { Element, ElementContent } from "hast";

import { assertIsStringArray } from "../assert";
import { convertHastChildrenToMdast } from "../customComponents/children";
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

    const textChildren = node.children.filter((child) => child.type === "element" && child.tagName === "p");

    const newNode: Element = {
        type: "element",
        tagName,
        properties: {},
        children: convertHastChildrenToMdast(textChildren) as Array<ElementContent>
    };

    return newNode;
}
