import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
import { Reference } from "@fern-typescript/commons";
import { GeneratedExpressInlinedRequestBodySchema } from "./GeneratedExpressInlinedRequestBodySchema";

export interface ExpressInlinedRequestBodySchemaContextMixin {
    getGeneratedInlinedRequestBodySchema: (
        service: FernFilepath,
        endpointName: Name
    ) => GeneratedExpressInlinedRequestBodySchema;
    getReferenceToInlinedRequestBody: (service: FernFilepath, endpointName: Name) => Reference;
}

export interface WithExpressInlinedRequestBodySchemaContextMixin {
    expressInlinedRequestBodySchema: ExpressInlinedRequestBodySchemaContextMixin;
}
