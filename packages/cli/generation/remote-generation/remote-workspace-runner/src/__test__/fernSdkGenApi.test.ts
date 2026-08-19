import { generatorsYml } from "@fern-api/configuration";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
    createFernSdkGenApiBatchRequest,
    createFernSdkGenApiRequest,
    FernSdkGenApiBatch,
    getFernSdkGenApiLanguage,
    getFernSdkGenApiOrigin,
    isEligibleForFernSdkGenApi,
    isFernSdkGenApiEnabled,
    runFernSdkGenApiBuild
} from "../fernSdkGenApi.js";

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
});

function invocation(overrides: Record<string, unknown> = {}): generatorsYml.GeneratorInvocation {
    return {
        name: "fernapi/fern-typescript-sdk",
        version: "3.86.0",
        language: "typescript",
        config: {},
        keywords: [],
        smartCasing: true,
        smartCasingDigitWordBoundary: false,
        disableExamples: false,
        outputMode: { type: "downloadFiles" },
        ...overrides
    } as unknown as generatorsYml.GeneratorInvocation;
}

describe("isEligibleForFernSdkGenApi", () => {
    it("selects first-party SDK generators in every supported language", () => {
        const generators = [
            ["fernapi/fern-typescript-sdk", "typescript"],
            ["fernapi/fern-python-sdk", "python"],
            ["fernapi/fern-java-sdk", "java"],
            ["fernapi/fern-kotlin-sdk", "kotlin"],
            ["fernapi/fern-go-sdk", "go"],
            ["fernapi/fern-csharp-sdk", "csharp"],
            ["fernapi/fern-php-sdk", "php"],
            ["fernapi/fern-ruby-sdk", "ruby"],
            ["fernapi/fern-rust-sdk", "rust"],
            ["fernapi/fern-swift-sdk", "swift"],
            ["fernapi/fern-cli-generator", "cli"]
        ] as const;

        for (const [name, language] of generators) {
            expect(getFernSdkGenApiLanguage(name)).toBe(language);
            expect(
                isEligibleForFernSdkGenApi({
                    generatorInvocation: invocation({ name, language }),
                    sdkVersion: "1.2.3",
                    specsTarGzBuffer: Buffer.from("archive")
                })
            ).toBe(true);
        }
    });

    it("retains configured invocations on the sdk-gen-api route", () => {
        expect(
            isEligibleForFernSdkGenApi({
                generatorInvocation: invocation({
                    config: { packageJson: { name: "@acme/sdk" } }
                }),
                sdkVersion: "1.2.3",
                specsTarGzBuffer: Buffer.from("archive")
            })
        ).toBe(true);
    });

    it("rejects non-SDK generators and unresolved SDK versions", () => {
        expect(
            isEligibleForFernSdkGenApi({
                generatorInvocation: invocation({
                    name: "fernapi/fern-typescript-express"
                }),
                sdkVersion: "1.2.3",
                specsTarGzBuffer: Buffer.from("archive")
            })
        ).toBe(false);
        expect(
            isEligibleForFernSdkGenApi({
                generatorInvocation: invocation(),
                sdkVersion: undefined,
                specsTarGzBuffer: Buffer.from("archive")
            })
        ).toBe(false);
    });

    it("routes GitHub and registry output through sdk-gen-api", () => {
        const outputs = [
            FernFiddle.OutputMode.githubV2(
                FernFiddle.GithubOutputModeV2.push({
                    owner: "acme",
                    repo: "sdk",
                    branch: "main"
                })
            ),
            FernFiddle.OutputMode.publishV2(
                FernFiddle.PublishOutputModeV2.npmOverride({
                    registryUrl: "https://registry.npmjs.org",
                    packageName: "@acme/sdk",
                    token: "secret"
                })
            )
        ];

        for (const outputMode of outputs) {
            expect(
                isEligibleForFernSdkGenApi({
                    generatorInvocation: invocation({ outputMode }),
                    sdkVersion: "1.2.3",
                    specsTarGzBuffer: Buffer.from("archive")
                })
            ).toBe(true);
        }
    });

    it("rejects AUTO until the shared pipeline owns Fern's post-generation version replacement", () => {
        expect(
            isEligibleForFernSdkGenApi({
                generatorInvocation: invocation(),
                sdkVersion: "AUTO",
                specsTarGzBuffer: Buffer.from("archive")
            })
        ).toBe(false);
    });

    it("rejects whitelabel builds until the shared pipeline can preserve their branding behavior", () => {
        expect(
            isEligibleForFernSdkGenApi({
                generatorInvocation: invocation(),
                sdkVersion: "1.2.3",
                specsTarGzBuffer: Buffer.from("archive"),
                whitelabel: {
                    github: { token: "token", username: "fern", email: "fern@example.com" }
                }
            })
        ).toBe(false);
    });

    it("references every source in the uploaded archive", () => {
        const request = createFernSdkGenApiRequest({
            apiName: "Petstore",
            organization: "acme",
            cliVersion: "0.0.0",
            generatorInvocation: invocation(),
            sdkVersion: "1.2.3",
            specsTarGzBuffer: Buffer.from("archive")
        });

        expect(request.apiInputs).toEqual([{ id: "default", specIndexes: "all" }]);
        expect(request.targets[0]).toMatchObject({
            language: "typescript",
            invocation: {
                customConfig: {},
                keywords: [],
                smartCasing: true,
                smartCasingDigitWordBoundary: false,
                disableExamples: false
            }
        });
        expect(request.targets[0]?.invocation).not.toHaveProperty("audiences");
    });

    it("preserves an explicitly selected audience list", () => {
        const request = createFernSdkGenApiBatchRequest({
            apiName: "Petstore",
            organization: "acme",
            cliVersion: "0.0.0",
            specsTarGzBuffer: Buffer.from("archive"),
            targets: [
                {
                    generatorInvocation: invocation(),
                    sdkVersion: "1.2.3",
                    audiences: ["public"]
                }
            ]
        });

        expect(request.targets[0]?.invocation.audiences).toEqual(["public"]);
    });

    it("uses the generator language instead of hard-coding TypeScript", () => {
        const request = createFernSdkGenApiRequest({
            apiName: "Petstore",
            organization: "acme",
            cliVersion: "0.0.0",
            generatorInvocation: invocation({
                name: "fernapi/fern-python-sdk",
                language: "python",
                version: "4.64.1"
            }),
            sdkVersion: "1.2.3",
            specsTarGzBuffer: Buffer.from("archive")
        });

        expect(request.targets[0]?.language).toBe("python");
    });

    it("maps GitHub delivery and optional registry publication", () => {
        const request = createFernSdkGenApiRequest({
            apiName: "Petstore",
            organization: "acme",
            cliVersion: "0.0.0",
            generatorInvocation: invocation({
                outputMode: FernFiddle.OutputMode.githubV2(
                    FernFiddle.GithubOutputModeV2.pullRequest({
                        owner: "acme",
                        repo: "typescript-sdk",
                        host: "github.example.com",
                        branch: "develop",
                        reviewers: [
                            FernFiddle.GithubPullRequestReviewer.team({
                                name: "sdk-reviewers"
                            }),
                            FernFiddle.GithubPullRequestReviewer.user({ name: "octocat" })
                        ],
                        publishInfo: FernFiddle.GithubPublishInfo.npm({
                            registryUrl: "https://registry.npmjs.org",
                            packageName: "@acme/typescript-sdk"
                        })
                    })
                )
            }),
            sdkVersion: "1.2.3",
            specsTarGzBuffer: Buffer.from("archive")
        });

        expect(request.targets[0]).toMatchObject({
            package: { packageName: "@acme/typescript-sdk" },
            requestedOutput: {
                type: "github",
                repository: "acme/typescript-sdk",
                host: "github.example.com",
                branch: "develop",
                mode: "pull-request",
                reviewers: { teams: ["sdk-reviewers"], users: ["octocat"] },
                publish: { registry: "npm", url: "https://registry.npmjs.org" }
            }
        });
        expect(JSON.stringify(request)).not.toContain("secret");
    });

    it("maps direct registry publication and package identity", () => {
        const request = createFernSdkGenApiRequest({
            apiName: "Petstore",
            organization: "acme",
            cliVersion: "0.0.0",
            generatorInvocation: invocation({
                name: "fernapi/fern-python-sdk",
                language: "python",
                outputMode: FernFiddle.OutputMode.publishV2(
                    FernFiddle.PublishOutputModeV2.pypiOverride({
                        registryUrl: "https://upload.pypi.org/legacy/",
                        coordinate: "acme-sdk",
                        username: "__token__",
                        password: "secret"
                    })
                )
            }),
            sdkVersion: "1.2.3",
            specsTarGzBuffer: Buffer.from("archive")
        });

        expect(request.targets[0]).toMatchObject({
            package: { packageName: "acme-sdk" },
            requestedOutput: {
                type: "publish",
                publish: { registry: "pypi", url: "https://upload.pypi.org/legacy/" }
            }
        });
        expect(JSON.stringify(request)).not.toContain("secret");
    });

    it("creates one request for a group with multiple languages and duplicate-language targets", () => {
        const request = createFernSdkGenApiBatchRequest({
            apiName: "Petstore",
            organization: "acme",
            cliVersion: "0.0.0",
            specsTarGzBuffer: Buffer.from("archive"),
            targets: [
                {
                    generatorInvocation: invocation(),
                    sdkVersion: "1.2.3",
                    targetIdSeed: "0"
                },
                {
                    generatorInvocation: invocation({
                        name: "fernapi/fern-python-sdk",
                        language: "python",
                        version: "4.64.1"
                    }),
                    sdkVersion: "1.2.3",
                    targetIdSeed: "1"
                },
                {
                    generatorInvocation: invocation(),
                    sdkVersion: "2.0.0",
                    targetIdSeed: "2"
                }
            ]
        });

        expect(request.targets.map((target) => target.language)).toEqual(["typescript", "python", "typescript"]);
        expect(new Set(request.targets.map((target) => target.targetId)).size).toBe(3);
    });

    it("changes the idempotency key when generator configuration or output changes", () => {
        const createRequest = (generatorInvocation: generatorsYml.GeneratorInvocation) =>
            createFernSdkGenApiRequest({
                apiName: "Petstore",
                organization: "acme",
                cliVersion: "0.0.0",
                generatorInvocation,
                sdkVersion: "1.2.3",
                specsTarGzBuffer: Buffer.from("archive")
            });

        const original = createRequest(invocation());
        const configured = createRequest(invocation({ config: { packageJson: { name: "@acme/sdk" } } }));
        const github = createRequest(
            invocation({
                outputMode: FernFiddle.OutputMode.githubV2(
                    FernFiddle.GithubOutputModeV2.push({ owner: "acme", repo: "sdk", branch: "main" })
                )
            })
        );

        expect(configured.idempotencyKey).not.toBe(original.idempotencyKey);
        expect(github.idempotencyKey).not.toBe(original.idempotencyKey);
    });

    it("submits and polls a multi-language group once", async () => {
        process.env.FERN_SDK_GEN_API_ORIGIN = "https://sdk-gen-api.test";
        const specsTarGzBuffer = Buffer.from("archive");
        const typescript = invocation();
        const python = invocation({
            name: "fernapi/fern-python-sdk",
            language: "python",
            version: "4.64.1"
        });
        const request = createFernSdkGenApiBatchRequest({
            apiName: "Petstore",
            organization: "acme",
            cliVersion: "0.0.0",
            specsTarGzBuffer,
            targets: [
                {
                    generatorInvocation: typescript,
                    sdkVersion: "1.2.3",
                    targetIdSeed: "0"
                },
                { generatorInvocation: python, sdkVersion: "1.2.3", targetIdSeed: "1" }
            ]
        });
        const post = vi.spyOn(axios, "post").mockResolvedValue({ data: { buildId: "build-1" } } as never);
        const get = vi.spyOn(axios, "get").mockResolvedValue({
            data: {
                buildId: "build-1",
                status: "succeeded",
                targets: request.targets.map((target) => ({
                    targetId: target.targetId,
                    status: "succeeded",
                    logs: [],
                    result: {
                        artifactUrl: `https://example.test/${target.targetId}.zip`
                    }
                }))
            }
        } as never);
        const context = {
            logger: { debug: vi.fn(), info: vi.fn() },
            failAndThrow: (message: string) => {
                throw new Error(message);
            }
        } as never;
        const common = {
            apiName: "Petstore",
            organization: "acme",
            cliVersion: "0.0.0",
            sdkVersion: "1.2.3",
            token: { value: "token" } as never,
            specsTarGzBuffer,
            absolutePathToPreview: undefined,
            context
        };
        const batch = new FernSdkGenApiBatch(2);

        const results = await Promise.all([
            batch.run({
                ...common,
                generatorInvocation: typescript,
                targetIdSeed: "0"
            }),
            batch.run({ ...common, generatorInvocation: python, targetIdSeed: "1" })
        ]);

        expect(post).toHaveBeenCalledTimes(1);
        expect(get).toHaveBeenCalledTimes(1);
        expect(results.map((result) => result.actualVersion)).toEqual(["1.2.3", "1.2.3"]);
    });

    it("stops polling when the build fails before a target reaches a terminal state", async () => {
        process.env.FERN_SDK_GEN_API_ORIGIN = "https://sdk-gen-api.test";
        const specsTarGzBuffer = Buffer.from("archive");
        const generatorInvocation = invocation();
        const request = createFernSdkGenApiRequest({
            apiName: "Petstore",
            organization: "acme",
            cliVersion: "0.0.0",
            generatorInvocation,
            sdkVersion: "1.2.3",
            specsTarGzBuffer
        });
        vi.spyOn(axios, "post").mockResolvedValue({ data: { buildId: "build-1" } } as never);
        const get = vi.spyOn(axios, "get").mockResolvedValue({
            data: {
                buildId: "build-1",
                status: "failed",
                targets: [{ targetId: request.targets[0]?.targetId, status: "queued", logs: [] }]
            }
        } as never);
        const context = {
            logger: { debug: vi.fn(), info: vi.fn() },
            failAndThrow: (message: string) => {
                throw new Error(message);
            }
        } as never;

        await expect(
            runFernSdkGenApiBuild({
                apiName: "Petstore",
                organization: "acme",
                cliVersion: "0.0.0",
                generatorInvocation,
                sdkVersion: "1.2.3",
                token: { value: "token" } as never,
                specsTarGzBuffer,
                absolutePathToPreview: undefined,
                context
            })
        ).rejects.toThrow("build ended with status failed");
        expect(get).toHaveBeenCalledTimes(1);
    });
});

describe("sdk-gen-api environment configuration", () => {
    it("is disabled by default", () => {
        vi.stubEnv("FERN_USE_SDK_GEN_API", undefined);
        vi.stubEnv("DEFAULT_USE_SDK_GEN_API", undefined);

        expect(isFernSdkGenApiEnabled()).toBe(false);
    });

    it("uses the baked default when no runtime override is present", () => {
        vi.stubEnv("FERN_USE_SDK_GEN_API", undefined);
        vi.stubEnv("DEFAULT_USE_SDK_GEN_API", " true ");

        expect(isFernSdkGenApiEnabled()).toBe(true);
    });

    it("lets the runtime flag override the baked default", () => {
        vi.stubEnv("FERN_USE_SDK_GEN_API", "false");
        vi.stubEnv("DEFAULT_USE_SDK_GEN_API", "true");

        expect(isFernSdkGenApiEnabled()).toBe(false);
    });

    it("prefers the runtime origin and removes its trailing slash", () => {
        vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", "https://override.example.test/");
        vi.stubEnv("DEFAULT_SDK_GEN_API_ORIGIN", "https://default.example.test");

        expect(getFernSdkGenApiOrigin()).toBe("https://override.example.test");
    });

    it("uses the baked origin when no runtime override is present", () => {
        vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", undefined);
        vi.stubEnv("DEFAULT_SDK_GEN_API_ORIGIN", "https://default.example.test/");

        expect(getFernSdkGenApiOrigin()).toBe("https://default.example.test");
    });

    it("allows HTTP only for loopback development origins", () => {
        vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", "http://localhost:3001/");
        expect(getFernSdkGenApiOrigin()).toBe("http://localhost:3001");

        vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", "http://127.0.0.1:3001/");
        expect(getFernSdkGenApiOrigin()).toBe("http://127.0.0.1:3001");
    });

    it("rejects insecure remote origins", () => {
        vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", "http://sdk-gen-api.example.test");

        expect(() => getFernSdkGenApiOrigin()).toThrow("must use HTTPS unless it targets localhost");
    });
});
