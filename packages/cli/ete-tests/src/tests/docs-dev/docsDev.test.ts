import { FdrAPI as FdrCjsSdk } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import fetch from "node-fetch";

import { captureFernCli, runFernCli } from "../../utils/runFernCli.js";

const fixturesDir = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

// Use high-numbered ports unlikely to conflict with common services
const LEGACY_BACKEND_PORT = "47100";
const BETA_BACKEND_PORT = "47101";
const DEFAULT_PORT = "47102";
const DEFAULT_BACKEND_PORT = "47103";

describe.sequential("fern docs dev --legacy", () => {
    it("basic docs --legacy", async ({ signal }) => {
        const check = await runFernCli(["check"], {
            cwd: join(fixturesDir, RelativeFilePath.of("simple")),
            signal
        });

        expect(check.exitCode).toBe(0);

        const process = captureFernCli(["docs", "dev", "--legacy", "--backend-port", LEGACY_BACKEND_PORT], {
            cwd: join(fixturesDir, RelativeFilePath.of("simple")),
            signal
        });

        const response = await waitForServer(
            `http://localhost:${LEGACY_BACKEND_PORT}/v2/registry/docs/load-with-url`,
            { method: "POST" },
            { signal }
        );

        expect(response.body != null).toEqual(true);
        const responseText = await response.text();
        expect(responseText.includes("[object Promise]")).toBeFalsy();

        const responseBody = JSON.parse(responseText) as FdrCjsSdk.docs.v2.read.LoadDocsForUrlResponse;
        expect(typeof responseBody === "object").toEqual(true);
        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
        expect(Object.keys(responseBody as any)).toEqual(["baseUrl", "definition", "lightModeEnabled", "orgId"]);

        const finishProcess = process.kill();
        expect(finishProcess).toBeTruthy();
    }, 90_000);
});

describe.sequential("fern docs dev --beta", () => {
    it("basic docs --beta", async ({ signal }) => {
        const check = await runFernCli(["check"], {
            cwd: join(fixturesDir, RelativeFilePath.of("simple")),
            reject: true,
            signal
        });

        expect(check.exitCode).toBe(0);

        const process = captureFernCli(["docs", "dev", "--beta", "--backend-port", BETA_BACKEND_PORT], {
            cwd: join(fixturesDir, RelativeFilePath.of("simple")),
            reject: true,
            signal
        });

        const response = await waitForServer(
            `http://localhost:${BETA_BACKEND_PORT}/v2/registry/docs/load-with-url`,
            { method: "POST" },
            { signal }
        );

        expect(response.body != null).toEqual(true);
        const responseText = await response.text();
        expect(responseText.includes("[object Promise]")).toBeFalsy();

        const responseBody = JSON.parse(responseText) as FdrCjsSdk.docs.v2.read.LoadDocsForUrlResponse;
        expect(typeof responseBody === "object").toEqual(true);
        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
        expect(Object.keys(responseBody as any)).toEqual(["baseUrl", "definition", "lightModeEnabled", "orgId"]);

        const finishProcess = process.kill();
        expect(finishProcess).toBeTruthy();
    }, 90_000);
});

describe.sequential("fern docs dev", () => {
    it("basic docs (astro)", async ({ signal }) => {
        const check = await runFernCli(["check"], {
            cwd: join(fixturesDir, RelativeFilePath.of("simple")),
            signal
        });

        expect(check.exitCode).toBe(0);

        const process = captureFernCli(
            ["docs", "dev", "--port", DEFAULT_PORT, "--backend-port", DEFAULT_BACKEND_PORT],
            {
                cwd: join(fixturesDir, RelativeFilePath.of("simple")),
                signal
            }
        );

        const response = await waitForOk(`http://localhost:${DEFAULT_PORT}/`, { signal, timeout: 150_000 });

        expect(response.headers.get("content-type")).toContain("text/html");
        const html = await response.text();
        expect(html).toContain("<html");
        expect(html.includes("[object Promise]")).toBeFalsy();

        const finishProcess = process.kill();
        expect(finishProcess).toBeTruthy();
    }, 180_000);
});

/** Polls until the server answers with a 2xx (the Astro proxy answers 5xx while the renderer boots). */
async function waitForOk(
    url: string,
    { interval = 1_000, timeout = 60_000, signal }: { interval?: number; timeout?: number; signal?: AbortSignal } = {}
): Promise<Awaited<ReturnType<typeof fetch>>> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        signal?.throwIfAborted();
        try {
            const response = await fetch(url, { signal });
            if (response.ok) {
                return response;
            }
        } catch (error) {
            if (signal?.aborted) {
                throw signal.reason;
            }
        }
        await new Promise((resolve) => setTimeout(resolve, interval));
    }
    return await fetch(url, { signal });
}

async function waitForServer(
    url: string,
    init: Parameters<typeof fetch>[1],
    { interval = 1_000, timeout = 60_000, signal }: { interval?: number; timeout?: number; signal?: AbortSignal } = {}
): Promise<Awaited<ReturnType<typeof fetch>>> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        signal?.throwIfAborted();
        try {
            return await fetch(url, { ...init, signal });
        } catch (error) {
            if (signal?.aborted) {
                throw signal.reason;
            }
            await new Promise((resolve) => setTimeout(resolve, interval));
        }
    }
    // Final attempt – let it throw if the server is still unreachable
    return await fetch(url, { ...init, signal });
}
