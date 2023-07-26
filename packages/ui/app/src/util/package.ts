import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";

export function isSubpackage(
    package_: FernRegistryApiRead.ApiDefinitionPackage
): package_ is FernRegistryApiRead.ApiDefinitionSubpackage {
    return typeof (package_ as FernRegistryApiRead.ApiDefinitionSubpackage).subpackageId === "string";
}
