import { ContainerType, DeclaredTypeName, PrimitiveType, TypeReference } from "@fern-fern/ir-model/types";
import { ts } from "ts-morph";
import { TypeReferenceNode } from "./TypeReferenceNode";

export declare namespace getReferenceToType {
    export interface Args {
        typeReference: TypeReference;
        getReferenceToNamedType: (typeName: DeclaredTypeName) => ts.TypeNode;
    }
}

export function getReferenceToType({
    typeReference,
    getReferenceToNamedType,
}: getReferenceToType.Args): TypeReferenceNode {
    return TypeReference._visit<TypeReferenceNode>(typeReference, {
        named: (typeName) => {
            return {
                typeNode: getReferenceToNamedType(typeName),
                isOptional: false,
            };
        },

        primitive: (primitive) => {
            return {
                typeNode: ts.factory.createKeywordTypeNode(getSyntaxKindForPrimitive(primitive)),
                isOptional: false,
            };
        },

        container: (container) => {
            return ContainerType._visit<TypeReferenceNode>(container, {
                map: (map) => ({
                    typeNode: ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                        getReferenceToType({
                            typeReference: map.keyType,
                            getReferenceToNamedType,
                        }).typeNode,
                        getReferenceToType({
                            typeReference: map.valueType,
                            getReferenceToNamedType,
                        }).typeNode,
                    ]),
                    isOptional: false,
                }),
                list: (valueType) => ({
                    typeNode: ts.factory.createArrayTypeNode(
                        getReferenceToType({
                            typeReference: valueType,
                            getReferenceToNamedType,
                        }).typeNode
                    ),
                    isOptional: false,
                }),
                set: (valueType) => ({
                    typeNode: ts.factory.createArrayTypeNode(
                        getReferenceToType({
                            typeReference: valueType,
                            getReferenceToNamedType,
                        }).typeNode
                    ),
                    isOptional: false,
                }),
                optional: (valueType) => {
                    const referencedToValueType = getReferenceToType({
                        typeReference: valueType,
                        getReferenceToNamedType,
                    }).typeNode;
                    return {
                        typeNode: ts.factory.createUnionTypeNode([
                            referencedToValueType,
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                        ]),
                        typeNodeWithoutUndefined: referencedToValueType,
                        isOptional: true,
                    };
                },
                _unknown: () => {
                    throw new Error("Unexpected container type: " + container._type);
                },
            });
        },

        unknown: () => {
            const typeNode = ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
            return {
                typeNode,
                isOptional: true,
                typeNodeWithoutUndefined: typeNode,
            };
        },

        void: () => {
            return {
                typeNode: ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword),
                ]),
                isOptional: false,
            };
        },

        _unknown: () => {
            throw new Error("Unexpected type reference: " + typeReference._type);
        },
    });
}

export function getSyntaxKindForPrimitive(
    primitive: PrimitiveType
): ts.SyntaxKind.BooleanKeyword | ts.SyntaxKind.StringKeyword | ts.SyntaxKind.NumberKeyword {
    return PrimitiveType._visit<
        ts.SyntaxKind.BooleanKeyword | ts.SyntaxKind.StringKeyword | ts.SyntaxKind.NumberKeyword
    >(primitive, {
        boolean: () => ts.SyntaxKind.BooleanKeyword,
        double: () => ts.SyntaxKind.NumberKeyword,
        integer: () => ts.SyntaxKind.NumberKeyword,
        long: () => ts.SyntaxKind.NumberKeyword,
        string: () => ts.SyntaxKind.StringKeyword,
        uuid: () => ts.SyntaxKind.StringKeyword,
        dateTime: () => ts.SyntaxKind.StringKeyword,
        _unknown: () => {
            throw new Error("Unexpected primitive type: " + primitive);
        },
    });
}
