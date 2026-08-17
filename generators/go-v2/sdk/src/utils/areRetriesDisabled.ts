import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Whether the endpoint declares that retries are disabled, in which case the request is issued exactly
 * once regardless of the client-level and per-request retry options.
 */
export function areRetriesDisabled(endpoint: Pick<FernIr.HttpEndpoint, "retries">): boolean {
    return endpoint.retries?.disabled === true;
}
