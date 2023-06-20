import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";

export function doesSubpackageHaveEndpointsRecursive(
    subpackageId: FernRegistryApiRead.SubpackageId,
    resolveSubpackage: (subpackageId: FernRegistryApiRead.SubpackageId) => FernRegistryApiRead.ApiDefinitionSubpackage
): boolean {
    const subpackage = resolveSubpackage(subpackageId);
    if (subpackage.endpoints.length > 0) {
        return true;
    }
    return subpackage.subpackages.some((s) => doesSubpackageHaveEndpointsRecursive(s, resolveSubpackage));
}
