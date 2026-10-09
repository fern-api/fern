import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

/**
 * Whether the endpoint declares `retries: { disabled: true }` (the `x-fern-retries` OpenAPI
 * extension), meaning its requests must never be retried.
 */
export function isRetriesDisabled(endpoint: Pick<FernIr.HttpEndpoint, "retries">): boolean {
    return endpoint.retries?.disabled === true;
}

/**
 * The statement that pins the request's maxRetries option to 0, or undefined when the endpoint
 * does not disable retries. It is written after the client and request options are merged so it
 * overrides both.
 */
export function getRetriesDisabledStatement({
    context,
    endpoint
}: {
    context: Pick<SdkGeneratorContext, "getRequestOptionsName" | "getMaxRetriesOptionName">;
    endpoint: Pick<FernIr.HttpEndpoint, "retries">;
}): string | undefined {
    if (!isRetriesDisabled(endpoint)) {
        return undefined;
    }
    return `$${context.getRequestOptionsName()}['${context.getMaxRetriesOptionName()}'] = 0`;
}
