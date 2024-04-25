import { raw } from "hast-util-raw";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import { visit } from "unist-util-visit";

export function parseImagePaths(page: string): string[] {
    const filepaths = new Set<string>();

    const tree = raw(toHast(fromMarkdown(page), { allowDangerousHtml: true }));

    visit(tree, (node) => {
        if (node.type === "element" && node.tagName === "img") {
            const src = node.properties?.src as string;
            if (src) {
                filepaths.add(src);
                return;
            }
        }
    });

    return [...filepaths];
}
