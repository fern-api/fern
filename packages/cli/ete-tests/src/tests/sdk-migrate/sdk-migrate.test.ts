import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { cp, readFile, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import tmp from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli.js";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("fern sdk migrate", () => {
    it("runs from the published CLI command tree and writes only YAML to stdout", async ({ signal }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });
        const generatorsPath = join(directory, RelativeFilePath.of("fern/generators.yml"));
        const originalGenerators = await readFile(generatorsPath, "utf-8");
        const expectedSdkConfig = yaml.load(
            await readFile(join(directory, RelativeFilePath.of("sdk-config.yml")), "utf-8")
        );

        const result = await runFernCli(["sdk", "migrate", "--api", "default", "-o", "-", "--log-level", "debug"], {
            cwd: directory,
            env: { FERN_NO_VERSION_REDIRECTION: "true" },
            signal,
            stripFinalNewline: false
        });

        expect(result.stdout.endsWith("\n")).toBe(true);
        expect(result.stdout.trimStart()).not.toMatch(/^\{/);
        const sdkConfig = yaml.load(result.stdout);
        expect(sdkConfig).toEqual(expectedSdkConfig);
        expect(await readFile(generatorsPath, "utf-8")).toBe(originalGenerators);
        await temporaryDirectory.cleanup();
    });

    it("writes sdk-config.yml without modifying generators.yml or changing unflagged generation", async ({
        signal
    }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });
        const output = join(directory, RelativeFilePath.of("fern/sdk-config.yml"));
        const generators = join(directory, RelativeFilePath.of("fern/generators.yml"));
        const originalGenerators = await readFile(generators, "utf-8");

        const migration = await runFernCli(["sdk", "migrate", "--api", "default"], {
            cwd: directory,
            env: { FERN_NO_VERSION_REDIRECTION: "true" },
            signal
        });

        expect(yaml.load(await readFile(output, "utf-8"))).toMatchObject({
            schemaVersion: "sdk-config/v1",
            source: { specs: [{ path: "./openapi.yml" }] }
        });
        expect(yaml.load(await readFile(join(directory, RelativeFilePath.of("fern/docs.yml")), "utf-8"))).toMatchObject(
            {
                navigation: [
                    {
                        api: "API reference",
                        specs: [{ type: "openapi", path: "./openapi.yml" }]
                    }
                ]
            }
        );
        expect(await readFile(generators, "utf-8")).toBe(originalGenerators);
        expect(migration.stderr).toContain(
            "Next: review the migrated file, then pass its path to fern generate --sdk-config."
        );

        const legacyGeneration = await runFernCli(
            ["generate", "--api", "default", "--group", "missing", "--local", "--no-prompt"],
            {
                cwd: directory,
                env: { FERN_NO_VERSION_REDIRECTION: "true" },
                reject: false,
                signal
            }
        );
        expect(legacyGeneration.exitCode).not.toBe(0);
        const generationOutput = `${legacyGeneration.stdout}\n${legacyGeneration.stderr}`;
        expect(generationOutput).toContain("'missing' is not a valid group or alias");
        expect(generationOutput).not.toContain("SDK Config");
        await temporaryDirectory.cleanup();
    });

    it("preserves AsyncAPI source types in sdk-config.yml and docs.yml", async ({ signal }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });
        const generatorsPath = join(directory, RelativeFilePath.of("fern/generators.yml"));
        const generators = await readFile(generatorsPath, "utf-8");
        await writeFile(generatorsPath, generators.replace("- openapi: ./openapi.yml", "- asyncapi: ./asyncapi.yml"));

        const result = await runFernCli(["sdk", "migrate", "--api", "default", "--output", "-"], {
            cwd: directory,
            env: { FERN_NO_VERSION_REDIRECTION: "true" },
            signal
        });

        expect(yaml.load(result.stdout)).toMatchObject({
            source: { specs: [{ type: "asyncapi", path: "./fern/asyncapi.yml" }] }
        });
        expect(yaml.load(await readFile(join(directory, RelativeFilePath.of("fern/docs.yml")), "utf-8"))).toMatchObject(
            {
                navigation: [
                    {
                        api: "API reference",
                        specs: [{ type: "asyncapi", path: "./asyncapi.yml" }]
                    }
                ]
            }
        );
        await temporaryDirectory.cleanup();
    });

    it("rejects an unknown API in a single unnamed workspace", async ({ signal }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });

        const result = await runFernCli(["sdk", "migrate", "--api", "typo", "--output", "-"], {
            cwd: directory,
            env: { FERN_NO_VERSION_REDIRECTION: "true" },
            reject: false,
            signal
        });

        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain("API 'typo' not found");
        await temporaryDirectory.cleanup();
    });

    it("protects an existing file and supports force replacement", async ({ signal }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });
        const output = join(directory, RelativeFilePath.of("output/sdk-config.yml"));
        const command = ["sdk", "migrate", "--output", output];
        const options = {
            cwd: directory,
            env: { FERN_NO_VERSION_REDIRECTION: "true" },
            signal
        };

        await runFernCli(command, options);
        const first = await readFile(output, "utf-8");
        const rejected = await runFernCli(command, { ...options, reject: false });
        expect(rejected.exitCode).not.toBe(0);
        expect(await readFile(output, "utf-8")).toBe(first);

        await runFernCli([...command, "--force"], options);
        expect(yaml.load(await readFile(output, "utf-8"))).toMatchObject({
            schemaVersion: "sdk-config/v1",
            source: { specs: [{ path: "./fern/openapi.yml" }] }
        });
        await temporaryDirectory.cleanup();
    });

    it("maps credential-free registry publication in strict mode", async ({ signal }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });

        const result = await runFernCli(["sdk", "migrate", "--group", "npm", "--output", "-", "--strict"], {
            cwd: directory,
            env: { FERN_NO_VERSION_REDIRECTION: "true" },
            signal
        });

        expect(yaml.load(result.stdout)).toMatchObject({
            targets: [
                {
                    language: "typescript",
                    package: { packageName: "@acme/sdk" },
                    output: { delivery: "zip", publish: { registry: "npm" } }
                }
            ]
        });
        await temporaryDirectory.cleanup();
    });

    it("consolidates repeated compatible groups into one SDK Config", async ({ signal }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });

        const result = await runFernCli(
            ["sdk", "migrate", "--group", "typescript-only", "--group", "python-only", "--output", "-"],
            {
                cwd: directory,
                env: { FERN_NO_VERSION_REDIRECTION: "true" },
                signal
            }
        );

        const targets = (yaml.load(result.stdout) as { targets: Array<Record<string, unknown>> }).targets;
        expect(targets).toMatchObject([{ language: "typescript" }, { language: "python" }]);
        expect(targets).toHaveLength(2);
        expect(targets.every((target) => !("generatorVersion" in target))).toBe(true);
        await temporaryDirectory.cleanup();
    });

    it("preserves portable settings across a multi-language SDK-only migration", async ({ signal }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });
        await cp(
            join(directory, RelativeFilePath.of("portable-settings-generators.yml")),
            join(directory, RelativeFilePath.of("fern/generators.yml"))
        );
        // Source import settings have no docs.yml equivalent, so keep this fixture scoped to SDK migration.
        await rm(join(directory, RelativeFilePath.of("fern/docs.yml")));

        const result = await runFernCli(
            ["sdk", "migrate", "--group", "ts-sdk", "--group", "php-sdk", "--group", "python-sdk", "--output", "-"],
            {
                cwd: directory,
                env: { FERN_NO_VERSION_REDIRECTION: "true" },
                signal
            }
        );

        expect(result.stderr).not.toContain("FERN_CONFIG_FIELD_UNSUPPORTED");
        expect(yaml.load(result.stdout)).toMatchObject({
            source: {
                apiImportSettings: {
                    ignoreTags: true,
                    disambiguateRequestNames: false
                }
            },
            targets: [
                {
                    language: "typescript",
                    package: {
                        description: "Example SDK for Node.js.",
                        authors: [{ name: "Example SDKs", email: "sdk@example.com", url: "https://example.com" }]
                    },
                    generation: { httpClient: { name: "fetch" } },
                    docs: {
                        readme: { customSections: [{ title: "Node.js", content: "Run npm install." }] }
                    }
                },
                {
                    language: "php",
                    package: {
                        packageName: "acme/example-sdk",
                        description: "Example SDK for PHP.",
                        authors: [{ name: "Example SDKs", email: "sdk@example.com", url: "https://example.com" }],
                        license: { type: "MIT" }
                    },
                    docs: {
                        readme: { customSections: [{ title: "PHP", content: "Run composer require." }] }
                    }
                },
                {
                    language: "python",
                    client: { responseValidation: false },
                    generation: { additionalInitExports: [{ from: "types", imports: ["ApiError"] }] },
                    docs: {
                        readme: { customSections: [{ title: "Python", content: "Run pip install." }] }
                    }
                }
            ]
        });
        await temporaryDirectory.cleanup();
    });

    it("rejects repeated groups with different audience schemas", async ({ signal }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });

        const result = await runFernCli(
            ["sdk", "migrate", "--group", "typescript-only", "--group", "maven", "--output", "-"],
            {
                cwd: directory,
                env: { FERN_NO_VERSION_REDIRECTION: "true" },
                reject: false,
                signal
            }
        );

        expect(result.exitCode).not.toBe(0);
        expect(result.stdout).toBe("");
        expect(result.stderr).toContain("resolve to different API sources, schemas, import settings, or audiences");
        await temporaryDirectory.cleanup();
    });

    it("normalizes Maven coordinates", async ({ signal }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });

        const result = await runFernCli(["sdk", "migrate", "--group", "maven", "--output", "-"], {
            cwd: directory,
            env: { FERN_NO_VERSION_REDIRECTION: "true" },
            signal
        });

        expect(yaml.load(result.stdout)).toMatchObject({
            targets: [
                {
                    language: "java",
                    package: { artifactId: "sdk", groupId: "com.acme" },
                    output: {
                        delivery: "github",
                        github: { repository: "acme/sdk", mode: "pull-request" },
                        publish: { registry: "maven" }
                    }
                }
            ]
        });
        await temporaryDirectory.cleanup();
    });

    it("does not write output when strict mode encounters a diagnostic", async ({ signal }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });
        const output = join(directory, RelativeFilePath.of("output/strict.yml"));

        const result = await runFernCli(["sdk", "migrate", "--group", "warning", "--output", output, "--strict"], {
            cwd: directory,
            env: { FERN_NO_VERSION_REDIRECTION: "true" },
            reject: false,
            signal
        });

        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain("[warning] [FERN_RESOLVED_FIELD_UNSUPPORTED]");
        await expect(readFile(output, "utf-8")).rejects.toMatchObject({ code: "ENOENT" });
        await temporaryDirectory.cleanup();
    });
}, 60_000);
