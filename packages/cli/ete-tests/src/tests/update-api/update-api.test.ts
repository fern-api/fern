import { cp } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

import { AbsoluteFilePath, getDirectoryContentsForSnapshot } from "@fern-api/fs-utils";

import { runFernCli } from "../../utils/runFernCli";
import { setupOpenAPIServer } from "../../utils/setupOpenAPIServer";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("fern api update", () => {
    it("fern api update", async () => {
        // Start express server that will respond with the OpenAPI spec.
        const { cleanup } = setupOpenAPIServer();

        const tmpDir = await tmp.dir();
        const directory = AbsoluteFilePath.of(tmpDir.path);
        const outputPath = AbsoluteFilePath.of(path.join(directory, "fern"));

        await cp(FIXTURES_DIR, directory, { recursive: true });
        await runFernCli(["api", "update"], {
            cwd: directory
        });

        expect(await getDirectoryContentsForSnapshot(outputPath)).toMatchSnapshot();

        // Shutdown the server now that we're done.
        await cleanup();
    }, 60_000);
});
