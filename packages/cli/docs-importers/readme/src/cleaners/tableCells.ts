import type { Code, InlineCode, Root as MdastRoot, Parent } from "mdast";
import { CONTINUE, visit } from "unist-util-visit";

export function remarkRemoveCodeBlocksInCells(): (root: MdastRoot) => void {
    return function (root: MdastRoot): void {
        return removeCodeBlocksInCells(root);
    };
}

function removeCodeBlocksInCells(root: MdastRoot): void {
    visit(root, "tableCell", function (node) {
        visit(node, "code", function (subNode: Code, index, parent: Parent | undefined) {
            if (!parent || typeof index !== "number") {
                return CONTINUE;
            }
            const newNode: InlineCode = {
                type: "inlineCode",
                value: subNode.value
            };
            (parent as Parent).children[index] = newNode;
            return CONTINUE;
        });
    });
}
