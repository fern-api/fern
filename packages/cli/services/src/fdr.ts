import { FernRegistryClient } from "@fern-fern/registry-node";
import { Supplier } from "@fern-fern/registry-node/core";

export function createFdrService({
    environment = process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
    token,
}: {
    environment?: string;
    token: Supplier<string>;
}): FernRegistryClient {
    return new FernRegistryClient({
        environment,
        token,
    });
}
