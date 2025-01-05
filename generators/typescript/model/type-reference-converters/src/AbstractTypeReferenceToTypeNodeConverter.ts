import { TypeReferenceNode } from "@fern-typescript/commons";
import { InlineConsts } from "@fern-typescript/commons/src/codegen-utils/inlineConsts";
import { ts } from "ts-morph";

import { assertNever } from "@fern-api/core-utils";

import { DeclaredTypeName, Literal, MapType, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-sdk/api";

import { AbstractTypeReferenceConverter, ConvertTypeReferenceParams } from "./AbstractTypeReferenceConverter";

export declare namespace AbstractTypeReferenceToTypeNodeConverter {
    export interface Init extends AbstractTypeReferenceConverter.Init {
        getReferenceToNamedType: (typeName: DeclaredTypeName, params: ConvertTypeReferenceParams) => ts.EntityName;
        generateForInlineUnion: (typeName: DeclaredTypeName) => ts.TypeNode;
    }
}

export abstract class AbstractTypeReferenceToTypeNodeConverter extends AbstractTypeReferenceConverter<TypeReferenceNode> {
    protected getReferenceToNamedType: (
        typeName: DeclaredTypeName,
        params: ConvertTypeReferenceParams
    ) => ts.EntityName;
    protected generateForInlineUnion: (typeName: DeclaredTypeName) => ts.TypeNode;

    constructor({
        getReferenceToNamedType,
        generateForInlineUnion,
        ...superInit
    }: AbstractTypeReferenceToTypeNodeConverter.Init) {
        super(superInit);
        this.getReferenceToNamedType = getReferenceToNamedType;
        this.generateForInlineUnion = generateForInlineUnion;
    }

    protected override named(typeName: DeclaredTypeName, params: ConvertTypeReferenceParams): TypeReferenceNode {
        const resolvedType = this.typeResolver.resolveTypeName(typeName);
        const isOptional = ResolvedTypeReference._visit<boolean>(resolvedType, {
            container: (container) => this.container(container, params).isOptional,
            primitive: (primitive) => this.primitive(primitive).isOptional,
            named: () => false,
            unknown: () => this.unknown().isOptional,
            _other: () => {
                throw new Error("Unexpected ResolvedTypeReference type: " + resolvedType.type);
            }
        });

        let typeNodeWithoutUndefined: ts.TypeNode;
        const typeDeclaration = this.typeResolver.getTypeDeclarationFromName(typeName);
        if (this.enableInlineTypes && typeDeclaration.inline) {
            if (ConvertTypeReferenceParams.isInlinePropertyParams(params)) {
                typeNodeWithoutUndefined = this.createTypeRefenceForInlinePropertyNamedType(params);
            } else if (ConvertTypeReferenceParams.isInlineAliasParams(params)) {
                typeNodeWithoutUndefined = this.createTypeRefenceForInlineAliasNamedType(typeName, params);
            } else if (ConvertTypeReferenceParams.isForInlineUnionParams(params)) {
                typeNodeWithoutUndefined = this.createTypeRefenceForInlineNamedTypeForInlineUnion(typeName);
            } else {
                typeNodeWithoutUndefined = ts.factory.createTypeReferenceNode(
                    this.getReferenceToNamedType(typeName, params)
                );
            }
        } else {
            typeNodeWithoutUndefined = ts.factory.createTypeReferenceNode(
                this.getReferenceToNamedType(typeName, params)
            );
        }

        if (!isOptional) {
            return this.generateNonOptionalTypeReferenceNode(typeNodeWithoutUndefined);
        } else {
            return {
                isOptional: true,
                typeNodeWithoutUndefined,
                typeNode: this.addUndefinedToTypeNode(typeNodeWithoutUndefined)
            };
        }
    }

    private createTypeRefenceForInlineNamedTypeForInlineUnion(typeName: DeclaredTypeName): ts.TypeNode {
        return this.generateForInlineUnion(typeName);
    }

    private createTypeRefenceForInlineAliasNamedType(
        typeName: DeclaredTypeName,
        params: ConvertTypeReferenceParams.InlineAliasTypeParams
    ): ts.TypeNode {
        let name: ts.EntityName = ts.factory.createIdentifier(params.aliasTypeName);
        switch (params.genericIn) {
            case "list":
                name = ts.factory.createQualifiedName(name, InlineConsts.LIST_ITEM_TYPE_NAME);
                break;
            case "map":
                name = ts.factory.createQualifiedName(name, InlineConsts.MAP_VALUE_TYPE_NAME);
                break;
            case "set":
                name = ts.factory.createQualifiedName(name, InlineConsts.LIST_ITEM_TYPE_NAME);
                break;
            default:
                return ts.factory.createTypeReferenceNode(this.getReferenceToNamedType(typeName, params));
        }

        return ts.factory.createTypeReferenceNode(name);
    }

    private createTypeRefenceForInlinePropertyNamedType({
        parentTypeName,
        propertyName,
        genericIn
    }: ConvertTypeReferenceParams.InlinePropertyTypeParams): ts.TypeNode {
        let name = ts.factory.createQualifiedName(
            ts.factory.createIdentifier(parentTypeName),
            ts.factory.createIdentifier(propertyName)
        );
        switch (genericIn) {
            case "list":
                name = ts.factory.createQualifiedName(name, InlineConsts.LIST_ITEM_TYPE_NAME);
                break;
            case "map":
                name = ts.factory.createQualifiedName(name, InlineConsts.MAP_VALUE_TYPE_NAME);
                break;
            case "set":
                name = ts.factory.createQualifiedName(name, InlineConsts.LIST_ITEM_TYPE_NAME);
                break;
            case undefined:
                break;
            default:
                assertNever(genericIn);
        }

        return ts.factory.createTypeReferenceNode(name);
    }

    protected override string(): TypeReferenceNode {
        return this.generateNonOptionalTypeReferenceNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword));
    }

    protected override boolean(): TypeReferenceNode {
        return this.generateNonOptionalTypeReferenceNode(
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword)
        );
    }

    protected override number(): TypeReferenceNode {
        return this.generateNonOptionalTypeReferenceNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword));
    }

    protected override long(): TypeReferenceNode {
        if (this.includeSerdeLayer && this.useBigInt) {
            return this.generateNonOptionalTypeReferenceNode(
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.BigIntKeyword)
            );
        }
        return this.generateNonOptionalTypeReferenceNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword));
    }

    protected override bigInteger(): TypeReferenceNode {
        if (this.includeSerdeLayer && this.useBigInt) {
            return this.generateNonOptionalTypeReferenceNode(
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.BigIntKeyword)
            );
        }
        return this.generateNonOptionalTypeReferenceNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword));
    }

    protected override optional(itemType: TypeReference, params: ConvertTypeReferenceParams): TypeReferenceNode {
        const referencedToValueType = this.convert({ ...params, typeReference: itemType }).typeNode;
        return {
            isOptional: true,
            typeNode: this.addUndefinedToTypeNode(referencedToValueType),
            typeNodeWithoutUndefined: referencedToValueType
        };
    }

    private addUndefinedToTypeNode(typeNode: ts.TypeNode): ts.TypeNode {
        return ts.factory.createUnionTypeNode([
            typeNode,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
        ]);
    }

    protected override unknown(): TypeReferenceNode {
        const typeNode = ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
        return {
            isOptional: true,
            typeNode,
            typeNodeWithoutUndefined: typeNode
        };
    }

    protected override any(): TypeReferenceNode {
        const typeNode = ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
        return {
            isOptional: true,
            typeNode,
            typeNodeWithoutUndefined: typeNode
        };
    }

    protected override list(itemType: TypeReference, params: ConvertTypeReferenceParams): TypeReferenceNode {
        return this.generateNonOptionalTypeReferenceNode(
            ts.factory.createArrayTypeNode(this.convert({ ...params, typeReference: itemType }).typeNode)
        );
    }

    protected override literal(literal: Literal): TypeReferenceNode {
        return Literal._visit(literal, {
            string: (value) => {
                const typeNode = ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(value));
                return {
                    isOptional: false,
                    typeNode,
                    typeNodeWithoutUndefined: typeNode
                };
            },
            boolean: (value) => {
                const typeNode = ts.factory.createLiteralTypeNode(
                    value ? ts.factory.createTrue() : ts.factory.createFalse()
                );
                return {
                    isOptional: false,
                    typeNode,
                    typeNodeWithoutUndefined: typeNode
                };
            },
            _other: () => {
                throw new Error("Unknown literal: " + literal.type);
            }
        });
    }

    protected override mapWithEnumKeys(map: MapType, params: ConvertTypeReferenceParams): TypeReferenceNode {
        return this.mapWithOptionalValues(map, params);
    }

    protected override mapWithNonEnumKeys(map: MapType, params: ConvertTypeReferenceParams): TypeReferenceNode {
        return this.generateNonOptionalTypeReferenceNode(
            ts.factory.createTypeReferenceNode("Record", [
                this.convert({ ...params, typeReference: map.keyType }).typeNode,
                this.convert({ ...params, typeReference: map.valueType }).typeNode
            ])
        );
    }

    protected mapWithOptionalValues(map: MapType, params: ConvertTypeReferenceParams): TypeReferenceNode {
        const valueType = this.convert({ ...params, typeReference: map.valueType });
        return this.generateNonOptionalTypeReferenceNode(
            ts.factory.createTypeReferenceNode("Record", [
                this.convert({ ...params, typeReference: map.keyType }).typeNode,
                (valueType.isOptional ? valueType : this.optional(map.valueType, params)).typeNode
            ])
        );
    }
}
