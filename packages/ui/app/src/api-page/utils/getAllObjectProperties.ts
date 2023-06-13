import * as FernRegistryApiRead from "@fern-fern/registry-browser/serialization/resources/api/resources/v1/resources/read";

export function getAllObjectProperties(
    object: FernRegistryApiRead.ObjectType.Raw,
    resolveTypeById: (typeId: FernRegistryApiRead.TypeId.Raw) => FernRegistryApiRead.TypeDefinition.Raw
): FernRegistryApiRead.ObjectProperty.Raw[] {
    return [
        ...object.properties,
        ...object.extends.flatMap((typeId) => {
            const type = resolveTypeByIdRecursive(typeId, resolveTypeById);
            if (type.shape.type !== "object") {
                throw new Error("Object extends non-object " + typeId);
            }
            return getAllObjectProperties(type.shape, resolveTypeById);
        }),
    ];
}

function resolveTypeByIdRecursive(
    typeId: FernRegistryApiRead.TypeId.Raw,
    resolveTypeById: (typeId: FernRegistryApiRead.TypeId.Raw) => FernRegistryApiRead.TypeDefinition.Raw
): FernRegistryApiRead.TypeDefinition.Raw {
    const type = resolveTypeById(typeId);
    if (type.shape.type === "alias" && type.shape.value.type === "id") {
        return resolveTypeByIdRecursive(type.shape.value.value, resolveTypeById);
    }
    return type;
}
