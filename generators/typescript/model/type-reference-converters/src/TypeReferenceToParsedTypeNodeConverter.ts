import { TypeReferenceNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";

import { TypeReference } from "@fern-fern/ir-sdk/api";

import { ConvertTypeReferenceParams } from "./AbstractTypeReferenceConverter";
import { AbstractTypeReferenceToTypeNodeConverter } from "./AbstractTypeReferenceToTypeNodeConverter";

export declare namespace TypeReferenceToParsedTypeNodeConverter {
    export interface Init extends AbstractTypeReferenceToTypeNodeConverter.Init {}
}

export class TypeReferenceToParsedTypeNodeConverter extends AbstractTypeReferenceToTypeNodeConverter {
    protected override set(itemType: TypeReference, params: ConvertTypeReferenceParams): TypeReferenceNode {
        if (this.includeSerdeLayer && this.isTypeReferencePrimitive(itemType)) {
            const itemTypeNode = this.convert({ ...params, typeReference: itemType }).typeNode;
            return this.generateNonOptionalTypeReferenceNode(ts.factory.createTypeReferenceNode("Set", [itemTypeNode]));
        } else {
            return this.list(itemType, params);
        }
    }

    protected override dateTime(): TypeReferenceNode {
        return this.includeSerdeLayer
            ? this.generateNonOptionalTypeReferenceNode(ts.factory.createTypeReferenceNode("Date"))
            : this.string();
    }
}
