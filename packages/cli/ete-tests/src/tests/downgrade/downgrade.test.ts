import { FERN_DIRECTORY, PROJECT_CONFIG_FILENAME } from "@fern-api/configuration";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";

import { runFernCli } from "../../utils/runFernCli.js";
import { init } from "../init/init.js";

describe("fern downgrade", () => {
    it("downgrades CLI version in fern.config.json", async ({ signal }) => {
        const directory = await init({ signal });
        const fernConfigFilepath = join(
            directory,
            RelativeFilePath.of(FERN_DIRECTORY),
            RelativeFilePath.of(PROJECT_CONFIG_FILENAME)
        );

        const initialConfig = JSON.parse((await readFile(fernConfigFilepath)).toString());
        expect(initialConfig.version).toBeDefined();

        await runFernCli(["downgrade", "0.30.0"], { cwd: directory, signal });

        const updatedConfig = JSON.parse((await readFile(fernConfigFilepath)).toString());
        expect(updatedConfig.version).toBe("0.30.0");
        expect(updatedConfig.organization).toBe(initialConfig.organization);
    }, 60_000);

    it("downgrades to a different version", async ({ signal }) => {
        const directory = await init({ signal });
        const fernConfigFilepath = join(
            directory,
            RelativeFilePath.of(FERN_DIRECTORY),
            RelativeFilePath.of(PROJECT_CONFIG_FILENAME)
        );

        await runFernCli(["downgrade", "0.25.5"], { cwd: directory, signal });

        const updatedConfig = JSON.parse((await readFile(fernConfigFilepath)).toString());
        expect(updatedConfig.version).toBe("0.25.5");
    }, 60_000);
});
