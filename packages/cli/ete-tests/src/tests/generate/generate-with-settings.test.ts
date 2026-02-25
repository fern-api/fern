import { AbsoluteFilePath, getDirectoryContentsForSnapshot, join, RelativeFilePath } from "@fern-api/fs-utils";
import { cp } from "fs/promises";
import tmp from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli.js";

describe("fern generate with settings", () => {
    it.concurrent("single api", async ({ expect, signal }) => {
        const fixturesDir = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures/api-settings"));

        const tmpDir = await tmp.dir();
        const directory = AbsoluteFilePath.of(tmpDir.path);

        await cp(fixturesDir, directory, { recursive: true });

        await runFernCli(["generate", "--local", "--keepDocker"], { cwd: directory, signal });

        expect(
            await getDirectoryContentsForSnapshot(join(directory, RelativeFilePath.of("sdks/python")))
        ).toMatchSnapshot();
    }, 180_000);

    it.concurrent("dependencies-based api", async ({ expect, signal }) => {
        const fixturesDir = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures/api-settings-unioned"));
        const tmpDir = await tmp.dir();
        const directory = AbsoluteFilePath.of(tmpDir.path);

        await cp(fixturesDir, directory, { recursive: true });

        await runFernCli(["generate", "--local", "--keepDocker", "--api", "unioned"], { cwd: directory, signal });

        expect(
            await getDirectoryContentsForSnapshot(join(directory, RelativeFilePath.of("sdks/python")))
        ).toMatchSnapshot();
    }, 180_000);
});
