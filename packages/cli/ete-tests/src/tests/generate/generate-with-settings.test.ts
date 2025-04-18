import { cp } from "fs/promises";
import tmp from "tmp-promise";

import {
    AbsoluteFilePath,
    RelativeFilePath,
    getDirectoryContents,
    getDirectoryContentsForSnapshot,
    join
} from "@fern-api/fs-utils";

import { runFernCli } from "../../utils/runFernCli";

describe("fern generate with settings", () => {
    it("single api", async () => {
        const fixturesDir = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures/api-settings"));

        const tmpDir = await tmp.dir();
        const directory = AbsoluteFilePath.of(tmpDir.path);

        await cp(fixturesDir, directory, { recursive: true });

        await runFernCli(["generate", "--local", "--keepDocker"], {
            cwd: directory
        });

        expect(
            await getDirectoryContentsForSnapshot(join(directory, RelativeFilePath.of("sdks/python")))
        ).toMatchSnapshot();
    }, 180_000);

    it("dependencies-based api", async () => {
        const fixturesDir = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures/api-settings-unioned"));
        const tmpDir = await tmp.dir();
        const directory = AbsoluteFilePath.of(tmpDir.path);

        await cp(fixturesDir, directory, { recursive: true });

        await runFernCli(["generate", "--local", "--keepDocker", "--api", "unioned"], {
            cwd: directory
        });

        expect(
            await getDirectoryContentsForSnapshot(join(directory, RelativeFilePath.of("sdks/python")))
        ).toMatchSnapshot();
    }, 180_000);
});
