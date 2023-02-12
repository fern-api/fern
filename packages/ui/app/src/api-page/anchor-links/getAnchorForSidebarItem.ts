import { assertNever } from "@fern-api/core-utils";
import { EndpointId, PackageId, PackagePath, SidebarItemId } from "../context/ApiContext";

export function getAnchorForSidebarItem(sidebarItemId: SidebarItemId): string {
    switch (sidebarItemId.type) {
        case "endpoint":
            return getAnchorForEndpoint(sidebarItemId);
        case "package":
            return getAnchorForPackage(sidebarItemId);
        default:
            assertNever(sidebarItemId);
    }
}

function getAnchorForPackage(packageId: PackageId): string {
    return getAnchorForPackagePath(packageId.packagePathIncludingSelf);
}

function getAnchorForPackagePath(packagePath: PackagePath): string {
    return packagePath.map((part) => `package${part.indexInParent}`).join("-");
}

function getAnchorForEndpoint(endpointId: EndpointId): string {
    return getAnchorForPackagePath(endpointId.packagePath) + "-" + `endpoint${endpointId.indexInParent}`;
}
