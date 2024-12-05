import { TypeReference } from "@fern-fern/ir-sdk/api";
import { TypeReferenceNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { AbstractTypeReferenceToTypeNodeConverter } from "./AbstractTypeReferenceToTypeNodeConverter";

export namespace TypeReferenceToRawTypeNodeConverter {
    export interface Options {
        parentInlineTypeName: string | undefined;
    }
}

type Options = TypeReferenceToRawTypeNodeConverter.Options;

export class TypeReferenceToRawTypeNodeConverter extends AbstractTypeReferenceToTypeNodeConverter<Options> {
    protected override set(itemType: TypeReference, options: Options): TypeReferenceNode {
        return this.generateNonOptionalTypeReferenceNode(
            ts.factory.createArrayTypeNode(this.convert(itemType, options).typeNode)
        );
    }

    protected override optional(itemType: TypeReference, options: Options): TypeReferenceNode {
        const referencedToValueType = this.convert(itemType, options).typeNode;
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
