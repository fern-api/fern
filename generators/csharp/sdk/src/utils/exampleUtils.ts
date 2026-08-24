import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { mayOmitRequestBody } from "./requestBodyUtils.js";

/**
 * Whether the example calls the endpoint without the request body it declares.
 *
 * Unless the caller may omit the body, the generated client asks for it, so rendering such an
 * example produces a call that is missing a required argument. Only bodies an example can carry
 * count: `ExampleRequestBody` has no shape for bytes or file uploads, so those examples always
 * read as bodyless even though the generated call passes a placeholder file.
 */
export function exampleOmitsRequestBody({
    context,
    endpoint,
    example
}: {
    context: SdkGeneratorContext;
    endpoint: FernIr.HttpEndpoint;
    example: FernIr.ExampleEndpointCall;
}): boolean {
    return (
        exampleCanCarryRequestBody(endpoint.requestBody) &&
        example.request == null &&
        !mayOmitRequestBody(context, endpoint.requestBody)
    );
}

/**
 * Twin of `exampleCanCarryRequestBody` in
 * `generators/typescript/utils/commons/src/codegen-utils/getExampleEndpointCalls.ts`; keep both in sync
 * when `ExampleRequestBody` grows a variant.
 */
function exampleCanCarryRequestBody(
    requestBody: FernIr.HttpRequestBody | undefined
): requestBody is FernIr.HttpRequestBody.InlinedRequestBody | FernIr.HttpRequestBody.Reference {
    return requestBody?.type === "inlinedRequestBody" || requestBody?.type === "reference";
}
