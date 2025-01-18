import type { Root as MdastRoot } from "mdast";
import { CONTINUE, visit } from "unist-util-visit";

export function remarkProperlyFormatEmphasis(): (root: MdastRoot) => void {
    return function (root: MdastRoot): void {
        return properlyFormatEmphasis(root);
    };
}

const spaceNode = {
    type: "text" as const,
    value: " "
};

function properlyFormatEmphasis(root: MdastRoot): void {
    visit(root, ["emphasis", "strong"], function (node, index, parent) {
        if (node.type !== "emphasis" && node.type !== "strong") {
            return CONTINUE;
        }
        if (
            node.children.length !== 1 ||
            !node.children[0] ||
            node.children[0].type !== "text" ||
            !parent ||
            typeof index !== "number"
        ) {
            return CONTINUE;
        }

        const child = node.children[0];
        if (child.value.startsWith(" ") || child.value.endsWith(" ")) {
            if (index !== 0 && child.value.startsWith(" ")) {
                parent.children.splice(index, 0, spaceNode);
            }
            if (parent.children.length > index + 1 && child.value.endsWith(" ")) {
                parent.children.splice(index + 1, 0, spaceNode);
            }
            child.value = child.value.trim();
            node.children[0] = child;
        }
        return CONTINUE;
    });
}
