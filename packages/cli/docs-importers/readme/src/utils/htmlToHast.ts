import type { Root as HastRoot } from "hast";
import rehypeParse from "rehype-parse";
import { unified } from "unified";
import { CONTINUE, visit } from "unist-util-visit";

export function htmlToHast(html: string): HastRoot {
    return unified().use(rehypeParse).use(unifiedRemovePositions).use(rehypeRemoveHastComments).parse(html);
}

export function removeHastComments(root: HastRoot): void {
    visit(root, "comment", function (_, index, parent) {
        if (parent && typeof index === "number") {
            parent.children.splice(index, 1);
            return [CONTINUE, index];
        }
        return CONTINUE;
    });
}

export function rehypeRemoveHastComments(): (root: HastRoot) => void {
    return function (root: HastRoot): void {
        return removeHastComments(root);
    };
}

export function unifiedRemovePositions(): (node: HastRoot) => void {
    return function (node: HastRoot): void {
        return removePositions(node);
    };
}

function removePositions(node: HastRoot): void {
    return visit(node, function (subNode) {
        delete subNode.position;
    });
}
