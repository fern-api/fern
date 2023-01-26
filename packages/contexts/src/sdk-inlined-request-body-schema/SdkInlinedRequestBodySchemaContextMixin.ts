import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
import { Reference } from "@fern-typescript/commons";
import { GeneratedSdkInlinedRequestBodySchema } from "./GeneratedSdkInlinedRequestBodySchema";

export interface SdkInlinedRequestBodySchemaContextMixin {
    getGeneratedInlinedRequestBodySchema: (
        service: FernFilepath,
        endpointName: Name
    ) => GeneratedSdkInlinedRequestBodySchema;
    getReferenceToInlinedRequestBody: (service: FernFilepath, endpointName: Name) => Reference;
}

export interface WithSdkInlinedRequestBodySchemaContextMixin {
    sdkInlinedRequestBodySchema: SdkInlinedRequestBodySchemaContextMixin;
}
