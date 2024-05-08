import { AbsoluteFilePath, getDirectoryContents } from "@fern-api/fs-utils";
import { cp } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { runFernCli } from "../../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("fern generator upgrade", () => {
    it.skip("fern generator upgrade", async () => {
        // Create tmpdir and copy contents
        const tmpDir = await tmp.dir();
        const directory = AbsoluteFilePath.of(tmpDir.path);

        await cp(FIXTURES_DIR, directory, { recursive: true });

        const outputPath = AbsoluteFilePath.of(path.join(directory, "fern"));

        await runFernCli(["generator", "upgrade", ""], {
            cwd: directory
        });

        expect(await getDirectoryContents(outputPath)).toMatchSnapshot();
    }, 60_000);
});
