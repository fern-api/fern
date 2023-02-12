import { assertNever } from "@fern-api/core-utils";
import { PackageId, PackagePath, SidebarItemId } from "./ApiContext";

export function areSidebarItemIdsEqual(a: SidebarItemId, b: SidebarItemId): boolean {
    switch (a.type) {
        case "package":
            if (b.type !== "package") {
                return false;
            }
            return arePackageIdsEqual(a, b);
        case "endpoint":
            if (b.type !== "endpoint") {
                return false;
            }
            return a.indexInParent === b.indexInParent && arePackagePathsEqual(a.packagePath, b.packagePath);
        default:
            assertNever(a);
    }
}

function arePackageIdsEqual(a: PackageId, b: PackageId): boolean {
    return arePackagePathsEqual(a.packagePathIncludingSelf, b.packagePathIncludingSelf);
}

function arePackagePathsEqual(a: PackagePath, b: PackagePath): boolean {
    if (a.length !== b.length) {
        return false;
    }
    return a.every((aItem, index) => {
        return aItem.indexInParent === b[index]?.indexInParent;
    });
}
