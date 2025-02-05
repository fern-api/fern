import type { Element, Root as HastRoot } from "hast";
import type { BlockContent, DefinitionContent } from "mdast";
import type { MdxJsxFlowElement } from "mdast-util-mdx-jsx";
import { visit } from "unist-util-visit";

import { ESCAPED_COMPONENTS } from "../constants";
import type { EscapedComponent } from "../types/components";

export function rehypeToRemarkCustomComponents(): (tree: HastRoot) => HastRoot {
    return function (tree: HastRoot): HastRoot {
        visit(tree, "element", function (node: Element, index, parent) {
            if (ESCAPED_COMPONENTS.includes(node.tagName as unknown as EscapedComponent)) {
                const newNode: MdxJsxFlowElement = {
                    type: "mdxJsxFlowElement",
                    name: node.tagName,
                    attributes: Object.entries(node.properties || {}).map(([key, value]) => ({
                        type: "mdxJsxAttribute",
                        name: key,
                        value: value as string
                    })),
                    children: node.children as Array<BlockContent | DefinitionContent>
                };
                if (parent && typeof index === "number") {
                    parent.children[index] = newNode as unknown as Element;
                }
            }
        });
        return tree;
    };
}
