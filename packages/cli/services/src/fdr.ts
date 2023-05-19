import { FernRegistryClient } from "@fern-fern/registry";
import { Supplier } from "@fern-fern/registry/core";

export function createFdrService({
    environment = process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
    token,
}: {
    environment?: string;
    token?: Supplier<string | undefined>;
} = {}): FernRegistryClient {
    return new FernRegistryClient({
        environment,
        token,
    });
}
