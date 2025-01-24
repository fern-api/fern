import type { Comment, Element, ElementContent, Root as HastRoot, RootContent as HastRootContent, Text } from "hast";
import type { Handle, State } from "hast-util-to-mdast";
import { defaultHandlers, toMdast } from "hast-util-to-mdast";
import type { Root as MdastRoot, RootContent as MdastRootContent } from "mdast";
import { unified } from "unified";

import { ESCAPED_COMPONENTS } from "../constants";
import { mdxJsxFlowElementHandler } from "../customComponents/selective";

export function convertHastChildrenToMdast(
    hastChildren: Array<HastRootContent | ElementContent | Element | Comment | Text>,
    options: { preserveJsxImages: boolean } = { preserveJsxImages: false }
): Array<MdastRootContent> {
    const hastRoot: HastRoot = {
        type: "root",
        children: hastChildren
    };

    const customHandlers: Record<string, Handle> = { ...defaultHandlers };

    if (options.preserveJsxImages) {
        customHandlers["img"] = function (state: State, node: Element) {
            const newProperties: Record<string, string | number | boolean | (string | number)[] | null | undefined> =
                {};
            Object.keys(node.properties).forEach((key) => {
                if (key === "src") {
                    newProperties[key] = node.properties[key] as string;
                }
            });
            node.properties = newProperties;
            return mdxJsxFlowElementHandler(state, node);
        };
    }

    ESCAPED_COMPONENTS.forEach((componentName) => {
        customHandlers[componentName] = function (state: State, node: Element) {
            return mdxJsxFlowElementHandler(state, node);
        };
    });

    const mdastRoot = unified()
        .use(function () {
            return function (tree: HastRoot): MdastRoot {
                return toMdast(tree, {
                    handlers: customHandlers
                }) as MdastRoot;
            };
        })
        .runSync(hastRoot);

    return mdastRoot.children;
}
