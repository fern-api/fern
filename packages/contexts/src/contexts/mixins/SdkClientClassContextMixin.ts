import { FernFilepath } from "@fern-fern/ir-model/commons";
import { Reference } from "@fern-typescript/commons";
import { GeneratedSdkClientClass } from "../../generated-types/GeneratedSdkClientClass";

export interface SdkClientClassContextMixin {
    getGeneratedSdkClientClass: (service: FernFilepath) => GeneratedSdkClientClass;
    getReferenceToService: (service: FernFilepath, options: { importAlias: string }) => Reference;
}

export interface WithSdkClientClassContextMixin {
    service: SdkClientClassContextMixin;
}
