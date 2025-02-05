import { PackageId, Reference } from "@fern-typescript/commons";

import { GeneratedExpressService } from "./GeneratedExpressService";

export interface ExpressServiceContext {
    getGeneratedExpressService: (packageId: PackageId) => GeneratedExpressService;
    getReferenceToExpressService: (packageId: PackageId, options: { importAlias: string }) => Reference;
}
