import { go } from "@fern-api/go-ast";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * The `DisableRetries` value for an endpoint's request params. Endpoints that declare retries as disabled are
 * issued exactly once, regardless of the client-level and per-request retry options.
 */
export function getDisableRetriesValue({
    endpoint,
    whenEnabled
}: {
    endpoint: Pick<FernIr.HttpEndpoint, "retries">;
    whenEnabled: go.TypeInstantiation;
}): go.TypeInstantiation {
    return endpoint.retries?.disabled === true ? go.TypeInstantiation.bool(true) : whenEnabled;
}
