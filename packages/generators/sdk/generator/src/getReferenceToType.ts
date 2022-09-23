import { ContainerType, DeclaredTypeName, PrimitiveType, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";

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
                typeNode: PrimitiveType._visit<ts.TypeNode>(primitive, {
                    boolean: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
                    double: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                    integer: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                    long: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                    string: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    uuid: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    dateTime: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    _unknown: () => {
                        throw new Error("Unexpected primitive type: " + primitive);
                    },
                }),
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
            return {
                typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
                isOptional: false,
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
