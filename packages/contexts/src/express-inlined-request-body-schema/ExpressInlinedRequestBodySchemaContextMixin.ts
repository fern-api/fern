import { Name } from "@fern-fern/ir-model/commons";
import { DeclaredServiceName } from "@fern-fern/ir-model/http";
import { Reference } from "@fern-typescript/commons";
import { GeneratedExpressInlinedRequestBodySchema } from "./GeneratedExpressInlinedRequestBodySchema";

export interface ExpressInlinedRequestBodySchemaContextMixin {
    getGeneratedInlinedRequestBodySchema: (
        service: DeclaredServiceName,
        endpointName: Name
    ) => GeneratedExpressInlinedRequestBodySchema;
    getReferenceToInlinedRequestBody: (service: DeclaredServiceName, endpointName: Name) => Reference;
}

export interface WithExpressInlinedRequestBodySchemaContextMixin {
    expressInlinedRequestBodySchema: ExpressInlinedRequestBodySchemaContextMixin;
}
