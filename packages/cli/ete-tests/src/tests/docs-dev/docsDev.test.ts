import { FdrAPI as FdrCjsSdk } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import fetch from "node-fetch";

import { captureFernCli, runFernCli } from "../../utils/runFernCli.js";

const fixturesDir = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

describe.sequential("fern docs dev --legacy", () => {
    it("basic docs --legacy", async () => {
        const check = await runFernCli(["check"], {
            cwd: join(fixturesDir, RelativeFilePath.of("simple"))
        });

        expect(check.exitCode).toBe(0);

        const process = captureFernCli(["docs", "dev", "--legacy"], {
            cwd: join(fixturesDir, RelativeFilePath.of("simple"))
        });

        const response = await waitForServer("http://localhost:3000/v2/registry/docs/load-with-url", {
            method: "POST"
        });

        expect(response.body != null).toEqual(true);
        const responseText = await response.text();
        expect(responseText.includes("[object Promise]")).toBeFalsy();

        const responseBody = JSON.parse(responseText) as FdrCjsSdk.docs.v2.read.LoadDocsForUrlResponse;
        expect(typeof responseBody === "object").toEqual(true);
        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
        expect(Object.keys(responseBody as any)).toEqual(["baseUrl", "definition", "lightModeEnabled", "orgId"]);

        // kill the process
        const finishProcess = process.kill();
        expect(finishProcess).toBeTruthy();
    }, 90_000);
});

describe.sequential("fern docs dev --beta", () => {
    it("basic docs --beta", async () => {
        const check = await runFernCli(["check"], {
            cwd: join(fixturesDir, RelativeFilePath.of("simple")),
            reject: true
        });

        expect(check.exitCode).toBe(0);

        const process = captureFernCli(["docs", "dev", "--beta", "--backend-port", "3001"], {
            cwd: join(fixturesDir, RelativeFilePath.of("simple")),
            reject: true
        });

        const response = await waitForServer("http://localhost:3001/v2/registry/docs/load-with-url", {
            method: "POST"
        });

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
    it("basic docs", async () => {
        const check = await runFernCli(["check"], {
            cwd: join(fixturesDir, RelativeFilePath.of("simple"))
        });

        expect(check.exitCode).toBe(0);

        const process = captureFernCli(["docs", "dev", "--backend-port", "3002"], {
            cwd: join(fixturesDir, RelativeFilePath.of("simple"))
        });

        const response = await waitForServer("http://localhost:3002/v2/registry/docs/load-with-url", {
            method: "POST"
        });

        expect(response.body != null).toEqual(true);
        const responseText = await response.text();
        expect(responseText.includes("[object Promise]")).toBeFalsy();

        const responseBody = JSON.parse(responseText) as FdrCjsSdk.docs.v2.read.LoadDocsForUrlResponse;
        expect(typeof responseBody === "object").toEqual(true);
        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
        expect(Object.keys(responseBody as any)).toEqual(["baseUrl", "definition", "lightModeEnabled", "orgId"]);
    }, 90_000);
});

async function waitForServer(
    url: string,
    init: Parameters<typeof fetch>[1],
    { interval = 1_000, timeout = 60_000 }: { interval?: number; timeout?: number } = {}
): Promise<Awaited<ReturnType<typeof fetch>>> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        try {
            return await fetch(url, init);
        } catch {
            await new Promise((resolve) => setTimeout(resolve, interval));
        }
    }
    // Final attempt – let it throw if the server is still unreachable
    return await fetch(url, init);
}
