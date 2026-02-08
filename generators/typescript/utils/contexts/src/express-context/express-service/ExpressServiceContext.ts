import { PackageId, Reference } from "@fern-typescript/commons";

import { GeneratedExpressService } from "./GeneratedExpressService.js";

export interface ExpressServiceContext {
    getGeneratedExpressService: (packageId: PackageId) => GeneratedExpressService;
    getReferenceToExpressService: (packageId: PackageId, options: { importAlias: string }) => Reference;
}
