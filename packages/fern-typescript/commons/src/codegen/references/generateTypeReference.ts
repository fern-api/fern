import { ContainerType, PrimitiveType, TypeReference } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { generateNamedTypeReference } from "./generateNamedTypeReference";

export function generateTypeReference({
    reference,
    referencedIn,
    modelDirectory,
    forceUseNamespaceImport,
}: {
    reference: TypeReference;
    referencedIn: SourceFile;
    modelDirectory: Directory;
    forceUseNamespaceImport?: generateNamedTypeReference.Args["forceUseNamespaceImport"];
}): ts.TypeNode {
    return TypeReference._visit(reference, {
        named: (named) =>
            generateNamedTypeReference({
                typeName: named,
                referencedIn,
                baseDirectory: modelDirectory,
                baseDirectoryType: "model",
                forceUseNamespaceImport,
            }),
        primitive: (primitive) => {
            return PrimitiveType._visit<ts.TypeNode>(primitive, {
                boolean: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
                // TODO add datetime
                // datetime: () => dropInfactory.createKeywordTypeNode(dropInTs.SyntaxKind.StringKeyword),
                double: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                integer: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                long: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                string: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                _unknown: () => {
                    throw new Error("Unexpected primitive type: " + primitive);
                },
            });
        },
        container: (container) => {
            return ContainerType._visit<ts.TypeNode>(container, {
                map: (map) =>
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                        generateTypeReference({
                            reference: map.keyType,
                            referencedIn,
                            modelDirectory,
                        }),
                        generateTypeReference({
                            reference: map.valueType,
                            referencedIn,
                            modelDirectory,
                        }),
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
                        generateTypeReference({
                            reference: optional,
                            referencedIn,
                            modelDirectory,
                        }),
                        ts.factory.createLiteralTypeNode(ts.factory.createNull()),
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                    ]),
                _unknown: () => {
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
        _unknown: () => {
            throw new Error("Unexpected type reference: " + reference._type);
        },
    });
}
