import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { PackagePath } from "../../commons/PackagePath";

export class TypeIdToPackagePathCache {
    private cache: Record<FernRegistryApiRead.TypeId, PackagePath> = {};

    constructor(
        apiDefinition: FernRegistryApiRead.ApiDefinition,
        resolveSubpackageById: (
            subpackageId: FernRegistryApiRead.SubpackageId
        ) => FernRegistryApiRead.ApiDefinitionSubpackage
    ) {
        this.addPackageToCache(apiDefinition.rootPackage, resolveSubpackageById, []);
    }

    public get(typeId: FernRegistryApiRead.TypeId): PackagePath {
        const packagePath = this.cache[typeId];
        if (packagePath == null) {
            throw new Error("Type ID does not exist: " + typeId);
        }
        return packagePath;
    }

    private addPackageToCache(
        package_: FernRegistryApiRead.ApiDefinitionPackage,
        resolveSubpackageById: (
            subpackageId: FernRegistryApiRead.SubpackageId
        ) => FernRegistryApiRead.ApiDefinitionSubpackage,
        packagePath: PackagePath
    ): void {
        for (const typeId of package_.types) {
            this.cache[typeId] = packagePath;
        }
        for (const subpackageId of package_.subpackages) {
            const subpackage = resolveSubpackageById(subpackageId);
            this.addPackageToCache(subpackage, resolveSubpackageById, [...packagePath, subpackage.name]);
        }
    }
}
