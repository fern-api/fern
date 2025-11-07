import { IrVersions } from "../../ir-versions";
import { convertTypeReference } from "./convertTypeReference";

export function convertContainerType(
    containerType: IrVersions.V5.types.ContainerType
): IrVersions.V4.types.ContainerType {
    return IrVersions.V5.types.ContainerType._visit<IrVersions.V4.types.ContainerType>(containerType, {
        list: (listType) => IrVersions.V4.types.ContainerType.list(convertTypeReference(listType.itemType)),
        set: (itemType) => IrVersions.V4.types.ContainerType.set(convertTypeReference(itemType)),
        map: ({ keyType, valueType }) =>
            IrVersions.V4.types.ContainerType.map({
                keyType: convertTypeReference(keyType),
                valueType: convertTypeReference(valueType)
            }),
        optional: (itemType) => IrVersions.V4.types.ContainerType.optional(convertTypeReference(itemType)),
        literal: (literal) =>
            IrVersions.V5.types.Literal._visit(literal, {
                string: (literalString) =>
                    IrVersions.V4.types.ContainerType.literal(IrVersions.V4.types.Literal.string(literalString)),
                _unknown: () => {
                    throw new Error("Unknown Literal: " + literal.type);
                }
            }),
        _unknown: () => {
            throw new Error("Unknown ContainerType: " + containerType._type);
        }
    });
}
