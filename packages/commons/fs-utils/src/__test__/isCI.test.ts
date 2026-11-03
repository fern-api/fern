import { afterEach, describe, expect, it, vi } from "vitest";

import { isCI } from "../isCI.js";

describe("isCI", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    function stubCleanEnv(env: Record<string, string>): void {
        for (const name of ["CI", "CONTINUOUS_INTEGRATION", "GITHUB_ACTIONS", "GITLAB_CI", "BUILDKITE"]) {
            vi.stubEnv(name, "");
        }
        for (const [name, value] of Object.entries(env)) {
            vi.stubEnv(name, value);
        }
    }

    it("returns false when no CI variables are set", () => {
        stubCleanEnv({});
        expect(isCI()).toBe(false);
    });

    it.each(["true", "1"])("returns true when CI=%s", (value) => {
        stubCleanEnv({ CI: value });
        expect(isCI()).toBe(true);
    });

    it("returns true for vendor variables without CI", () => {
        stubCleanEnv({ GITHUB_ACTIONS: "true" });
        expect(isCI()).toBe(true);
    });

    it.each(["false", "FALSE", "0"])("treats CI=%s as an explicit opt-out", (value) => {
        stubCleanEnv({ CI: value, GITHUB_ACTIONS: "true" });
        expect(isCI()).toBe(false);
    });
});
