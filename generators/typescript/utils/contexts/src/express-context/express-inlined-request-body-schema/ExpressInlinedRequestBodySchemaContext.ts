import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId, Reference } from "@fern-typescript/commons";

import { GeneratedExpressInlinedRequestBodySchema } from "./GeneratedExpressInlinedRequestBodySchema.js";

export interface ExpressInlinedRequestBodySchemaContext {
    getGeneratedInlinedRequestBodySchema: (
        packageId: PackageId,
        endpointName: FernIr.Name
    ) => GeneratedExpressInlinedRequestBodySchema;
    getReferenceToInlinedRequestBody: (packageId: PackageId, endpointName: FernIr.Name) => Reference;
}
