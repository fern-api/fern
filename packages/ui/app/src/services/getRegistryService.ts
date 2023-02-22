import { FernRegistryClient } from "@fern-fern/registry";

export const REGISTRY_SERVICE = new FernRegistryClient({
    environment: "https://fern-definition-registry.fly.dev",
});
