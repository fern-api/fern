import type { Root as MdastRoot } from "mdast";
import { visit } from "unist-util-visit";

export function convertHeaderLinksToText(): (tree: MdastRoot) => MdastRoot {
    return function (tree: MdastRoot) {
        visit(tree, "heading", function (node) {
            visit(node, "link", function (subNode, index, parent) {
                if (subNode.url.startsWith("#") && subNode.title == null) {
                    if (parent && typeof index === "number") {
                        parent.children.splice(index, 1);
                    }
                }
            });
        });
        return tree;
    };
}
