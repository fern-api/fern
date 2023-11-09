import { DeclaredTypeName, Literal, MapType, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-sdk/api";
import { TypeReferenceNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { AbstractTypeReferenceConverter } from "./AbstractTypeReferenceConverter";

export declare namespace AbstractTypeReferenceToTypeNodeConverter {
    export interface Init extends AbstractTypeReferenceConverter.Init {
        getReferenceToNamedType: (typeName: DeclaredTypeName) => ts.EntityName;
    }
}

export abstract class AbstractTypeReferenceToTypeNodeConverter extends AbstractTypeReferenceConverter<TypeReferenceNode> {
    protected getReferenceToNamedType: (typeName: DeclaredTypeName) => ts.EntityName;

    constructor({ getReferenceToNamedType, ...superInit }: AbstractTypeReferenceToTypeNodeConverter.Init) {
        super(superInit);
        this.getReferenceToNamedType = getReferenceToNamedType;
    }

    protected override named(typeName: DeclaredTypeName): TypeReferenceNode {
        const resolvedType = this.typeResolver.resolveTypeName(typeName);
        const isOptional = ResolvedTypeReference._visit<boolean>(resolvedType, {
            container: (container) => this.container(container).isOptional,
            primitive: (primitive) => this.primitive(primitive).isOptional,
            named: () => false,
            unknown: () => this.unknown().isOptional,
            _other: () => {
                throw new Error("Unexpected ResolvedTypeReference type: " + resolvedType.type);
            },
        });

        const typeNodeWithoutUndefined = ts.factory.createTypeReferenceNode(this.getReferenceToNamedType(typeName));
        if (!isOptional) {
            return this.generateNonOptionalTypeReferenceNode(typeNodeWithoutUndefined);
        } else {
            return {
                isOptional: true,
                typeNodeWithoutUndefined,
                typeNode: this.addUndefinedToTypeNode(typeNodeWithoutUndefined),
            };
        }
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

    protected override optional(itemType: TypeReference): TypeReferenceNode {
        const referencedToValueType = this.convert(itemType).typeNode;
        return {
            isOptional: true,
            typeNode: this.addUndefinedToTypeNode(referencedToValueType),
            typeNodeWithoutUndefined: referencedToValueType,
        };
    }

    private addUndefinedToTypeNode(typeNode: ts.TypeNode): ts.TypeNode {
        return ts.factory.createUnionTypeNode([
            typeNode,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
        ]);
    }

    protected override unknown(): TypeReferenceNode {
        const typeNode = ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
        return {
            isOptional: true,
            typeNode,
            typeNodeWithoutUndefined: typeNode,
        };
    }

    protected override any(): TypeReferenceNode {
        const typeNode = ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
        return {
            isOptional: true,
            typeNode,
            typeNodeWithoutUndefined: typeNode,
        };
    }

    protected override list(itemType: TypeReference): TypeReferenceNode {
        return this.generateNonOptionalTypeReferenceNode(
            ts.factory.createArrayTypeNode(this.convert(itemType).typeNode)
        );
    }

    protected override literal(literal: Literal): TypeReferenceNode {
        return Literal._visit(literal, {
            string: (value) => {
                const typeNode = ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(value));
                return {
                    isOptional: false,
                    typeNode,
                    typeNodeWithoutUndefined: typeNode,
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
                };
            },
            _other: () => {
                throw new Error("Unknown literal: " + literal.type);
            },
        });
    }

    protected override mapWithEnumKeys(map: MapType): TypeReferenceNode {
        return this.mapWithOptionalValues(map);
    }

    protected override mapWithNonEnumKeys(map: MapType): TypeReferenceNode {
        return this.generateNonOptionalTypeReferenceNode(
            ts.factory.createTypeReferenceNode("Record", [
                this.convert(map.keyType).typeNode,
                this.convert(map.valueType).typeNode,
            ])
        );
    }

    protected mapWithOptionalValues(map: MapType): TypeReferenceNode {
        const valueType = this.convert(map.valueType);
        return this.generateNonOptionalTypeReferenceNode(
            ts.factory.createTypeReferenceNode("Record", [
                this.convert(map.keyType).typeNode,
                (valueType.isOptional ? valueType : this.optional(map.valueType)).typeNode,
            ])
        );
    }
}
