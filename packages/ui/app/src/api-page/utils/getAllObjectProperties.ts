import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";

export function getAllObjectProperties(
    object: FernRegistryApiRead.ObjectType,
    resolveTypeById: (typeId: FernRegistryApiRead.TypeId) => FernRegistryApiRead.TypeDefinition
): FernRegistryApiRead.ObjectProperty[] {
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
