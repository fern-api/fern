// cspell:ignore kotlin octocat unstub
import { generatorsYml } from "@fern-api/configuration";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import axios from "axios";
import FormData from "form-data";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gunzipSync, gzipSync } from "zlib";
import {
    createFernSdkGenApiBatchRequest,
    createFernSdkGenApiRequest,
    FernSdkGenApiBatch,
    type FernSdkGenApiBuildParameters,
    type FernSdkGenApiPayload,
    FernSdkGenApiPreparationBatch,
    getFernSdkGenApiLanguage,
    getFernSdkGenApiOrigin,
    isEligibleForFernSdkGenApi,
    isFernSdkGenApiEnabled,
    mapFernSdkGenApiOutput,
    preflightFernSdkGenApiBuild,
    runFernSdkGenApiBuild,
    selectFernSdkGenApiRoute
} from "../fernSdkGenApi.js";
import {
    type FernSdkGenApiSourceArchive,
    type FernSdkGenApiSourceManifestEntry,
    validateFernSdkGenApiSourceCompatibility
} from "../fernSdkGenApiSourceArchive.js";
import { getGithubPublishConfig } from "../getGeneratorConfig.js";
import { prepareFernSdkGenApiRuntimeBundle } from "../prepareFernSdkGenApiRuntimeBundle.js";
import {
    getFernSdkGenApiCandidateIndexes,
    preflightFernSdkGenApiSources,
    prepareFernSdkGenApiRoutes
} from "../runRemoteGenerationForAPIWorkspace.js";
import { type GenerationConfigRoute, validateGeneratorConfigCompatibility } from "../sdk-gen-client/index.js";

const migrationMocks = vi.hoisted(() => ({
    getIrVersionForGenerator: vi.fn(),
    migrateForGenerator: vi.fn(),
    migrateToVersionForGenerator: vi.fn()
}));

vi.mock("@fern-api/core", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/core")>()),
    getIrVersionForGenerator: migrationMocks.getIrVersionForGenerator
}));

vi.mock("@fern-api/ir-migrations", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/ir-migrations")>()),
    migrateIntermediateRepresentationForGenerator: migrationMocks.migrateForGenerator,
    migrateIntermediateRepresentationToVersionForGenerator: migrationMocks.migrateToVersionForGenerator
}));

beforeEach(() => {
    migrationMocks.getIrVersionForGenerator.mockReset().mockResolvedValue(undefined);
    migrationMocks.migrateForGenerator.mockReset().mockImplementation(({ intermediateRepresentation }) =>
        Promise.resolve({
            ...intermediateRepresentation,
            migrated: "generator"
        })
    );
    migrationMocks.migrateToVersionForGenerator
        .mockReset()
        .mockImplementation(({ intermediateRepresentation, irVersion }) =>
            Promise.resolve({
                ...intermediateRepresentation,
                migrated: irVersion
            })
        );
});

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
        outputMode: FernFiddle.OutputMode.downloadFiles({}),
        ...overrides
    } as unknown as generatorsYml.GeneratorInvocation;
}

const context = {
    logger: { debug: vi.fn(), info: vi.fn() },
    failAndThrow: (message: string) => {
        throw new Error(message);
    }
} as never;

const validSourceArchive = gzipSync(Buffer.from("archive"));
const validRuntimeBundle = gzipSync(Buffer.from("runtime-bundle"));

function runtimePayload(body: Buffer): FernSdkGenApiPayload {
    return { payloadKind: "fern-runtime-bundle", body };
}

function sdkConfigPayload(body: string): FernSdkGenApiPayload {
    return { payloadKind: "sdk-config-v1", body: Buffer.from(body) };
}

function sourceArchive(
    specs: FernSdkGenApiSourceManifestEntry[] = [{ type: "openapi", specPath: "/fern/specs/openapi0.json" }]
): FernSdkGenApiSourceArchive {
    return {
        buffer: validSourceArchive,
        manifest: { specs },
        specIndexes: specs.map((_, index) => index)
    };
}

function nativeSdkConfigRoute(generatorInvocation: generatorsYml.GeneratorInvocation): GenerationConfigRoute {
    const language = getFernSdkGenApiLanguage(generatorInvocation.name);
    if (language == null) {
        throw new Error(`Unknown generator language for ${generatorInvocation.name}`);
    }
    return validateGeneratorConfigCompatibility({
        generatorId: generatorInvocation.name,
        language,
        requestedVersion: generatorInvocation.version,
        configKind: "sdk-config-v1"
    });
}

function serializedRequestBytes(generatorInvocation: generatorsYml.GeneratorInvocation): number {
    const request = createFernSdkGenApiRequest({
        apiName: "Petstore",
        organization: "acme",
        cliVersion: "0.0.0",
        generatorInvocation,
        sdkVersion: "1.2.3",
        specsTarGzBuffer: validSourceArchive,
        payload: runtimePayload(validRuntimeBundle)
    });
    return Buffer.byteLength(JSON.stringify(request), "utf8");
}

function invocationWithSerializedRequestBytes(requestBytes: number): generatorsYml.GeneratorInvocation {
    const createInvocation = (padding: string) =>
        invocation({
            config: {
                packageJson: {
                    name: "@acme/petstore-sdk",
                    description: "Generated client for the Café API"
                },
                clientClassName: "PetstoreClient",
                requestMetadata: { generatedBy: "Fern CLI", environment: "production" },
                padding
            },
            keywords: ["petstore", "café", "sdk"],
            readme: { introduction: "Use this SDK to call the Café API." },
            settings: { generateWireTests: true }
        });
    const invocationWithoutPadding = createInvocation("");
    const paddingBytes = requestBytes - serializedRequestBytes(invocationWithoutPadding);
    if (paddingBytes < 0) {
        throw new Error(`Cannot create a serialized request smaller than its ${requestBytes - paddingBytes} byte base`);
    }
    const sizedInvocation = createInvocation("x".repeat(paddingBytes));
    if (serializedRequestBytes(sizedInvocation) !== requestBytes) {
        throw new Error(`Could not create a ${requestBytes} byte serialized request`);
    }
    return sizedInvocation;
}

function createPreflightBatch({
    payloads,
    specsTarGzBuffer = validSourceArchive,
    generatorInvocation = invocation(),
    generatorInvocations
}: {
    payloads: FernSdkGenApiPayload[];
    specsTarGzBuffer?: Buffer;
    generatorInvocation?: generatorsYml.GeneratorInvocation;
    generatorInvocations?: generatorsYml.GeneratorInvocation[];
}): {
    builds: Array<Promise<unknown>>;
    post: ReturnType<typeof vi.spyOn>;
    get: ReturnType<typeof vi.spyOn>;
} {
    vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", "https://sdk-gen-api.test");
    const post = vi.spyOn(axios, "post").mockRejectedValue(new Error("axios should not be called"));
    const get = vi.spyOn(axios, "get").mockRejectedValue(new Error("axios should not be called"));
    const batch = new FernSdkGenApiBatch(payloads.length);
    const builds = payloads.map((payload, index) =>
        batch.run({
            apiName: "Petstore",
            organization: "acme",
            cliVersion: "0.0.0",
            generatorInvocation: generatorInvocations?.[index] ?? generatorInvocation,
            sdkVersion: "1.2.3",
            token: { value: "token" } as never,
            specsTarGzBuffer,
            payload,
            absolutePathToPreview: undefined,
            context,
            targetIdSeed: index.toString()
        })
    );

    return { builds, post, get };
}

describe("isEligibleForFernSdkGenApi", () => {
    it("routes cutover-1 and rejects legacy configuration at and after cutover", () => {
        const startTargetWork = vi.fn();

        expect(selectFernSdkGenApiRoute(invocation({ version: "3.999.999" }))?.payloadKind).toBe("fern-runtime-bundle");
        for (const version of ["4.0.0", "4.0.1"]) {
            const [result] = prepareFernSdkGenApiRoutes({
                generators: [invocation({ version })],
                enabled: true,
                requireEnvVars: true,
                isPreview: false
            });
            expect(result?.error).toHaveProperty(
                "message",
                expect.stringContaining("fern sdk migrate --output <path>")
            );
        }
        expect(() => {
            selectFernSdkGenApiRoute(invocation({ version: "latest" }));
            startTargetWork();
        }).toThrow("exact semantic version");
        expect(startTargetWork).not.toHaveBeenCalled();
    });

    it("rejects legacy configuration at cutover when sdk-gen-api routing is disabled", () => {
        const [result] = prepareFernSdkGenApiRoutes({
            generators: [invocation({ version: "4.0.0" })],
            enabled: false,
            requireEnvVars: true,
            isPreview: false
        });

        expect(result?.route).toBeUndefined();
        expect(result?.error).toMatchObject({
            code: "CONFIG_ERROR",
            message: expect.stringContaining("fern sdk migrate --output <path>")
        });
    });

    it("preserves non-exact legacy versions when sdk-gen-api routing is disabled", () => {
        const [result] = prepareFernSdkGenApiRoutes({
            generators: [invocation({ version: "latest" })],
            enabled: false,
            requireEnvVars: true,
            isPreview: false
        });

        expect(result?.route).toBeUndefined();
        expect(result?.error).toBeUndefined();
    });

    it("unescapes literal environment placeholders only once", () => {
        vi.stubEnv("FERN_LITERAL_TOKEN", "secret");
        const [result] = prepareFernSdkGenApiRoutes({
            generators: [
                invocation({
                    version: "3.999.999",
                    config: { literal: "\\$\\{FERN_LITERAL_TOKEN\\}" }
                })
            ],
            enabled: false,
            requireEnvVars: true,
            isPreview: false
        });

        expect(result?.generatorInvocation.config).toMatchObject({ literal: "${FERN_LITERAL_TOKEN}" });
    });

    it("resolves generator substitutions before rejecting a legacy cutover target", () => {
        vi.stubEnv("FERN_TEST_GENERATOR_VERSION", "4.0.0");

        const [result] = prepareFernSdkGenApiRoutes({
            generators: [invocation({ version: "${FERN_TEST_GENERATOR_VERSION}" })],
            enabled: true,
            requireEnvVars: true,
            isPreview: false
        });

        expect(result?.generatorInvocation.version).toBe("4.0.0");
        expect(result?.route).toBeUndefined();
        expect(result?.error).toHaveProperty("message", expect.stringContaining("fern sdk migrate --output <path>"));
    });

    it("keeps pre-cutover GitHub delivery on Fiddle", () => {
        const [result] = prepareFernSdkGenApiRoutes({
            generators: [
                invocation({
                    version: "3.999.999",
                    outputMode: FernFiddle.OutputMode.githubV2(
                        FernFiddle.GithubOutputModeV2.push({ owner: "acme", repo: "sdk", branch: "main" })
                    )
                })
            ],
            enabled: true,
            requireEnvVars: true,
            isPreview: false
        });

        expect(result?.route).toBeUndefined();
        expect(result?.error).toBeUndefined();
    });

    it.each([
        [
            "GitHub delivery",
            {
                outputMode: FernFiddle.OutputMode.githubV2(
                    FernFiddle.GithubOutputModeV2.push({ owner: "acme", repo: "sdk", branch: "main" })
                )
            }
        ],
        [
            "registry publication",
            {
                outputMode: FernFiddle.OutputMode.publishV2(
                    FernFiddle.PublishOutputModeV2.npmOverride({
                        registryUrl: "https://registry.npmjs.org",
                        packageName: "@acme/sdk",
                        token: "secret"
                    })
                )
            }
        ],
        ["verification", { verify: true }],
        ["skip-if-no-diff", { skipIfNoDiff: true }],
        ["auto-merge", { autoMerge: true }]
    ] as const)("rejects post-cutover %s before source preparation", (_name, options) => {
        const [result] = prepareFernSdkGenApiRoutes({
            generators: [
                invocation({
                    version: "4.0.0",
                    ...("outputMode" in options ? { outputMode: options.outputMode } : {})
                })
            ],
            enabled: true,
            requireEnvVars: true,
            isPreview: false,
            verify: "verify" in options ? options.verify : undefined,
            skipIfNoDiff: "skipIfNoDiff" in options ? options.skipIfNoDiff : undefined,
            autoMerge: "autoMerge" in options ? options.autoMerge : undefined
        });

        expect(result?.route).toBeUndefined();
        expect(result?.error).toBeInstanceOf(Error);
        expect(result?.error).toHaveProperty("message", expect.stringContaining("fern sdk migrate --output <path>"));
    });

    it("settles route failures per target while retaining successful siblings", async () => {
        const results = prepareFernSdkGenApiRoutes({
            generators: [invocation({ version: "3.999.999" }), invocation({ version: "not-semver" })],
            enabled: true,
            requireEnvVars: true,
            isPreview: false
        });

        expect(results[0]?.route?.payloadKind).toBe("fern-runtime-bundle");
        expect(results[0]?.error).toBeUndefined();
        expect(results[1]?.route).toBeUndefined();
        expect(results[1]?.error).toBeInstanceOf(Error);
        const sourcePreflight = preflightFernSdkGenApiSources({
            generators: results.map((result) => result.generatorInvocation),
            routes: results.map((result) => result.route),
            routeErrors: results.map((result) => result.error),
            sourceResolution: { sourceArchives: new Map([[0, sourceArchive()]]), errors: new Map() }
        });
        expect(
            getFernSdkGenApiCandidateIndexes(
                results.map((result) => result.route),
                results.map((result, index) => result.error ?? sourcePreflight.preflightErrors[index])
            )
        ).toEqual(new Set([0]));
    });

    it("releases a prepared automation sibling after another target preparation fails", async () => {
        const preparation = new FernSdkGenApiPreparationBatch(["0", "1"]);
        const validTarget = preparation.ready("0");

        expect(preparation.fail("1", new Error("mapping failed"), true)).toBe(true);
        await expect(validTarget).resolves.toBeUndefined();
    });

    it("dispatches remaining undispatched participants after removing a failed target", async () => {
        vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", "https://sdk-gen-api.test");
        const post = vi.spyOn(axios, "post").mockRejectedValue(new Error("submission attempted"));
        const batch = new FernSdkGenApiBatch(2);
        const validTarget = batch.run({
            apiName: "Petstore",
            organization: "acme",
            cliVersion: "0.0.0",
            generatorInvocation: invocation(),
            sdkVersion: "1.2.3",
            token: { value: "token" } as never,
            specsTarGzBuffer: validSourceArchive,
            payload: runtimePayload(validRuntimeBundle),
            absolutePathToPreview: undefined,
            context,
            targetIdSeed: "0"
        });
        await Promise.resolve();
        expect(post).not.toHaveBeenCalled();

        expect(batch.remove("1", new Error("target failed"))).toBe(true);

        await expect(validTarget).rejects.toThrow("Failed to submit sdk-gen-api build");
        expect(post).toHaveBeenCalledTimes(1);
    });

    it("rejects grouped request limits before releasing the remote-mutation barrier", async () => {
        vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", "https://sdk-gen-api.test");
        const preparation = new FernSdkGenApiPreparationBatch(["0", "1"]);
        const parameters = (targetIdSeed: string): FernSdkGenApiBuildParameters => ({
            apiName: "Petstore",
            organization: "acme",
            cliVersion: "0.0.0",
            generatorInvocation: invocation({ version: "4.0.0", config: { padding: "x".repeat(600_000) } }),
            sdkVersion: "1.2.3",
            token: { value: "token" } as never,
            specsTarGzBuffer: validSourceArchive,
            payload: sdkConfigPayload('{"schemaVersion":"sdk-config/v1"}'),
            absolutePathToPreview: undefined,
            context,
            targetIdSeed
        });

        const first = preparation.ready("0", parameters("0"));
        const second = preparation.ready("1", parameters("1"));

        await expect(Promise.all([first, second])).rejects.toThrow("exceeding the 1 MiB UTF-8 field limit");
    });

    it.each([
        {
            name: "origin",
            origin: "http://remote.example.test",
            archive: validSourceArchive,
            message: "must use HTTPS"
        },
        {
            name: "source archive",
            origin: "https://sdk-gen-api.test",
            archive: Buffer.from("not-gzip"),
            message: "source archive is malformed gzip"
        }
    ])("finishes local $name validation before remote mutation", ({ origin, archive, message }) => {
        const remoteMutation = vi.fn();
        vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", origin);

        expect(() => {
            preflightFernSdkGenApiBuild({
                apiName: "Petstore",
                organization: "acme",
                cliVersion: "0.0.0",
                generatorInvocation: invocation({ version: "4.0.0" }),
                sdkVersion: "1.2.3",
                token: { value: "token" } as never,
                specsTarGzBuffer: archive,
                payload: sdkConfigPayload('{"schemaVersion":"sdk-config/v1"}'),
                absolutePathToPreview: undefined,
                context
            });
            remoteMutation();
        }).toThrow(message);
        expect(remoteMutation).not.toHaveBeenCalled();
    });

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
            ["fernapi/fern-cli-generator", "cli"],
            ["fernapi/fern-mcp-server", "mcp"]
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

    it("passes a known generator language mismatch to canonical compatibility validation", () => {
        // Eligibility gates route prerequisites; batch preflight owns canonical diagnostics.
        expect(
            isEligibleForFernSdkGenApi({
                generatorInvocation: invocation({ language: "python" }),
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
            specsTarGzBuffer: Buffer.from("archive"),
            payload: runtimePayload(Buffer.from("bundle"))
        });

        expect(request.protocolVersion).toBe(2);
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
        expect(request.targets[0]).not.toHaveProperty("payload");
        expect(request.targets[0]?.payloadKind).toBe("fern-runtime-bundle");
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
                    audiences: ["public"],
                    payload: runtimePayload(Buffer.from("bundle"))
                }
            ]
        });

        expect(request.targets[0]?.invocation.audiences).toEqual(["public"]);
    });

    it("uses the same resolved spec version in request metadata and SDK Config v1", () => {
        const apiVersion = "2026-08-28";
        const payload = sdkConfigPayload(
            JSON.stringify({
                schemaVersion: "sdk-config/v1",
                apiVersion,
                targets: [{ language: "typescript", generatorVersion: "4.0.0" }]
            })
        );
        const request = createFernSdkGenApiRequest({
            apiName: "Petstore",
            organization: "acme",
            cliVersion: "0.0.0",
            generatorInvocation: invocation({ version: "4.0.0" }),
            sdkVersion: "1.2.3",
            apiVersion,
            specsTarGzBuffer: validSourceArchive,
            payload
        });

        expect(request.targets[0]?.sdk.apiVersion).toBe(apiVersion);
        expect(JSON.parse(payload.body.toString("utf8")).apiVersion).toBe(apiVersion);
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
            specsTarGzBuffer: Buffer.from("archive"),
            payload: runtimePayload(Buffer.from("bundle"))
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
            specsTarGzBuffer: Buffer.from("archive"),
            payload: runtimePayload(Buffer.from("bundle"))
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
            specsTarGzBuffer: Buffer.from("archive"),
            payload: runtimePayload(Buffer.from("bundle"))
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
                    targetIdSeed: "0",
                    payload: runtimePayload(Buffer.from("typescript-bundle"))
                },
                {
                    generatorInvocation: invocation({
                        name: "fernapi/fern-python-sdk",
                        language: "python",
                        version: "4.64.1"
                    }),
                    sdkVersion: "1.2.3",
                    targetIdSeed: "1",
                    payload: runtimePayload(Buffer.from("python-bundle"))
                },
                {
                    generatorInvocation: invocation(),
                    sdkVersion: "2.0.0",
                    targetIdSeed: "2",
                    payload: runtimePayload(Buffer.from("second-typescript-bundle"))
                }
            ]
        });

        expect(request.targets.map((target) => target.language)).toEqual(["typescript", "python", "typescript"]);
        expect(new Set(request.targets.map((target) => target.targetId)).size).toBe(3);
    });

    it("keeps idempotency stable for equal archive bytes and changes it with request inputs", () => {
        const createRequest = (
            generatorInvocation: generatorsYml.GeneratorInvocation,
            runtimeBundle = Buffer.from("bundle"),
            sourceArchive = Buffer.from("archive")
        ) =>
            createFernSdkGenApiRequest({
                apiName: "Petstore",
                organization: "acme",
                cliVersion: "0.0.0",
                generatorInvocation,
                sdkVersion: "1.2.3",
                specsTarGzBuffer: sourceArchive,
                payload: runtimePayload(runtimeBundle)
            });

        const original = createRequest(invocation());
        const independentlyAllocatedArchive = createRequest(
            invocation(),
            Buffer.from("bundle"),
            Buffer.from("archive")
        );
        const configured = createRequest(invocation({ config: { packageJson: { name: "@acme/sdk" } } }));
        const changedBundle = createRequest(invocation(), Buffer.from("changed-bundle"));
        const changedSource = createRequest(invocation(), Buffer.from("bundle"), Buffer.from("changed-archive"));
        const github = createRequest(
            invocation({
                outputMode: FernFiddle.OutputMode.githubV2(
                    FernFiddle.GithubOutputModeV2.push({ owner: "acme", repo: "sdk", branch: "main" })
                )
            })
        );

        expect(independentlyAllocatedArchive.idempotencyKey).toBe(original.idempotencyKey);
        expect(configured.idempotencyKey).not.toBe(original.idempotencyKey);
        expect(github.idempotencyKey).not.toBe(original.idempotencyKey);
        expect(changedBundle.idempotencyKey).not.toBe(original.idempotencyKey);
        expect(changedSource.idempotencyKey).not.toBe(original.idempotencyKey);
    });

    it("creates a generator-compatible gzip bundle with enriched IR and no publish secrets", async () => {
        const generatorInvocation = invocation({
            config: { packageJson: { name: "@acme/sdk" } },
            outputMode: FernFiddle.OutputMode.publishV2(
                FernFiddle.PublishOutputModeV2.npmOverride({
                    registryUrl: "https://registry.npmjs.org",
                    packageName: "@acme/sdk",
                    token: "raw-publish-secret"
                })
            )
        });

        const compressed = await prepareFernSdkGenApiRuntimeBundle({
            apiName: "Petstore",
            organization: "acme",
            generatorInvocation,
            sdkVersion: "1.2.3",
            intermediateRepresentation: {
                apiName: "Petstore",
                fdrApiDefinitionId: "definition-id",
                publishConfig: { type: "filesystem" }
            } as never,
            irVersionOverride: undefined,
            context
        });
        const bundle = JSON.parse(gunzipSync(compressed).toString("utf8"));

        expect(bundle).toMatchObject({
            config: {
                irFilepath: "/tmp/fern-runtime/ir.json",
                workspaceName: "Petstore",
                organization: "acme",
                customConfig: { packageJson: { name: "@acme/sdk" } },
                output: {
                    path: "/fern/output",
                    mode: {
                        type: "github",
                        version: "1.2.3"
                    }
                },
                writeUnitTests: false,
                generateOauthClients: false,
                generatePaginatedClients: false
            },
            ir: {
                apiName: "Petstore",
                fdrApiDefinitionId: "definition-id",
                publishConfig: { type: "filesystem" },
                migrated: "generator"
            }
        });
        expect(gunzipSync(compressed).toString("utf8")).not.toContain("raw-publish-secret");
    });

    it("rejects a source type that sdk-gen-api cannot represent downstream", () => {
        const generatorInvocation = invocation({ version: "4.0.0" });
        const route = nativeSdkConfigRoute(generatorInvocation);

        expect(() =>
            validateFernSdkGenApiSourceCompatibility(
                route,
                sourceArchive([{ type: "protobuf", specPath: "/fern/specs/protobuf0" }])
            )
        ).toThrow("does not support Fern source type protobuf");
    });

    it.each([
        "protobuf",
        "openrpc"
    ] as const)("allows %s at cutover-1 and fails it at cutover and cutover+1", async (sourceType) => {
        const archive = await sourceArchive([
            {
                type: sourceType,
                specPath: `/fern/specs/${sourceType}0`,
                ...(sourceType === "protobuf" ? { overridePaths: ["/fern/specs/protobuf0-override-0.yaml"] } : {})
            }
        ]);
        const before = selectFernSdkGenApiRoute(invocation({ version: "3.999.999" }));
        const cutover = nativeSdkConfigRoute(invocation({ version: "4.0.0" }));
        const after = nativeSdkConfigRoute(invocation({ version: "4.0.1" }));
        if (before == null || cutover == null || after == null) {
            throw new Error("Expected known SDK generator routes");
        }

        expect(() => validateFernSdkGenApiSourceCompatibility(before, archive)).not.toThrow();
        if (sourceType === "protobuf") {
            expect(archive.manifest.specs[0]?.overridePaths).toEqual(["/fern/specs/protobuf0-override-0.yaml"]);
        }
        expect(() => validateFernSdkGenApiSourceCompatibility(cutover, archive)).toThrow(
            `does not support Fern source type ${sourceType}`
        );
        expect(() => validateFernSdkGenApiSourceCompatibility(after, archive)).toThrow(
            `does not support Fern source type ${sourceType}`
        );
    });

    it("isolates an unsupported post-cutover source from a valid automation sibling", async () => {
        const validGenerator = invocation({ version: "4.0.0" });
        const invalidGenerator = invocation({
            name: "fernapi/fern-python-sdk",
            language: "python",
            version: "6.0.0"
        });
        const validRoute = nativeSdkConfigRoute(validGenerator);
        const invalidRoute = nativeSdkConfigRoute(invalidGenerator);
        const validArchive = await sourceArchive();
        const invalidArchive = await sourceArchive([{ type: "protobuf", specPath: "/fern/specs/protobuf0" }]);
        const { sourceArchives, preflightErrors } = preflightFernSdkGenApiSources({
            generators: [validGenerator, invalidGenerator],
            routes: [validRoute, invalidRoute],
            sourceResolution: {
                sourceArchives: new Map([
                    [0, validArchive],
                    [1, invalidArchive]
                ]),
                errors: new Map()
            }
        });

        expect(sourceArchives).toEqual([validArchive, invalidArchive]);
        expect(preflightErrors[0]).toBeUndefined();
        expect(preflightErrors[1]).toBeInstanceOf(Error);
        const invalidError = preflightErrors[1];
        if (!(invalidError instanceof Error)) {
            throw new Error("Expected target-specific source preflight error");
        }
        expect(invalidError.message).toContain("protobuf");
        expect(getFernSdkGenApiCandidateIndexes([validRoute, invalidRoute], preflightErrors)).toEqual(new Set([0]));
    });

    it("ignores source resolution errors for generators that do not use sdk-gen-api", () => {
        const generator = invocation({ name: "acme/custom-generator" });
        const { preflightErrors } = preflightFernSdkGenApiSources({
            generators: [generator],
            routes: [undefined],
            sourceResolution: {
                sourceArchives: new Map(),
                errors: new Map([[0, new Error("source resolution failed")]])
            }
        });

        expect(preflightErrors).toEqual([undefined]);
    });

    it("enables only explicitly supplied runtime entitlements", async () => {
        const compressed = await prepareFernSdkGenApiRuntimeBundle({
            apiName: "Petstore",
            organization: "acme",
            generatorInvocation: invocation(),
            sdkVersion: "1.2.3",
            intermediateRepresentation: { apiName: "Petstore" } as never,
            irVersionOverride: undefined,
            generateOauthClients: true,
            generatePaginatedClients: true,
            context
        });
        const bundle = JSON.parse(gunzipSync(compressed).toString("utf8"));

        expect(bundle.config).toMatchObject({
            writeUnitTests: false,
            generateOauthClients: true,
            generatePaginatedClients: true
        });
    });

    it("preserves trusted OIDC markers while omitting actual GitHub publish credentials", () => {
        for (const marker of ["OIDC", "<USE_OIDC>"] as const) {
            const npm = getGithubPublishConfig(
                FernFiddle.GithubPublishInfo.npm({
                    registryUrl: "https://registry.npmjs.org",
                    packageName: "@acme/sdk",
                    token: marker
                }),
                { omitPublishCredentials: true }
            );
            const nuget = getGithubPublishConfig(
                FernFiddle.GithubPublishInfo.nuget({
                    registryUrl: "https://api.nuget.org/v3/index.json",
                    packageName: "Acme.Sdk",
                    apiKey: marker
                }),
                { omitPublishCredentials: true }
            );
            const pypi = getGithubPublishConfig(
                FernFiddle.GithubPublishInfo.pypi({
                    registryUrl: "https://upload.pypi.org/legacy/",
                    packageName: "acme-sdk",
                    credentials: { username: "__token__", password: marker }
                }),
                { omitPublishCredentials: true }
            );

            expect(npm?.type === "npm" ? npm.tokenEnvironmentVariable : undefined).toBe("<USE_OIDC>");
            expect(nuget?.type === "nuget" ? nuget.apiKeyEnvironmentVariable : undefined).toBe("<USE_OIDC>");
            expect(pypi?.type === "pypi" ? pypi.passwordEnvironmentVariable : undefined).toBe("OIDC");
        }

        const npmWithSecret = getGithubPublishConfig(
            FernFiddle.GithubPublishInfo.npm({
                registryUrl: "https://registry.npmjs.org",
                packageName: "@acme/sdk",
                token: "actual-secret"
            }),
            { omitPublishCredentials: true }
        );
        const nugetWithSecret = getGithubPublishConfig(
            FernFiddle.GithubPublishInfo.nuget({
                registryUrl: "https://api.nuget.org/v3/index.json",
                packageName: "Acme.Sdk",
                apiKey: "actual-secret"
            }),
            { omitPublishCredentials: true }
        );
        const pypiWithSecret = getGithubPublishConfig(
            FernFiddle.GithubPublishInfo.pypi({
                registryUrl: "https://upload.pypi.org/legacy/",
                packageName: "acme-sdk",
                credentials: { username: "actual-user", password: "actual-secret" }
            }),
            { omitPublishCredentials: true }
        );
        expect(npmWithSecret?.type === "npm" ? npmWithSecret.tokenEnvironmentVariable : undefined).toBe("");
        expect(nugetWithSecret?.type === "nuget" ? nugetWithSecret.apiKeyEnvironmentVariable : undefined).toBe("");
        expect(pypiWithSecret?.type === "pypi" ? pypiWithSecret.usernameEnvironmentVariable : undefined).toBe("");
        expect(pypiWithSecret?.type === "pypi" ? pypiWithSecret.passwordEnvironmentVariable : undefined).toBe("");
    });

    it("omits credentials for registries without trusted-publishing markers", () => {
        const options = { omitPublishCredentials: true };
        const maven = getGithubPublishConfig(
            FernFiddle.GithubPublishInfo.maven({
                registryUrl: "https://repo.example.com",
                coordinate: "com.acme:sdk",
                credentials: { username: "user", password: "secret" },
                signature: { keyId: "key", password: "secret", secretKey: "private" }
            }),
            options
        );
        const rubygems = getGithubPublishConfig(
            FernFiddle.GithubPublishInfo.rubygems({
                registryUrl: "https://rubygems.org",
                packageName: "acme-sdk",
                apiKey: "secret"
            }),
            options
        );
        const crates = getGithubPublishConfig(
            FernFiddle.GithubPublishInfo.crates({
                registryUrl: "https://crates.io",
                packageName: "acme-sdk",
                token: "secret"
            }),
            options
        );

        expect(maven).toMatchObject({
            usernameEnvironmentVariable: "",
            passwordEnvironmentVariable: ""
        });
        expect(maven?.type === "maven" ? maven.signature : undefined).toBeUndefined();
        expect(rubygems?.type === "rubygems" ? rubygems.apiKeyEnvironmentVariable : undefined).toBe("");
        expect(crates?.type === "crates" ? crates.tokenEnvironmentVariable : undefined).toBe("");
    });

    it("uses the override and exact generator identity when migrating a runtime bundle", async () => {
        const generatorInvocation = invocation({ version: "3.86.7" });
        migrationMocks.getIrVersionForGenerator.mockResolvedValue(66);

        await prepareFernSdkGenApiRuntimeBundle({
            apiName: "Petstore",
            organization: "acme",
            generatorInvocation,
            sdkVersion: "1.2.3",
            intermediateRepresentation: { apiName: "Petstore" } as never,
            irVersionOverride: "v55",
            context
        });

        expect(migrationMocks.getIrVersionForGenerator).toHaveBeenCalledWith(generatorInvocation);
        expect(migrationMocks.migrateToVersionForGenerator).toHaveBeenCalledWith(
            expect.objectContaining({
                irVersion: "v55",
                targetGenerator: {
                    name: "fernapi/fern-typescript-sdk",
                    version: "3.86.7"
                }
            })
        );
        expect(migrationMocks.migrateForGenerator).not.toHaveBeenCalled();
    });

    it("submits and polls a mixed-kind multi-language group once", async () => {
        process.env.FERN_SDK_GEN_API_ORIGIN = "https://sdk-gen-api.test";
        const specsTarGzBuffer = validSourceArchive;
        const typescriptRuntimeBundle = gzipSync(Buffer.from("typescript-runtime-bundle"));
        const pythonSdkConfig = Buffer.from(
            JSON.stringify({
                schemaVersion: "sdk-config/v1",
                sdkName: "Petstore",
                sdkVersion: "1.2.3",
                api: {},
                client: {},
                package: {},
                output: { delivery: "zip" },
                docs: {},
                generation: {},
                targets: [{ language: "python", generatorVersion: "6.0.0" }]
            })
        );
        const typescript = invocation();
        const python = invocation({
            name: "fernapi/fern-python-sdk",
            language: "python",
            version: "6.0.0"
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
                    targetIdSeed: "2",
                    sourceSpecIndexes: [0],
                    payload: runtimePayload(typescriptRuntimeBundle)
                },
                {
                    generatorInvocation: python,
                    sdkVersion: "1.2.3",
                    targetIdSeed: "10",
                    sourceSpecIndexes: [1, 2],
                    payload: { payloadKind: "sdk-config-v1", body: pythonSdkConfig }
                }
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
                        artifactUrl: `https://example.test/${target.targetId}.zip`,
                        actualVersion: target.language
                    }
                }))
            }
        } as never);
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

        const pythonResult = batch.run({
            ...common,
            generatorInvocation: python,
            payload: { payloadKind: "sdk-config-v1", body: pythonSdkConfig },
            targetIdSeed: "10",
            sourceSpecIndexes: [1, 2]
        });
        const typescriptResult = batch.run({
            ...common,
            generatorInvocation: typescript,
            payload: runtimePayload(typescriptRuntimeBundle),
            targetIdSeed: "2",
            sourceSpecIndexes: [0]
        });
        const results = await Promise.all([pythonResult, typescriptResult]);

        expect(post).toHaveBeenCalledTimes(1);
        expect(get).toHaveBeenCalledTimes(1);
        expect(results.map((result) => result.actualVersion)).toEqual(["python", "typescript"]);
        const submittedForm = post.mock.calls[0]?.[1];
        expect(submittedForm).toBeInstanceOf(FormData);
        if (!(submittedForm instanceof FormData)) {
            throw new Error("Expected sdk-gen-api request to use multipart form data");
        }
        const multipartBuffer = submittedForm.getBuffer();
        const multipartBody = multipartBuffer.toString("utf8");
        const requestMatch = multipartBody.match(/name="request"\r\n\r\n([^\r\n]+)/);
        expect(requestMatch?.[1]).toBeDefined();
        const submittedRequest = JSON.parse(requestMatch?.[1] ?? "{}");
        expect(submittedRequest.targets).toEqual(request.targets);
        expect(submittedRequest.apiInputs).toEqual([
            { id: "target-2", specIndexes: [0] },
            { id: "target-10", specIndexes: [1, 2] }
        ]);
        expect(submittedRequest.targets.map((target: { apiInputId: string }) => target.apiInputId)).toEqual([
            "target-2",
            "target-10"
        ]);
        expect(submittedRequest.targets.map((target: { payloadKind: string }) => target.payloadKind)).toEqual([
            "fern-runtime-bundle",
            "sdk-config-v1"
        ]);
        expect(submittedRequest.idempotencyKey).toBe(request.idempotencyKey);
        expect(multipartBody.match(/name="sources"/g)).toHaveLength(1);
        expect(multipartBody).toContain('name="sources"; filename="specs.tar.gz"');
        expect(multipartBody.match(/name="payloads"/g)).toHaveLength(2);
        request.targets.forEach((target, index) => {
            const isRuntimeBundle = target.payloadKind === "fern-runtime-bundle";
            const filename = `${target.targetId}.json${isRuntimeBundle ? ".gz" : ""}`;
            const payload = index === 0 ? typescriptRuntimeBundle : pythonSdkConfig;
            expect(multipartBody).toContain(
                `name="payloads"; filename="${filename}"\r\nContent-Type: ${isRuntimeBundle ? "application/gzip" : "application/json"}`
            );
            expect(multipartBuffer.indexOf(filename)).toBeLessThan(multipartBuffer.indexOf(payload));
        });
        expect(multipartBuffer.indexOf(typescriptRuntimeBundle)).toBeLessThan(multipartBuffer.indexOf(pythonSdkConfig));
    });

    it("stops polling when the build fails before a target reaches a terminal state", async () => {
        process.env.FERN_SDK_GEN_API_ORIGIN = "https://sdk-gen-api.test";
        const specsTarGzBuffer = validSourceArchive;
        const generatorInvocation = invocation();
        const request = createFernSdkGenApiRequest({
            apiName: "Petstore",
            organization: "acme",
            cliVersion: "0.0.0",
            generatorInvocation,
            sdkVersion: "1.2.3",
            specsTarGzBuffer,
            payload: runtimePayload(validRuntimeBundle)
        });
        vi.spyOn(axios, "post").mockResolvedValue({ data: { buildId: "build-1" } } as never);
        const get = vi.spyOn(axios, "get").mockResolvedValue({
            data: {
                buildId: "build-1",
                status: "failed",
                targets: [{ targetId: request.targets[0]?.targetId, status: "queued", logs: [] }]
            }
        } as never);
        await expect(
            runFernSdkGenApiBuild({
                apiName: "Petstore",
                organization: "acme",
                cliVersion: "0.0.0",
                generatorInvocation,
                sdkVersion: "1.2.3",
                token: { value: "token" } as never,
                specsTarGzBuffer,
                payload: runtimePayload(validRuntimeBundle),
                absolutePathToPreview: undefined,
                context
            })
        ).rejects.toThrow("build ended with status failed");
        expect(get).toHaveBeenCalledTimes(1);
    });

    it.each([
        ["UNKNOWN_GENERATOR", invocation({ name: "fernapi/not-a-generator" })],
        ["GENERATOR_LANGUAGE_MISMATCH", invocation({ language: "python" })],
        ["INVALID_GENERATOR_VERSION", invocation({ version: "latest" })]
    ])("rejects %s before submission", async (code, generatorInvocation) => {
        const { builds, post, get } = createPreflightBatch({
            payloads: [runtimePayload(validRuntimeBundle)],
            generatorInvocation
        });

        await expect(Promise.all(builds)).rejects.toThrow(code);
        expect(post).not.toHaveBeenCalled();
        expect(get).not.toHaveBeenCalled();
    });

    it("rejects a legacy payload at the generator cutover", async () => {
        const { builds, post, get } = createPreflightBatch({
            payloads: [runtimePayload(validRuntimeBundle)],
            generatorInvocation: invocation({ version: "4.0.0" })
        });

        await expect(Promise.all(builds)).rejects.toThrow(
            "SDK_CONFIG_V1_REQUIRED; generator=fernapi/fern-typescript-sdk; language=typescript; requestedVersion=4.0.0; cutoverVersion=4.0.0; receivedConfigKind=legacy-fern; expectedConfigKind=sdk-config-v1"
        );
        expect(post).not.toHaveBeenCalled();
        expect(get).not.toHaveBeenCalled();
    });

    it("requires sdk-config for MCP at its first core-backed version", async () => {
        const { builds, post, get } = createPreflightBatch({
            payloads: [runtimePayload(validRuntimeBundle)],
            generatorInvocation: invocation({
                name: "fernapi/fern-mcp-server",
                language: "mcp",
                version: "0.1.0"
            })
        });

        await expect(Promise.all(builds)).rejects.toThrow(
            "SDK_CONFIG_V1_REQUIRED; generator=fernapi/fern-mcp-server; language=mcp; requestedVersion=0.1.0; cutoverVersion=0.1.0"
        );
        expect(post).not.toHaveBeenCalled();
        expect(get).not.toHaveBeenCalled();
    });

    it("rejects an incompatible later batch target before submitting any target", async () => {
        const { builds, post, get } = createPreflightBatch({
            payloads: [runtimePayload(validRuntimeBundle), runtimePayload(validRuntimeBundle)],
            generatorInvocations: [invocation(), invocation({ version: "4.0.0" })]
        });

        await expect(Promise.all(builds)).rejects.toThrow("SDK_CONFIG_V1_REQUIRED");
        expect(post).not.toHaveBeenCalled();
        expect(get).not.toHaveBeenCalled();
    });

    it("rejects more than 64 target payloads before submission", async () => {
        const { builds, post } = createPreflightBatch({
            payloads: Array.from({ length: 65 }, () => runtimePayload(Buffer.alloc(0)))
        });
        await expect(Promise.all(builds)).rejects.toThrow("at most 64 target payloads");
        expect(post).not.toHaveBeenCalled();
    });

    it("rejects a bundle larger than 5 MiB before submission", async () => {
        const { builds, post } = createPreflightBatch({
            payloads: [runtimePayload(Buffer.alloc(5 * 1024 * 1024 + 1))]
        });
        await expect(Promise.all(builds)).rejects.toThrow("exceeding the 5.00 MiB upload limit");
        expect(post).not.toHaveBeenCalled();
    });

    it("rejects a source archive larger than 25 MiB compressed before submission", async () => {
        const { builds, post } = createPreflightBatch({
            payloads: [runtimePayload(validRuntimeBundle)],
            specsTarGzBuffer: Buffer.alloc(25 * 1024 * 1024 + 1)
        });
        await expect(Promise.all(builds)).rejects.toThrow("source archive is 25.00 MiB");
        expect(post).not.toHaveBeenCalled();
    });

    it("rejects a source archive larger than 25 MiB decompressed before submission", async () => {
        const { builds, post } = createPreflightBatch({
            payloads: [runtimePayload(validRuntimeBundle)],
            specsTarGzBuffer: gzipSync(Buffer.alloc(25 * 1024 * 1024 + 1))
        });
        await expect(Promise.all(builds)).rejects.toThrow("source archive is 25.00 MiB decompressed");
        expect(post).not.toHaveBeenCalled();
    });

    it("rejects a bundle larger than 25 MiB decompressed before submission", async () => {
        const { builds, post } = createPreflightBatch({
            payloads: [runtimePayload(gzipSync(Buffer.alloc(25 * 1024 * 1024 + 1)))]
        });
        await expect(Promise.all(builds)).rejects.toThrow("fern-runtime-bundle 0 is 25.00 MiB decompressed");
        expect(post).not.toHaveBeenCalled();
    });

    it("rejects more than 25 MiB of runtime bundle payloads before submission", async () => {
        const { builds, post } = createPreflightBatch({
            payloads: Array.from({ length: 6 }, () => runtimePayload(Buffer.alloc(5 * 1024 * 1024)))
        });
        await expect(Promise.all(builds)).rejects.toThrow("exceeding the 25 MiB compressed limit");
        expect(post).not.toHaveBeenCalled();
    });

    it("accepts exactly 50 MiB of source and mixed target payload files", async () => {
        const sdkConfigPayloadBytes = 25 * 1024 * 1024;
        const remainingPayloadBytes =
            50 * 1024 * 1024 - validSourceArchive.length - validRuntimeBundle.length - sdkConfigPayloadBytes;
        const { builds, post } = createPreflightBatch({
            payloads: [
                runtimePayload(validRuntimeBundle),
                { payloadKind: "sdk-config-v1", body: Buffer.alloc(sdkConfigPayloadBytes) },
                { payloadKind: "sdk-config-v1", body: Buffer.alloc(remainingPayloadBytes) }
            ],
            generatorInvocations: [
                invocation({ version: "3.999.999" }),
                invocation({ version: "4.0.0" }),
                invocation({ version: "4.0.1" })
            ]
        });

        await expect(Promise.all(builds)).rejects.toThrow("Failed to submit sdk-gen-api build");
        expect(post).toHaveBeenCalledTimes(1);
    });

    it("rejects source and mixed target payload files one byte over 50 MiB", async () => {
        const sdkConfigPayloadBytes = 25 * 1024 * 1024;
        const remainingPayloadBytes =
            50 * 1024 * 1024 - validSourceArchive.length - validRuntimeBundle.length - sdkConfigPayloadBytes + 1;
        const { builds, post } = createPreflightBatch({
            payloads: [
                runtimePayload(validRuntimeBundle),
                { payloadKind: "sdk-config-v1", body: Buffer.alloc(sdkConfigPayloadBytes) },
                { payloadKind: "sdk-config-v1", body: Buffer.alloc(remainingPayloadBytes) }
            ],
            generatorInvocations: [
                invocation({ version: "3.999.999" }),
                invocation({ version: "4.0.0" }),
                invocation({ version: "4.0.1" })
            ]
        });

        await expect(Promise.all(builds)).rejects.toThrow(
            "exceeding the 50 MiB in-memory upload limit; reduce the source archive size, target payload size, or number of targets"
        );
        expect(post).not.toHaveBeenCalled();
    });

    it("rejects more than 100 MiB of decoded payloads before submission", async () => {
        const { builds, post } = createPreflightBatch({
            payloads: Array.from({ length: 5 }, () => runtimePayload(gzipSync(Buffer.alloc(21 * 1024 * 1024))))
        });
        await expect(Promise.all(builds)).rejects.toThrow("exceeding the 100 MiB decoded limit");
        expect(post).not.toHaveBeenCalled();
    });

    it("rejects malformed source gzip before submission", async () => {
        const { builds, post } = createPreflightBatch({
            payloads: [runtimePayload(validRuntimeBundle)],
            specsTarGzBuffer: Buffer.from("not-gzip")
        });
        await expect(Promise.all(builds)).rejects.toThrow("source archive is malformed gzip");
        expect(post).not.toHaveBeenCalled();
    });

    it("rejects malformed runtime bundle gzip before submission", async () => {
        const { builds, post } = createPreflightBatch({
            payloads: [runtimePayload(Buffer.from("not-gzip"))]
        });
        await expect(Promise.all(builds)).rejects.toThrow("fern-runtime-bundle 0 is malformed gzip");
        expect(post).not.toHaveBeenCalled();
    });

    it("accepts a serialized UTF-8 request field of exactly 1 MiB", async () => {
        const generatorInvocation = invocationWithSerializedRequestBytes(1024 * 1024);
        const { builds, post } = createPreflightBatch({
            payloads: [runtimePayload(validRuntimeBundle)],
            generatorInvocation
        });

        expect(serializedRequestBytes(generatorInvocation)).toBe(1024 * 1024);
        await expect(Promise.all(builds)).rejects.toThrow("Failed to submit sdk-gen-api build");
        expect(post).toHaveBeenCalledTimes(1);
    });

    it("rejects a serialized UTF-8 request field one byte over 1 MiB", async () => {
        const generatorInvocation = invocationWithSerializedRequestBytes(1024 * 1024 + 1);
        const { builds, post } = createPreflightBatch({
            payloads: [runtimePayload(validRuntimeBundle)],
            generatorInvocation
        });

        expect(serializedRequestBytes(generatorInvocation)).toBe(1024 * 1024 + 1);
        await expect(Promise.all(builds)).rejects.toThrow(
            "exceeding the 1 MiB UTF-8 field limit; reduce generator customConfig, readme, settings, or API override metadata"
        );
        expect(post).not.toHaveBeenCalled();
    });

    it("rejects a multipart body larger than 60 MiB before submission", async () => {
        vi.spyOn(FormData.prototype, "getLengthSync").mockReturnValue(60 * 1024 * 1024 + 1);
        const { builds, post } = createPreflightBatch({
            payloads: [runtimePayload(validRuntimeBundle)]
        });
        await expect(Promise.all(builds)).rejects.toThrow("exceeding the 60 MiB limit");
        expect(post).not.toHaveBeenCalled();
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

describe("fernapi/fern-mcp-server target", () => {
    function mcpInvocation(overrides: Record<string, unknown> = {}): generatorsYml.GeneratorInvocation {
        return {
            name: "fernapi/fern-mcp-server",
            version: "0.1.0",
            config: {
                target: "hosted",
                serverName: "my-api",
                baseUrl: "https://api.example.com/v3"
            },
            keywords: [],
            smartCasing: false,
            smartCasingDigitWordBoundary: false,
            disableExamples: false,
            outputMode: { type: "downloadFiles" },
            ...overrides
        } as unknown as generatorsYml.GeneratorInvocation;
    }

    it("maps fernapi/fern-mcp-server to the mcp language", () => {
        expect(getFernSdkGenApiLanguage("fernapi/fern-mcp-server")).toBe("mcp");
    });

    it("is eligible for sdk-gen-api with a concrete version and source archive", () => {
        expect(
            isEligibleForFernSdkGenApi({
                generatorInvocation: mcpInvocation(),
                sdkVersion: "0.0.1",
                specsTarGzBuffer: Buffer.from("archive")
            })
        ).toBe(true);
    });

    it("maps downloadFiles output mode to download", () => {
        expect(mapFernSdkGenApiOutput(mcpInvocation()).requestedOutput).toEqual({ type: "download" });
    });

    it("builds a request with customConfig passed through unchanged", () => {
        const config = {
            target: "hosted",
            serverName: "my-api",
            baseUrl: "https://api.example.com/v3",
            tools: [{ name: "list-pets", path: "/pets", method: "GET" }],
            toolsets: ["crud"]
        };

        const request = createFernSdkGenApiRequest({
            apiName: "Petstore",
            organization: "acme",
            cliVersion: "0.0.0",
            generatorInvocation: mcpInvocation({ config }),
            sdkVersion: "0.0.1",
            specsTarGzBuffer: Buffer.from("archive"),
            payload: sdkConfigPayload("{}")
        });

        const target = request.targets[0];
        expect(target).toBeDefined();
        expect(target?.language).toBe("mcp");
        expect(target?.fernGenerator).toEqual({
            id: "fernapi/fern-mcp-server",
            version: "0.1.0"
        });
        expect(target?.sdk).toEqual({ name: "Petstore", version: "0.0.1" });
        expect(target?.invocation.customConfig).toEqual(config);
        expect(target?.requestedOutput).toEqual({ type: "download" });
    });

    it("does not include package metadata for download output", () => {
        const request = createFernSdkGenApiRequest({
            apiName: "Petstore",
            organization: "acme",
            cliVersion: "0.0.0",
            generatorInvocation: mcpInvocation(),
            sdkVersion: "0.0.1",
            specsTarGzBuffer: Buffer.from("archive"),
            payload: sdkConfigPayload("{}")
        });

        expect(request.targets[0]?.package).toBeUndefined();
    });

    it("infers npm for legacy publish output with no explicit registry override", () => {
        const request = createFernSdkGenApiRequest({
            apiName: "Petstore",
            organization: "acme",
            cliVersion: "0.0.0",
            generatorInvocation: mcpInvocation({
                outputMode: FernFiddle.OutputMode.publish({
                    registryOverrides: {}
                })
            }),
            sdkVersion: "0.0.1",
            specsTarGzBuffer: Buffer.from("archive"),
            payload: sdkConfigPayload("{}")
        });

        expect(request.targets[0]?.requestedOutput).toEqual({
            type: "publish",
            publish: { registry: "npm" }
        });
    });
});
