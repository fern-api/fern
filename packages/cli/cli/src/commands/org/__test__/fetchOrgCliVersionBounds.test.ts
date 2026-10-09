import { afterEach, describe, expect, it, vi } from "vitest";

import { CliContext } from "../../../cli-context/CliContext.js";
import { fetchOrgCliVersionBounds } from "../orgConfig.js";

// Only `logger.debug` is exercised by fetchOrgCliVersionBounds; a minimal stub
// is enough (test mock, hence the assertion).
const cliContext = { logger: { debug: vi.fn() } } as unknown as CliContext;

function mockFetchResolves(response: Partial<Response>): void {
    vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({}),
            ...response
        })
    );
}

describe("fetchOrgCliVersionBounds", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it("returns ok with bounds on a successful response", async () => {
        mockFetchResolves({ json: async () => ({ cliVersionMin: "5.40.0", cliVersionMax: "5.50.0" }) });
        const result = await fetchOrgCliVersionBounds({ cliContext, orgId: "acme", token: "t" });
        expect(result).toEqual({ ok: true, bounds: { min: "5.40.0", max: "5.50.0" } });
    });

    it("returns ok with empty bounds when the org has none set", async () => {
        mockFetchResolves({ json: async () => ({}) });
        const result = await fetchOrgCliVersionBounds({ cliContext, orgId: "acme", token: "t" });
        expect(result).toEqual({ ok: true, bounds: { min: undefined, max: undefined } });
    });

    it("returns not-ok on an HTTP error (fails open)", async () => {
        mockFetchResolves({ ok: false, status: 500 });
        const result = await fetchOrgCliVersionBounds({ cliContext, orgId: "acme", token: "t" });
        expect(result).toEqual({ ok: false });
    });

    it("returns not-ok when the fetch throws (network failure)", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
        const result = await fetchOrgCliVersionBounds({ cliContext, orgId: "acme", token: "t" });
        expect(result).toEqual({ ok: false });
    });

    it("returns not-ok when the request times out (AbortError)", async () => {
        const abortError = new Error("The operation was aborted");
        abortError.name = "TimeoutError";
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));
        const result = await fetchOrgCliVersionBounds({ cliContext, orgId: "acme", token: "t", timeoutMs: 1 });
        expect(result).toEqual({ ok: false });
    });
});
