import { afterEach, describe, expect, it, vi } from "vitest";

import { isSdkConfigInitEnabled } from "../isSdkConfigInitEnabled.js";

describe("SDK Config initialization environment configuration", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("is disabled by default", () => {
        vi.stubEnv("FERN_USE_SDK_CONFIG", undefined);
        vi.stubEnv("DEFAULT_USE_SDK_CONFIG", undefined);

        expect(isSdkConfigInitEnabled()).toBe(false);
    });

    it("uses the baked default when no runtime override is present", () => {
        vi.stubEnv("FERN_USE_SDK_CONFIG", undefined);
        vi.stubEnv("DEFAULT_USE_SDK_CONFIG", " true ");

        expect(isSdkConfigInitEnabled()).toBe(true);
    });

    it("lets the runtime flag override the baked default", () => {
        vi.stubEnv("FERN_USE_SDK_CONFIG", "false");
        vi.stubEnv("DEFAULT_USE_SDK_CONFIG", "true");

        expect(isSdkConfigInitEnabled()).toBe(false);
    });

    it("does not use the SDK Gen API flag", () => {
        vi.stubEnv("FERN_USE_SDK_CONFIG", undefined);
        vi.stubEnv("DEFAULT_USE_SDK_CONFIG", undefined);
        vi.stubEnv("FERN_USE_SDK_GEN_API", "true");

        expect(isSdkConfigInitEnabled()).toBe(false);
    });
});
