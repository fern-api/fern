import { TypeReference } from "@fern-fern/ir-sdk/api";
import { TypeReferenceNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { AbstractTypeReferenceToTypeNodeConverter } from "./AbstractTypeReferenceToTypeNodeConverter";

export declare namespace TypeReferenceToParsedTypeNodeConverter {
    export interface Init extends AbstractTypeReferenceToTypeNodeConverter.Init<ConvertOptions> {}
    export interface ConvertOptions {
        parentInlineTypeName: string | undefined;
    }
}
type ConvertOptions = TypeReferenceToParsedTypeNodeConverter.ConvertOptions;

export class TypeReferenceToParsedTypeNodeConverter extends AbstractTypeReferenceToTypeNodeConverter<
    ConvertOptions | undefined
> {
    protected override set(itemType: TypeReference, options?: ConvertOptions): TypeReferenceNode {
        if (this.includeSerdeLayer && this.isTypeReferencePrimitive(itemType)) {
            const itemTypeNode = this.convert(itemType, options).typeNode;
            return this.generateNonOptionalTypeReferenceNode(ts.factory.createTypeReferenceNode("Set", [itemTypeNode]));
        } else {
            return this.list(itemType, options);
        }
    }

    protected override dateTime(): TypeReferenceNode {
        return this.includeSerdeLayer
            ? this.generateNonOptionalTypeReferenceNode(ts.factory.createTypeReferenceNode("Date"))
            : this.string();
    }
}
