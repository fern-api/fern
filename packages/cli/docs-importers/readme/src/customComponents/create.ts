import type { Element, Root as HastRoot } from "hast";
import { CONTINUE, SKIP, visit } from "unist-util-visit";

import { scrapeAccordion } from "../components/Accordion";
import { scrapeAccordionGroup } from "../components/AccordionGroup";
import { scrapeCallout } from "../components/Callout";
import { scrapeCard } from "../components/Card";
import { scrapeCardGroup } from "../components/CardGroup";
import { scrapeCodeGroup } from "../components/CodeGroup";
import { scrapeEmbed } from "../components/Embed";
import { scrapeFrame } from "../components/Frame";
import { scrapeTabs } from "../components/Tabs";
import type { HastNode, HastNodeIndex, HastNodeParent } from "../types/hastTypes";

type ScrapeFuncType = (node: HastNode, index: HastNodeIndex, parent: HastNodeParent) => Element | undefined;

function createComponent(scrapeFunc: ScrapeFuncType) {
    return function (tree: HastRoot) {
        return visit(tree, "element", function (node, index, parent) {
            if (node.tagName === "code" || node.tagName === "pre") {
                return SKIP;
            }
            let result: Element | undefined = undefined;

            result = scrapeFunc(node, index, parent);
            if (!result) {
                return CONTINUE;
            }

            if (parent && typeof index === "number") {
                parent.children[index] = result;
                return SKIP;
            }
            return CONTINUE;
        });
    };
}

export function createCard(): (tree: HastRoot) => void {
    return createComponent(scrapeCard);
}
export function createEmbed(): (tree: HastRoot) => void {
    return createComponent(scrapeEmbed);
}
export function createAccordion(): (tree: HastRoot) => void {
    return createComponent(scrapeAccordion);
}
export function createAccordionGroup(): (tree: HastRoot) => void {
    return createComponent(scrapeAccordionGroup);
}
export function createFrame(): (tree: HastRoot) => void {
    return createComponent(scrapeFrame);
}
export function createCodeGroup(): (tree: HastRoot) => void {
    return createComponent(scrapeCodeGroup);
}
export function createTabs(): (tree: HastRoot) => void {
    return createComponent(scrapeTabs);
}
export function createCallout(): (tree: HastRoot) => void {
    return createComponent(scrapeCallout);
}
export function createCardGroup(): (tree: HastRoot) => void {
    return createComponent(scrapeCardGroup);
}
