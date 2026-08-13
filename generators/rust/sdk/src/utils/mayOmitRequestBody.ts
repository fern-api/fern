import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

/**
 * Whether the caller may leave the request body out of the call entirely, which the IR describes as
 * `required: false` on a referenced request body. An absent `required` means required, and reading the
 * field at all is opt-in so that existing SDKs keep the signatures they already have.
 *
 * Only a body the caller passes on its own can be left out. A body that the IR folds into a wrapper
 * request, along with query parameters or an inlined shape, stays required: the wrapper is what the
 * caller passes, and the dynamic IR carries no omittability for it, so snippets could not agree with
 * the signature.
 */
export function mayOmitRequestBody({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: FernIr.HttpEndpoint;
}): boolean {
    const requestBody = endpoint.requestBody;
    return (
        context.customConfig.respectOptionalRequestBody === true &&
        requestBody?.type === "reference" &&
        requestBody.required === false &&
        endpoint.queryParameters.length === 0 &&
        endpoint.sdkRequest?.shape.type === "justRequestBody"
    );
}
