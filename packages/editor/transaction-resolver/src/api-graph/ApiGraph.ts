import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { EndpointNode, ErrorNode, PackageNode, TypeNode } from "./nodes";

export class ApiGraph {
    private packages = new Map<FernApiEditor.PackageId, PackageNode>();
    private endpoints = new Map<FernApiEditor.EndpointId, EndpointNode>();
    private types = new Map<FernApiEditor.TypeId, TypeNode>();
    private errors = new Map<FernApiEditor.ErrorId, ErrorNode>();

    constructor(initialDefinition: FernApiEditor.Api) {
        for (const package_ of Object.values(initialDefinition.packages)) {
            this.processApiPackage(package_, { api: initialDefinition, parent: undefined });
        }
    }

    private processApiPackage(
        apiPackage: FernApiEditor.Package,
        { api, parent }: { api: Readonly<FernApiEditor.Api>; parent: FernApiEditor.PackageId | undefined }
    ): void {
        this.createPackage(apiPackage.packageId, { parent });

        for (const subPackageId of apiPackage.packages) {
            const apiSubPackage = api.packages[subPackageId];
            if (apiSubPackage == null) {
                throw new Error("Package does not exist: " + subPackageId);
            }
            this.processApiPackage(apiSubPackage, { api, parent: apiPackage.packageId });
        }

        for (const endpointId of apiPackage.endpoints) {
            this.createEndpoint(endpointId, { parent: apiPackage.packageId });
        }

        for (const typeId of apiPackage.types) {
            this.createType(typeId, { parent: apiPackage.packageId });
        }

        for (const errorId of apiPackage.errors) {
            this.createError(errorId, { parent: apiPackage.packageId });
        }
    }

    public getPackageParent(packageId: FernApiEditor.PackageId): FernApiEditor.PackageId | undefined {
        const package_ = this.getPackageOrThrow(packageId);
        return package_.parent;
    }

    public getEndpointParent(endpointId: FernApiEditor.EndpointId): FernApiEditor.PackageId {
        const endpoint = this.getEndpointOrThrow(endpointId);
        return endpoint.parent;
    }

    public getTypeParent(typeId: FernApiEditor.TypeId): FernApiEditor.PackageId {
        const type = this.getTypeOrThrow(typeId);
        return type.parent;
    }

    public getErrorParent(errorId: FernApiEditor.ErrorId): FernApiEditor.PackageId {
        const error = this.getErrorOrThrow(errorId);
        return error.parent;
    }

    public createPackage(
        packageId: FernApiEditor.PackageId,
        { parent }: { parent: FernApiEditor.PackageId | undefined }
    ): void {
        this.packages.set(packageId, {
            packageId,
            parent,
            packages: new Set(),
            endpoints: new Set(),
            types: new Set(),
            errors: new Set(),
        });
    }

    public deletePackage(packageId: FernApiEditor.PackageId): void {
        const package_ = this.getPackageOrThrow(packageId);
        for (const subPackageId of package_.packages) {
            this.deletePackage(subPackageId);
        }
        for (const endpointId of package_.endpoints) {
            this.deleteEndpoint(endpointId);
        }
        for (const typeId of package_.types) {
            this.deleteType(typeId);
        }
        for (const errorId of package_.errors) {
            this.deleteError(errorId);
        }
        this.packages.delete(packageId);

        if (package_.parent != null) {
            const parent = this.getPackageOrThrow(package_.parent);
            parent.packages.delete(packageId);
        }
    }

    public createEndpoint(endpointId: FernApiEditor.EndpointId, { parent }: { parent: FernApiEditor.PackageId }): void {
        const package_ = this.getPackageOrThrow(parent);
        package_.endpoints.add(endpointId);
        this.endpoints.set(endpointId, {
            endpointId,
            parent,
        });
    }

    public deleteEndpoint(endpointId: FernApiEditor.EndpointId): void {
        const endpoint = this.getEndpointOrThrow(endpointId);
        this.endpoints.delete(endpointId);
        const package_ = this.getPackageOrThrow(endpoint.parent);
        package_.endpoints.delete(endpointId);
    }

    public createType(typeId: FernApiEditor.TypeId, { parent }: { parent: FernApiEditor.PackageId }): void {
        const package_ = this.getPackageOrThrow(parent);
        package_.types.add(typeId);
        this.types.set(typeId, {
            typeId,
            parent,
        });
    }

    public deleteType(typeId: FernApiEditor.TypeId): void {
        const type = this.getTypeOrThrow(typeId);
        this.types.delete(typeId);
        const package_ = this.getPackageOrThrow(type.parent);
        package_.types.delete(typeId);
    }

    public createError(errorId: FernApiEditor.ErrorId, { parent }: { parent: FernApiEditor.PackageId }): void {
        const package_ = this.getPackageOrThrow(parent);
        package_.errors.add(errorId);
        this.errors.set(errorId, {
            errorId,
            parent,
        });
    }

    public deleteError(errorId: FernApiEditor.ErrorId): void {
        const error = this.getErrorOrThrow(errorId);
        this.errors.delete(errorId);
        const package_ = this.getPackageOrThrow(error.parent);
        package_.errors.delete(errorId);
    }

    private getPackageOrThrow(packageId: FernApiEditor.PackageId): PackageNode {
        const package_ = this.packages.get(packageId);
        if (package_ == null) {
            throw new Error(`Package ${packageId} does not exist`);
        }
        return package_;
    }

    private getEndpointOrThrow(endpointId: FernApiEditor.EndpointId): EndpointNode {
        const endpoint = this.endpoints.get(endpointId);
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpoint} does not exist`);
        }
        return endpoint;
    }

    private getTypeOrThrow(typeId: FernApiEditor.TypeId): TypeNode {
        const type = this.types.get(typeId);
        if (type == null) {
            throw new Error(`Type ${type} does not exist`);
        }
        return type;
    }

    private getErrorOrThrow(errorId: FernApiEditor.ErrorId): ErrorNode {
        const error = this.errors.get(errorId);
        if (error == null) {
            throw new Error(`Error ${error} does not exist`);
        }
        return error;
    }
}
