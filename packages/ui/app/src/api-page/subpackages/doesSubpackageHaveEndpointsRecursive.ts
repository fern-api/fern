import * as FernRegistryApiRead from "@fern-fern/registry-browser/serialization/resources/api/resources/v1/resources/read";

export function doesSubpackageHaveEndpointsRecursive(
    subpackageId: FernRegistryApiRead.SubpackageId.Raw,
    resolveSubpackage: (
        subpackageId: FernRegistryApiRead.SubpackageId.Raw
    ) => FernRegistryApiRead.ApiDefinitionSubpackage.Raw
): boolean {
    const subpackage = resolveSubpackage(subpackageId);
    if (subpackage.endpoints.length > 0) {
        return true;
    }
    return subpackage.subpackages.some((s) => doesSubpackageHaveEndpointsRecursive(s, resolveSubpackage));
}
