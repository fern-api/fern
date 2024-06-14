import { FdrClient } from "@fern-api/fdr-sdk";
import { FernRegistryClient } from "@fern-fern/fdr-test-sdk";

export function createFdrService({
    environment = process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
    token
}: {
    environment?: string;
    token: (() => string) | string;
}): FdrClient {
    return new FdrClient({
        environment,
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
