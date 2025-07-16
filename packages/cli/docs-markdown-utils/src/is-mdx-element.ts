import type { Node as MdastNode } from "mdast";
import type { MdxFlowExpression, MdxTextExpression } from "mdast-util-mdx-expression";
import type {
    MdxJsxAttribute,
    MdxJsxExpressionAttribute,
    MdxJsxFlowElement,
    MdxJsxTextElement
} from "mdast-util-mdx-jsx";

export function isMdxJsxElement(node: MdastNode): node is MdxJsxFlowElement | MdxJsxTextElement {
    return node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement";
}

export function isMdxExpression(node: MdastNode): node is MdxFlowExpression | MdxTextExpression {
    return node.type === "mdxFlowExpression" || node.type === "mdxTextExpression";
}

export function isMdxJsxAttribute(attr: MdxJsxAttribute | MdxJsxExpressionAttribute): attr is MdxJsxAttribute {
    return attr.type === "mdxJsxAttribute";
}

export function isMdxJsxExpressionAttribute(
    attr: MdxJsxAttribute | MdxJsxExpressionAttribute
): attr is MdxJsxExpressionAttribute {
    return attr.type === "mdxJsxExpressionAttribute";
}
