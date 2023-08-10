import { AbsoluteFilePath, getDirectoryContents } from "@fern-api/fs-utils";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import * as FernGeneratorExecParsing from "@fern-fern/generator-exec-sdk/serialization";
import decompress from "decompress";
import execa from "execa";
import { lstat, rm, symlink, writeFile } from "fs/promises";
import "jest-specific-snapshot";
import path from "path";
import tmp from "tmp-promise";
import { ExpressCustomConfigSchema } from "../custom-config/schema/ExpressCustomConfigSchema";
import { ExpressGeneratorCli } from "../ExpressGeneratorCli";

const FILENAMES_TO_IGNORE_FOR_SNAPSHOT = new Set([".pnp.cjs", ".pnp.loader.mjs", ".yarn", "yarn.lock", "node_modules"]);

interface FixtureInfo {
    path: string;
    orgName: string;
    outputMode: "github" | "publish" | "local";
    apiName: string;
    customConfig?: ExpressCustomConfigSchema;
    only?: true;
    additionalAssertions?: (pathToOutput: AbsoluteFilePath) => void | Promise<void>;
}

const FIXTURES: FixtureInfo[] = [
    {
        path: "trace",
        orgName: "trace",
        outputMode: "local",
        apiName: "api",
        customConfig: {
            includeUtilsOnUnionMembers: true,
            includeOtherInUnionTypes: true,
        },
    },
    {
        path: "simple",
        orgName: "fern",
        outputMode: "local",
        apiName: "api",
        customConfig: {
            doNotHandleUnrecognizedErrors: true,
            includeUtilsOnUnionMembers: true,
            includeOtherInUnionTypes: true,
        },
    },
    {
        path: "output-source-files-simple",
        orgName: "fern",
        outputMode: "local",
        apiName: "api",
        customConfig: {
            outputSourceFiles: true,
        },
    },
    {
        path: "folders",
        orgName: "fern",
        outputMode: "local",
        apiName: "api",
    },
    {
        path: "no-zurg-trace",
        orgName: "fern",
        outputMode: "local",
        apiName: "api",
        customConfig: {
            noSerdeLayer: true,
        },
        additionalAssertions: async (outputPath) => {
            // eslint-disable-next-line jest/no-standalone-expect
            expect(await doesPathExist(path.join(outputPath, "serialization"))).toBe(false);
            // eslint-disable-next-line jest/no-standalone-expect
            expect(await doesPathExist(path.join(outputPath, "core", "schemas"))).toBe(false);
        },
    },
];
const FIXTURES_PATH = path.join(__dirname, "fixtures");

describe("runGenerator", () => {
    // mock generator version
    process.env.GENERATOR_VERSION = "0.0.0";

    for (const fixture of FIXTURES) {
        (fixture.only ? it.only : it)(
            // eslint-disable-next-line jest/valid-title
            fixture.path,
            async () => {
                const fixturePath = path.join(FIXTURES_PATH, "fern", fixture.path);
                const irPath = path.join(fixturePath, "ir.json");
                const configJsonPath = path.join(fixturePath, "config.json");

                const { path: outputPath } = await tmp.dir();

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
                await writeFile(
                    configJsonPath,
                    JSON.stringify(await FernGeneratorExecParsing.GeneratorConfig.jsonOrThrow(config), undefined, 4)
                );

                await execa("fern", ["ir", irPath, "--api", fixture.path, "--language", "typescript"], {
                    cwd: FIXTURES_PATH,
                });

                await new ExpressGeneratorCli().run(configJsonPath);

                const unzippedDirectory = await getDirectoryForSnapshot(AbsoluteFilePath.of(outputPath));

                // add symlink for easy access in VSCode
                const generatedDir = path.join(fixturePath, "generated");
                await rm(generatedDir, { force: true, recursive: true });
                if (await doesPathExist(configJsonPath)) {
                    await rm(configJsonPath);
                }
                if (await doesPathExist(irPath)) {
                    await rm(irPath);
                }
                await symlink(unzippedDirectory, generatedDir);

                // we don't run compile for github, so run it here to make sure it compiles
                if (fixture.outputMode === "github") {
                    await execa("yarn", [], {
                        cwd: unzippedDirectory,
                    });
                    await execa("yarn", ["build"], {
                        cwd: unzippedDirectory,
                    });
                }

                const directoryContents = (await getDirectoryContents(unzippedDirectory)).filter(
                    (item) => !FILENAMES_TO_IGNORE_FOR_SNAPSHOT.has(item.name)
                );

                await fixture.additionalAssertions?.(unzippedDirectory);

                // eslint-disable-next-line jest/no-standalone-expect
                expect(directoryContents).toMatchSpecificSnapshot(
                    path.join(fixturePath, `express-${fixture.path}.shot`)
                );
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
                    tokenEnvironmentVariable: FernGeneratorExec.EnvironmentVariable("NPM_TOKEN"),
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
                version: "0.0.0",
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

async function getDirectoryForSnapshot(outputPath: AbsoluteFilePath): Promise<AbsoluteFilePath> {
    const unzippedPackage = (await tmp.dir()).path;
    await decompress(path.join(outputPath, "output.zip"), unzippedPackage);
    return AbsoluteFilePath.of(unzippedPackage);
}
