import { DeclaredTypeName, MapType, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { ts } from "ts-morph";
import { AbstractTypeReferenceToTypeNodeConverter } from "./AbstractTypeReferenceToTypeNodeConverter";

export class TypeReferenceToParsedTypeNodeConverter extends AbstractTypeReferenceToTypeNodeConverter {
    protected map(map: MapType): TypeReferenceNode {
        return {
            typeNode: ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                this.keyType(map.keyType).typeNode,
                this.convert(map.valueType).typeNode,
            ]),
            isOptional: false,
        };
    }

    protected set(itemType: TypeReference): TypeReferenceNode {
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
    protected enumAsString(enumTypeName: DeclaredTypeName): TypeReferenceNode {
        const referenceToEnum = this.getReferenceToNamedType(enumTypeName);
        return {
            isOptional: false,
            typeNode: ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(
                    referenceToEnum,
                    // TODO don't harcode this!
                    "RawValue"
                )
            ),
        };
    }
}
