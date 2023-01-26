import { FernFilepath } from "@fern-fern/ir-model/commons";
import { Reference } from "@fern-typescript/commons";
import { GeneratedExpressService } from "./GeneratedExpressService";

export interface ExpressServiceContextMixin {
    getGeneratedExpressService: (service: FernFilepath) => GeneratedExpressService;
    getReferenceToExpressService: (service: FernFilepath, options: { importAlias: string }) => Reference;
}

export interface WithExpressServiceContextMixin {
    expressService: ExpressServiceContextMixin;
}
