import { Name } from "@fern-fern/ir-model/commons";
import { PackageId, Reference } from "@fern-typescript/commons";
import { GeneratedSdkInlinedRequestBodySchema } from "./GeneratedSdkInlinedRequestBodySchema";

export interface SdkInlinedRequestBodySchemaContextMixin {
    getGeneratedInlinedRequestBodySchema: (
        packageId: PackageId,
        endpointName: Name
    ) => GeneratedSdkInlinedRequestBodySchema;
    getReferenceToInlinedRequestBody: (packageId: PackageId, endpointName: Name) => Reference;
}

export interface WithSdkInlinedRequestBodySchemaContextMixin {
    sdkInlinedRequestBodySchema: SdkInlinedRequestBodySchemaContextMixin;
}
