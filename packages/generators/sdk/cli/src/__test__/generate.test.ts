import { AbsoluteFilePath, getDirectoryContents } from "@fern-api/fs-utils";
import { FileOrDirectory } from "@fern-api/fs-utils/lib/getDirectoryContents";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { PackageJsonScript } from "@fern-typescript/sdk-generator/src/generate-ts-project/generatePackageJson";
import decompress from "decompress";
import execa from "execa";
import { lstat, rm, symlink, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { SdkCustomConfigSchema } from "../custom-config/schema/SdkCustomConfigSchema";
import { runGenerator } from "../runGenerator";

interface FixtureInfo {
    path: string;
    orgName: string;
    outputMode: "github" | "publish" | "local";
    apiName: string;
    customConfig?: SdkCustomConfigSchema;
}

const FIXTURES: FixtureInfo[] = [
    {
        path: "trace",
        orgName: "trace",
        outputMode: "publish",
        apiName: "api",
        customConfig: {
            useBrandedStringAliases: true,
            neverThrowErrors: true,
        },
    },
    {
        path: "reserved-keywords",
        orgName: "fern",
        outputMode: "local",
        apiName: "api",
        customConfig: {
            neverThrowErrors: true,
        },
    },
    {
        path: "nursery-status-code",
        orgName: "fern",
        outputMode: "github",
        apiName: "api",
        customConfig: {
            private: true,
        },
    },
    {
        path: "nursery-property-discriminant",
        orgName: "fern",
        outputMode: "github",
        apiName: "api",
        customConfig: {
            private: true,
        },
    },
    {
        path: "fiddle",
        orgName: "fern",
        outputMode: "publish",
        apiName: "fiddle",
        customConfig: {
            useBrandedStringAliases: true,
            neverThrowErrors: true,
            namespaceExport: "Fiddle",
        },
    },
];
const FIXTURES_PATH = path.join(__dirname, "fixtures");

describe("runGenerator", () => {
    // mock generator version
    process.env.GENERATOR_VERSION = "0.0.0";

    for (const fixture of FIXTURES) {
        it(
            // eslint-disable-next-line jest/valid-title
            fixture.path,
            async () => {
                const fixturePath = path.join(FIXTURES_PATH, "fern", fixture.path);
                const irPath = path.join(fixturePath, "ir.json");
                const configJsonPath = path.join(fixturePath, "config.json");

                const { path: outputPath } = await tmp.dir();

                // add symlink for easy access in VSCode
                const generatedDir = path.join(fixturePath, "generated");
                await rm(generatedDir, { force: true, recursive: true });
                if (await doesPathExist(configJsonPath)) {
                    await rm(configJsonPath);
                }
                if (await doesPathExist(irPath)) {
                    await rm(irPath);
                }
                await symlink(outputPath, generatedDir);

                const config: FernGeneratorExec.GeneratorConfig = {
                    dryRun: true,
                    irFilepath: irPath,
                    output: {
                        path: outputPath,
                        mode: generateOutputMode(fixture.orgName, fixture.apiName, fixture.outputMode),
                    },
                    publish: undefined,
                    customConfig: fixture.customConfig,
                    workspaceName: fixture.apiName,
                    organization: fixture.orgName,
                    environment: FernGeneratorExec.GeneratorEnvironment.local(),
                };
                await writeFile(configJsonPath, JSON.stringify(config, undefined, 4));

                await execa("fern", ["ir", irPath, "--api", fixture.path, "--language", "typescript"], {
                    cwd: FIXTURES_PATH,
                });

                await runGenerator(configJsonPath);

                let directoryContents: FileOrDirectory[];

                if (fixture.outputMode === "local") {
                    directoryContents = await getDirectoryContents(AbsoluteFilePath.of(outputPath));
                } else {
                    const runCommandInOutputDirectory = async (
                        command: string,
                        args?: string[],
                        { env }: { env?: Record<string, string> } = {}
                    ) => {
                        await execa(command, args, {
                            cwd: outputPath,
                            env,
                        });
                    };

                    if (fixture.outputMode !== "publish") {
                        await runCommandInOutputDirectory("yarn", undefined, {
                            env: {
                                // set enableImmutableInstalls=false so we can modify yarn.lock, even when in CI
                                YARN_ENABLE_IMMUTABLE_INSTALLS: "false",
                            },
                        });
                        await runCommandInOutputDirectory("yarn", [PackageJsonScript.BUILD]);
                    }

                    // check that the non-git-ignored files match snapshot
                    const pathToGitArchive = path.join(outputPath, "archive.zip");
                    await runCommandInOutputDirectory("git", ["init", "--initial-branch=main"]);
                    await runCommandInOutputDirectory("git", ["add", "."]);
                    await runCommandInOutputDirectory("git", ["commit", "-m", '"Initial commit"']);
                    await runCommandInOutputDirectory("git", ["archive", "--output", pathToGitArchive, "main"]);

                    const unzippedGitArchive = (await tmp.dir()).path;
                    await decompress(pathToGitArchive, unzippedGitArchive);
                    await rm(path.join(unzippedGitArchive, ".yarn"), { recursive: true, force: true });
                    await rm(path.join(unzippedGitArchive, "yarn.lock"), { recursive: true, force: true });
                    directoryContents = await getDirectoryContents(AbsoluteFilePath.of(unzippedGitArchive));
                }

                expect(directoryContents).toMatchSnapshot();
            },
            180_000
        );
    }
});

function generateOutputMode(
    org: string,
    apiName: string,
    mode: "github" | "publish" | "local"
): FernGeneratorExec.OutputMode {
    switch (mode) {
        case "local":
            return FernGeneratorExec.OutputMode.downloadFiles();
        case "github":
            return FernGeneratorExec.OutputMode.github({
                version: "0.0.1",
                repoUrl: `https://github.com/${org}/${apiName}}`,
                publishInfo: FernGeneratorExec.GithubPublishInfo.npm({
                    registryUrl: "https://npmjs.org/",
                    tokenEnvironmentVariable: "NPM_TOKEN",
                    packageName: `@${org}/${apiName}`,
                }),
            });
        case "publish":
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
}

async function doesPathExist(filepath: string): Promise<boolean> {
    try {
        await lstat(filepath);
        return true;
    } catch {
        return false;
    }
}
