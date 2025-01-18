import type { Element, Root as HastRoot } from "hast";
import type { Handle, State } from "hast-util-to-mdast";
import { defaultHandlers, toMdast } from "hast-util-to-mdast";
import type { BlockContent, DefinitionContent, Root as MdastRoot } from "mdast";
import type { MdxJsxFlowElement } from "mdast-util-mdx-jsx";

import { ESCAPED_COMPONENTS } from "../constants.js";

export function mdxJsxFlowElementHandler(_: State, node: Element): MdxJsxFlowElement {
    return {
        type: "mdxJsxFlowElement",
        name: node.tagName,
        attributes: Object.entries(node.properties ?? {}).map(([key, value]) => ({
            type: "mdxJsxAttribute",
            name: key,
            value: value as string
        })),
        children: node.children as Array<BlockContent | DefinitionContent>
    };
}

export function selectiveRehypeRemark(): (tree: HastRoot) => MdastRoot {
    const handlers: Record<string, Handle> = { ...defaultHandlers };
    ESCAPED_COMPONENTS.forEach((tagName) => {
        handlers[tagName] = mdxJsxFlowElementHandler;
    });
    handlers.mdxJsxFlowElement = mdxJsxFlowElementHandler;

    return function (tree: HastRoot): MdastRoot {
        const newTree = toMdast(tree, {
            handlers
        }) as MdastRoot;
        return newTree;
    };
}
