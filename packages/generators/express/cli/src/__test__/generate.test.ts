import { AbsoluteFilePath, getDirectoryContents } from "@fern-api/fs-utils";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import decompress from "decompress";
import execa from "execa";
import { lstat, readdir, rm, symlink, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { ExpressCustomConfigSchema } from "../custom-config/schema/ExpressCustomConfigSchema";
import { ExpressGeneratorCli } from "../ExpressGeneratorCli";

interface FixtureInfo {
    path: string;
    orgName: string;
    outputMode: "github" | "publish" | "local";
    apiName: string;
    customConfig?: ExpressCustomConfigSchema;
}

const FIXTURES: FixtureInfo[] = [
    {
        path: "trace",
        orgName: "trace",
        outputMode: "local",
        apiName: "api",
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

                await new ExpressGeneratorCli().run(configJsonPath);

                const directoryContents = await getDirectoryContents(
                    await getDirectoryForSnapshot({
                        outputMode: fixture.outputMode,
                        outputPath: AbsoluteFilePath.of(outputPath),
                    })
                );

                // we don't run compile for github, so run it here to make sure it compiles
                if (fixture.outputMode === "github") {
                    await execa("yarn", [], {
                        cwd: outputPath,
                    });
                    await execa("yarn", ["build"], {
                        cwd: outputPath,
                    });
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

async function getDirectoryForSnapshot({
    outputMode,
    outputPath,
}: {
    outputMode: "local" | "github" | "publish";
    outputPath: AbsoluteFilePath;
}): Promise<AbsoluteFilePath> {
    switch (outputMode) {
        case "local":
        case "github": {
            return AbsoluteFilePath.of(outputPath);
        }
        case "publish": {
            const outputContents = await readdir(outputPath);
            const tgzFilename = outputContents.find((item) => item.endsWith(".tgz"));
            if (tgzFilename == null) {
                throw new Error("No .tgz was found in output directory");
            }
            const unzippedPackage = (await tmp.dir()).path;
            await decompress(path.join(outputPath, tgzFilename), unzippedPackage);
            return AbsoluteFilePath.of(unzippedPackage);
        }
    }
}
