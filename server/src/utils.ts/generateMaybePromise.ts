import { ts } from "ts-morph";

export function generateMaybePromise(type: ts.TypeNode): ts.TypeNode {
    return ts.factory.createUnionTypeNode([
        type,
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [type]),
    ]);
}
