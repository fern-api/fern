import { FernIr } from "@fern-fern/ir-sdk";

export function areRetriesDisabled(endpoint: Pick<FernIr.HttpEndpoint, "retries">): boolean {
    return endpoint.retries?.disabled === true;
}

export function hasEndpointWithRetriesDisabled(endpoints: Pick<FernIr.HttpEndpoint, "retries">[]): boolean {
    return endpoints.some(areRetriesDisabled);
}
