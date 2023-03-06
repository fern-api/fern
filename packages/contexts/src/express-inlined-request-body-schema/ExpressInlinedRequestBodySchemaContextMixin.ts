import { Name } from "@fern-fern/ir-model/commons";
import { PackageId, Reference } from "@fern-typescript/commons";
import { GeneratedExpressInlinedRequestBodySchema } from "./GeneratedExpressInlinedRequestBodySchema";

export interface ExpressInlinedRequestBodySchemaContextMixin {
    getGeneratedInlinedRequestBodySchema: (
        packageId: PackageId,
        endpointName: Name
    ) => GeneratedExpressInlinedRequestBodySchema;
    getReferenceToInlinedRequestBody: (packageId: PackageId, endpointName: Name) => Reference;
}

export interface WithExpressInlinedRequestBodySchemaContextMixin {
    expressInlinedRequestBodySchema: ExpressInlinedRequestBodySchemaContextMixin;
}
