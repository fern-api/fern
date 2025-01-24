import { PackageId } from "@fern-typescript/commons";

import { HttpService, IntermediateRepresentation, Package, Subpackage, SubpackageId } from "@fern-fern/ir-sdk/api";

export class PackageResolver {
    constructor(private readonly intermediateRepresentation: IntermediateRepresentation) {}

    public getAllPackageIds(): PackageId[] {
        return [
            {
                isRoot: true
            },
            ...Object.keys(this.intermediateRepresentation.subpackages).map((subpackageId) => ({
                isRoot: false,
                subpackageId
            }))
        ];
    }

    public resolvePackage(packageId: PackageId): Package {
        if (packageId.isRoot) {
            return this.intermediateRepresentation.rootPackage;
        } else {
            return this.resolveSubpackage(packageId.subpackageId);
        }
    }

    public resolveSubpackage(subpackageId: SubpackageId): Subpackage {
        const subpackage = this.intermediateRepresentation.subpackages[subpackageId];
        if (subpackage == null) {
            throw new Error("Subpackage does not exist: " + subpackageId);
        }
        return subpackage;
    }

    public getServiceDeclarationOrThrow(packageId: PackageId): HttpService {
        const service = this.getServiceDeclaration(packageId);
        if (service == null) {
            throw new Error(
                "Package does not have a service: " + (packageId.isRoot ? "<Root package>" : packageId.subpackageId)
            );
        }
        return service;
    }

    public getServiceDeclaration(packageId: PackageId): HttpService | undefined {
        const package_ = this.resolvePackage(packageId);
        if (package_.service == null) {
            return undefined;
        }
        const service = this.intermediateRepresentation.services[package_.service];
        if (service == null) {
            throw new Error("Service does not exist: " + package_.service);
        }
        return service;
    }
}
