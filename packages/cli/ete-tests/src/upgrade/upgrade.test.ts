import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { GeneratorsConfigurationSchema } from "@fern-api/generators-configuration";
import { FERN_DIRECTORY, GENERATORS_CONFIGURATION_FILENAME } from "@fern-api/project-configuration";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { init } from "../init/init";
import { runFernCli } from "../utils/runFernCli";

const GENERATED_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("generated"));
const GENERATORS_CONFIGURATION_FILEPATH = join(
    GENERATED_DIR,
    RelativeFilePath.of(FERN_DIRECTORY),
    RelativeFilePath.of("api"),
    RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)
);

const GENERATORS_CONFIGURATION: GeneratorsConfigurationSchema = {
    generators: [
        {
            name: "fernapi/fern-postman",
            version: "0.0.20",
            generate: {
                enabled: true,
                output: RelativeFilePath.of("./generated-postman.json"),
            },
        },
        {
            name: "fernapi/fern-openapi",
            version: "0.0.2",
            generate: {
                enabled: true,
                output: RelativeFilePath.of("./generated-openapi.yml"),
            },
            config: {
                format: "yaml",
            },
        },
        {
            name: "fernapi/fern-java",
            version: "0.0.81",
            generate: true,
            config: {
                packagePrefix: "com",
                mode: "client_and_server",
            },
        },
        {
            name: "fernapi/fern-typescript",
            version: "0.0.14",
            generate: true,
            config: {
                mode: "client_and_server",
            },
        },
    ],
};

describe("fern upgrade", () => {
    it("upgrades generators", async () => {
        await rm(GENERATED_DIR, { force: true, recursive: true });
        await mkdir(GENERATED_DIR);
        await init(GENERATED_DIR);
        await writeFile(GENERATORS_CONFIGURATION_FILEPATH, JSON.stringify(GENERATORS_CONFIGURATION, undefined, 4));
        await runFernCli(["upgrade"], {
            cwd: GENERATED_DIR,
        });
        const generatorsConfiguration = (await readFile(GENERATORS_CONFIGURATION_FILEPATH)).toString();
        expect(generatorsConfiguration).toMatchSnapshot();
    });
});
