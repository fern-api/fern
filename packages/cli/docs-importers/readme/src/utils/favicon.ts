import type { Root as HastRoot } from "hast";
import { CONTINUE, EXIT, visit } from "unist-util-visit";

import { downloadImage } from "./files/images";

export async function downloadFavicon(hast: HastRoot): Promise<string> {
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

    const res = await downloadImage(src);
    if (!res.success) {
        return "/favicon.svg";
    }
    if (!res.data) {
        return "/favicon.svg";
    }

    return res.data[1];
}
