import fetch from "node-fetch";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { FernRegistry as FdrCjsSdk } from "@fern-fern/fdr-cjs-sdk";

import { runFernCli } from "../../utils/runFernCli";

const fixturesDir = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

describe("fern docs dev", () => {
    it("dev basic docs", async () => {
        const check = await runFernCli(["check"], {
            cwd: join(fixturesDir, RelativeFilePath.of("simple"))
        });

        expect(check.exitCode).toBe(0);

        void runFernCli(["docs", "dev"], {
            cwd: join(fixturesDir, RelativeFilePath.of("simple"))
        });

        await sleep(20_000);

        const response = await fetch("http://localhost:3000/v2/registry/docs/load-with-url", {
            method: "POST"
        });

        expect(response.body != null).toEqual(true);
        const responseText = await response.text();
        expect(responseText.includes("[object Promise]")).toBeFalsy();

        const responseBody = JSON.parse(responseText) as FdrCjsSdk.docs.v2.read.LoadDocsForUrlResponse;
        expect(typeof responseBody === "object").toEqual(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(Object.keys(responseBody as any)).toEqual(["baseUrl", "definition", "lightModeEnabled", "orgId"]);

        // const root = FernNavigation.utils.convertLoadDocsForUrlResponse(responseBody);
        // const pageIds = new Set(Object.keys(responseBody.definition.pages));
        // const pageIdsVisited = new Set<string>();

        // FernNavigation.utils.traverseNavigation(root, (node) => {
        //     if (FernNavigation.hasMarkdown(node)) {
        //         const pageId = FernNavigation.utils.getPageId(node);
        //         if (pageId != null) {
        //             pageIdsVisited.add(pageId);
        //         }
        //     }
        // });
        // expect(pageIdsVisited.size).toBeGreaterThan(0);

        // const overlap = new Set([...pageIds].filter((x) => pageIdsVisited.has(x)));
        // expect(overlap.size).toEqual(pageIdsVisited.size);
    }, 30_000);
});

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
