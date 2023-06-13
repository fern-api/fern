import * as FernRegistryApiRead from "@fern-fern/registry-browser/serialization/resources/api/resources/v1/resources/read";
import { PackagePath } from "../commons/PackagePath";

export class TypeIdToPackagePathCache {
    private cache: Record<FernRegistryApiRead.TypeId.Raw, PackagePath> = {};

    constructor(
        apiDefinition: FernRegistryApiRead.ApiDefinition.Raw,
        resolveSubpackageById: (
            subpackageId: FernRegistryApiRead.SubpackageId.Raw
        ) => FernRegistryApiRead.ApiDefinitionSubpackage.Raw
    ) {
        this.addPackageToCache(apiDefinition.rootPackage, resolveSubpackageById, []);
    }

    public get(typeId: FernRegistryApiRead.TypeId.Raw): PackagePath {
        const packagePath = this.cache[typeId];
        if (packagePath == null) {
            throw new Error("Type ID does not exist: " + typeId);
        }
        return packagePath;
    }

    private addPackageToCache(
        package_: FernRegistryApiRead.ApiDefinitionPackage.Raw,
        resolveSubpackageById: (
            subpackageId: FernRegistryApiRead.SubpackageId.Raw
        ) => FernRegistryApiRead.ApiDefinitionSubpackage.Raw,
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
