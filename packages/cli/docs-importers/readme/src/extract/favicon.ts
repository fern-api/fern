import type { Root as HastRoot } from "hast";
import { CONTINUE, EXIT, visit } from "unist-util-visit";

export async function getFavicon(hast: HastRoot): Promise<string | undefined> {
    let src: string = "";
    visit(hast, "element", function (node) {
        if (node.tagName === "link" && Array.isArray(node.properties.rel) && node.properties.rel.includes("icon")) {
            src = node.properties.href as string;
            return EXIT;
        }
        return CONTINUE;
    });

    return src;
}
