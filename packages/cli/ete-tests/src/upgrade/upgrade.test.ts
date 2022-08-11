import { ProjectConfigSchema, PROJECT_CONFIG_FILENAME } from "@fern-api/project-configuration";
import { WorkspaceConfigurationSchema, WORKSPACE_CONFIGURATION_FILENAME } from "@fern-api/workspace-configuration";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { runFernCli } from "../utils/runFernCli";

const RELATIVE_PATH_TO_DEFINITION = "src";

const FERN_CONFIG_JSON: ProjectConfigSchema = {
    workspaces: ["**"],
    organization: "fern",
};

const FERN_RC: WorkspaceConfigurationSchema = {
    name: "api",
    definition: RELATIVE_PATH_TO_DEFINITION,
    generators: [
        {
            name: "fernapi/fern-postman",
            version: "0.0.20",
            generate: {
                enabled: true,
                output: "./generated-postman.json",
            },
        },
        {
            name: "fernapi/fern-openapi",
            version: "0.0.2",
            generate: {
                enabled: true,
                output: "./generated-openapi.yml",
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
        // put in generated/ so it's git-ignored
        const workspacePath = path.join(__dirname, "generated");
        await rm(workspacePath, { recursive: true, force: true });
        await mkdir(workspacePath, { recursive: true });
        await mkdir(path.join(workspacePath, RELATIVE_PATH_TO_DEFINITION));
        await writeFile(
            path.join(workspacePath, PROJECT_CONFIG_FILENAME),
            JSON.stringify(FERN_CONFIG_JSON, undefined, 2)
        );
        await writeFile(path.join(workspacePath, WORKSPACE_CONFIGURATION_FILENAME), yaml.dump(FERN_RC));
        await runFernCli(["upgrade"], {
            cwd: workspacePath,
        });
        const newFernRc = await readFile(path.join(workspacePath, WORKSPACE_CONFIGURATION_FILENAME));
        expect(newFernRc.toString()).toMatchSnapshot();
    });
});
