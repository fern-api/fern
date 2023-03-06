import { PackageId, Reference } from "@fern-typescript/commons";
import { GeneratedSdkClientClass } from "./GeneratedSdkClientClass";

export interface SdkClientClassContextMixin {
    getGeneratedSdkClientClass: (packageId: PackageId) => GeneratedSdkClientClass;
    getReferenceToClientClass: (packageId: PackageId, options?: { importAlias?: string }) => Reference;
}

export interface WithSdkClientClassContextMixin {
    sdkClientClass: SdkClientClassContextMixin;
}
