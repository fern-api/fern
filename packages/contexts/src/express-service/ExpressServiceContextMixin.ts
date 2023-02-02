import { DeclaredServiceName } from "@fern-fern/ir-model/http";
import { Reference } from "@fern-typescript/commons";
import { GeneratedExpressService } from "./GeneratedExpressService";

export interface ExpressServiceContextMixin {
    getGeneratedExpressService: (service: DeclaredServiceName) => GeneratedExpressService;
    getReferenceToExpressService: (service: DeclaredServiceName, options: { importAlias: string }) => Reference;
}

export interface WithExpressServiceContextMixin {
    expressService: ExpressServiceContextMixin;
}
