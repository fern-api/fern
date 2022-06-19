import { ContainerType, PrimitiveType, TypeReference } from "@fern-api/api";
import { Directory, ts } from "ts-morph";
import { SourceFileManager } from "../SourceFileManager";
import { getNamedTypeReference } from "./getNamedTypeReference";

export function getTypeReference({
    reference,
    referencedIn,
    baseDirectory,
    baseDirectoryType,
    forceUseNamespaceImport,
}: {
    reference: TypeReference;
    referencedIn: SourceFileManager;
    baseDirectory: Directory;
    baseDirectoryType: getNamedTypeReference.Args["baseDirectoryType"];
    forceUseNamespaceImport?: getNamedTypeReference.Args["forceUseNamespaceImport"];
}): ts.TypeNode {
    return TypeReference._visit(reference, {
        named: (named) =>
            getNamedTypeReference({
                typeName: named,
                referencedIn,
                baseDirectory: baseDirectory,
                baseDirectoryType,
                forceUseNamespaceImport,
            }),
        primitive: (primitive) => {
            return PrimitiveType._visit<ts.TypeNode>(primitive, {
                boolean: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
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
                        getTypeReference({
                            reference: map.keyType,
                            referencedIn,
                            baseDirectory,
                            baseDirectoryType,
                        }),
                        getTypeReference({
                            reference: map.valueType,
                            referencedIn,
                            baseDirectory,
                            baseDirectoryType,
                        }),
                    ]),
                list: (list) =>
                    ts.factory.createArrayTypeNode(
                        getTypeReference({ reference: list, referencedIn, baseDirectory, baseDirectoryType })
                    ),
                set: (set) =>
                    ts.factory.createArrayTypeNode(
                        getTypeReference({ reference: set, referencedIn, baseDirectory, baseDirectoryType })
                    ),
                optional: (optional) =>
                    ts.factory.createUnionTypeNode([
                        getTypeReference({
                            reference: optional,
                            referencedIn,
                            baseDirectory,
                            baseDirectoryType,
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
