import { DeclaredTypeName, MapType, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { ts } from "ts-morph";
import { AbstractTypeReferenceToTypeNodeConverter } from "./AbstractTypeReferenceToTypeNodeConverter";

export declare namespace TypeReferenceToParsedTypeNodeConverter {
    export interface Init extends AbstractTypeReferenceToTypeNodeConverter.Init {
        getReferenceToRawEnum: (referenceToEnum: ts.EntityName) => ts.TypeNode;
    }
}

export class TypeReferenceToParsedTypeNodeConverter extends AbstractTypeReferenceToTypeNodeConverter {
    private getReferenceToRawEnum: (referenceToEnum: ts.EntityName) => ts.TypeNode;

    constructor({ getReferenceToRawEnum, ...superInit }: TypeReferenceToParsedTypeNodeConverter.Init) {
        super(superInit);
        this.getReferenceToRawEnum = getReferenceToRawEnum;
    }

    protected override map(map: MapType): TypeReferenceNode {
        return {
            typeNode: ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                this.keyType(map.keyType).typeNode,
                this.convert(map.valueType).typeNode,
            ]),
            isOptional: false,
        };
    }

    protected override set(itemType: TypeReference): TypeReferenceNode {
        const itemTypeNode = this.convert(itemType).typeNode;

        return {
            typeNode: this.isTypeReferencePrimitive(itemType)
                ? ts.factory.createTypeReferenceNode("Set", [itemTypeNode])
                : ts.factory.createArrayTypeNode(itemTypeNode),
            isOptional: false,
        };
    }

    // override enumAsString to reference the enum's RawValue (which is
    // effectively an alias for string, but this way the code is more self
    // documenting)
    protected override enumAsString(enumTypeName: DeclaredTypeName): TypeReferenceNode {
        return {
            isOptional: false,
            typeNode: this.getReferenceToRawEnum(this.getReferenceToNamedType(enumTypeName)),
        };
    }

    protected override dateTime(): TypeReferenceNode {
        return {
            typeNode: ts.factory.createTypeReferenceNode("Date"),
            isOptional: false,
        };
    }
}
