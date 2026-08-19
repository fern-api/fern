import { ts } from "ts-morph";

export function removeUndefinedAndNullFromTypeNode(typeNode: ts.TypeNode): ts.TypeNode {
    if (ts.isUnionTypeNode(typeNode)) {
        const typeElements = typeNode.types.filter(
            (node) => node.kind !== ts.SyntaxKind.UndefinedKeyword && node.kind !== ts.SyntaxKind.NullKeyword
        );

        if (typeElements.length === 1) {
            return typeElements[0] as ts.TypeNode;
        } else if (typeElements.length > 1) {
            return ts.factory.createUnionTypeNode(typeElements);
        }
    }

    return typeNode;
}
