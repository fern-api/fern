import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
import { Reference } from "@fern-typescript/commons";
import { GeneratedInlinedRequestBodySchema } from "./GeneratedInlinedRequestBodySchema";

export interface InlinedRequestBodySchemaContextMixin {
    getGeneratedInlinedRequestBodySchema: (
        service: FernFilepath,
        endpointName: Name
    ) => GeneratedInlinedRequestBodySchema;
    getReferenceToInlinedRequestBodySchema: (service: FernFilepath, endpointName: Name) => Reference;
}

export interface WithInlinedRequestBodySchemaContextMixin {
    inlinedRequestBodySchema: InlinedRequestBodySchemaContextMixin;
}
