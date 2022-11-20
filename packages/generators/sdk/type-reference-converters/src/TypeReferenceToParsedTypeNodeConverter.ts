import { MapType, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { ts } from "ts-morph";
import { AbstractTypeReferenceToTypeNodeConverter } from "./AbstractTypeReferenceToTypeNodeConverter";

export class TypeReferenceToParsedTypeNodeConverter extends AbstractTypeReferenceToTypeNodeConverter {
    protected override map(map: MapType): TypeReferenceNode {
        return this.generateNonOptionalTypeReferenceNode(
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                this.convert(map.keyType).typeNode,
                this.convert(map.valueType).typeNode,
            ])
        );
    }

    protected override set(itemType: TypeReference): TypeReferenceNode {
        const itemTypeNode = this.convert(itemType).typeNode;
        return this.generateNonOptionalTypeReferenceNode(
            this.isTypeReferencePrimitive(itemType)
                ? ts.factory.createTypeReferenceNode("Set", [itemTypeNode])
                : ts.factory.createArrayTypeNode(itemTypeNode)
        );
    }

    protected override dateTime(): TypeReferenceNode {
        return this.generateNonOptionalTypeReferenceNode(ts.factory.createTypeReferenceNode("Date"));
    }
}
