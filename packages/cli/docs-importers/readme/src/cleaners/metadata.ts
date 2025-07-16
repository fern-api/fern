import type { Root as MdastRoot } from "mdast";
import { visit } from "unist-util-visit";

export function remarkRemoveBottomMetadata(): (root: MdastRoot) => void {
    return function (root: MdastRoot): void {
        return removeBottomMetadata(root);
    };
}

function removeBottomMetadata(root: MdastRoot): void {
    if (root.children.at(-1)?.type === "thematicBreak") {
        root.children.pop();
    }
    if (root.children.at(-1)?.type === "paragraph") {
        let shouldDelete = false as boolean;
        visit(root, "text", function (node) {
            if (
                (node.value.startsWith("Updated") || node.value.startsWith("Last updated")) &&
                node.value.endsWith("ago")
            ) {
                shouldDelete = true;
            }
        });
        if (shouldDelete) {
            root.children.pop();
        }
    }
}
