import { validateWorkspaceAndLogIssues } from "@fern-api/cli";
import { getDirectoryContents } from "@fern-api/core-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { loadWorkspace } from "@fern-api/workspace-loader";
import { GeneratorConfig } from "@fern-fern/ir-model/generators";
import { installAndCompileGeneratedProjects } from "@fern-typescript/testing-utils";
import { mkdir, rm, symlink, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { runGenerator } from "../generator/runGenerator";

const FIXTURES = ["trace"];
const FIXTURES_PATH = path.join(__dirname, "fixtures");

const MODES = ["client-v2", "client", "server", "client_and_server"];

describe("runGenerator", () => {
    for (const fixture of FIXTURES) {
        // eslint-disable-next-line jest/valid-title
        describe(fixture, () => {
            const fixturePath = path.join(FIXTURES_PATH, fixture);
            const generatedDir = path.join(fixturePath, "generated");
            const irPath = path.join(fixturePath, "ir.json");
            const configJsonPath = path.join(fixturePath, "config.json");

            beforeAll(async () => {
                const generatedDir = path.join(fixturePath, "generated");
                await rm(generatedDir, { force: true, recursive: true });
                await mkdir(generatedDir, { recursive: true });

                const parseWorkspaceResult = await loadWorkspace({
                    absolutePathToWorkspace: path.join(fixturePath, ".fern", "api"),
                    version: 2,
                });
                if (!parseWorkspaceResult.didSucceed) {
                    throw new Error(JSON.stringify(parseWorkspaceResult.failures));
                }

                await validateWorkspaceAndLogIssues(parseWorkspaceResult.workspace);

                const intermediateRepresentation = await generateIntermediateRepresentation(
                    parseWorkspaceResult.workspace
                );

                await writeFile(irPath, JSON.stringify(intermediateRepresentation, undefined, 4));
            });

            for (const mode of MODES) {
                it(
                    // eslint-disable-next-line jest/valid-title
                    mode,
                    async () => {
                        const { path: outputPath } = await tmp.dir();

                        // add symlink for easy access in VSCode
                        const linkToOutputPath = path.join(generatedDir, mode);
                        await rm(linkToOutputPath, { force: true });
                        await symlink(outputPath, linkToOutputPath, "dir");

                        const config: GeneratorConfig = {
                            irFilepath: irPath,
                            output: {
                                path: outputPath,
                            },
                            publish: null,
                            customConfig: {
                                mode,
                            },
                            workspaceName: "my-api",
                            organization: "fern-api",
                            environment: { _type: "local" },
                        };
                        await writeFile(configJsonPath, JSON.stringify(config, undefined, 4));

                        await runGenerator(configJsonPath);

                        const directoryContents = await getDirectoryContents(outputPath);
                        expect(directoryContents).toMatchSnapshot();

                        // compile after snapshotting, so directoryContents doesn't
                        // include compiled files, node_modules
                        await installAndCompileGeneratedProjects(outputPath);
                    },
                    90_000
                );
            }
        });
    }
});
