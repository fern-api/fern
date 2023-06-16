import { Name } from "@fern-fern/ir-model/commons";
import { PackageId, Reference } from "@fern-typescript/commons";
import { GeneratedSdkInlinedRequestBodySchema } from "./GeneratedSdkInlinedRequestBodySchema";

export interface SdkInlinedRequestBodySchemaContext {
    getGeneratedInlinedRequestBodySchema: (
        packageId: PackageId,
        endpointName: Name
    ) => GeneratedSdkInlinedRequestBodySchema;
    getReferenceToInlinedRequestBody: (packageId: PackageId, endpointName: Name) => Reference;
}
