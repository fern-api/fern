import { FdrClient } from "@fern-api/fdr-sdk";

export function createFdrServiceV2({
    token,
    headers
}: {
    token: (() => string) | string;
    headers?: Record<string, string>;
}): FdrClient {
    const environment =
        process.env.FERN_FDR_ORIGIN ??
        process.env.OVERRIDE_FDR_ORIGIN ??
        process.env.DEFAULT_FDR_ORIGIN ??
        "https://registry.buildwithfern.com";
    return new FdrClient({
        environment,
        token: typeof token === "function" ? token() : token,
        headers
    });
}
