import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ setGlobalDispatcher: vi.fn(), Agent: vi.fn() }));

vi.mock("undici", () => ({ setGlobalDispatcher: mocks.setGlobalDispatcher, Agent: mocks.Agent }));

async function importFaiFetch() {
    // The dispatcher is installed once per process, so each case needs a fresh module.
    vi.resetModules();
    return (await import("../utils/faiFetch.js")).faiFetch;
}

describe("faiFetch", () => {
    const fetchMock = vi.fn();
    const originalProxy = process.env.HTTP_PROXY;

    beforeEach(() => {
        mocks.setGlobalDispatcher.mockReset();
        mocks.Agent.mockReset();
        fetchMock.mockReset();
        fetchMock.mockResolvedValue({ ok: true, status: 200 });
        vi.stubGlobal("fetch", fetchMock);
        delete process.env.HTTP_PROXY;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        if (originalProxy == null) {
            delete process.env.HTTP_PROXY;
        } else {
            process.env.HTTP_PROXY = originalProxy;
        }
    });

    it("passes the request through to fetch and returns its response", async () => {
        const faiFetch = await importFaiFetch();
        const init = { method: "POST", body: "{}" };

        const response = await faiFetch("https://fai.buildwithfern.com/sdks/analyze-commit-diff", init);

        expect(response.status).toBe(200);
        expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
            "https://fai.buildwithfern.com/sdks/analyze-commit-diff",
            init
        );
    });

    it("raises the undici header and body timeouts past the load balancer's idle timeout", async () => {
        const faiFetch = await importFaiFetch();

        await faiFetch("https://fai.buildwithfern.com/sdks/analyze-commit-diff", { method: "POST" });

        expect(mocks.Agent).toHaveBeenCalledTimes(1);
        const [options] = mocks.Agent.mock.calls[0] as [{ headersTimeout: number; bodyTimeout: number }];
        expect(options.headersTimeout).toBeGreaterThan(900_000);
        expect(options.bodyTimeout).toBeGreaterThan(900_000);
        expect(mocks.setGlobalDispatcher).toHaveBeenCalledTimes(1);
    });

    it("installs the dispatcher once no matter how many requests are made", async () => {
        const faiFetch = await importFaiFetch();

        await faiFetch("https://fai.buildwithfern.com/sdks/analyze-commit-diff", { method: "POST" });
        await faiFetch("https://fai.buildwithfern.com/sdks/analyze-commit-diff", { method: "POST" });

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(mocks.setGlobalDispatcher).toHaveBeenCalledTimes(1);
    });

    it("leaves the dispatcher alone when the process is proxied, so the proxy is not dropped", async () => {
        process.env.HTTP_PROXY = "http://localhost:3128";
        const faiFetch = await importFaiFetch();

        await faiFetch("https://fai.buildwithfern.com/sdks/analyze-commit-diff", { method: "POST" });

        expect(mocks.setGlobalDispatcher).not.toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
