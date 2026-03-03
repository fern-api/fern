import { FernIr } from "@fern-fern/ir-sdk";
import { TypeReferenceNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";

import { ConvertTypeReferenceParams } from "./AbstractTypeReferenceConverter.js";
import { AbstractTypeReferenceToTypeNodeConverter } from "./AbstractTypeReferenceToTypeNodeConverter.js";

export class TypeReferenceToRawTypeNodeConverter extends AbstractTypeReferenceToTypeNodeConverter {
    protected override set(itemType: FernIr.TypeReference, params: ConvertTypeReferenceParams): TypeReferenceNode {
        const itemTypeNode = this.convert({ ...params, typeReference: itemType });
        return this.generateNonOptionalTypeReferenceNode({
            typeNode: ts.factory.createArrayTypeNode(itemTypeNode.typeNode),
            requestTypeNode: itemTypeNode.requestTypeNode,
            responseTypeNode: itemTypeNode.responseTypeNode
        });
    }

    protected override optional(itemType: FernIr.TypeReference, params: ConvertTypeReferenceParams): TypeReferenceNode {
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

    protected override nullable(itemType: FernIr.TypeReference, params: ConvertTypeReferenceParams): TypeReferenceNode {
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

    protected override mapWithOptionalValues(
        map: FernIr.MapType,
        params: ConvertTypeReferenceParams
    ): TypeReferenceNode {
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
