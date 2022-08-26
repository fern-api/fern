import { ContainerType, PrimitiveType, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode } from "@fern-typescript/declaration-handler";
import { SourceFile, ts } from "ts-morph";
import { ImportDeclaration } from "../../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../../types";
import { getExportedFilepathForType } from "./getExportedFilepathForType";
import { getGeneratedTypeName } from "./getGeneratedTypeName";
import { getReferenceToExportedType } from "./getReferenceToExportedType";

export declare namespace getReferenceToType {
    export interface Args {
        apiName: string;
        referencedIn: SourceFile;
        typeReference: TypeReference;
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
    }
}

export function getReferenceToType({
    apiName,
    referencedIn,
    typeReference,
    addImport,
}: getReferenceToType.Args): TypeReferenceNode {
    return TypeReference._visit<TypeReferenceNode>(typeReference, {
        named: (typeName) => {
            return {
                typeNode: getReferenceToExportedType({
                    apiName,
                    referencedIn,
                    typeName: getGeneratedTypeName(typeName),
                    exportedFromPath: getExportedFilepathForType(typeName, apiName),
                    addImport,
                }),
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
                            apiName,
                            referencedIn,
                            typeReference: map.keyType,
                            addImport,
                        }).typeNode,
                        getReferenceToType({
                            apiName,
                            referencedIn,
                            typeReference: map.valueType,
                            addImport,
                        }).typeNode,
                    ]),
                    isOptional: false,
                }),
                list: (valueType) => ({
                    typeNode: ts.factory.createArrayTypeNode(
                        getReferenceToType({
                            apiName,
                            referencedIn,
                            typeReference: valueType,
                            addImport,
                        }).typeNode
                    ),
                    isOptional: false,
                }),
                set: (valueType) => ({
                    typeNode: ts.factory.createArrayTypeNode(
                        getReferenceToType({
                            apiName,
                            referencedIn,
                            typeReference: valueType,
                            addImport,
                        }).typeNode
                    ),
                    isOptional: false,
                }),
                optional: (valueType) => {
                    const referencedToValueType = getReferenceToType({
                        apiName,
                        referencedIn,
                        typeReference: valueType,
                        addImport,
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
