import { ts } from "ts-morph";

/**
 * Unwraps parenthesized type nodes to get to the underlying type.
 */
function unwrapParens(node: ts.TypeNode): ts.TypeNode {
    let current = node;
    while (ts.isParenthesizedTypeNode(current)) {
        current = current.type;
    }
    return current;
}

/**
 * Checks if a type node is the undefined keyword.
 */
function isUndefinedKeyword(node: ts.TypeNode): boolean {
    const unwrapped = unwrapParens(node);
    return unwrapped.kind === ts.SyntaxKind.UndefinedKeyword;
}

/**
 * Strips top-level undefined from a union type node.
 * This prevents double unions like (T | undefined) | undefined.
 */
export function stripTopLevelUndefined(node: ts.TypeNode): ts.TypeNode {
    const unwrapped = unwrapParens(node);
    if (ts.isUnionTypeNode(unwrapped)) {
        const nonUndefined = unwrapped.types.filter((t) => !isUndefinedKeyword(t));
        switch (nonUndefined.length) {
            case 0:
                return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);
            case 1: {
                const only = nonUndefined[0];
                if (only == null) {
                    // Defensive fallback; should be unreachable given length === 1
                    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);
                }
                return only;
            }
            default:
                return ts.factory.createUnionTypeNode(nonUndefined);
        }
    }
    return node;
}
