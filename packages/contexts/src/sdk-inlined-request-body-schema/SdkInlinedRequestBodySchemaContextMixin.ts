import { Name } from "@fern-fern/ir-model/commons";
import { DeclaredServiceName } from "@fern-fern/ir-model/http";
import { Reference } from "@fern-typescript/commons";
import { GeneratedSdkInlinedRequestBodySchema } from "./GeneratedSdkInlinedRequestBodySchema";

export interface SdkInlinedRequestBodySchemaContextMixin {
    getGeneratedInlinedRequestBodySchema: (
        service: DeclaredServiceName,
        endpointName: Name
    ) => GeneratedSdkInlinedRequestBodySchema;
    getReferenceToInlinedRequestBody: (service: DeclaredServiceName, endpointName: Name) => Reference;
}

export interface WithSdkInlinedRequestBodySchemaContextMixin {
    sdkInlinedRequestBodySchema: SdkInlinedRequestBodySchemaContextMixin;
}
