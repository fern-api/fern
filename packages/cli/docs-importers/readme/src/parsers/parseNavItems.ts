import type { Element } from "hast";
import { CONTINUE, SKIP, visit } from "unist-util-visit";

import { scrapedNavigationEntry } from "../types/scrapedNavigation";
import { findTitle } from "../utils/title";
import { parseListItem } from "./parseListItem";

export function parseNavItems(rootNode: Element): Array<scrapedNavigationEntry> {
    const result: Array<scrapedNavigationEntry> = [];
    const rootSectionTagName = "section";

    const innerSectionTagName = "h2";

    visit(rootNode, "element", function (node, index, parent) {
        if (node.tagName === rootSectionTagName) {node.tagName = "li";}
        if (node.tagName !== "li") {return CONTINUE;}

        let title: string | undefined = undefined;
        if (
            node.children[0] &&
            node.children[1] &&
            node.children[0].type === "element" &&
            node.children[0].tagName === "div" &&
            node.children[1].type === "element" &&
            node.children[1].tagName === "ul" &&
            node.children[0].children.filter((child) => child.type === "text").length ===
                node.children[0].children.length
        ) {
            title = findTitle(node.children[0], { delete: false });
        }

        if (
            node.children.length === 2 &&
            node.children[1] &&
            node.children[1].type === "element" &&
            node.children[1].tagName === "ul" &&
            typeof index === "number" &&
            parent
        ) {
            node.children = [
                {
                    type: "element",
                    tagName: "div",
                    properties: {},
                    children: node.children
                }
            ];
        }

        const entry = parseListItem({
            node,
            sectionTagName: innerSectionTagName,
            childListTagName: "ul",
            title
        });

        if (entry !== undefined) {
            result.push(entry);
            return SKIP;
        }
        return CONTINUE;
    });

    return result;
}
