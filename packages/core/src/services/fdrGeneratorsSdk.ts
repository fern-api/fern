import { FernRegistryClient as FdrClient } from "@fern-fern/generators-sdk";

export function createFdrGeneratorsSdkService({
    environment = process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
    token
}: {
    environment?: string;
    token: (() => string) | string | undefined;
}): FdrClient {
    return new FdrClient({
        environment,
        token
    });
}
