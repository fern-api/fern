import { DeclaredTypeName, Literal, MapType, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-sdk/api";
import { TypeReferenceNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { assertNever } from "../../../utils/commons/node_modules/@fern-api/core-utils/src";
import { AbstractTypeReferenceConverter, ConvertTypeReferenceParams } from "./AbstractTypeReferenceConverter";

export declare namespace AbstractTypeReferenceToTypeNodeConverter {
    export interface Init extends AbstractTypeReferenceConverter.Init {
        getReferenceToNamedType: (
            typeName: DeclaredTypeName,
            inlineType: ConvertTypeReferenceParams.InlineType | undefined
        ) => ts.EntityName;
    }
}

export abstract class AbstractTypeReferenceToTypeNodeConverter extends AbstractTypeReferenceConverter<TypeReferenceNode> {
    protected getReferenceToNamedType: (
        typeName: DeclaredTypeName,
        inlineType: ConvertTypeReferenceParams.InlineType | undefined
    ) => ts.EntityName;

    constructor({ getReferenceToNamedType, ...superInit }: AbstractTypeReferenceToTypeNodeConverter.Init) {
        super(superInit);
        this.getReferenceToNamedType = getReferenceToNamedType;
    }

    protected override named(
        typeName: DeclaredTypeName,
        inlineType: ConvertTypeReferenceParams.InlineType | undefined
    ): TypeReferenceNode {
        const resolvedType = this.typeResolver.resolveTypeName(typeName);
        const isOptional = ResolvedTypeReference._visit<boolean>(resolvedType, {
            container: (container) => this.container(container, inlineType).isOptional,
            primitive: (primitive) => this.primitive(primitive).isOptional,
            named: () => false,
            unknown: () => this.unknown().isOptional,
            _other: () => {
                throw new Error("Unexpected ResolvedTypeReference type: " + resolvedType.type);
            }
        });

        let typeNodeWithoutUndefined: ts.TypeReferenceNode;
        const typeDeclaration = this.typeResolver.getTypeDeclarationFromName(typeName);
        if (typeDeclaration.inline && inlineType) {
            // if (!inlineType) {
            //     throw new Error(
            //         "ConvertTypeReferenceParams.inlineType is required for converting type to type reference"
            //     );
            // }
            typeNodeWithoutUndefined = this.createTypeRefenceForInlineNamedType(inlineType);
        } else {
            typeNodeWithoutUndefined = ts.factory.createTypeReferenceNode(
                this.getReferenceToNamedType(typeName, inlineType)
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

    private createTypeRefenceForInlineNamedType({
        parentTypeName,
        propertyName,
        genericIn
    }: ConvertTypeReferenceParams.InlineType): ts.TypeReferenceNode {
        let name = ts.factory.createQualifiedName(
            ts.factory.createIdentifier(parentTypeName),
            ts.factory.createIdentifier(propertyName)
        );
        switch (genericIn) {
            case "list":
                name = ts.factory.createQualifiedName(name, "Item");
                break;
            case "map":
                name = ts.factory.createQualifiedName(name, "Value");
                break;
            case "set":
                name = ts.factory.createQualifiedName(name, "Item");
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

    protected override optional(
        itemType: TypeReference,
        inlineType: ConvertTypeReferenceParams.InlineType | undefined
    ): TypeReferenceNode {
        const referencedToValueType = this.convert({ typeReference: itemType, inlineType }).typeNode;
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

    protected override list(
        itemType: TypeReference,
        inlineType: ConvertTypeReferenceParams.InlineType | undefined
    ): TypeReferenceNode {
        if (inlineType) {
            inlineType = {
                ...inlineType,
                genericIn: "list"
            };
        }
        return this.generateNonOptionalTypeReferenceNode(
            ts.factory.createArrayTypeNode(
                this.convert({
                    typeReference: itemType,
                    inlineType
                }).typeNode
            )
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

    protected override mapWithEnumKeys(
        map: MapType,
        inlineType: ConvertTypeReferenceParams.InlineType | undefined
    ): TypeReferenceNode {
        return this.mapWithOptionalValues(map, inlineType);
    }

    protected override mapWithNonEnumKeys(
        map: MapType,
        inlineType: ConvertTypeReferenceParams.InlineType | undefined
    ): TypeReferenceNode {
        return this.generateNonOptionalTypeReferenceNode(
            ts.factory.createTypeReferenceNode("Record", [
                this.convert({ typeReference: map.keyType, inlineType }).typeNode,
                this.convert({ typeReference: map.valueType, inlineType }).typeNode
            ])
        );
    }

    protected mapWithOptionalValues(
        map: MapType,
        inlineType: ConvertTypeReferenceParams.InlineType | undefined
    ): TypeReferenceNode {
        const valueType = this.convert({ typeReference: map.valueType, inlineType });
        return this.generateNonOptionalTypeReferenceNode(
            ts.factory.createTypeReferenceNode("Record", [
                this.convert({ typeReference: map.keyType, inlineType }).typeNode,
                (valueType.isOptional ? valueType : this.optional(map.valueType, inlineType)).typeNode
            ])
        );
    }
}
