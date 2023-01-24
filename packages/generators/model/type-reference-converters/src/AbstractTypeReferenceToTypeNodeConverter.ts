import { DeclaredTypeName, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-model/types";
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
            _unknown: () => {
                throw new Error("Unexpected ResolvedTypeReference type: " + resolvedType._type);
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

    protected override list(itemType: TypeReference): TypeReferenceNode {
        return this.generateNonOptionalTypeReferenceNode(
            ts.factory.createArrayTypeNode(this.convert(itemType).typeNode)
        );
    }
}
