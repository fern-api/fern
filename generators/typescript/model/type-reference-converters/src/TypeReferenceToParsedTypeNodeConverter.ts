import { TypeReference } from "@fern-fern/ir-sdk/api";
import { TypeReferenceNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";

import { ConvertTypeReferenceParams } from "./AbstractTypeReferenceConverter";
import { AbstractTypeReferenceToTypeNodeConverter } from "./AbstractTypeReferenceToTypeNodeConverter";

export declare namespace TypeReferenceToParsedTypeNodeConverter {
    export interface Init extends AbstractTypeReferenceToTypeNodeConverter.Init {}
}

export class TypeReferenceToParsedTypeNodeConverter extends AbstractTypeReferenceToTypeNodeConverter {
    protected override set(itemType: TypeReference, params: ConvertTypeReferenceParams): TypeReferenceNode {
        if (this.includeSerdeLayer && this.isTypeReferencePrimitive(itemType)) {
            const itemTypeNode = this.convert({ ...params, typeReference: itemType });
            return this.generateNonOptionalTypeReferenceNode({
                typeNode: ts.factory.createTypeReferenceNode("Set", [itemTypeNode.typeNode]),
                requestTypeNode: itemTypeNode.requestTypeNode,
                responseTypeNode: itemTypeNode.responseTypeNode
            });
        } else {
            return this.list(itemType, params);
        }
    }

    protected override dateTime(): TypeReferenceNode {
        return this.includeSerdeLayer
            ? this.generateNonOptionalTypeReferenceNode({
                  typeNode: ts.factory.createTypeReferenceNode("Date"),
                  requestTypeNode: undefined,
                  responseTypeNode: undefined
              })
            : this.string();
    }
}
