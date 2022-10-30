import { FernApiEditor } from "@fern-fern/api-editor-sdk";

export abstract class AbstractTransactionHandler<T> {
    public abstract applyTransaction(api: FernApiEditor.Api, transaction: T): void;

    protected getPackageOrThrow(api: FernApiEditor.Api, packageId: FernApiEditor.PackageId): FernApiEditor.Package {
        const package_ = api.packages.find((p) => p.packageId === packageId);
        if (package_ == null) {
            throw new Error(`Package ${packageId} does not exist`);
        }
        return package_;
    }

    protected getEndpointOrThrow(
        api: FernApiEditor.Api,
        packageId: FernApiEditor.PackageId,
        endpointId: FernApiEditor.EndpointId
    ): FernApiEditor.Endpoint {
        const package_ = this.getPackageOrThrow(api, packageId);
        const endpoint = package_.endpoints.find((e) => e.endpointId === endpointId);
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointId} does not exist`);
        }
        return endpoint;
    }

    protected getErrorOrThrow(
        api: FernApiEditor.Api,
        packageId: FernApiEditor.PackageId,
        errorId: FernApiEditor.ErrorId
    ): FernApiEditor.Error {
        const package_ = this.getPackageOrThrow(api, packageId);
        const error = package_.errors.find((e) => e.errorId === errorId);
        if (error == null) {
            throw new Error(`Error ${errorId} does not exist`);
        }
        return error;
    }

    protected getTypeOrThrow(
        api: FernApiEditor.Api,
        packageId: FernApiEditor.PackageId,
        typeId: FernApiEditor.TypeId
    ): FernApiEditor.Type {
        const package_ = this.getPackageOrThrow(api, packageId);
        const type = package_.types.find((e) => e.typeId === typeId);
        if (type == null) {
            throw new Error(`Type ${typeId} does not exist`);
        }
        return type;
    }
}
