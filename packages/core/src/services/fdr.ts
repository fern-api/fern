import { FdrClient } from "@fern-api/fdr-sdk";
import { FernRegistryClient } from "@fern-fern/fdr-test-sdk";

export function createFdrService({
    environment = process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
    token,
    headers
}: {
    environment?: string;
    token: (() => string) | string;
    headers?: Record<string, string>;
}): FdrClient {
    const overrideEnvironment = process.env.FERN_FDR_ORIGIN ?? process.env.OVERRIDE_FDR_ORIGIN;
    return new FdrClient({
        environment: overrideEnvironment ?? environment,
        token: typeof token === "function" ? token() : token,
        headers
    });
}

export function createFdrTestService({
    environment = process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
    token
}: {
    environment?: string;
    token: (() => string) | string;
}): FernRegistryClient {
    return new FernRegistryClient({
        environment,
        token
    });
}
