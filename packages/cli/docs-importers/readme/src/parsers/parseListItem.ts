import type { Element } from "hast";
import { CONTINUE, EXIT, visit } from "unist-util-visit";

import { scrapedNavigationEntry } from "../types/scrapedNavigation";
import { dedupedAppend } from "../utils/append";
import { findFirstChild } from "../utils/firstChild";
import { removeTrailingSlash } from "../utils/strings";
import { getText } from "../utils/text";
import { parseNavItems } from "./parseNavItems";

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
    const link = findFirstChild({ node, tagName: "a" });
    if (!link) {return undefined;}

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

    const sectionHeader = findFirstChild({ node, tagName: sectionTagName });
    const childList = findFirstChild({ node, tagName: childListTagName });
    if (!childList) {
        return linkHref;
    }

    let groupTitle = title;
    if (!groupTitle) {
        groupTitle = getText(link) || getText(sectionHeader) || "";
    }

    let childEntries = parseNavItems(childList);
    const newLink =
        linkHref !== "#" && childEntries.find((child) => typeof child === "string" && child.startsWith(linkHref))
            ? removeTrailingSlash(linkHref) + "/overview"
            : linkHref;

    if (linkHref !== "#") {
        if (childEntries.includes(linkHref)) {
            childEntries.forEach((child, index) => {
                if (child === linkHref) {
                    childEntries[index] = newLink;
                }
            });
        }
        childEntries = dedupedAppend(newLink, childEntries, true);
    }

    return { group: groupTitle, pages: childEntries };
}
