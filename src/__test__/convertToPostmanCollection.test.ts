/* eslint-disable jest/valid-title */
import {
    GeneratorConfig,
    GeneratorEnvironment,
    GithubPublishInfo,
    OutputMode,
} from "@fern-fern/generator-exec-client/api";
import { execa } from "execa";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { COLLECTION_OUTPUT_FILENAME, writePostmanCollection } from "../writePostmanCollection";

const FIXTURES = ["test-api", "any-auth"];

describe("convertToPostman", () => {
    for (const fixture of FIXTURES) {
        // eslint-disable-next-line jest/valid-title
        const fixtureDir = path.join(__dirname, "fixtures");
        it(fixture, async () => {
            const tmpDir = await tmp.dir();
            const openapiPath = path.join(tmpDir.path, COLLECTION_OUTPUT_FILENAME);
            const confgPath = path.join(tmpDir.path, "config.json");
            const irPath = path.join(tmpDir.path, "ir.json");

            const generatorConfig: GeneratorConfig = {
                dryRun: true,
                irFilepath: irPath,
                output: {
                    path: tmpDir.path,
                    mode: OutputMode.github({
                        repoUrl: "fern-api/fake",
                        version: "0.0.0",
                        publishInfo: GithubPublishInfo.postman({
                            apiKeyEnvironmentVariable: "API_KEY",
                            workspaceIdEnvironmentVariable: "WORKSPACE_ID",
                        }),
                    }),
                },
                publish: undefined,
                workspaceName: "fern",
                organization: "fern",
                customConfig: undefined,
                environment: GeneratorEnvironment.local(),
            };

            await writeFile(confgPath, JSON.stringify(generatorConfig, undefined, 4));

            await execa("fern", ["ir", irPath, "--api", fixture], {
                cwd: fixtureDir,
            });

            await writePostmanCollection(confgPath);

            const openApi = (await readFile(openapiPath)).toString();

            expect(openApi).toMatchSnapshot();
        });
    }
});
