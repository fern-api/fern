import { getToken } from "@fern-api/auth";
import { mkdir, readFile, writeFile } from "fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CliContext } from "../../../cli-context/CliContext.js";
import { applyOrgBoundsToVersion } from "../orgConfig.js";

vi.mock("@fern-api/auth", () => ({ getToken: vi.fn() }));
vi.mock("fs/promises", () => ({ mkdir: vi.fn(), readFile: vi.fn(), writeFile: vi.fn() }));

// Only logger.info/debug are exercised (test mock).
const cliContext = { logger: { info: vi.fn(), debug: vi.fn() } } as unknown as CliContext;

let fetchMock: ReturnType<typeof vi.fn>;

function stubFetch(response: Partial<Response>): void {
    fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}), ...response });
    vi.stubGlobal("fetch", fetchMock);
}

function cachedEntry(bounds: { min?: string; max?: string }, ageMs: number): string {
    return JSON.stringify({
        acme: { cliVersionMin: bounds.min ?? null, cliVersionMax: bounds.max ?? null, fetchedAt: Date.now() - ageMs }
    });
}

describe("getCachedOrgCliVersionBounds (via applyOrgBoundsToVersion)", () => {
    beforeEach(() => {
        vi.mocked(getToken).mockResolvedValue({ type: "organization", value: "tok" });
        // Cache miss on read so every call reaches the fetch path unless overridden.
        vi.mocked(readFile).mockRejectedValue(new Error("ENOENT"));
        vi.mocked(mkdir).mockResolvedValue(undefined);
        vi.mocked(writeFile).mockResolvedValue(undefined);
        delete process.env.FERN_IGNORE_ORG_VERSION_BOUNDS;
        delete process.env.FERN_IGNORE_ORG_VERSION_FLOOR;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it("does not write the cache when the fetch fails (no poisoning)", async () => {
        stubFetch({ ok: false, status: 500 });
        const version = await applyOrgBoundsToVersion({ cliContext, orgId: "acme", intendedVersion: "5.40.0" });
        expect(version).toBe("5.40.0");
        expect(writeFile).not.toHaveBeenCalled();
    });

    it("writes the cache and clamps on a successful response", async () => {
        stubFetch({ json: async () => ({ cliVersionMin: "5.45.0" }) });
        const version = await applyOrgBoundsToVersion({ cliContext, orgId: "acme", intendedVersion: "5.40.0" });
        expect(version).toBe("5.45.0");
        expect(writeFile).toHaveBeenCalledTimes(1);
    });

    it("caches a successful empty response (no bounds set)", async () => {
        stubFetch({ json: async () => ({}) });
        const version = await applyOrgBoundsToVersion({ cliContext, orgId: "acme", intendedVersion: "5.40.0" });
        expect(version).toBe("5.40.0");
        expect(writeFile).toHaveBeenCalledTimes(1);
    });

    it("drops a malformed bound from FDR rather than using it", async () => {
        stubFetch({ json: async () => ({ cliVersionMin: "not-a-version" }) });
        const version = await applyOrgBoundsToVersion({ cliContext, orgId: "acme", intendedVersion: "5.40.0" });
        expect(version).toBe("5.40.0");
    });

    it("uses a fresh cache entry without fetching", async () => {
        stubFetch({});
        vi.mocked(readFile).mockResolvedValue(cachedEntry({ min: "5.50.0" }, 60_000));
        const version = await applyOrgBoundsToVersion({ cliContext, orgId: "acme", intendedVersion: "5.40.0" });
        expect(version).toBe("5.50.0");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("re-fetches when the cache entry is past its TTL", async () => {
        stubFetch({ json: async () => ({ cliVersionMin: "5.60.0" }) });
        vi.mocked(readFile).mockResolvedValue(cachedEntry({ min: "5.50.0" }, 25 * 60 * 60 * 1000));
        const version = await applyOrgBoundsToVersion({ cliContext, orgId: "acme", intendedVersion: "5.40.0" });
        expect(version).toBe("5.60.0");
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it.each([
        "FERN_IGNORE_ORG_VERSION_BOUNDS",
        "FERN_IGNORE_ORG_VERSION_FLOOR"
    ])("bypasses enforcement entirely when %s=true", async (envVar) => {
        stubFetch({ json: async () => ({ cliVersionMin: "5.90.0" }) });
        process.env[envVar] = "true";
        const version = await applyOrgBoundsToVersion({ cliContext, orgId: "acme", intendedVersion: "5.40.0" });
        expect(version).toBe("5.40.0");
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
