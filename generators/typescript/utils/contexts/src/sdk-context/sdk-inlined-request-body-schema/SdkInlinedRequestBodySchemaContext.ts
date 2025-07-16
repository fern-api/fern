import { PackageId, Reference } from "@fern-typescript/commons";

import { Name } from "@fern-fern/ir-sdk/api";

import { GeneratedSdkInlinedRequestBodySchema } from "./GeneratedSdkInlinedRequestBodySchema";

export interface SdkInlinedRequestBodySchemaContext {
    getGeneratedInlinedRequestBodySchema: (
        packageId: PackageId,
        endpointName: Name
    ) => GeneratedSdkInlinedRequestBodySchema;
    getReferenceToInlinedRequestBody: (packageId: PackageId, endpointName: Name) => Reference;
}
