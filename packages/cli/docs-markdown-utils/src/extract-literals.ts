// copied from https://github.com/fern-api/fern-platform/blob/main/packages/fern-docs/mdx/src/mdx-utils/extract-literal.ts
import type { Node as EstreeNode } from "estree"
import { walk } from "estree-walker"
import { MdxJsxAttributeValueExpression } from "mdast-util-mdx-jsx"

type Literal = string | number | bigint | boolean | RegExp | null | undefined

/**
 * Extracts a single literal from an estree program.
 *
 * @param estree - The estree program to extract the literal from.
 * @returns The literal if there is exactly one, otherwise `undefined`.
 */
export function extractSingleLiteral(estree?: EstreeNode | null | undefined): Literal {
    if (estree == null) {
        return undefined
    }
    const literals: Literal[] = []
    let skip = false
    walk(estree, {
        enter(node) {
            // ignore function declarations, arrow functions, and JSX elements
            if (
                node.type === "FunctionDeclaration" ||
                node.type === "ArrowFunctionExpression" ||
                node.type === "JSXOpeningElement" ||
                node.type === "JSXOpeningFragment" ||
                node.type === "Identifier"
            ) {
                skip = true
                this.skip()
            }

            if (node.type === "Literal") {
                literals.push(node.value)
            }
        }
    })
    if (skip) {
        return undefined
    }
    return literals.length === 1 ? literals[0] : undefined
}

/**
 * Works for:
 *  - <Component prop="a" />
 *  - <Component prop={1} />
 *  - <Component prop={"a"} />
 *  - <Component prop={`a`} />
 *  - <Component prop={["a"]} />
 *
 * Does not work for:
 *  - <Component prop={() => {}} />
 *  - <Component prop={something("else")} />
 *  - <Component prop={["a", "b"]} />
 *  - <Component prop={<div />} />
 */
export function extractAttributeValueLiteral(
    value: string | MdxJsxAttributeValueExpression | null | undefined
): Literal | undefined {
    if (typeof value === "string") {
        return value
    }

    if (value?.type === "mdxJsxAttributeValueExpression") {
        return extractSingleLiteral(value.data?.estree)
    }

    return undefined
}
