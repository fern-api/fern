import { NpmPackage, PackageId, Reference } from "@fern-typescript/commons";

import { GeneratedSdkClientClass } from "./GeneratedSdkClientClass.js";

export interface SdkClientClassContext {
    getGeneratedSdkClientClass: (packageId: PackageId) => GeneratedSdkClientClass;
    getReferenceToClientClass: (
        packageId: PackageId,
        options?: { importAlias?: string; npmPackage?: NpmPackage }
    ) => Reference;
    getReferenceToBaseClientOptions: () => Reference;
    getReferenceToBaseRequestOptions: () => Reference;
    getReferenceToBaseIdempotentRequestOptions: () => Reference;
}
