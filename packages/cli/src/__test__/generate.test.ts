import { validateWorkspaceAndLogIssues } from "@fern-api/cli";
import { AbsoluteFilePath, getDirectoryContents } from "@fern-api/core-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { createMockTaskContext, TaskResult } from "@fern-api/task-context";
import { loadWorkspace } from "@fern-api/workspace-loader";
import { FernGeneratorExec } from "@fern-fern/generator-exec-client";
import { installAndCompileGeneratedProjects } from "@fern-typescript/testing-utils";
import { mkdir, rm, symlink, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { runGenerator } from "../generator/runGenerator";

const FIXTURES = ["trace"];
const FIXTURES_PATH = path.join(__dirname, "fixtures");

const MODES = ["client", "server", "client_and_server"];

describe("runGenerator", () => {
    // mock generator version
    process.env.GENERATOR_VERSION = "0.0.0";

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
                    absolutePathToWorkspace: AbsoluteFilePath.of(fixturePath),
                });
                if (!parseWorkspaceResult.didSucceed) {
                    throw new Error(JSON.stringify(parseWorkspaceResult.failures));
                }

                const taskContext = createMockTaskContext();
                await validateWorkspaceAndLogIssues(parseWorkspaceResult.workspace, taskContext);
                if (taskContext.getResult() === TaskResult.Failure) {
                    throw new Error("Failed to validate workspace");
                }

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

                        const config: FernGeneratorExec.GeneratorConfig = {
                            dryRun: true,
                            irFilepath: irPath,
                            output: {
                                path: outputPath,
                                mode: FernGeneratorExec.OutputMode.downloadFiles(),
                            },
                            publish: undefined,
                            customConfig: {
                                mode,
                            },
                            workspaceName: "my-api",
                            organization: "fern-api",
                            environment: FernGeneratorExec.GeneratorEnvironment.local(),
                        };
                        await writeFile(configJsonPath, JSON.stringify(config, undefined, 4));

                        await runGenerator(configJsonPath);

                        const directoryContents = await getDirectoryContents(AbsoluteFilePath.of(outputPath));
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
