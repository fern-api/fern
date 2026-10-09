import { afterEach, describe, expect, it, vi } from "vitest";

describe("getPosthogManager", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    it.each(["", "   "])("sends no events when the build injected an empty key (%j)", async (key) => {
        vi.stubEnv("POSTHOG_API_KEY", key);
        const { getPosthogManager } = await import("../src/getPosthogManager.js");
        const { NoopPosthogManager } = await import("../src/NoopPosthogManager.js");

        expect(await getPosthogManager()).toBeInstanceOf(NoopPosthogManager);
    });
});
