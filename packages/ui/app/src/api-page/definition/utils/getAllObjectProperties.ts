import { FernRegistry } from "@fern-fern/registry";

export function getAllObjectProperties(
    object: FernRegistry.ObjectType,
    resolveTypeById: (typeId: FernRegistry.TypeId) => FernRegistry.TypeDefinition
): FernRegistry.ObjectProperty[] {
    return [
        ...object.properties,
        ...object.extends.flatMap((typeId) => {
            const type = resolveTypeById(typeId);
            if (type.shape.type !== "object") {
                throw new Error("Object extends non-object " + typeId);
            }
            return getAllObjectProperties(type.shape, resolveTypeById);
        }),
    ];
}
