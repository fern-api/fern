import type { Element, Root } from "hast";
import { CONTINUE, EXIT, visit } from "unist-util-visit";

export function assertIsReadme(rootHast: Root): boolean {
    let isReadme = false;

    visit(rootHast, "element", function (node: Element) {
        if (
            node.tagName === "meta" &&
            typeof node.properties.name === "string" &&
            node.properties.name === "readme-deploy"
        ) {
            isReadme = true;
            return EXIT;
        }
        return CONTINUE;
    });

    return isReadme;
}
