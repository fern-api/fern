import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

/**
 * Whether the caller may leave the request body out of the call entirely, which the IR describes as
 * `required: false` on a referenced request body. An absent `required` means required, and reading the
 * field at all is opt-in so that existing SDKs keep sending exactly what they always have. A body whose
 * Go type cannot be compared to nil has no way to express its own absence, so it keeps being sent.
 */
export function mayOmitRequestBody({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: FernIr.HttpEndpoint;
}): boolean {
    const requestBody = endpoint.requestBody;
    if (
        context.customConfig.respectOptionalRequestBody !== true ||
        requestBody?.type !== "reference" ||
        requestBody.required !== false
    ) {
        return false;
    }
    return context.goTypeMapper.convert({ reference: requestBody.requestBodyType }).isNilable();
}
