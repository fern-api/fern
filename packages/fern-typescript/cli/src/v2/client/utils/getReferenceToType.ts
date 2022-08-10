import { ContainerType, PrimitiveType, TypeReference } from "@fern-fern/ir-model";
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
}: getReferenceToType.Args): ts.TypeNode {
    return TypeReference._visit<ts.TypeNode>(typeReference, {
        named: (typeName) => {
            return getReferenceToExportedType({
                apiName,
                referencedIn,
                typeName: getGeneratedTypeName(typeName),
                exportedFromPath: getExportedFilepathForType(typeName, apiName),
                addImport,
            });
        },

        primitive: (primitive) => {
            return PrimitiveType._visit<ts.TypeNode>(primitive, {
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
            });
        },

        container: (container) => {
            return ContainerType._visit<ts.TypeNode>(container, {
                map: (map) =>
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                        getReferenceToType({
                            apiName,
                            referencedIn,
                            typeReference: map.keyType,
                            addImport,
                        }),
                        getReferenceToType({
                            apiName,
                            referencedIn,
                            typeReference: map.valueType,
                            addImport,
                        }),
                    ]),
                list: (valueType) =>
                    ts.factory.createArrayTypeNode(
                        getReferenceToType({
                            apiName,
                            referencedIn,
                            typeReference: valueType,
                            addImport,
                        })
                    ),
                set: (valueType) =>
                    ts.factory.createArrayTypeNode(
                        getReferenceToType({
                            apiName,
                            referencedIn,
                            typeReference: valueType,
                            addImport,
                        })
                    ),
                optional: (valueType) =>
                    ts.factory.createUnionTypeNode([
                        getReferenceToType({
                            apiName,
                            referencedIn,
                            typeReference: valueType,
                            addImport,
                        }),
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                    ]),
                _unknown: () => {
                    throw new Error("Unexpected container type: " + container._type);
                },
            });
        },

        unknown: () => {
            return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
        },

        void: () => {
            return ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword),
            ]);
        },

        _unknown: () => {
            throw new Error("Unexpected type reference: " + typeReference._type);
        },
    });
}
