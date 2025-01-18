import type { Root as HastRoot } from "hast";
import { CONTINUE, EXIT, visit } from "unist-util-visit";

import { downloadImage } from "../utils/files/images";

export async function getFavicon(hast: HastRoot): Promise<string> {
    let src: string = "";
    visit(hast, "element", function (node) {
        if (node.tagName === "link" && Array.isArray(node.properties.rel) && node.properties.rel.includes("icon")) {
            src = node.properties.href as string;
            return EXIT;
        }
        return CONTINUE;
    });

    if (!src) {
        return "/favicon.svg";
    }

    const result = await downloadImage(src);
    if (!result.success || !result.data) {
        return "/favicon.svg";
    }

    return result.data[1];
}
