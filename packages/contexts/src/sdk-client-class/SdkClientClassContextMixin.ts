import { FernFilepath } from "@fern-fern/ir-model/commons";
import { Reference } from "@fern-typescript/commons";
import { GeneratedSdkClientClass } from "./GeneratedSdkClientClass";

export interface SdkClientClassContextMixin {
    getGeneratedSdkClientClass: (service: FernFilepath) => GeneratedSdkClientClass;
    getReferenceToClientClass: (service: FernFilepath, options: { importAlias: string }) => Reference;
}

export interface WithSdkClientClassContextMixin {
    sdkClientClass: SdkClientClassContextMixin;
}
