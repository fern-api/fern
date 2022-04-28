import { ContainerType, PrimitiveType, TypeReference } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { generateNamedTypeReference } from "./generateNamedTypeReference";

export function generateTypeReference({
    reference,
    referencedIn,
    modelDirectory,
}: {
    reference: TypeReference;
    referencedIn: SourceFile;
    modelDirectory: Directory;
}): ts.TypeNode {
    return TypeReference._visit(reference, {
        named: (named) => generateNamedTypeReference({ typeName: named, referencedIn, baseDirectory: modelDirectory }),
        primitive: (primitive) => {
            return PrimitiveType.visit<ts.TypeNode>(primitive, {
                Boolean: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
                // TODO add datetime
                // datetime: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                Double: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                Integer: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                Long: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                String: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                unknown: (value) => {
                    throw new Error("Unexpected primitive type: " + value);
                },
            });
        },
        container: (container) => {
            return ContainerType._visit<ts.TypeNode>(container, {
                map: (map) =>
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                        generateTypeReference({ reference: map.keyType, referencedIn, modelDirectory }),
                        generateTypeReference({ reference: map.valueType, referencedIn, modelDirectory }),
                    ]),
                list: (list) =>
                    ts.factory.createArrayTypeNode(
                        generateTypeReference({ reference: list, referencedIn, modelDirectory })
                    ),
                set: (set) =>
                    ts.factory.createArrayTypeNode(
                        generateTypeReference({ reference: set, referencedIn, modelDirectory })
                    ),
                optional: (optional) =>
                    ts.factory.createUnionTypeNode([
                        generateTypeReference({ reference: optional, referencedIn, modelDirectory }),
                        ts.factory.createLiteralTypeNode(ts.factory.createNull()),
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                    ]),
                unknown: () => {
                    throw new Error("Unexpected container type: " + container._type);
                },
            });
        },
        void: () => {
            return ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword),
            ]);
        },
        unknown: () => {
            throw new Error("Unexpected type reference: " + reference._type);
        },
    });
}
