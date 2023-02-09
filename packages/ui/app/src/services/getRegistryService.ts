import { FernRegistryClient } from "@fern-fern/registry";

export const REGISTRY_SERVICE = new FernRegistryClient({
    environment: "http://localhost:8080",
});
