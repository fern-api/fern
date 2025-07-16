import type { Element, ElementContent } from "hast";
import type { Code } from "mdast";
import { CONTINUE, EXIT, visit } from "unist-util-visit";

import { convertHastChildrenToMdast } from "../customComponents/children";
import type { HastNode, HastNodeIndex, HastNodeParent } from "../types/hastTypes";

export function scrapeCodeGroup(node: HastNode, _: HastNodeIndex, __: HastNodeParent): Element | undefined {
    if (
        node.tagName !== "div" ||
        !node.properties.className ||
        !Array.isArray(node.properties.className) ||
        !node.properties.className.includes("CodeTabs")
    ) {
        return undefined;
    }

    let newNode: Element | undefined = undefined;
    visit(node, "element", function (node) {
        if (
            node.tagName !== "div" ||
            !node.properties.className ||
            !Array.isArray(node.properties.className) ||
            !node.properties.className.includes("CodeTabs-inner")
        ) {
            return CONTINUE;
        }

        const langs: Array<string> = [];
        const titles: Array<string> = [];
        visit(node, "element", function (subNode) {
            if (
                subNode.tagName === "code" &&
                Array.isArray(subNode.properties.className) &&
                subNode.properties.className.includes("rdmd-code")
            ) {
                const lang = (subNode.properties.dataLang as string | undefined) ?? "";
                const title = (subNode.properties.name as string | undefined) ?? "";
                langs.push(lang);
                titles.push(title);
            }
            return CONTINUE;
        });

        const children = convertHastChildrenToMdast(node.children) as Array<ElementContent>;
        const tabChildren: Array<ElementContent> = [];
        children.forEach((child, index) => {
            const lang = langs[index] || "bash";
            const title = titles[index] || lang;
            tabChildren.push({
                type: "code",
                lang,
                meta: title,
                value: (child as unknown as Code).value
            } as unknown as ElementContent);
        });

        newNode = {
            type: "element",
            tagName: "CodeGroup",
            properties: {},
            children: tabChildren as Array<ElementContent>
        };

        return EXIT;
    });

    return newNode;
}
