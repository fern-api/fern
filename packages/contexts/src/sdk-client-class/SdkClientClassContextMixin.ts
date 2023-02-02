import { DeclaredServiceName } from "@fern-fern/ir-model/http";
import { Reference } from "@fern-typescript/commons";
import { GeneratedSdkClientClass } from "./GeneratedSdkClientClass";

export interface SdkClientClassContextMixin {
    getGeneratedSdkClientClass: (service: DeclaredServiceName) => GeneratedSdkClientClass;
    getReferenceToClientClass: (service: DeclaredServiceName, options: { importAlias: string }) => Reference;
}

export interface WithSdkClientClassContextMixin {
    sdkClientClass: SdkClientClassContextMixin;
}
