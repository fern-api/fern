import { TypeReference } from "@fern-fern/ir-sdk/api";
import { TypeReferenceNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";

import { ConvertTypeReferenceParams } from "./AbstractTypeReferenceConverter";
import { AbstractTypeReferenceToTypeNodeConverter } from "./AbstractTypeReferenceToTypeNodeConverter";

export class TypeReferenceToRawTypeNodeConverter extends AbstractTypeReferenceToTypeNodeConverter {
    protected override set(itemType: TypeReference, params: ConvertTypeReferenceParams): TypeReferenceNode {
        const itemTypeNode = this.convert({ ...params, typeReference: itemType });
        return this.generateNonOptionalTypeReferenceNode({
            typeNode: ts.factory.createArrayTypeNode(itemTypeNode.typeNode),
            requestTypeNode: itemTypeNode.requestTypeNode,
            responseTypeNode: itemTypeNode.responseTypeNode
        });
    }

    protected override optional(itemType: TypeReference, params: ConvertTypeReferenceParams): TypeReferenceNode {
        const referencedToValueType = this.convert({ ...params, typeReference: itemType });
        return {
            isOptional: true,
            typeNode: ts.factory.createUnionTypeNode([
                referencedToValueType.typeNode,
                ts.factory.createLiteralTypeNode(ts.factory.createNull()),
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
            ]),
            typeNodeWithoutUndefined: ts.factory.createUnionTypeNode([
                referencedToValueType.typeNode,
                ts.factory.createLiteralTypeNode(ts.factory.createNull())
            ]),
            requestTypeNode: referencedToValueType.requestTypeNode
                ? ts.factory.createUnionTypeNode([
                      referencedToValueType.requestTypeNode,
                      ts.factory.createLiteralTypeNode(ts.factory.createNull()),
                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                  ])
                : undefined,
            requestTypeNodeWithoutUndefined: referencedToValueType.requestTypeNode
                ? ts.factory.createUnionTypeNode([
                      referencedToValueType.requestTypeNode,
                      ts.factory.createLiteralTypeNode(ts.factory.createNull())
                  ])
                : undefined,
            responseTypeNode: referencedToValueType.responseTypeNode
                ? ts.factory.createUnionTypeNode([
                      referencedToValueType.responseTypeNode,
                      ts.factory.createLiteralTypeNode(ts.factory.createNull()),
                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                  ])
                : undefined,
            responseTypeNodeWithoutUndefined: referencedToValueType.responseTypeNode
                ? ts.factory.createUnionTypeNode([
                      referencedToValueType.responseTypeNode,
                      ts.factory.createLiteralTypeNode(ts.factory.createNull())
                  ])
                : undefined
        };
    }

    protected override nullable(itemType: TypeReference, params: ConvertTypeReferenceParams): TypeReferenceNode {
        const referencedToValueType = this.convert({ ...params, typeReference: itemType });
        return {
            isOptional: true,
            typeNode: ts.factory.createUnionTypeNode([
                referencedToValueType.typeNode,
                ts.factory.createLiteralTypeNode(ts.factory.createNull()),
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
            ]),
            typeNodeWithoutUndefined: ts.factory.createUnionTypeNode([
                referencedToValueType.typeNode,
                ts.factory.createLiteralTypeNode(ts.factory.createNull())
            ]),
            requestTypeNode: referencedToValueType.requestTypeNode
                ? ts.factory.createUnionTypeNode([
                      referencedToValueType.requestTypeNode,
                      ts.factory.createLiteralTypeNode(ts.factory.createNull()),
                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                  ])
                : undefined,
            requestTypeNodeWithoutUndefined: referencedToValueType.requestTypeNode
                ? ts.factory.createUnionTypeNode([
                      referencedToValueType.requestTypeNode,
                      ts.factory.createLiteralTypeNode(ts.factory.createNull())
                  ])
                : undefined,
            responseTypeNode: referencedToValueType.responseTypeNode
                ? ts.factory.createUnionTypeNode([
                      referencedToValueType.responseTypeNode,
                      ts.factory.createLiteralTypeNode(ts.factory.createNull()),
                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                  ])
                : undefined,
            responseTypeNodeWithoutUndefined: referencedToValueType.responseTypeNode
                ? ts.factory.createUnionTypeNode([
                      referencedToValueType.responseTypeNode,
                      ts.factory.createLiteralTypeNode(ts.factory.createNull())
                  ])
                : undefined
        };
    }

    protected override dateTime(): TypeReferenceNode {
        return this.string();
    }

    protected override bigInteger(): TypeReferenceNode {
        if (this.useBigInt) {
            return this.generateNonOptionalTypeReferenceNode({
                typeNode: ts.factory.createUnionTypeNode([
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.BigIntKeyword),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
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

    protected override long(): TypeReferenceNode {
        if (this.useBigInt) {
            return this.bigInteger();
        }
        return this.number();
    }
}
