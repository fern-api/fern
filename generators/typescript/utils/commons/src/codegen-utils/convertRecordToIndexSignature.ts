import { ts } from "ts-morph";

/**
 * Rewrites `Record<string, V>` as `{ [key: string]: V }`. They are the same type, but a type alias can
 * only reference itself through the index signature form (TS2456 otherwise). Any other node is returned
 * unchanged, including `Record`s with non-string keys, which an index signature can't express.
 */
export function convertRecordToIndexSignature(typeNode: ts.TypeNode): ts.TypeNode {
    if (
        !ts.isTypeReferenceNode(typeNode) ||
        !ts.isIdentifier(typeNode.typeName) ||
        typeNode.typeName.text !== "Record"
    ) {
        return typeNode;
    }
    const [keyType, valueType] = typeNode.typeArguments ?? [];
    if (keyType == null || valueType == null || keyType.kind !== ts.SyntaxKind.StringKeyword) {
        return typeNode;
    }
    return ts.factory.createTypeLiteralNode([
        ts.factory.createIndexSignature(
            undefined,
            [ts.factory.createParameterDeclaration(undefined, undefined, "key", undefined, keyType)],
            valueType
        )
    ]);
}
