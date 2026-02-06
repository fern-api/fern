import { Name } from "@fern-fern/ir-sdk/api";
import { PackageId, Reference } from "@fern-typescript/commons";

import { GeneratedExpressInlinedRequestBodySchema } from "./GeneratedExpressInlinedRequestBodySchema.js";

export interface ExpressInlinedRequestBodySchemaContext {
    getGeneratedInlinedRequestBodySchema: (
        packageId: PackageId,
        endpointName: Name
    ) => GeneratedExpressInlinedRequestBodySchema;
    getReferenceToInlinedRequestBody: (packageId: PackageId, endpointName: Name) => Reference;
}
