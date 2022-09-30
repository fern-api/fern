import { DeclaredTypeName, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
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
        return {
            typeNode: ts.factory.createTypeReferenceNode(this.getReferenceToNamedType(typeName)),
            isOptional: false,
        };
    }

    protected override string(): TypeReferenceNode {
        return {
            typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
            isOptional: false,
        };
    }

    protected override boolean(): TypeReferenceNode {
        return {
            typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
            isOptional: false,
        };
    }

    protected override number(): TypeReferenceNode {
        return {
            typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            isOptional: false,
        };
    }

    protected override optional(itemType: TypeReference): TypeReferenceNode {
        const referencedToValueType = this.convert(itemType).typeNode;
        return {
            typeNode: ts.factory.createUnionTypeNode([
                referencedToValueType,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
            ]),
            typeNodeWithoutUndefined: referencedToValueType,
            isOptional: true,
        };
    }

    protected override unknown(): TypeReferenceNode {
        const typeNode = ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
        return {
            typeNode,
            isOptional: true,
            typeNodeWithoutUndefined: typeNode,
        };
    }

    protected override list(itemType: TypeReference): TypeReferenceNode {
        return {
            typeNode: ts.factory.createArrayTypeNode(this.convert(itemType).typeNode),
            isOptional: false,
        };
    }
}
