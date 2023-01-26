import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
import { Reference } from "@fern-typescript/commons";
import { GeneratedExpressInlinedRequestBody } from "./GeneratedExpressInlinedRequestBody";

export interface ExpressInlinedRequestBodyContextMixin {
    getGeneratedInlinedRequestBody: (service: FernFilepath, endpointName: Name) => GeneratedExpressInlinedRequestBody;
    getReferenceToInlinedRequestBodyType: (service: FernFilepath, endpointName: Name) => Reference;
}

export interface WithExpressInlinedRequestBodyContextMixin {
    expressInlinedRequestBody: ExpressInlinedRequestBodyContextMixin;
}
