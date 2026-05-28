import { FernFiddleClient } from "@fern-fern/fiddle-sdk";

const FIDDLE_ORIGIN =
    process.env.FERN_FIDDLE_ORIGIN ??
    process.env.DEFAULT_FIDDLE_ORIGIN ??
    "https://fiddle-coordinator.buildwithfern.com";

export function createFiddleServiceV2({
    token,
    headers
}: {
    token?: string;
    headers?: Record<string, string>;
}): FernFiddleClient {
    return new FernFiddleClient({
        environment: FIDDLE_ORIGIN,
        token,
        headers
    });
}
