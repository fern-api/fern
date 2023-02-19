import { FernRegistry } from "@fern-fern/registry";
import { PackagePath } from "../../commons/PackagePath";

export class TypeIdToPackagePathCache {
    private cache: Record<FernRegistry.TypeId, PackagePath> = {};

    constructor(
        apiDefinition: FernRegistry.ApiDefinition,
        resolveSubpackageById: (subpackageId: FernRegistry.SubpackageId) => FernRegistry.ApiDefinitionSubpackage
    ) {
        this.addPackageToCache(apiDefinition.rootPackage, resolveSubpackageById, []);
    }

    public get(typeId: FernRegistry.TypeId): PackagePath {
        const packagePath = this.cache[typeId];
        if (packagePath == null) {
            throw new Error("Type ID does not exist: " + typeId);
        }
        return packagePath;
    }

    private addPackageToCache(
        package_: FernRegistry.ApiDefinitionPackage,
        resolveSubpackageById: (subpackageId: FernRegistry.SubpackageId) => FernRegistry.ApiDefinitionSubpackage,
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
