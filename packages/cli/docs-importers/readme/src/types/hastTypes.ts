import type { Element, ElementContent, Root as HastRoot } from "hast";
import type { MdxJsxFlowElementHast, MdxJsxTextElementHast } from "mdast-util-mdx-jsx";

export type HastNode = Element;
export type HastNodeIndex = number | undefined;
export type HastNodeParent = Element | MdxJsxTextElementHast | MdxJsxFlowElementHast | HastRoot | undefined;
export type HastChildrenType = Array<ElementContent>;
