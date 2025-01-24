import type { Element } from "hast";
import { CONTINUE, EXIT, SKIP, visit } from "unist-util-visit";

import { getFirstChild } from "../extract/firstChild";
import { getText } from "../extract/text";
import { findTitle } from "../extract/title";
import { scrapedNavigationEntry, scrapedNavigationSection } from "../types/scrapedNavigation";

export function parseSidebar(rootNode: Element): Array<scrapedNavigationSection> {
    const result: Array<scrapedNavigationSection> = [];

    visit(rootNode, "element", function (node) {
        if (
            node.tagName === "section" &&
            node.properties.className &&
            Array.isArray(node.properties.className) &&
            node.properties.className.includes("rm-Sidebar-section")
        ) {
            const heading = getFirstChild({ node, tagName: "h2" });
            const headingText = heading ? getText(heading) : "";
            const items = parseNavItems(node);

            const flattenedItems = items.flatMap((item) => {
                if (typeof item === "string") {
                    return item;
                }
                return item.pages;
            });

            result.push({
                group: headingText,
                pages: flattenedItems
            });
        }
    });
    return result;
}

export function parseNavItems(rootNode: Element): Array<scrapedNavigationEntry> {
    const result: Array<scrapedNavigationEntry> = [];
    const rootSectionTagName = "section";
    const innerSectionTagName = "h2";

    visit(rootNode, "element", function (node, index, parent) {
        if (node.tagName === rootSectionTagName) {
            node.tagName = "li";
        }
        if (node.tagName !== "li") {
            return CONTINUE;
        }

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

export function parseListItem({
    node,
    sectionTagName = "section",
    childListTagName = "ul",
    title
}: {
    node: Element;
    sectionTagName: string;
    childListTagName: string;
    title?: string;
}): scrapedNavigationEntry | undefined {
    const link = getFirstChild({ node, tagName: "a" });
    if (!link) {
        return undefined;
    }

    let linkHref: string | undefined = undefined;
    linkHref = link.properties.href as string | undefined;

    if (linkHref === undefined || linkHref === "#") {
        return undefined;
    }

    let isApiReferenceLink = false as boolean;
    visit(link, "element", function (subNode) {
        if (
            subNode.tagName === "span" &&
            Array.isArray(subNode.properties.className) &&
            subNode.properties.className.includes("rm-APIMethod")
        ) {
            isApiReferenceLink = true;
            return EXIT;
        }
        return CONTINUE;
    });
    if (isApiReferenceLink) {
        return undefined;
    }

    if (linkHref.startsWith("/")) {
        linkHref = linkHref.substring(1);
    }

    const sectionHeader = getFirstChild({ node, tagName: sectionTagName });
    const childList = getFirstChild({ node, tagName: childListTagName });
    if (!childList) {
        return linkHref;
    }

    let groupTitle = title;
    if (!groupTitle) {
        groupTitle = getText(link) || getText(sectionHeader) || "";
    }

    const childEntries = parseNavItems(childList);
    const newLink = linkHref;

    if (linkHref !== "#") {
        if (childEntries.includes(linkHref)) {
            childEntries.forEach((child, index) => {
                if (child === linkHref) {
                    childEntries[index] = newLink;
                }
            });
        }
        if (!childEntries.includes(newLink)) {
            childEntries.unshift(newLink);
        }
    }

    return { group: groupTitle, pages: childEntries };
}
