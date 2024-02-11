import { TypeReference } from "@fern-fern/ir-sdk/api";
import { TypeReferenceNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { AbstractTypeReferenceToTypeNodeConverter } from "./AbstractTypeReferenceToTypeNodeConverter";

export declare namespace TypeReferenceToParsedTypeNodeConverter {
    export interface Init extends AbstractTypeReferenceToTypeNodeConverter.Init {}
}

export class TypeReferenceToParsedTypeNodeConverter extends AbstractTypeReferenceToTypeNodeConverter {
    private includeSerdeLayer: boolean;

    constructor(superInit: TypeReferenceToParsedTypeNodeConverter.Init) {
        super(superInit);
        this.includeSerdeLayer = superInit.includeSerdeLayer;
    }

    protected override set(itemType: TypeReference): TypeReferenceNode {
        if (this.includeSerdeLayer && this.isTypeReferencePrimitive(itemType)) {
            const itemTypeNode = this.convert(itemType).typeNode;
            return this.generateNonOptionalTypeReferenceNode(ts.factory.createTypeReferenceNode("Set", [itemTypeNode]));
        } else {
            return this.list(itemType);
        }
    }

    protected override dateTime(): TypeReferenceNode {
        return this.includeSerdeLayer
            ? this.generateNonOptionalTypeReferenceNode(ts.factory.createTypeReferenceNode("Date"))
            : this.string();
    }
}
