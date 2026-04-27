import { describe, expect, it } from "vitest";

import { resolveVersionFallback } from "../runRemoteGenerationForGenerator.js";

describe("resolveVersionFallback", () => {
    it("returns the version when an explicit version is provided", () => {
        expect(resolveVersionFallback("1.2.3")).toBe("1.2.3");
    });

    it("returns undefined when resolvedVersion is undefined (no version provided)", () => {
        expect(resolveVersionFallback(undefined)).toBeUndefined();
    });

    it("returns undefined when resolvedVersion is 'AUTO' (uppercase)", () => {
        expect(resolveVersionFallback("AUTO")).toBeUndefined();
    });

    it("returns undefined when resolvedVersion is 'auto' (lowercase)", () => {
        expect(resolveVersionFallback("auto")).toBeUndefined();
    });

    it("returns undefined when resolvedVersion is 'Auto' (mixed case)", () => {
        expect(resolveVersionFallback("Auto")).toBeUndefined();
    });

    it("returns a pre-release version as-is", () => {
        expect(resolveVersionFallback("1.0.0-rc.1")).toBe("1.0.0-rc.1");
    });

    it("returns a v-prefixed version as-is (stripping is handled elsewhere)", () => {
        expect(resolveVersionFallback("v2.0.0")).toBe("v2.0.0");
    });
});
