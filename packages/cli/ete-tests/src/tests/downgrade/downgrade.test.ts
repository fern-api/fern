import { FERN_DIRECTORY, PROJECT_CONFIG_FILENAME } from "@fern-api/configuration";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";

import { runFernCli } from "../../utils/runFernCli";
import { init } from "../init/init";

describe("fern downgrade", () => {
    it("downgrades CLI version in fern.config.json", async () => {
        const directory = await init();
        const fernConfigFilepath = join(
            directory,
            RelativeFilePath.of(FERN_DIRECTORY),
            RelativeFilePath.of(PROJECT_CONFIG_FILENAME)
        );

        const initialConfig = JSON.parse((await readFile(fernConfigFilepath)).toString());
        expect(initialConfig.version).toBeDefined();

        await runFernCli(["downgrade", "0.30.0"], {
            cwd: directory
        });

        const updatedConfig = JSON.parse((await readFile(fernConfigFilepath)).toString());
        expect(updatedConfig.version).toBe("0.30.0");
        expect(updatedConfig.organization).toBe(initialConfig.organization);
    }, 60_000);

    it("downgrades to a different version", async () => {
        const directory = await init();
        const fernConfigFilepath = join(
            directory,
            RelativeFilePath.of(FERN_DIRECTORY),
            RelativeFilePath.of(PROJECT_CONFIG_FILENAME)
        );

        await runFernCli(["downgrade", "0.25.5"], {
            cwd: directory
        });

        const updatedConfig = JSON.parse((await readFile(fernConfigFilepath)).toString());
        expect(updatedConfig.version).toBe("0.25.5");
    }, 60_000);
});
