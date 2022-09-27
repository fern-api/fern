import { join, RelativeFilePath } from "@fern-api/core-utils";
import { GeneratorsConfigurationSchema } from "@fern-api/generators-configuration";
import { FERN_DIRECTORY, GENERATORS_CONFIGURATION_FILENAME } from "@fern-api/project-configuration";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { runFernCli } from "../../utils/runFernCli";
import { init } from "../init/init";

const GENERATORS_CONFIGURATION: GeneratorsConfigurationSchema = {
    draft: [
        {
            name: "fernapi/fern-postman",
            version: "0.0.20",
            "local-output": RelativeFilePath.of("./generated-postman.json"),
        },
        {
            name: "fernapi/fern-openapi",
            version: "0.0.2",
            "local-output": RelativeFilePath.of("./generated-openapi.yml"),
            config: {
                format: "yaml",
            },
        },
        {
            name: "fernapi/java-client",
            version: "0.0.81",
        },
        {
            name: "fernapi/fern-typescript",
            version: "0.0.14",
            config: {
                mode: "client_and_server",
            },
        },
    ],
};

describe("fern upgrade", () => {
    it("upgrades generators", async () => {
        const directory = await init();
        const generatorsConfigurationFilepath = join(
            directory,
            RelativeFilePath.of(FERN_DIRECTORY),
            RelativeFilePath.of("api"),
            RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)
        );
        // make sure the file exists
        await readFile(generatorsConfigurationFilepath);
        await writeFile(generatorsConfigurationFilepath, yaml.dump(GENERATORS_CONFIGURATION));
        await runFernCli(["upgrade"], {
            cwd: directory,
            env: {
                // this env var needs to be defined so the CLI thinks we're mid-upgrade
                FERN_PRE_UPGRADE_VERSION: "0.0.0",
            },
        });
        const generatorsConfiguration = (await readFile(generatorsConfigurationFilepath)).toString();
        expect(generatorsConfiguration).toMatchSnapshot();
    });
});
