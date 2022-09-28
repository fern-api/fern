import { MapType, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { ts } from "ts-morph";
import { AbstractTypeReferenceToTypeNodeConverter } from "./AbstractTypeReferenceToTypeNodeConverter";

export class TypeReferenceToRawTypeNodeConverter extends AbstractTypeReferenceToTypeNodeConverter {
    protected map(map: MapType): TypeReferenceNode {
        return {
            typeNode: ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                this.convert(map.keyType).typeNode,
                this.convert(map.valueType).typeNode,
            ]),
            isOptional: false,
        };
    }

    protected set(itemType: TypeReference): TypeReferenceNode {
        return {
            typeNode: ts.factory.createArrayTypeNode(this.convert(itemType).typeNode),
            isOptional: false,
        };
    }
}
