import { Name } from "@fern-fern/ir-model/commons";
import { DeclaredServiceName } from "@fern-fern/ir-model/http";
import { Reference } from "@fern-typescript/commons";
import { GeneratedExpressInlinedRequestBody } from "./GeneratedExpressInlinedRequestBody";

export interface ExpressInlinedRequestBodyContextMixin {
    getGeneratedInlinedRequestBody: (
        service: DeclaredServiceName,
        endpointName: Name
    ) => GeneratedExpressInlinedRequestBody;
    getReferenceToInlinedRequestBodyType: (service: DeclaredServiceName, endpointName: Name) => Reference;
}

export interface WithExpressInlinedRequestBodyContextMixin {
    expressInlinedRequestBody: ExpressInlinedRequestBodyContextMixin;
}
