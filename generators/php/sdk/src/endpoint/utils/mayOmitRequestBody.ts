import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

/**
 * Whether the caller may leave the request body out of the call entirely, which the IR describes as
 * `required: false` on a referenced request body. An absent `required` means required, and reading
 * the field at all is opt-in so that existing SDKs keep their signatures. A call that leaves the
 * body out sends no body, and so no body content type either.
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
        (context.customConfig.respectOptionalRequestBody ?? false) &&
        requestBody?.type === "reference" &&
        requestBody.required === false
    );
}
