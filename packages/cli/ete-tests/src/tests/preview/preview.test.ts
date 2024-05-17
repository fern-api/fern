import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import fetch from "node-fetch";
import { runFernCli } from "../../utils/runFernCli";

const fixturesDir = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

describe("fern preview", () => {
    it("preview basic docs", async () => {
        void runFernCli(["docs", "preview"], {
            cwd: join(fixturesDir, RelativeFilePath.of("simple"))
        });

<<<<<<< HEAD
        await sleep(20_000);
=======
        await sleep(5_000);
>>>>>>> 6bac5f6244 (update file watcher, preview.test.ts)

        const response = await fetch("http://localhost:3000/v2/registry/docs/load-with-url", {
            method: "POST"
        });

        expect(response.body != null).toEqual(true);
        const responseBody = await response.json();
        expect(typeof responseBody === "object").toEqual(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(Object.keys(responseBody as any)).toEqual(["baseUrl", "definition", "lightModeEnabled"]);
    }, 30_000);
});

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
