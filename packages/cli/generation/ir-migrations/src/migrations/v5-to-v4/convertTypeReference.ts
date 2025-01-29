import { IrVersions } from "../../ir-versions";
import { convertContainerType } from "./convertContainerType";
import { convertDeclaredTypeName } from "./convertDeclaredTypeName";

export function convertTypeReference(
    typeReference: IrVersions.V5.types.TypeReference
): IrVersions.V4.types.TypeReference {
    return IrVersions.V5.types.TypeReference._visit<IrVersions.V4.types.TypeReference>(typeReference, {
        named: (typeName) => IrVersions.V4.types.TypeReference.named(convertDeclaredTypeName(typeName)),
        container: (containerType) => IrVersions.V4.types.TypeReference.container(convertContainerType(containerType)),
        primitive: (primitive) => IrVersions.V4.types.TypeReference.primitive(primitive),
        unknown: IrVersions.V4.types.TypeReference.unknown,
        _unknown: () => {
            throw new Error("Unknown TypeReference: " + typeReference._type);
        }
    });
}
