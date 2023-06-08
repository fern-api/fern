import { FernRegistryClient } from "@fern-fern/registry-browser";

export const REGISTRY_SERVICE = new FernRegistryClient({
    environment: process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
});
