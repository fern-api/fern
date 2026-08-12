import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Whether the example calls the endpoint without the request body it declares.
 *
 * The generated client asks for the body, so rendering such an example produces a call that is
 * missing a required argument.
 */
export function exampleOmitsRequestBody({
    endpoint,
    example
}: {
    endpoint: FernIr.HttpEndpoint;
    example: FernIr.ExampleEndpointCall;
}): boolean {
    return endpoint.requestBody != null && example.request == null;
}
