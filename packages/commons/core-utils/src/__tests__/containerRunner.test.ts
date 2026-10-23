import { DEFAULT_CONTAINER_RUNNER, resolveContainerRunner } from "../fallbacks/containerRunner.js";

describe("resolveContainerRunner", () => {
    it("falls back to docker when no runner is configured", () => {
        expect(DEFAULT_CONTAINER_RUNNER).toBe("docker");
        expect(resolveContainerRunner(undefined)).toBe("docker");
    });

    it("keeps a configured runner", () => {
        expect(resolveContainerRunner("podman")).toBe("podman");
        expect(resolveContainerRunner("docker")).toBe("docker");
    });
});
