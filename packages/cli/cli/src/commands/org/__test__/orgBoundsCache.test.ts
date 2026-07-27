import { getToken } from "@fern-api/auth";
import { mkdir, readFile, writeFile } from "fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CliContext } from "../../../cli-context/CliContext.js";
import { applyOrgBoundsToVersion } from "../orgConfig.js";

vi.mock("@fern-api/auth", () => ({ getToken: vi.fn() }));
vi.mock("fs/promises", () => ({ mkdir: vi.fn(), readFile: vi.fn(), writeFile: vi.fn() }));

// Only logger.info/debug are exercised (test mock).
const cliContext = { logger: { info: vi.fn(), debug: vi.fn() } } as unknown as CliContext;

function stubFetch(response: Partial<Response>): void {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}), ...response }));
}

describe("getCachedOrgCliVersionBounds (via applyOrgBoundsToVersion)", () => {
    beforeEach(() => {
        vi.mocked(getToken).mockResolvedValue({ type: "organization", value: "tok" });
        // Cache miss on read so every call reaches the fetch path.
        vi.mocked(readFile).mockRejectedValue(new Error("ENOENT"));
        vi.mocked(mkdir).mockResolvedValue(undefined);
        vi.mocked(writeFile).mockResolvedValue(undefined);
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
});
