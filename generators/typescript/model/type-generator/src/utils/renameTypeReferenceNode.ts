import { ts } from "ts-morph";

export function renameTypeReferenceNode(node: ts.TypeNode, newLeft: string, newRight: string): ts.TypeNode {
    const transformer = (context: ts.TransformationContext) => {
        const visit = (node: ts.Node): ts.Node => {
            if (ts.isTypeReferenceNode(node)) {
                if (ts.isQualifiedName(node.typeName)) {
                    return ts.factory.createTypeReferenceNode(
                        ts.factory.createQualifiedName(ts.factory.createIdentifier(newLeft), newRight),
                        node.typeArguments
                    );
                }
            }

            // Recursively visit all children
            return ts.visitEachChild(node, visit, context);
        };

        return visit;
    };

    // Create transformation result
    const result = ts.transform(node, [transformer]);

    // Return the first transformed node
    return result.transformed[0] as ts.TypeNode;
}
