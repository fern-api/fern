import { assertNever } from "@fern-api/core-utils";
import { DeclaredTypeName, Literal, MapType, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-sdk/api";
import { InlineConsts, TypeReferenceNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";

import { AbstractTypeReferenceConverter, ConvertTypeReferenceParams } from "./AbstractTypeReferenceConverter";

export declare namespace AbstractTypeReferenceToTypeNodeConverter {
    export interface Init extends AbstractTypeReferenceConverter.Init {
        getReferenceToNamedType: (typeName: DeclaredTypeName, params: ConvertTypeReferenceParams) => ts.EntityName;
        generateForInlineUnion: (typeName: DeclaredTypeName) => {
            typeNode: ts.TypeNode;
            requestTypeNode: ts.TypeNode | undefined;
            responseTypeNode: ts.TypeNode | undefined;
        };
    }
}
export abstract class AbstractTypeReferenceToTypeNodeConverter extends AbstractTypeReferenceConverter<TypeReferenceNode> {
    protected getReferenceToNamedType: (
        typeName: DeclaredTypeName,
        params: ConvertTypeReferenceParams
    ) => ts.EntityName;
    protected generateForInlineUnion: (typeName: DeclaredTypeName) => {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    };

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
        const resolvedType = this.context.type.resolveTypeName(typeName);
        const isOptional = ResolvedTypeReference._visit<boolean>(resolvedType, {
            container: (container) => this.container(container, params).isOptional,
            primitive: (primitive) => this.primitive(primitive, params).isOptional,
            named: () => false,
            unknown: () => this.unknown().isOptional,
            _other: () => {
                throw new Error("Unexpected ResolvedTypeReference type: " + resolvedType.type);
            }
        });

        let typeNodeWithoutUndefined: ts.TypeNode;
        let requestTypeNodeWithoutUndefined: ts.TypeNode | undefined;
        let responseTypeNodeWithoutUndefined: ts.TypeNode | undefined;
        const typeDeclaration = this.context.type.getTypeDeclaration(typeName);
        if (this.enableInlineTypes && typeDeclaration.inline) {
            if (ConvertTypeReferenceParams.isInlinePropertyParams(params)) {
                typeNodeWithoutUndefined = this.createTypeReferenceForInlinePropertyNamedType(params);
            } else if (ConvertTypeReferenceParams.isInlineAliasParams(params)) {
                typeNodeWithoutUndefined = this.createTypeReferenceForInlineAliasNamedType(typeName, params);
            } else if (ConvertTypeReferenceParams.isForInlineUnionParams(params)) {
                const types = this.createTypeReferenceForInlineNamedTypeForInlineUnion(typeName);
                typeNodeWithoutUndefined = types.typeNode;
                requestTypeNodeWithoutUndefined = types.requestTypeNode;
                responseTypeNodeWithoutUndefined = types.responseTypeNode;
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

        const needsRequestResponseTypeVariant = this.context.type.needsRequestResponseTypeVariantById(typeName.typeId);
        if (!requestTypeNodeWithoutUndefined && needsRequestResponseTypeVariant.request) {
            requestTypeNodeWithoutUndefined = this.addRequestToTypeNode(typeNodeWithoutUndefined);
        }
        if (!responseTypeNodeWithoutUndefined && needsRequestResponseTypeVariant.response) {
            responseTypeNodeWithoutUndefined = this.addResponseToTypeNode(typeNodeWithoutUndefined);
        }
        if (!isOptional) {
            return this.generateNonOptionalTypeReferenceNode({
                typeNode: typeNodeWithoutUndefined,
                requestTypeNode: this.generateReadWriteOnlyTypes ? requestTypeNodeWithoutUndefined : undefined,
                responseTypeNode: this.generateReadWriteOnlyTypes ? responseTypeNodeWithoutUndefined : undefined
            });
        } else {
            return {
                isOptional: true,
                typeNodeWithoutUndefined,
                typeNode: this.addUndefinedToTypeNode(typeNodeWithoutUndefined),
                requestTypeNode: this.generateReadWriteOnlyTypes
                    ? requestTypeNodeWithoutUndefined
                        ? this.addUndefinedToTypeNode(requestTypeNodeWithoutUndefined)
                        : undefined
                    : undefined,
                requestTypeNodeWithoutUndefined: this.generateReadWriteOnlyTypes
                    ? requestTypeNodeWithoutUndefined
                    : undefined,
                responseTypeNode: this.generateReadWriteOnlyTypes
                    ? responseTypeNodeWithoutUndefined
                        ? this.addUndefinedToTypeNode(responseTypeNodeWithoutUndefined)
                        : undefined
                    : undefined,
                responseTypeNodeWithoutUndefined: this.generateReadWriteOnlyTypes
                    ? responseTypeNodeWithoutUndefined
                    : undefined
            };
        }
    }

    private createTypeReferenceForInlineNamedTypeForInlineUnion(typeName: DeclaredTypeName): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    } {
        return this.generateForInlineUnion(typeName);
    }

    private createTypeReferenceForInlineAliasNamedType(
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

    private createTypeReferenceForInlinePropertyNamedType({
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
        return this.generateNonOptionalTypeReferenceNode({
            typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
            requestTypeNode: undefined,
            responseTypeNode: undefined
        });
    }

    protected override boolean(): TypeReferenceNode {
        return this.generateNonOptionalTypeReferenceNode({
            typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
            requestTypeNode: undefined,
            responseTypeNode: undefined
        });
    }

    protected override number(): TypeReferenceNode {
        return this.generateNonOptionalTypeReferenceNode({
            typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            requestTypeNode: undefined,
            responseTypeNode: undefined
        });
    }

    protected override long(): TypeReferenceNode {
        if (this.useBigInt) {
            if (this.includeSerdeLayer) {
                return this.generateNonOptionalTypeReferenceNode({
                    typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.BigIntKeyword),
                    requestTypeNode: undefined,
                    responseTypeNode: undefined
                });
            }
            return this.generateNonOptionalTypeReferenceNode({
                typeNode: ts.factory.createUnionTypeNode([
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.BigIntKeyword)
                ]),
                requestTypeNode: undefined,
                responseTypeNode: undefined
            });
        }
        return this.generateNonOptionalTypeReferenceNode({
            typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            requestTypeNode: undefined,
            responseTypeNode: undefined
        });
    }

    protected override bigInteger(): TypeReferenceNode {
        if (this.useBigInt) {
            if (this.includeSerdeLayer) {
                return this.generateNonOptionalTypeReferenceNode({
                    typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.BigIntKeyword),
                    requestTypeNode: undefined,
                    responseTypeNode: undefined
                });
            }
            return this.generateNonOptionalTypeReferenceNode({
                typeNode: ts.factory.createUnionTypeNode([
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.BigIntKeyword)
                ]),
                requestTypeNode: undefined,
                responseTypeNode: undefined
            });
        }
        return this.generateNonOptionalTypeReferenceNode({
            typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
            requestTypeNode: undefined,
            responseTypeNode: undefined
        });
    }

    protected override nullable(itemType: TypeReference, params: ConvertTypeReferenceParams): TypeReferenceNode {
        return this.generateNonOptionalTypeReferenceNode({
            typeNode: this.addNullToTypeNode(this.convert({ ...params, typeReference: itemType }).typeNode),
            requestTypeNode: undefined,
            responseTypeNode: undefined
        });
    }

    protected override optional(itemType: TypeReference, params: ConvertTypeReferenceParams): TypeReferenceNode {
        const referencedToValueType = this.convert({ ...params, typeReference: itemType }).typeNode;
        const needsRequestResponseTypeVariant = this.context.type.needsRequestResponseTypeVariant(itemType);
        return {
            isOptional: true,
            typeNode: this.addUndefinedToTypeNode(referencedToValueType),
            typeNodeWithoutUndefined: referencedToValueType,
            requestTypeNode: needsRequestResponseTypeVariant.request
                ? this.addUndefinedToTypeNode(this.addRequestToTypeNode(referencedToValueType))
                : undefined,
            requestTypeNodeWithoutUndefined: needsRequestResponseTypeVariant.request
                ? this.addRequestToTypeNode(referencedToValueType)
                : undefined,
            responseTypeNode: needsRequestResponseTypeVariant.response
                ? this.addUndefinedToTypeNode(this.addResponseToTypeNode(referencedToValueType))
                : undefined,
            responseTypeNodeWithoutUndefined: needsRequestResponseTypeVariant.response
                ? this.addResponseToTypeNode(referencedToValueType)
                : undefined
        };
    }

    private addNullToTypeNode(typeNode: ts.TypeNode): ts.TypeNode {
        return ts.factory.createUnionTypeNode([typeNode, ts.factory.createLiteralTypeNode(ts.factory.createNull())]);
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
            typeNodeWithoutUndefined: typeNode,
            requestTypeNode: undefined,
            requestTypeNodeWithoutUndefined: undefined,
            responseTypeNode: undefined,
            responseTypeNodeWithoutUndefined: undefined
        };
    }

    protected override any(): TypeReferenceNode {
        const typeNode = ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
        return {
            isOptional: true,
            typeNode,
            typeNodeWithoutUndefined: typeNode,
            requestTypeNode: undefined,
            requestTypeNodeWithoutUndefined: undefined,
            responseTypeNode: undefined,
            responseTypeNodeWithoutUndefined: undefined
        };
    }

    protected override list(itemType: TypeReference, params: ConvertTypeReferenceParams): TypeReferenceNode {
        const itemTypeNode = this.convert({ ...params, typeReference: itemType });
        return this.generateNonOptionalTypeReferenceNode({
            typeNode: ts.factory.createArrayTypeNode(itemTypeNode.typeNode),
            requestTypeNode: itemTypeNode.requestTypeNode
                ? ts.factory.createArrayTypeNode(itemTypeNode.requestTypeNode)
                : undefined,
            responseTypeNode: itemTypeNode.responseTypeNode
                ? ts.factory.createArrayTypeNode(itemTypeNode.responseTypeNode)
                : undefined
        });
    }

    protected override literal(literal: Literal): TypeReferenceNode {
        return Literal._visit(literal, {
            string: (value) => {
                const typeNode = ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(value));
                return {
                    isOptional: false,
                    typeNode,
                    typeNodeWithoutUndefined: typeNode,
                    requestTypeNode: undefined,
                    requestTypeNodeWithoutUndefined: undefined,
                    responseTypeNode: undefined,
                    responseTypeNodeWithoutUndefined: undefined
                };
            },
            boolean: (value) => {
                const typeNode = ts.factory.createLiteralTypeNode(
                    value ? ts.factory.createTrue() : ts.factory.createFalse()
                );
                return {
                    isOptional: false,
                    typeNode,
                    typeNodeWithoutUndefined: typeNode,
                    requestTypeNode: undefined,
                    requestTypeNodeWithoutUndefined: undefined,
                    responseTypeNode: undefined,
                    responseTypeNodeWithoutUndefined: undefined
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
        const keyTypeNode = this.convert({ ...params, typeReference: map.keyType });
        const valueTypeNode = this.convert({ ...params, typeReference: map.valueType });
        return this.generateNonOptionalTypeReferenceNode({
            typeNode: ts.factory.createTypeReferenceNode("Record", [keyTypeNode.typeNode, valueTypeNode.typeNode]),
            requestTypeNode:
                keyTypeNode.requestTypeNode || valueTypeNode.requestTypeNode
                    ? ts.factory.createTypeReferenceNode("Record", [
                          keyTypeNode.requestTypeNode ?? keyTypeNode.typeNode,
                          valueTypeNode.requestTypeNode ?? valueTypeNode.typeNode
                      ])
                    : undefined,
            responseTypeNode:
                keyTypeNode.responseTypeNode || valueTypeNode.responseTypeNode
                    ? ts.factory.createTypeReferenceNode("Record", [
                          keyTypeNode.responseTypeNode ?? keyTypeNode.typeNode,
                          valueTypeNode.responseTypeNode ?? valueTypeNode.typeNode
                      ])
                    : undefined
        });
    }

    protected mapWithOptionalValues(map: MapType, params: ConvertTypeReferenceParams): TypeReferenceNode {
        const valueType = this.convert({ ...params, typeReference: map.valueType });
        const keyType = this.convert({ ...params, typeReference: map.keyType });
        const optionalValueTypeNode = valueType.isOptional ? valueType : this.optional(map.valueType, params);
        return this.generateNonOptionalTypeReferenceNode({
            typeNode: ts.factory.createTypeReferenceNode("Record", [keyType.typeNode, optionalValueTypeNode.typeNode]),
            requestTypeNode: this.generateReadWriteOnlyTypes
                ? keyType.requestTypeNode || optionalValueTypeNode.requestTypeNode
                    ? ts.factory.createTypeReferenceNode("Record", [
                          keyType.requestTypeNode ?? keyType.typeNode,
                          optionalValueTypeNode.requestTypeNode ?? optionalValueTypeNode.typeNode
                      ])
                    : undefined
                : undefined,
            responseTypeNode: this.generateReadWriteOnlyTypes
                ? keyType.responseTypeNode || optionalValueTypeNode.responseTypeNode
                    ? ts.factory.createTypeReferenceNode("Record", [
                          keyType.responseTypeNode ?? keyType.typeNode,
                          optionalValueTypeNode.responseTypeNode ?? optionalValueTypeNode.typeNode
                      ])
                    : undefined
                : undefined
        });
    }
}
