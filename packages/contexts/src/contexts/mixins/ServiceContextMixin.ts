import { FernFilepath } from "@fern-fern/ir-model/commons";
import { GeneratedService } from "../../generated-types/GeneratedService";
import { Reference } from "../../Reference";

export interface ServiceContextMixin {
    getGeneratedService: (service: FernFilepath) => GeneratedService;
    getReferenceToService: (service: FernFilepath, options: { importAlias: string }) => Reference;
}

export interface WithServiceContextMixin {
    service: ServiceContextMixin;
}
