import { FernRegistryClient as FdrClient } from "@fern-api/fdr-sdk";
import { FernRegistryClient } from "@fern-fern/fdr-test-sdk";

export function createFdrService({
    environment = process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
    token
}: {
    environment?: string;
    token: (() => string) | string;
}): FdrClient {
    const overrideEnvironment = process.env.OVERRIDE_FDR_ORIGIN;
    return new FdrClient({
        environment: overrideEnvironment ?? environment,
        token
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
