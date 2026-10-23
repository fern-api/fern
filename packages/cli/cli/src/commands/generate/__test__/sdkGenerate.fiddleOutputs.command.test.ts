import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    type FiddleOutcome,
    type FiddlePackage,
    GenerateWorld,
    generate,
    generator,
    generatorsYml,
    OPENAPI
} from "./sdkGenerateHarness.js";

vi.mock("@fern-api/login", async () => (await import("./sdkGenerateMocks.js")).loginModule());
vi.mock("@fern-api/posthog-manager", async (importOriginal) =>
    (await import("./sdkGenerateMocks.js")).posthogModule(
        await importOriginal<typeof import("@fern-api/posthog-manager")>()
    )
);

// A generators.yml generator, handed to Fiddle with each way of delivering the SDK. The create-job request is what
// Fiddle acts on, so it is read field by field; the IR the command uploads is read for its publishing config.

const TS = "fernapi/fern-typescript-sdk";
const PY = "fernapi/fern-python-sdk";
const JAVA = "fernapi/fern-java-sdk";
const CSHARP = "fernapi/fern-csharp-sdk";
const RUBY = "fernapi/fern-ruby-sdk";
const RUST = "fernapi/fern-rust-sdk";

describe("fern generate: what a generators.yml generator asks Fiddle to do", { timeout: 120_000 }, () => {
    let world: GenerateWorld;

    beforeEach(async () => {
        world = new GenerateWorld();
        await world.setup();
        vi.stubEnv("NPM_TOKEN", "npm-secret");
        vi.stubEnv("PYPI_TOKEN", "pypi-secret");
        vi.stubEnv("MAVEN_PASSWORD", "maven-secret");
        vi.stubEnv("NUGET_KEY", "nuget-secret");
        vi.stubEnv("GEM_KEY", "gem-secret");
        vi.stubEnv("CRATES_TOKEN", "crates-secret");
    });

    afterEach(() => world.teardown());

    /** Runs one generator and returns what Fiddle was asked, plus the result of the run. */
    async function run({
        name = TS,
        version = "3.0.0",
        body,
        generatorsYmlExtra,
        cliVersion = "1.2.3",
        outcome,
        args = {}
    }: {
        name?: string;
        version?: string;
        body: string;
        generatorsYmlExtra?: string;
        cliVersion?: string | undefined;
        outcome?: FiddleOutcome;
        args?: Record<string, unknown>;
    }) {
        if (outcome != null) {
            world.fiddle.willFinish(outcome);
        }
        const result = await generate(world, {
            files: {
                "openapi/openapi.yml": OPENAPI,
                "generators.yml": generatorsYml({
                    groups: { sdks: [generator(name, version, body)] },
                    defaultGroup: "sdks",
                    extra: generatorsYmlExtra
                })
            },
            args: { version: cliVersion, ...args }
        });
        const [job] = world.fiddle.jobs;
        return { result, request: job?.request, outputMode: job?.request.generators[0]?.outputMode, job };
    }

    describe("local-file-system", () => {
        it("downloads the files into the output path, and asks Fiddle to keep them for download", async () => {
            const { result, request, outputMode, job } = await run({
                body: `        output:
          location: local-file-system
          path: ./generated/sdk
`
            });

            expect(result.failed).toBe(false);
            expect(outputMode).toEqual({ type: "downloadFiles", downloadSnippets: true });
            expect(request).toMatchObject({
                apiName: "api",
                organizationName: "acme",
                version: "1.2.3",
                uploadToS3: true,
                preview: false,
                verify: false
            });
            expect(await result.generated("fern")).toEqual(["generated/sdk/README.md"]);
            expect(await result.read("fern/generated/sdk/README.md")).toBe("generated");
            // With --version, the IR carries the version the SDK will be written with.
            expect(job?.ir().publishConfig).toMatchObject({
                type: "filesystem",
                generateFullProject: false,
                publishTarget: { version: "1.2.3" }
            });
            expect(job?.started).toBe(true);
            expect(job?.hasSpecs).toBe(false);
        });

        it("replaces what an earlier run left in the output directory", async () => {
            const result = await generate(world, {
                files: {
                    "openapi/openapi.yml": OPENAPI,
                    "generators.yml": generatorsYml({
                        groups: {
                            sdks: [
                                generator(
                                    TS,
                                    "3.0.0",
                                    "        output:\n          location: local-file-system\n          path: ./generated/sdk\n"
                                )
                            ]
                        },
                        defaultGroup: "sdks"
                    }),
                    "generated/sdk/stale.txt": "left over"
                }
            });

            expect(result.failed).toBe(false);
            expect(await result.generated("fern")).toEqual(["generated/sdk/README.md"]);
        });
    });

    describe("no output section", () => {
        it("sends a publish with no registry overrides, and writes nothing", async () => {
            const { result, outputMode, request, job } = await run({ body: "" });

            expect(result.failed).toBe(false);
            expect(outputMode).toEqual({ type: "publish", registryOverrides: {} });
            expect(request?.uploadToS3).toBe(false);
            expect(await result.generated("fern")).toEqual([]);
            expect(job?.ir().publishConfig).toBeNull();
        });
    });

    describe("publishing to a registry", () => {
        const published = (packages: FiddlePackage[]): FiddleOutcome => ({ packages, actualVersion: "1.2.3" });

        it("publishes to npm, with the token resolved from the environment", async () => {
            const { result, outputMode, request } = await run({
                body: `        output:
          location: npm
          package-name: "@acme/sdk"
          token: \${NPM_TOKEN}
`,
                outcome: published([{ type: "npm", name: "@acme/sdk", version: "1.2.3" }])
            });

            expect(result.failed).toBe(false);
            expect(outputMode).toEqual({
                type: "publishV2",
                publishV2: {
                    type: "npmOverride",
                    npmOverride: {
                        registryUrl: "https://registry.npmjs.org",
                        packageName: "@acme/sdk",
                        token: "npm-secret",
                        downloadSnippets: false
                    }
                }
            });
            expect(request?.uploadToS3).toBe(false);
            expect(request?.version).toBe("1.2.3");
            expect(result.logged("Published @acme/sdk@1.2.3")).toBe(true);
            expect(await result.generated("fern")).toEqual([]);
        });

        it("publishes to a custom npm registry", async () => {
            const { outputMode } = await run({
                body: `        output:
          location: npm
          package-name: "@acme/sdk"
          url: https://npm.acme.test
          token: \${NPM_TOKEN}
`
            });

            expect(outputMode).toMatchObject({
                publishV2: { npmOverride: { registryUrl: "https://npm.acme.test", packageName: "@acme/sdk" } }
            });
        });

        it("publishes to PyPI with a token as the password of __token__", async () => {
            const { result, outputMode } = await run({
                name: PY,
                version: "4.0.0",
                body: `        output:
          location: pypi
          package-name: acme-py
          token: \${PYPI_TOKEN}
`,
                outcome: published([{ type: "pypi", name: "acme-py", version: "1.2.3" }])
            });

            expect(outputMode).toEqual({
                type: "publishV2",
                publishV2: {
                    type: "pypiOverride",
                    pypiOverride: {
                        registryUrl: "https://upload.pypi.org/legacy/",
                        username: "__token__",
                        password: "pypi-secret",
                        coordinate: "acme-py",
                        downloadSnippets: false
                    }
                }
            });
            expect(result.logged("Published acme-py 1.2.3")).toBe(true);
        });

        it("publishes to PyPI with a username and password when there is no token", async () => {
            vi.stubEnv("PYPI_USER", "acme-user");
            vi.stubEnv("PYPI_PASSWORD", "acme-password");
            const { outputMode } = await run({
                name: PY,
                version: "4.0.0",
                body: `        output:
          location: pypi
          package-name: acme-py
          username: \${PYPI_USER}
          password: \${PYPI_PASSWORD}
`
            });

            expect(outputMode).toMatchObject({
                publishV2: { pypiOverride: { username: "acme-user", password: "acme-password" } }
            });
        });

        it("publishes to Maven with the coordinate and signing key", async () => {
            vi.stubEnv("MAVEN_KEY", "maven-key-id");
            const { result, outputMode } = await run({
                name: JAVA,
                body: `        output:
          location: maven
          coordinate: com.acme:sdk
          username: maven-user
          password: \${MAVEN_PASSWORD}
          signature:
            keyId: \${MAVEN_KEY}
            password: signing-password
            secretKey: signing-secret
`,
                outcome: published([{ type: "maven", group: "com.acme", artifact: "sdk", version: "1.2.3" }])
            });

            expect(result.failed).toBe(false);
            expect(outputMode).toEqual({
                type: "publishV2",
                publishV2: {
                    type: "mavenOverride",
                    mavenOverride: {
                        registryUrl:
                            "https://ossrh-staging-api.central.sonatype.com/service/local/staging/deploy/maven2/",
                        username: "maven-user",
                        password: "maven-secret",
                        coordinate: "com.acme:sdk",
                        signature: { keyId: "maven-key-id", secretKey: "signing-secret", password: "signing-password" },
                        downloadSnippets: false
                    }
                }
            });
            expect(result.logged("Published com.acme:sdk:1.2.3")).toBe(true);
        });

        it("publishes to NuGet", async () => {
            const { result, outputMode } = await run({
                name: CSHARP,
                version: "2.0.0",
                body: `        output:
          location: nuget
          package-name: Acme.Sdk
          api-key: \${NUGET_KEY}
`,
                outcome: published([{ type: "nuget", name: "Acme.Sdk", version: "1.2.3" }])
            });

            expect(outputMode).toEqual({
                type: "publishV2",
                publishV2: {
                    type: "nugetOverride",
                    nugetOverride: {
                        registryUrl: "https://nuget.org/",
                        packageName: "Acme.Sdk",
                        apiKey: "nuget-secret",
                        downloadSnippets: false
                    }
                }
            });
            expect(result.logged("Published Acme.Sdk 1.2.3")).toBe(true);
        });

        it("publishes to crates.io", async () => {
            const { result, outputMode } = await run({
                name: RUST,
                version: "0.5.0",
                body: `        output:
          location: crates
          package-name: acme-crate
          token: \${CRATES_TOKEN}
`,
                outcome: published([{ type: "crates", name: "acme-crate", version: "1.2.3" }])
            });

            expect(outputMode).toEqual({
                type: "publishV2",
                publishV2: {
                    type: "cratesOverride",
                    cratesOverride: {
                        registryUrl: "https://crates.io/api/v1/crates",
                        packageName: "acme-crate",
                        token: "crates-secret",
                        downloadSnippets: false
                    }
                }
            });
            expect(result.logged("Published acme-crate 1.2.3")).toBe(true);
        });

        it("refuses to publish directly to RubyGems, before anything is sent to Fiddle", async () => {
            const { result } = await run({
                name: RUBY,
                version: "1.0.0",
                body: `        output:
          location: rubygems
          package-name: acme-gem
          api-key: \${GEM_KEY}
`
            });

            expect(result.failed).toBe(true);
            expect(result.errors.join("\n")).toContain("fernapi/fern-ruby-sdk");
            expect(world.fiddle.jobs).toEqual([]);
            expect(world.fdr.to("POST /registry/api/register")).toEqual([]);
        });

        it("asks for snippets to be kept when the generator writes them to a path", async () => {
            const { outputMode, request } = await run({
                body: `        snippets:
          path: ./snippet.json
        output:
          location: npm
          package-name: "@acme/sdk"
          token: \${NPM_TOKEN}
`
            });

            expect(outputMode).toMatchObject({ publishV2: { npmOverride: { downloadSnippets: true } } });
            expect(request?.uploadToS3).toBe(true);
        });
    });

    describe("publishing to Postman", () => {
        it("sends the API key and workspace, and tells the generator to publish directly", async () => {
            vi.stubEnv("POSTMAN_KEY", "postman-secret");
            const { result, outputMode, job } = await run({
                body: `        output:
          location: postman
          api-key: \${POSTMAN_KEY}
          workspace-id: ws-1
          collection-id: col-1
`
            });

            expect(result.failed).toBe(false);
            expect(outputMode).toEqual({
                type: "publishV2",
                publishV2: { type: "postman", apiKey: "postman-secret", workspaceId: "ws-1" }
            });
            expect(job?.ir().publishConfig).toEqual({
                type: "direct",
                target: { type: "postman", apiKey: "postman-secret", workspaceId: "ws-1", collectionId: "col-1" }
            });
        });
    });

    describe("GitHub", () => {
        const github = (lines: string): string =>
            `        github:\n${lines
                .split("\n")
                .map((line) => `          ${line}`)
                .join("\n")}\n`;

        it("releases by default: commits to the repository and tags a release", async () => {
            const { result, outputMode, request } = await run({ body: github("repository: acme/sdk-ts") });

            expect(result.failed).toBe(false);
            expect(outputMode).toEqual({
                type: "githubV2",
                githubV2: {
                    type: "commitAndRelease",
                    owner: "acme",
                    repo: "sdk-ts",
                    downloadSnippets: false,
                    workflows: true
                }
            });
            expect(request?.uploadToS3).toBe(false);
            expect(await result.generated("fern")).toEqual([]);
        });

        it.each(["release", "commit"])("treats mode %s as commit-and-release", async (mode) => {
            const { outputMode } = await run({ body: github(`repository: acme/sdk-ts\nmode: ${mode}\nbranch: main`) });

            expect(outputMode).toMatchObject({
                type: "githubV2",
                githubV2: { type: "commitAndRelease", owner: "acme", repo: "sdk-ts", branch: "main" }
            });
        });

        it("pushes to a branch", async () => {
            const { outputMode } = await run({ body: github("repository: acme/sdk-ts\nmode: push\nbranch: dev") });

            expect(outputMode).toEqual({
                type: "githubV2",
                githubV2: {
                    type: "push",
                    owner: "acme",
                    repo: "sdk-ts",
                    branch: "dev",
                    downloadSnippets: false,
                    workflows: true
                }
            });
        });

        it("opens a pull request, with the reviewers of the root, the group and the output, without repeats", async () => {
            const { outputMode } = await run({
                generatorsYmlExtra: "reviewers:\n  teams:\n    - name: core\n  users:\n    - name: alice\n",
                body: github(
                    "repository: acme/sdk-ts\nmode: pull-request\nbranch: sdk-update\nreviewers:\n  teams:\n    - name: core\n    - name: docs\n  users:\n    - name: bob"
                )
            });

            expect(outputMode).toEqual({
                type: "githubV2",
                githubV2: {
                    type: "pullRequest",
                    owner: "acme",
                    repo: "sdk-ts",
                    branch: "sdk-update",
                    reviewers: [
                        { type: "team", name: "core" },
                        { type: "team", name: "docs" },
                        { type: "user", name: "alice" },
                        { type: "user", name: "bob" }
                    ],
                    downloadSnippets: false,
                    workflows: true
                }
            });
        });

        it("sends the license, and leaves the workflows out when asked", async () => {
            const { outputMode } = await run({
                body: github("repository: acme/sdk-ts\nlicense: MIT\nworkflows: false")
            });

            expect(outputMode).toMatchObject({
                githubV2: { license: { type: "basic", id: "MIT" }, workflows: false }
            });
        });

        it("sends a custom license read from the file next to generators.yml", async () => {
            const result = await generate(world, {
                files: {
                    "openapi/openapi.yml": OPENAPI,
                    "LICENSE.txt": "Acme custom license",
                    "generators.yml": generatorsYml({
                        groups: {
                            sdks: [
                                generator(
                                    TS,
                                    "3.0.0",
                                    "        github:\n          repository: acme/sdk-ts\n          license:\n            custom: ./LICENSE.txt\n"
                                )
                            ]
                        },
                        defaultGroup: "sdks"
                    })
                },
                args: { version: "1.2.3" }
            });

            expect(result.failed).toBe(false);
            expect(world.fiddle.jobs[0]?.request.generators[0]?.outputMode).toMatchObject({
                githubV2: { license: { type: "custom", contents: "Acme custom license" } }
            });
        });

        it("reads the host of a GitHub Enterprise repository", async () => {
            const { outputMode } = await run({
                body: github("repository: github.acme.test/acme/sdk-ts")
            });

            expect(outputMode).toMatchObject({
                githubV2: { owner: "acme", repo: "sdk-ts", host: "github.acme.test" }
            });
        });

        it("reads a self-hosted repository from its uri", async () => {
            vi.stubEnv("GITHUB_PAT", "github-secret");
            const { outputMode } = await run({
                body: github("uri: https://github.acme.test/acme/sdk-ts.git\ntoken: ${GITHUB_PAT}")
            });

            expect(outputMode).toMatchObject({
                githubV2: { owner: "acme", repo: "sdk-ts", host: "github.acme.test" }
            });
        });

        // These are rejected while the project loads, before `generateAPIWorkspaces` is reached.
        it("fails to load, naming the repository, when it cannot be read", async () => {
            await expect(
                generate(world, {
                    files: {
                        "openapi/openapi.yml": OPENAPI,
                        "generators.yml": generatorsYml({
                            groups: { sdks: [generator(TS, "3.0.0", github("repository: not-a-repository"))] },
                            defaultGroup: "sdks"
                        })
                    }
                })
            ).rejects.toThrow('Invalid GitHub repository "not-a-repository" in generators.yml');
            expect(world.fiddle.jobs).toEqual([]);
        });

        it("fails to load when local-file-system output sits next to a github block", async () => {
            await expect(
                generate(world, {
                    files: {
                        "openapi/openapi.yml": OPENAPI,
                        "generators.yml": generatorsYml({
                            groups: {
                                sdks: [
                                    generator(
                                        TS,
                                        "3.0.0",
                                        `${github("repository: acme/sdk-ts")}        output:\n          location: local-file-system\n          path: ./generated/sdk\n`
                                    )
                                ]
                            },
                            defaultGroup: "sdks"
                        })
                    }
                })
            ).rejects.toThrow("Cannot use local-file-system with github publishing");
        });

        describe("with a registry to publish to", () => {
            const withOutput = (output: string): string =>
                `${github("repository: acme/sdk")}        output:\n${output
                    .split("\n")
                    .map((line) => `          ${line}`)
                    .join("\n")}\n`;

            it("hands npm publishing to the release workflow", async () => {
                const { outputMode } = await run({
                    body: withOutput('location: npm\npackage-name: "@acme/sdk"\ntoken: ${NPM_TOKEN}')
                });

                expect(outputMode).toMatchObject({
                    githubV2: {
                        type: "commitAndRelease",
                        publishInfo: {
                            type: "npm",
                            registryUrl: "https://registry.npmjs.org",
                            packageName: "@acme/sdk",
                            token: "npm-secret"
                        }
                    }
                });
            });

            it("hands PyPI publishing to the release workflow", async () => {
                const { outputMode } = await run({
                    name: PY,
                    version: "4.0.0",
                    body: withOutput("location: pypi\npackage-name: acme-py\ntoken: ${PYPI_TOKEN}")
                });

                expect(outputMode).toMatchObject({
                    githubV2: {
                        publishInfo: {
                            type: "pypi",
                            packageName: "acme-py",
                            registryUrl: "https://upload.pypi.org/legacy/",
                            credentials: { username: "__token__", password: "pypi-secret" }
                        }
                    }
                });
            });

            it("hands Maven publishing to the release workflow", async () => {
                const { outputMode } = await run({
                    name: JAVA,
                    body: withOutput(
                        "location: maven\ncoordinate: com.acme:sdk\nusername: u\npassword: ${MAVEN_PASSWORD}"
                    )
                });

                expect(outputMode).toMatchObject({
                    githubV2: {
                        publishInfo: {
                            type: "maven",
                            coordinate: "com.acme:sdk",
                            credentials: { username: "u", password: "maven-secret" }
                        }
                    }
                });
            });

            it("hands NuGet publishing to the release workflow", async () => {
                const { outputMode } = await run({
                    name: CSHARP,
                    version: "2.0.0",
                    body: withOutput("location: nuget\npackage-name: Acme.Sdk\napi-key: ${NUGET_KEY}")
                });

                expect(outputMode).toMatchObject({
                    githubV2: { publishInfo: { type: "nuget", packageName: "Acme.Sdk", apiKey: "nuget-secret" } }
                });
            });

            it("hands RubyGems publishing to the release workflow, which a direct publish cannot do", async () => {
                const { result, outputMode } = await run({
                    name: RUBY,
                    version: "1.0.0",
                    body: withOutput("location: rubygems\npackage-name: acme-gem\napi-key: ${GEM_KEY}")
                });

                expect(result.failed).toBe(false);
                expect(outputMode).toMatchObject({
                    githubV2: { publishInfo: { type: "rubygems", packageName: "acme-gem", apiKey: "gem-secret" } }
                });
            });

            it("hands crates.io publishing to the release workflow", async () => {
                const { outputMode } = await run({
                    name: RUST,
                    version: "0.5.0",
                    body: withOutput("location: crates\npackage-name: acme-crate\ntoken: ${CRATES_TOKEN}")
                });

                expect(outputMode).toMatchObject({
                    githubV2: { publishInfo: { type: "crates", packageName: "acme-crate", token: "crates-secret" } }
                });
            });

            it("fails to load when a fern-hosted output sits next to a github block", async () => {
                await expect(
                    generate(world, {
                        files: {
                            "openapi/openapi.yml": OPENAPI,
                            "generators.yml": generatorsYml({
                                groups: {
                                    sdks: [generator(TS, "3.0.0", withOutput("location: fern-hosted\nslug: acme"))]
                                },
                                defaultGroup: "sdks"
                            })
                        }
                    })
                ).rejects.toThrow("Cannot use fern-hosted with github publishing");
            });
        });
    });
});
