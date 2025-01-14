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
import type { ScrapeFuncType } from "../types/scrapeFunc";

function createComponent(scrapeFunc: ScrapeFuncType) {
    return function (tree: HastRoot) {
        return visit(tree, "element", function (node, index, parent) {
            if (node.tagName === "code" || node.tagName === "pre") {return SKIP;}
            let result: Element | undefined = undefined;

            result = scrapeFunc(node, index, parent);
            if (!result) {return CONTINUE;}

            if (parent && typeof index === "number") {
                parent.children[index] = result;
                return SKIP;
            }
            return CONTINUE;
        });
    };
}

export function createCard() {
    return createComponent(scrapeCard);
}
export function createEmbed() {
    return createComponent(scrapeEmbed);
}
export function createAccordion() {
    return createComponent(scrapeAccordion);
}
export function createAccordionGroup() {
    return createComponent(scrapeAccordionGroup);
}
export function createFrame() {
    return createComponent(scrapeFrame);
}
export function createCodeGroup() {
    return createComponent(scrapeCodeGroup);
}
export function createTabs() {
    return createComponent(scrapeTabs);
}
export function createCallout() {
    return createComponent(scrapeCallout);
}
export function createCardGroup() {
    return createComponent(scrapeCardGroup);
}
