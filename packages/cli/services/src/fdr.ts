import { FernRegistryClient } from "@fern-fern/registry-node";
import { Supplier } from "@fern-fern/registry-node/core";

const FDR_ORIGIN = process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com";

export function createFdrService({ token }: { token: Supplier<string> }): FernRegistryClient {
    return new FernRegistryClient({
        environment: FDR_ORIGIN,
        token,
    });
}
