import type { Element, ElementContent } from "hast";
import { CONTINUE, EXIT, visit } from "unist-util-visit";

import { convertHastChildrenToMdast } from "../customComponents/children";
import type { HastNode, HastNodeIndex, HastNodeParent } from "../types/hastTypes";

export function scrapeTabs(node: HastNode, _: HastNodeIndex, __: HastNodeParent): Element | undefined {
    if (
        (node.tagName !== "div" && node.tagName !== "a") ||
        !node.properties.className ||
        !Array.isArray(node.properties.className) ||
        (!node.properties.className.includes("tabbed-component") &&
            !node.properties.className.includes("tabs") &&
            !node.properties.className.includes("Tabs"))
    ) {
        return undefined;
    }

    if (!node.children[0] || !node.children[1]) {
        return undefined;
    }

    const titles: Array<string> = [];
    const tabContents: Array<Element> = [];

    if (node.children.length !== 2) {
        visit(node, "element", function (subNode) {
            if (subNode.tagName !== "label" && subNode.tagName !== "button") {
                return CONTINUE;
            }

            let title = "";
            visit(subNode, "text", function (textNode) {
                title += textNode.value;
            });

            titles.push(title.trim().replace("\n", ""));
            return EXIT;
        });

        tabContents.push(
            ...(node.children.filter((subNode) => {
                if (
                    subNode.type === "element" &&
                    Array.isArray(subNode.properties.className) &&
                    (subNode.properties.className.includes("tab") ||
                        subNode.properties.className.includes("Tab") ||
                        subNode.properties.className.includes("tabbed-content") ||
                        subNode.properties.className.includes("tab-content"))
                ) {
                    return true;
                }
                return false;
            }) as Array<Element>)
        );
    } else {
        const tabTitles = node.children[0];

        visit(tabTitles, "element", function (subNode) {
            visit(subNode, "text", function (textNode) {
                titles.push(textNode.value);
                return EXIT;
            });
        });

        node.children.shift();
        if (node.children[0].type === "element") {
            tabContents.push(...(node.children[0].children as Array<Element>));
        }
    }

    const tabChildren: Array<ElementContent> = [];
    tabContents.forEach((tab, index) => {
        if (!titles[index]) {
            return;
        }
        const children = convertHastChildrenToMdast([tab]) as Array<ElementContent>;
        tabChildren.push({
            type: "element",
            tagName: "Tab",
            properties: {
                title: titles[index]
            },
            children
        });
    });

    const newNode: Element = {
        type: "element",
        tagName: "Tabs",
        properties: {},
        children: tabChildren as Array<ElementContent>
    };

    return newNode;
}
