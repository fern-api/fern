import { ContainerType, PrimitiveType, TypeReference } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { generateNamedTypeReference } from "./generateNamedTypeReference";

export function generateTypeReference({
    reference,
    referencedIn,
    modelDirectory,
    forceUseNamespaceImport,
    factory,
    SyntaxKind,
}: {
    reference: TypeReference;
    referencedIn: SourceFile;
    modelDirectory: Directory;
    forceUseNamespaceImport?: generateNamedTypeReference.Args["forceUseNamespaceImport"];
    factory: ts.NodeFactory;
    SyntaxKind: typeof ts.SyntaxKind;
}): ts.TypeNode {
    return TypeReference._visit(reference, {
        named: (named) =>
            generateNamedTypeReference({
                typeName: named,
                referencedIn,
                baseDirectory: modelDirectory,
                baseDirectoryType: "model",
                forceUseNamespaceImport,
                factory,
            }),
        primitive: (primitive) => {
            return PrimitiveType._visit<ts.TypeNode>(primitive, {
                boolean: () => factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword),
                // TODO add datetime
                // datetime: () => dropInfactory.createKeywordTypeNode(dropInTs.SyntaxKind.StringKeyword),
                double: () => factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
                integer: () => factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
                long: () => factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
                string: () => factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
                _unknown: () => {
                    throw new Error("Unexpected primitive type: " + primitive);
                },
            });
        },
        container: (container) => {
            return ContainerType._visit<ts.TypeNode>(container, {
                map: (map) =>
                    factory.createTypeReferenceNode(factory.createIdentifier("Record"), [
                        generateTypeReference({
                            reference: map.keyType,
                            referencedIn,
                            modelDirectory,
                            factory,
                            SyntaxKind,
                        }),
                        generateTypeReference({
                            reference: map.valueType,
                            referencedIn,
                            modelDirectory,
                            factory,
                            SyntaxKind,
                        }),
                    ]),
                list: (list) =>
                    factory.createArrayTypeNode(
                        generateTypeReference({ reference: list, referencedIn, modelDirectory, factory, SyntaxKind })
                    ),
                set: (set) =>
                    factory.createArrayTypeNode(
                        generateTypeReference({ reference: set, referencedIn, modelDirectory, factory, SyntaxKind })
                    ),
                optional: (optional) =>
                    factory.createUnionTypeNode([
                        generateTypeReference({
                            reference: optional,
                            referencedIn,
                            modelDirectory,
                            factory,
                            SyntaxKind,
                        }),
                        factory.createLiteralTypeNode(factory.createNull()),
                        factory.createKeywordTypeNode(SyntaxKind.UndefinedKeyword),
                    ]),
                _unknown: () => {
                    throw new Error("Unexpected container type: " + container._type);
                },
            });
        },
        void: () => {
            return factory.createTypeReferenceNode(factory.createIdentifier("Record"), [
                factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
                factory.createKeywordTypeNode(SyntaxKind.NeverKeyword),
            ]);
        },
        _unknown: () => {
            throw new Error("Unexpected type reference: " + reference._type);
        },
    });
}
