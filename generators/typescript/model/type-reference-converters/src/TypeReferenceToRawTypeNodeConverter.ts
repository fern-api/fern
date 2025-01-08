import { TypeReferenceNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";

import { TypeReference } from "@fern-fern/ir-sdk/api";

import { ConvertTypeReferenceParams } from "./AbstractTypeReferenceConverter";
import { AbstractTypeReferenceToTypeNodeConverter } from "./AbstractTypeReferenceToTypeNodeConverter";

export class TypeReferenceToRawTypeNodeConverter extends AbstractTypeReferenceToTypeNodeConverter {
    protected override set(itemType: TypeReference, params: ConvertTypeReferenceParams): TypeReferenceNode {
        return this.generateNonOptionalTypeReferenceNode(
            ts.factory.createArrayTypeNode(this.convert({ ...params, typeReference: itemType }).typeNode)
        );
    }

    protected override optional(itemType: TypeReference, params: ConvertTypeReferenceParams): TypeReferenceNode {
        const referencedToValueType = this.convert({ ...params, typeReference: itemType }).typeNode;
        return {
            isOptional: true,
            typeNode: ts.factory.createUnionTypeNode([
                referencedToValueType,
                ts.factory.createLiteralTypeNode(ts.factory.createNull()),
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
            ]),
            typeNodeWithoutUndefined: ts.factory.createUnionTypeNode([
                referencedToValueType,
                ts.factory.createLiteralTypeNode(ts.factory.createNull())
            ])
        };
    }

    protected override dateTime(): TypeReferenceNode {
        return this.string();
    }

    protected override bigInteger(): TypeReferenceNode {
        return this.string();
    }

    protected override long(): TypeReferenceNode {
        if (this.useBigInt) {
            return this.string();
        }
        return this.number();
    }
}
