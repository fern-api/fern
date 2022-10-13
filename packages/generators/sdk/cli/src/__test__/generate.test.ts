import { validateWorkspaceAndLogIssues } from "@fern-api/cli";
import { AbsoluteFilePath, getDirectoryContents } from "@fern-api/core-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { createMockTaskContext, TaskResult } from "@fern-api/task-context";
import { loadWorkspace } from "@fern-api/workspace-loader";
import { FernGeneratorExec } from "@fern-fern/generator-exec-client";
import decompress from "decompress";
import execa from "execa";
import { rm, symlink, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { runGenerator } from "../runGenerator";

const FIXTURES = ["trace"];
const FIXTURES_PATH = path.join(__dirname, "fixtures");

describe("runGenerator", () => {
    // mock generator version
    process.env.GENERATOR_VERSION = "0.0.0";

    for (const fixture of FIXTURES) {
        it(
            // eslint-disable-next-line jest/valid-title
            fixture,
            async () => {
                const fixturePath = path.join(FIXTURES_PATH, fixture);
                const irPath = path.join(fixturePath, "ir.json");
                const configJsonPath = path.join(fixturePath, "config.json");

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

                const { path: outputPath } = await tmp.dir();

                // add symlink for easy access in VSCode
                const generatedDir = path.join(fixturePath, "generated");
                await rm(generatedDir, { force: true, recursive: true });
                await symlink(outputPath, generatedDir, "dir");

                const config: FernGeneratorExec.GeneratorConfig = {
                    dryRun: true,
                    irFilepath: irPath,
                    output: {
                        path: outputPath,
                        mode: generateOutputMode("trace", "api"),
                    },
                    publish: undefined,
                    customConfig: undefined,
                    workspaceName: "api",
                    organization: "trace",
                    environment: FernGeneratorExec.GeneratorEnvironment.local(),
                };
                await writeFile(configJsonPath, JSON.stringify(config, undefined, 4));

                await runGenerator(configJsonPath);

                const runCommandInOutputDirectory = async (command: string, args: string[]) => {
                    await execa(command, args, {
                        cwd: outputPath,
                    });
                };

                // check that the non-git-ignored files match snapshot
                const pathToGitArchive = path.join(outputPath, "archive.zip");
                await runCommandInOutputDirectory("git", ["init", "--initial-branch=main"]);
                await runCommandInOutputDirectory("git", ["add", "."]);
                await runCommandInOutputDirectory("git", ["commit", "-m", '"Initial commit"']);
                await runCommandInOutputDirectory("git", ["archive", "--output", pathToGitArchive, "main"]);

                const unzippedGitArchive = (await tmp.dir()).path;
                await decompress(pathToGitArchive, unzippedGitArchive);
                await rm(path.join(unzippedGitArchive, ".yarn"), { recursive: true });
                await rm(path.join(unzippedGitArchive, "yarn.lock"), { recursive: true });
                const directoryContents = await getDirectoryContents(AbsoluteFilePath.of(unzippedGitArchive));
                expect(directoryContents).toMatchSnapshot();
            },
            90_000
        );
    }
});

function generateOutputMode(org: string, apiName: string): FernGeneratorExec.OutputMode {
    return FernGeneratorExec.OutputMode.publish({
        registries: {
            maven: {
                username: "",
                password: "",
                registryUrl: "",
                group: "",
            },
            npm: {
                registryUrl: "https://registry.npmjs.org",
                token: "token",
                scope: `fern-${org}`,
            },
        },
        registriesV2: {
            maven: {
                username: "",
                password: "",
                registryUrl: "",
                coordinate: "",
            },
            npm: {
                registryUrl: "https://registry.npmjs.org",
                token: "token",
                packageName: `@fern-${org}/${apiName}-sdk`,
            },
            pypi: {
                registryUrl: "",
                username: "",
                password: "",
                packageName: "",
            },
        },
        version: "",
    });
}
