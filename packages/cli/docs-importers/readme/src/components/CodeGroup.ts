import type { Element, ElementContent } from "hast";
import type { Code } from "mdast";
import { CONTINUE, EXIT, visit } from "unist-util-visit";

import type { HastNode, HastNodeIndex, HastNodeParent } from "../types/hastTypes";
import { turnChildrenIntoMdx } from "../utils/children";

function tabContainsOnlyCode(node: Element | undefined): boolean {
    if (!node) {
        return false;
    }

    let tabsCount = 0;
    let onlyCodeCount = 0;

    visit(node, "element", function (subNode) {
        if (subNode.properties.role !== "tabpanel") {
            return CONTINUE;
        }
        tabsCount++;
        if (
            subNode.children[0] &&
            subNode.children[0].type === "element" &&
            subNode.children[0].children.length === 1 &&
            subNode.children[0].children[0] &&
            subNode.children[0].children[0].type === "element" &&
            subNode.children[0].children[0].children.length > 1 &&
            subNode.children[0].children[0].children.find(
                (child) => child.type === "element" && (child.tagName === "pre" || child.tagName === "code")
            ) !== undefined
        ) {
            onlyCodeCount++;
        }
        return EXIT;
    });
    return onlyCodeCount === tabsCount && tabsCount > 0;
}

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
                subNode.tagName !== "code" ||
                !Array.isArray(subNode.properties.className) ||
                !subNode.properties.className.includes("rdmd-code")
            ) {
                return CONTINUE;
            }

            langs.push((subNode.properties.dataLang as string | undefined) ?? "");
            titles.push((subNode.properties.name as string | undefined) ?? "");
            return EXIT;
        });

        const children = turnChildrenIntoMdx(node.children) as Array<ElementContent>;
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
