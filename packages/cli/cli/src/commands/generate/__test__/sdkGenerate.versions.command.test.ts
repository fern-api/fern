import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    filesTarget,
    GenerateWorld,
    generate,
    generator,
    generatorsYml,
    localGenerator,
    OPENAPI,
    type RegistryLanguage,
    sdkConfigYml
} from "./sdkGenerateHarness.js";
import { featureFlags } from "./sdkGenerateMocks.js";

vi.mock("@fern-api/login", async () => (await import("./sdkGenerateMocks.js")).loginModule());
vi.mock("@fern-api/posthog-manager", async (importOriginal) =>
    (await import("./sdkGenerateMocks.js")).posthogModule(
        await importOriginal<typeof import("@fern-api/posthog-manager")>()
    )
);

// The version of the SDK: what is asked for (--version, sdk-config.yml's sdkVersion, a computed next version, AUTO), what
// is sent to Fiddle and sdk-gen-api, and which version the command files the SDK's dynamic IR under afterwards.

const TS = "fernapi/fern-typescript-sdk";
const PY = "fernapi/fern-python-sdk";

describe("fern generate: SDK versions", { timeout: 120_000 }, () => {
    let world: GenerateWorld;

    beforeEach(async () => {
        world = new GenerateWorld();
        await world.setup();
        vi.stubEnv("NPM_TOKEN", "npm-secret");
        vi.stubEnv("PYPI_TOKEN", "pypi-secret");
        vi.stubEnv("MAVEN_PASSWORD", "maven-secret");
        vi.stubEnv("NUGET_KEY", "nuget-secret");
        vi.stubEnv("CRATES_TOKEN", "crates-secret");
        vi.stubEnv("GEM_KEY", "gem-secret");
    });

    afterEach(() => world.teardown());

    describe("generators.yml generators (Fiddle)", () => {
        const pythonLocal = localGenerator(
            PY,
            "4.0.0",
            "./generated/python",
            "        config:\n          package_name: acme-py\n"
        );

        const run = (generators: string[], args: Record<string, unknown> = {}) =>
            generate(world, {
                files: {
                    "openapi/openapi.yml": OPENAPI,
                    "generators.yml": generatorsYml({ groups: { sdks: generators }, defaultGroup: "sdks" })
                },
                args
            });

        const dynamicIrUploads = () =>
            world.fdr.to("POST /registry/api/sdk-dynamic-ir-upload-urls").map(({ body }) => body);

        it("sends no version when none is given and none can be computed, and files no dynamic IR", async () => {
            const result = await run([pythonLocal]);

            expect(result.failed).toBe(false);
            expect(world.fiddle.requestBodies[0]?.version).toBeUndefined();
            expect(dynamicIrUploads()).toEqual([]);
            expect(
                result.logged("Skipping dynamic IR upload for fernapi/fern-python-sdk: no SDK version was resolved")
            ).toBe(true);
        });

        it("sends the version it was given, builds the package with it, and files the dynamic IR under it", async () => {
            const result = await run([pythonLocal], { version: "1.2.3" });

            expect(result.failed).toBe(false);
            expect(world.fiddle.requestBodies[0]?.version).toBe("1.2.3");
            expect(result.logged("Created PyPiPublishTarget: version 1.2.3 package name: acme-py")).toBe(true);
            expect(dynamicIrUploads()).toEqual([
                { orgId: "acme", version: "1.2.3", snippetConfiguration: { python: "acme-py" } }
            ]);
        });

        it("files the dynamic IR under the version Fiddle reports, not the one asked for", async () => {
            world.fiddle.willFinish({ actualVersion: "1.2.4" });
            await run([pythonLocal], { version: "1.2.3" });

            expect(world.fiddle.requestBodies[0]?.version).toBe("1.2.3");
            expect(dynamicIrUploads()).toEqual([
                { orgId: "acme", version: "1.2.4", snippetConfiguration: { python: "acme-py" } }
            ]);
        });

        it("reads the version from the release Fiddle tagged when it does not report one", async () => {
            world.fiddle.willFinish({
                logs: [
                    { level: "INFO", message: "Cloning acme/sdk-py" },
                    { level: "INFO", message: "Tagging release v2.5.0" }
                ]
            });
            await run([pythonLocal], { version: "AUTO" });

            expect(dynamicIrUploads()).toEqual([
                { orgId: "acme", version: "2.5.0", snippetConfiguration: { python: "acme-py" } }
            ]);
        });

        describe("AUTO", () => {
            it("is sent as AUTO, and the package is built with a placeholder Fiddle replaces", async () => {
                const result = await run([pythonLocal], { version: "AUTO" });

                expect(result.failed).toBe(false);
                expect(world.fiddle.requestBodies[0]?.version).toBe("AUTO");
                // Python's placeholder is a valid PEP 440 version; the others use the canonical one.
                expect(result.logged("Created PyPiPublishTarget: version 0.0.0.dev0 package name: acme-py")).toBe(true);
                expect(dynamicIrUploads()).toEqual([]);
            });

            it("uses the canonical placeholder for TypeScript", async () => {
                const result = await run(
                    [
                        localGenerator(
                            TS,
                            "3.0.0",
                            "./generated/typescript",
                            '        config:\n          packageName: "@acme/sdk"\n'
                        )
                    ],
                    {
                        version: "AUTO"
                    }
                );

                expect(result.failed).toBe(false);
                expect(world.fiddle.jobs[0]?.ir().publishConfig).toMatchObject({
                    type: "filesystem",
                    publishTarget: { type: "npm", version: "0.0.0-fern-placeholder" }
                });
            });

            it("files the dynamic IR under the version Fiddle chose", async () => {
                world.fiddle.willFinish({ actualVersion: "3.1.4" });
                await run([pythonLocal], { version: "AUTO" });

                expect(dynamicIrUploads()).toEqual([
                    { orgId: "acme", version: "3.1.4", snippetConfiguration: { python: "acme-py" } }
                ]);
            });
        });

        describe("the next version, computed from what is published", () => {
            const publishing = (name: string, version: string, output: string, config = ""): string =>
                generator(name, version, `${config}        output:\n${output}`);

            it.each<{
                label: string;
                language: RegistryLanguage;
                packageName: string;
                published: string[];
                next: string;
                generatorYaml: string;
            }>([
                {
                    label: "npm",
                    language: "typescript",
                    packageName: "@acme/sdk",
                    published: ["1.0.0", "1.2.3"],
                    next: "1.2.4",
                    generatorYaml: publishing(
                        TS,
                        "3.0.0",
                        '          location: npm\n          package-name: "@acme/sdk"\n          token: ${NPM_TOKEN}\n'
                    )
                },
                {
                    label: "PyPI",
                    language: "python",
                    packageName: "acme-py",
                    published: ["2.0.0"],
                    next: "2.0.1",
                    generatorYaml: publishing(
                        PY,
                        "4.0.0",
                        "          location: pypi\n          package-name: acme-py\n          token: ${PYPI_TOKEN}\n"
                    )
                },
                {
                    label: "Maven Central",
                    language: "java",
                    packageName: "com.acme:sdk",
                    published: ["3.1.0"],
                    next: "3.1.1",
                    generatorYaml: publishing(
                        "fernapi/fern-java-sdk",
                        "3.0.0",
                        "          location: maven\n          coordinate: com.acme:sdk\n          username: u\n          password: ${MAVEN_PASSWORD}\n"
                    )
                },
                {
                    label: "NuGet",
                    language: "csharp",
                    packageName: "Acme.Sdk",
                    published: ["0.8.0", "0.9.0", "1.0.0-rc.1"],
                    next: "0.9.1",
                    generatorYaml: publishing(
                        "fernapi/fern-csharp-sdk",
                        "2.0.0",
                        "          location: nuget\n          package-name: Acme.Sdk\n          api-key: ${NUGET_KEY}\n"
                    )
                },
                {
                    label: "crates.io",
                    language: "rust",
                    packageName: "acme-crate",
                    published: ["0.4.0"],
                    next: "0.4.1",
                    generatorYaml: publishing(
                        "fernapi/fern-rust-sdk",
                        "0.5.0",
                        "          location: crates\n          package-name: acme-crate\n          token: ${CRATES_TOKEN}\n"
                    )
                }
            ])("looks the package up on $label, and leaves picking the next version to Fiddle", async ({
                language,
                packageName,
                published,
                next,
                generatorYaml
            }) => {
                world.registry.publish(language, packageName, published);
                const result = await run([generatorYaml]);

                expect(result.failed).toBe(false);
                // NOTE: the CLI reads the registry but sends Fiddle no version for a publish output; Fiddle bumps it.
                expect(world.registry.requests.length).toBeGreaterThan(0);
                expect(world.fiddle.requestBodies[0]?.version).toBeUndefined();
                expect(next).not.toBe(published[published.length - 1]);
            });

            it("bumps the highest of the registry, the GitHub release and .fern/metadata.json", async () => {
                world.registry.publish("typescript", "@acme/sdk", ["1.2.3"]);
                world.registry.github("acme/sdk-ts", { latestRelease: "1.4.0", metadataVersion: "1.5.0" });
                const result = await run([
                    generator(
                        TS,
                        "3.0.0",
                        '        output:\n          location: npm\n          package-name: "@acme/sdk"\n          token: ${NPM_TOKEN}\n        github:\n          repository: acme/sdk-ts\n'
                    )
                ]);

                expect(result.failed).toBe(false);
                expect(world.fiddle.requestBodies[0]?.version).toBe("1.5.1");
            });

            it("sends no version for a package nothing has published", async () => {
                const result = await run([
                    generator(
                        TS,
                        "3.0.0",
                        '        output:\n          location: npm\n          package-name: "@acme/new-sdk"\n          token: ${NPM_TOKEN}\n'
                    )
                ]);

                expect(result.failed).toBe(false);
                expect(world.fiddle.requestBodies[0]?.version).toBeUndefined();
            });

            it("prefers the version it was given to computing one", async () => {
                world.registry.publish("typescript", "@acme/sdk", ["1.2.3"]);
                await run(
                    [
                        generator(
                            TS,
                            "3.0.0",
                            '        output:\n          location: npm\n          package-name: "@acme/sdk"\n          token: ${NPM_TOKEN}\n'
                        )
                    ],
                    { version: "5.0.0" }
                );

                expect(world.fiddle.requestBodies[0]?.version).toBe("5.0.0");
                // It never asked the registry for the latest version, only whether 5.0.0 exists.
                expect(world.registry.requests).toEqual(["GET https://registry.npmjs.org/@acme%2Fsdk/5.0.0"]);
            });

            it("files the dynamic IR of a GitHub-only SDK under its package only when the release is confirmed", async () => {
                world.registry.publish("typescript", "@acme/sdk", ["1.2.3"]);
                const result = await run([
                    generator(
                        TS,
                        "3.0.0",
                        '        config:\n          packageName: "@acme/sdk"\n        github:\n          repository: acme/sdk-ts\n'
                    )
                ]);

                expect(result.failed).toBe(false);
                // The candidate would be 1.2.4, but the registry still says 1.2.3 after the run.
                expect(dynamicIrUploads()).toEqual([]);
                expect(
                    result.logged(
                        "computed candidate 1.2.4 for package @acme/sdk but the registry/GitHub reports 1.2.3, so the generated SDK version is unconfirmed"
                    )
                ).toBe(true);
            });
        });

        describe("a version that is already published", () => {
            it.each([
                {
                    label: "npm",
                    registry: "npm",
                    language: "typescript" as const,
                    packageName: "@acme/sdk",
                    generatorYaml: generator(
                        TS,
                        "3.0.0",
                        '        output:\n          location: npm\n          package-name: "@acme/sdk"\n          token: ${NPM_TOKEN}\n'
                    )
                },
                {
                    label: "PyPI",
                    registry: "PyPI",
                    language: "python" as const,
                    packageName: "acme-py",
                    generatorYaml: generator(
                        PY,
                        "4.0.0",
                        "        output:\n          location: pypi\n          package-name: acme-py\n          token: ${PYPI_TOKEN}\n"
                    )
                },
                {
                    label: "Maven",
                    registry: "Maven Central",
                    language: "java" as const,
                    packageName: "com.acme:sdk",
                    generatorYaml: generator(
                        "fernapi/fern-java-sdk",
                        "3.0.0",
                        "        output:\n          location: maven\n          coordinate: com.acme:sdk\n          username: u\n          password: ${MAVEN_PASSWORD}\n"
                    )
                },
                {
                    label: "NuGet",
                    registry: "NuGet",
                    language: "csharp" as const,
                    packageName: "Acme.Sdk",
                    generatorYaml: generator(
                        "fernapi/fern-csharp-sdk",
                        "2.0.0",
                        "        output:\n          location: nuget\n          package-name: Acme.Sdk\n          api-key: ${NUGET_KEY}\n"
                    )
                },
                {
                    label: "crates.io",
                    registry: "crates.io",
                    language: "rust" as const,
                    packageName: "acme-crate",
                    generatorYaml: generator(
                        "fernapi/fern-rust-sdk",
                        "0.5.0",
                        "        output:\n          location: crates\n          package-name: acme-crate\n          token: ${CRATES_TOKEN}\n"
                    )
                }
            ])("refuses to publish it again to $label, before anything is sent to Fiddle", async ({
                language,
                packageName,
                generatorYaml,
                registry
            }) => {
                world.registry.publish(language, packageName, ["1.2.3"]);
                const result = await generate(world, {
                    files: {
                        "openapi/openapi.yml": OPENAPI,
                        "generators.yml": generatorsYml({ groups: { sdks: [generatorYaml] }, defaultGroup: "sdks" })
                    },
                    args: { version: "1.2.3" }
                });

                expect(result.failed).toBe(true);
                expect(result.errors.join("\n")).toContain(
                    `Version 1.2.3 of ${packageName} already exists on the ${registry} registry. Please use a different version number. If you want to automatically increment the version, omit the --version flag.`
                );
                expect(world.fiddle.jobs).toEqual([]);
                expect(world.fdr.to("POST /registry/api/register")).toEqual([]);
            });

            it("only warns for a GitHub delivery, whose CI pipeline may publish it", async () => {
                world.registry.publish("typescript", "@acme/sdk", ["1.2.3"]);
                const result = await generate(world, {
                    files: {
                        "openapi/openapi.yml": OPENAPI,
                        "generators.yml": generatorsYml({
                            groups: {
                                sdks: [
                                    generator(
                                        TS,
                                        "3.0.0",
                                        '        config:\n          packageName: "@acme/sdk"\n        github:\n          repository: acme/sdk-ts\n'
                                    )
                                ]
                            },
                            defaultGroup: "sdks"
                        })
                    },
                    args: { version: "1.2.3" }
                });

                expect(result.failed).toBe(false);
                expect(result.warnings.join("\n")).toContain(
                    "Version 1.2.3 of @acme/sdk already exists on the npm registry. If your CI pipeline publishes this version, it may fail."
                );
                expect(world.fiddle.requestBodies[0]?.version).toBe("1.2.3");
            });

            it("does not look for it when the files are only downloaded", async () => {
                world.registry.publish("typescript", "@acme/sdk", ["1.2.3"]);
                const result = await run(
                    [
                        localGenerator(
                            TS,
                            "3.0.0",
                            "./generated/ts",
                            '        config:\n          packageName: "@acme/sdk"\n'
                        )
                    ],
                    { version: "1.2.3" }
                );

                expect(result.failed).toBe(false);
                expect(world.registry.requests.filter((request) => request.endsWith("/1.2.3"))).toEqual([]);
            });

            it("does not look for it in a preview, and says so", async () => {
                world.registry.publish("typescript", "@acme/sdk", ["1.2.3"]);
                const result = await run(
                    [
                        generator(
                            TS,
                            "3.0.0",
                            '        output:\n          location: npm\n          package-name: "@acme/sdk"\n          token: ${NPM_TOKEN}\n'
                        )
                    ],
                    { version: "1.2.3", preview: true }
                );

                expect(result.failed).toBe(false);
                expect(result.warnings.join("\n")).toContain(
                    "Skipping version availability check in preview mode. Version 1.2.3 may already exist on the package registry."
                );
                expect(world.registry.requests).toEqual([]);
            });
        });
    });

    describe("SDK Config targets (sdk-gen-api)", () => {
        const run = (targets: string, args: Record<string, unknown> = {}, header = "") =>
            generate(world, {
                files: { "openapi/openapi.yml": OPENAPI, "sdk-config.yml": sdkConfigYml(targets, header) },
                args
            });

        const versionsByLanguage = (): Record<string, string> =>
            Object.fromEntries(world.sdkGenApi.submitted.map((target) => [target.language, target.sdk.version]));

        it("uses sdk-config.yml's sdkVersion", async () => {
            await run(filesTarget("typescript"));

            expect(versionsByLanguage()).toEqual({ typescript: "1.0.0" });
        });

        it("uses 1.0.0 when sdk-config.yml has no sdkVersion", async () => {
            await generate(world, {
                files: {
                    "openapi/openapi.yml": OPENAPI,
                    "sdk-config.yml": `schemaVersion: sdk-config/v1
sdkName: acme
source:
  specs:
    - id: pets
      type: openapi
      path: ./openapi/openapi.yml
targets:
${filesTarget("typescript")}`
                }
            });

            expect(versionsByLanguage()).toEqual({ typescript: "1.0.0" });
        });

        it("prefers a target's own sdkVersion to the file's", async () => {
            await run(filesTarget("typescript", "    sdkVersion: 2.0.0\n") + filesTarget("python"));

            expect(versionsByLanguage()).toEqual({ typescript: "2.0.0", python: "1.0.0" });
        });

        it("prefers --version to both", async () => {
            await run(filesTarget("typescript", "    sdkVersion: 2.0.0\n") + filesTarget("python"), {
                version: "9.9.9"
            });

            expect(versionsByLanguage()).toEqual({ typescript: "9.9.9", python: "9.9.9" });
        });

        it("sends the SDK name and API version, from the target before the file", async () => {
            await generate(world, {
                files: {
                    "openapi/openapi.yml": OPENAPI,
                    "sdk-config.yml": `schemaVersion: sdk-config/v1
sdkName: acme
sdkVersion: 1.0.0
apiVersion: "2026-01-01"
source:
  specs:
    - id: pets
      type: openapi
      path: ./openapi/openapi.yml
targets:
${filesTarget("typescript", "    sdkName: acme-ts\n")}${filesTarget("python")}`
                }
            });

            expect(world.sdkGenApi.submitted.map((target) => [target.language, target.sdk]).sort()).toEqual([
                ["python", { name: "acme", version: "1.0.0", apiVersion: "2026-01-01" }],
                ["typescript", { name: "acme-ts", version: "1.0.0", apiVersion: "2026-01-01" }]
            ]);
        });

        describe("--version AUTO", () => {
            const github = (language: string): string => `  - language: ${language}
    output:
      delivery: github
      github:
        repository: acme/sdk-${language}
        mode: pull-request
`;
            const delivered = {
                publication: {
                    status: "success" as const,
                    publishTarget: { type: "github" as const, identifier: "acme/sdk-typescript" },
                    output: {}
                }
            };

            it("is sent with a GitHub delivery, and logs the version sdk-gen-api chose", async () => {
                world.sdkGenApi.willBuild("typescript", { ...delivered, actualVersion: "1.4.0" });
                const result = await run(github("typescript"), { version: "AUTO" });

                expect(result.failed).toBe(false);
                expect(versionsByLanguage()).toEqual({ typescript: "AUTO" });
                expect(result.logged("AUTO versioning picked new version: 1.4.0")).toBe(true);
            });

            it("logs no version when the build released nothing", async () => {
                world.sdkGenApi.willBuild("typescript", delivered);
                const result = await run(github("typescript"), { version: "AUTO" });

                expect(result.failed).toBe(false);
                expect(result.logged("AUTO versioning picked")).toBe(false);
            });

            it("is refused for a download, which would ship the placeholder", async () => {
                const result = await run(filesTarget("typescript"), { version: "AUTO" });

                expect(result.failed).toBe(true);
                expect(result.errors.join("\n")).toContain(
                    "Cannot submit SDK generation to sdk-gen-api: automatic SDK versioning (--version AUTO) through sdk-gen-api requires GitHub output"
                );
                expect(world.sdkGenApi.builds).toEqual([]);
            });

            it("is refused for a direct registry publish", async () => {
                const result = await run(
                    `  - language: typescript
    package:
      packageName: "@acme/sdk"
    output:
      delivery: files
      publish:
        registry: npm
        token: \${NPM_TOKEN}
`,
                    { version: "AUTO" }
                );

                expect(result.failed).toBe(true);
                expect(result.errors.join("\n")).toContain("requires GitHub output");
            });

            it("is refused for a preview, which only downloads", async () => {
                const result = await run(github("typescript"), { version: "AUTO", preview: true });

                expect(result.failed).toBe(true);
                expect(result.errors.join("\n")).toContain(
                    "preview generation only downloads files, so it cannot use --version AUTO"
                );
            });

            it("is refused for a generators.yml generator that sdk-gen-api builds", async () => {
                featureFlags.isEnabled.mockImplementation(async () => true);
                const result = await generate(world, {
                    files: {
                        "openapi/openapi.yml": OPENAPI,
                        "generators.yml": generatorsYml({
                            groups: { sdks: [localGenerator(TS, "3.0.0", "./generated/typescript")] },
                            defaultGroup: "sdks"
                        })
                    },
                    args: { version: "AUTO" }
                });

                expect(result.failed).toBe(true);
                expect(result.errors.join("\n")).toContain(
                    "automatic SDK versioning has not yet moved from Fiddle to the shared pipeline"
                );
                expect(world.sdkGenApi.builds).toEqual([]);
            });
        });
    });
});
