import { afterEach, describe, expect, it, vi } from "vitest";

// Keep the per-case module reload cheap: the real managers pull in heavy dependencies.
vi.mock("@fern-api/auth", () => ({ getAccessToken: vi.fn(), getUserToken: vi.fn() }));
vi.mock("../src/UserPosthogManager.js", () => ({ UserPosthogManager: class {} }));
vi.mock("../src/AccessTokenPosthogManager.js", () => ({ AccessTokenPosthogManager: class {} }));

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
