import { getToken } from "@fern-api/auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CliContext } from "../../../cli-context/CliContext.js";
import { applyOrgBoundsToVersion } from "../orgConfig.js";

vi.mock("@fern-api/auth", () => ({ getToken: vi.fn() }));

// Only logger.info/debug are exercised (test mock).
const cliContext = { logger: { info: vi.fn(), debug: vi.fn() } } as unknown as CliContext;

let fetchMock: ReturnType<typeof vi.fn>;

function stubFetch(response: Partial<Response>): void {
    fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}), ...response });
    vi.stubGlobal("fetch", fetchMock);
}

describe("getOrgCliVersionBounds (via applyOrgBoundsToVersion)", () => {
    beforeEach(() => {
        vi.mocked(getToken).mockResolvedValue({ type: "organization", value: "tok" });
        delete process.env.FERN_IGNORE_ORG_VERSION_BOUNDS;
        delete process.env.FERN_IGNORE_ORG_VERSION_FLOOR;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it("fails open (does not clamp) when the fetch fails", async () => {
        stubFetch({ ok: false, status: 500 });
        const version = await applyOrgBoundsToVersion({ cliContext, orgId: "acme", intendedVersion: "5.40.0" });
        expect(version).toBe("5.40.0");
    });

    it("clamps to the floor on a successful response", async () => {
        stubFetch({ json: async () => ({ cliVersionMin: "5.45.0" }) });
        const version = await applyOrgBoundsToVersion({ cliContext, orgId: "acme", intendedVersion: "5.40.0" });
        expect(version).toBe("5.45.0");
    });

    it("leaves the version unchanged on a successful empty response (no bounds set)", async () => {
        stubFetch({ json: async () => ({}) });
        const version = await applyOrgBoundsToVersion({ cliContext, orgId: "acme", intendedVersion: "5.40.0" });
        expect(version).toBe("5.40.0");
    });

    it("drops a malformed bound from FDR rather than using it", async () => {
        stubFetch({ json: async () => ({ cliVersionMin: "not-a-version" }) });
        const version = await applyOrgBoundsToVersion({ cliContext, orgId: "acme", intendedVersion: "5.40.0" });
        expect(version).toBe("5.40.0");
    });

    it("fetches from FDR on every invocation (no cache)", async () => {
        stubFetch({ json: async () => ({ cliVersionMin: "5.45.0" }) });
        await applyOrgBoundsToVersion({ cliContext, orgId: "acme", intendedVersion: "5.40.0" });
        await applyOrgBoundsToVersion({ cliContext, orgId: "acme", intendedVersion: "5.40.0" });
        expect(fetchMock).toHaveBeenCalledTimes(2);
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
