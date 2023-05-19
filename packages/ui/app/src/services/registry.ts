import { FernRegistryClient } from "@fern-fern/registry-browser";

export const REGISTRY_SERVICE = new FernRegistryClient({
    environment: import.meta.env.VITE_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
});
