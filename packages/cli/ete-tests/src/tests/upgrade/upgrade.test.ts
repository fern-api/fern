import { join } from "@fern-api/core-utils";
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
            mode: "download-files",
            "output-path": "./generated-postman",
        },
        {
            name: "fernapi/fern-openapi",
            version: "0.0.2",
            config: {
                format: "yaml",
            },
            mode: "download-files",
            "output-path": "./generated-openapi",
        },
        {
            name: "fernapi/fern-java-sdk",
            version: "0.0.81",
            mode: "publish",
        },
        {
            name: "fernapi/fern-typescript-sdk",
            version: "0.0.14",
            mode: "publish",
        },
    ],
};

describe("fern upgrade", () => {
    it("upgrades generators", async () => {
        const directory = await init();
        const generatorsConfigurationFilepath = join(
            directory,
            FERN_DIRECTORY,
            "api",
            GENERATORS_CONFIGURATION_FILENAME
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
