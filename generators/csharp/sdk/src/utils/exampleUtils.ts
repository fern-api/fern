import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { mayOmitRequestBody } from "./requestBodyUtils.js";

/**
 * Whether the example calls the endpoint without the request body it declares.
 *
 * Unless the caller may omit the body, the generated client asks for it, so rendering such an
 * example produces a call that is missing a required argument.
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
        endpoint.requestBody != null && example.request == null && !mayOmitRequestBody(context, endpoint.requestBody)
    );
}
