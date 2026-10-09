// cspell:ignore sdkgen
import { generatorsYml } from "@fern-api/configuration";
import { CliError } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const runGenerator = vi.hoisted(() => vi.fn());

vi.mock("../runRemoteGenerationForGenerator.js", () => ({
    runRemoteGenerationForGenerator: runGenerator
}));

import type { FernSdkConfigV1Payload } from "../fernSdkGenApi.js";
import {
    createFernSdkGenApiPublishCredentials,
    createFernSdkGenApiRequest,
    FernSdkGenApiBatch
} from "../fernSdkGenApi.js";
import type { FernSdkGenApiSourceArchive } from "../fernSdkGenApiSourceArchive.js";
import {
    prepareFernSdkGenApiRoutes,
    runRemoteGenerationForAPIWorkspace
} from "../runRemoteGenerationForAPIWorkspace.js";

function invocation(
    name: string,
    language: "typescript" | "python" | "ruby" | "csharp",
    version: string
): generatorsYml.GeneratorInvocation {
    return {
        name,
        version,
        language,
        config: {},
        keywords: [],
        smartCasing: true,
        smartCasingDigitWordBoundary: false,
        disableExamples: false,
        outputMode: FernFiddle.OutputMode.downloadFiles({})
    } as never;
}

async function runMixedFailure(
    failure: "route" | "archive" | "post-barrier",
    { automation = true, remoteMutation = vi.fn() }: { automation?: boolean; remoteMutation?: () => void } = {}
): Promise<{
    typescript: generatorsYml.GeneratorInvocation;
    python: generatorsYml.GeneratorInvocation;
    recordSuccess: ReturnType<typeof vi.fn>;
    recordFailure: ReturnType<typeof vi.fn>;
    failWithoutThrowing: ReturnType<typeof vi.fn>;
    taskNames: string[];
}> {
    const typescript = invocation("fernapi/fern-typescript-sdk", "typescript", "3.999.999");
    const python = invocation("fernapi/fern-python-sdk", "python", failure === "route" ? "not-semver" : "5.999.999");
    const recordSuccess = vi.fn();
    const recordFailure = vi.fn();
    const failWithoutThrowing = vi.fn();
    const taskNames: string[] = [];
    runGenerator.mockImplementation(async (parameters) => {
        await parameters.sdkGenApiPreparationBatch.ready(parameters.sdkGenApiTargetIdSeed);
        if (failure === "post-barrier" && parameters.generatorInvocation.name === python.name) {
            throw new Error("post-barrier target failure");
        }
        remoteMutation();
        return {
            createdSnippets: false,
            snippetsS3PreSignedReadUrl: undefined,
            actualVersion: "1.2.3",
            pullRequestUrl: undefined,
            noChangesDetected: undefined,
            publishTarget: undefined
        };
    });
    const interactiveContext = {
        logger: { warn: vi.fn(), debug: vi.fn(), info: vi.fn() },
        failWithoutThrowing,
        getLastFailureMessage: vi.fn()
    };
    const context = {
        logger: { warn: vi.fn() },
        runInteractiveTask: async (options: { name: string }, run: (taskContext: never) => Promise<void>) => {
            taskNames.push(options.name);
            await run(interactiveContext as never);
            return true;
        }
    };
    const workspace = {
        workspaceName: "petstore",
        generatorsConfiguration: undefined,
        toFernWorkspace: vi.fn().mockResolvedValue({
            definition: { rootApiFile: { contents: { name: "Petstore" } } },
            cliVersion: "0.0.0"
        })
    };
    const sourceArchive: FernSdkGenApiSourceArchive = {
        buffer: Buffer.from("shared-archive"),
        manifest: { specs: [{ type: "openapi", specPath: "/fern/specs/openapi0.json" }] },
        specIndexes: [0]
    };

    await runRemoteGenerationForAPIWorkspace({
        projectConfig: { organization: "acme" } as never,
        organization: "acme",
        workspace: workspace as never,
        context: context as never,
        generatorGroup: {
            groupName: "sdk",
            generators: [typescript, python],
            audiences: { type: "all" }
        } as never,
        version: "1.2.3",
        shouldLogS3Url: false,
        token: { value: "token" } as never,
        whitelabel: undefined,
        replay: undefined,
        absolutePathToPreview: undefined,
        mode: undefined,
        fernignorePath: undefined,
        skipFernignore: true,
        dynamicIrOnly: false,
        validateWorkspace: false,
        retryRateLimited: false,
        requireEnvVars: true,
        automation: automation ? ({ recorder: { recordSuccess, recordFailure } } as never) : undefined,
        getSpecsTarGzBuffer: async (requests) => ({
            sourceArchives: new Map(
                requests
                    .filter((request) => failure !== "archive" || request.generatorIndex !== 1)
                    .map((request) => [request.generatorIndex, sourceArchive])
            ),
            errors: new Map(
                failure === "archive" ? [[1, new Error("target source override could not be resolved")]] : []
            )
        })
    });

    return { typescript, python, recordSuccess, recordFailure, failWithoutThrowing, taskNames };
}

describe("runRemoteGenerationForAPIWorkspace sdk-gen-api preparation", () => {
    beforeEach(() => {
        vi.stubEnv("FERN_USE_SDK_GEN_API", "true");
        runGenerator.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it.each([
        "route",
        "archive"
    ] as const)("records a target %s failure without canceling its valid automation sibling", async (failure) => {
        const result = await runMixedFailure(failure);

        expect(runGenerator).toHaveBeenCalledTimes(1);
        expect(result.recordSuccess).toHaveBeenCalledTimes(1);
        expect(result.recordSuccess).toHaveBeenCalledWith(
            expect.objectContaining({ generatorName: result.typescript.name })
        );
        expect(result.recordFailure).toHaveBeenCalledTimes(1);
        expect(result.recordFailure).toHaveBeenCalledWith(
            expect.objectContaining({ generatorName: result.python.name })
        );
        expect(result.failWithoutThrowing).toHaveBeenCalledTimes(1);
        expect(result.taskNames).toEqual([result.typescript.name, result.python.name]);
    });

    it("fails a legacy cutover target before source preparation or target work", async () => {
        const getSpecsTarGzBuffer = vi.fn();
        const runInteractiveTask = vi.fn();

        await expect(
            runRemoteGenerationForAPIWorkspace({
                projectConfig: { organization: "acme" } as never,
                organization: "acme",
                workspace: {
                    workspaceName: "petstore",
                    generatorsConfiguration: undefined
                } as never,
                context: { logger: { warn: vi.fn() }, runInteractiveTask } as never,
                generatorGroup: {
                    groupName: "sdk",
                    generators: [
                        invocation("fernapi/fern-typescript-sdk", "typescript", "4.0.0"),
                        invocation("fernapi/fern-python-sdk", "python", "5.999.999")
                    ],
                    audiences: { type: "all" }
                } as never,
                version: "1.2.3",
                shouldLogS3Url: false,
                token: { value: "token" } as never,
                whitelabel: undefined,
                replay: undefined,
                absolutePathToPreview: undefined,
                mode: undefined,
                fernignorePath: undefined,
                skipFernignore: true,
                dynamicIrOnly: false,
                validateWorkspace: false,
                retryRateLimited: false,
                requireEnvVars: true,
                getSpecsTarGzBuffer
            })
        ).rejects.toThrow("fern generate --sdk-config <path>");
        expect(getSpecsTarGzBuffer).not.toHaveBeenCalled();
        expect(runInteractiveTask).not.toHaveBeenCalled();
    });

    it("pairs duplicate-language SDK Config targets by declaration order", () => {
        const generators = [
            invocation("fernapi/fern-typescript-sdk", "typescript", "4.0.0"),
            invocation("fernapi/fern-typescript-sdk", "typescript", "4.1.0")
        ];
        const sdkConfigV1: FernSdkConfigV1Payload = {
            sdkName: "petstore",
            sdkVersion: "1.2.3",
            targets: [
                {
                    body: Buffer.from('{"targets":[{"sdkName":"first"}]}'),
                    language: "typescript",
                    generatorVersion: "4.0.0",
                    requestedOutput: { type: "publish", publish: { registry: "npm" } },
                    publishCredential: { registry: "npm", token: "first-secret" }
                },
                {
                    body: Buffer.from('{"targets":[{"sdkName":"second"}]}'),
                    language: "typescript",
                    generatorVersion: "4.1.0",
                    requestedOutput: { type: "publish", publish: { registry: "npm" } },
                    publishCredential: { registry: "npm", token: "second-secret" }
                }
            ]
        };

        const prepared = prepareFernSdkGenApiRoutes({
            generators,
            enabled: true,
            sdkConfigV1,
            requireEnvVars: true,
            isPreview: false
        });

        expect(prepared.map((result) => result.error)).toEqual([undefined, undefined]);
        expect(prepared.map((result) => result.generatorInvocation.version)).toEqual(["4.0.0", "4.1.0"]);
    });

    it("keeps the original duplicate-language target after generator filtering", async () => {
        const filteredGenerator = {
            ...invocation("fernapi/fern-typescript-sdk", "typescript", "4.1.0"),
            sdkConfigTargetIndex: 1
        };
        const sourceArchive: FernSdkGenApiSourceArchive = {
            buffer: Buffer.from("archive"),
            manifest: { specs: [{ type: "openapi", specPath: "/fern/specs/openapi0.json" }] },
            specIndexes: [0]
        };
        const getSpecsTarGzBuffer = vi.fn(async (requests) => {
            expect(requests).toMatchObject([{ generatorIndex: 0, sdkConfigTargetIndex: 1 }]);
            return {
                sourceArchives: new Map([[0, sourceArchive]]),
                errors: new Map()
            };
        });
        runGenerator.mockResolvedValue({
            createdSnippets: false,
            snippetsS3PreSignedReadUrl: undefined,
            actualVersion: "2.0.0",
            pullRequestUrl: undefined,
            noChangesDetected: undefined,
            publishTarget: undefined
        });
        const taskNames: string[] = [];

        await runRemoteGenerationForAPIWorkspace({
            projectConfig: { organization: "acme" } as never,
            organization: "acme",
            workspace: {
                workspaceName: "petstore",
                generatorsConfiguration: undefined,
                toFernWorkspace: vi.fn().mockResolvedValue({
                    definition: { rootApiFile: { contents: { name: "Petstore" } } },
                    cliVersion: "0.0.0"
                })
            } as never,
            context: {
                logger: { warn: vi.fn() },
                runInteractiveTask: async (options: { name: string }, run: (taskContext: never) => Promise<void>) => {
                    taskNames.push(options.name);
                    await run({ logger: { warn: vi.fn(), debug: vi.fn(), info: vi.fn() } } as never);
                    return true;
                }
            } as never,
            generatorGroup: {
                groupName: "sdk-config",
                generators: [filteredGenerator],
                audiences: { type: "all" }
            } as never,
            version: "2.0.0",
            shouldLogS3Url: false,
            token: { value: "token" } as never,
            whitelabel: undefined,
            replay: undefined,
            absolutePathToPreview: undefined,
            mode: undefined,
            fernignorePath: undefined,
            dynamicIrOnly: false,
            retryRateLimited: false,
            requireEnvVars: true,
            getSpecsTarGzBuffer,
            sdkConfigV1: {
                sdkName: "petstore",
                sdkVersion: "2.0.0",
                targets: [
                    {
                        body: Buffer.from('{"targets":[{"sdkName":"first"}]}'),
                        language: "typescript",
                        generatorVersion: "4.0.0",
                        requestedOutput: { type: "publish", publish: { registry: "npm" } }
                    },
                    {
                        body: Buffer.from('{"targets":[{"sdkName":"second"}]}'),
                        language: "typescript",
                        generatorVersion: "4.1.0",
                        requestedOutput: { type: "publish", publish: { registry: "npm" } },
                        publishCredential: { registry: "npm", token: "second-secret" }
                    }
                ]
            }
        });

        expect(runGenerator).toHaveBeenCalledWith(
            expect.objectContaining({ sdkGenApiTargetIdSeed: "1", sdkGenApiRoute: expect.objectContaining({}) })
        );
        expect(taskNames).toEqual(["TypeScript SDK"]);
    });

    it.each([
        ["missing credentials", undefined, { registry: "npm" }, "missing its credential configuration"],
        [
            "unsafe URL",
            { registry: "npm", token: "secret" },
            { registry: "npm", url: "http://npm.example.com" },
            "must use HTTPS"
        ],
        ["unsupported registry", { registry: "nuget" }, { registry: "nuget" }, "does not support direct nuget"],
        [
            "mismatched credential registry",
            { registry: "pypi", username: "user", password: "secret" },
            { registry: "npm" },
            "credential registry pypi does not match requested registry npm"
        ]
    ] as const)("rejects selected SDK Config %s before source or HTTP work", async (_name, publishCredential, publish, expectedError) => {
        const getSpecsTarGzBuffer = vi.fn();
        const post = vi.spyOn(axios, "post");
        const get = vi.spyOn(axios, "get");

        await expect(
            runRemoteGenerationForAPIWorkspace({
                projectConfig: { organization: "acme" } as never,
                organization: "acme",
                workspace: { workspaceName: "petstore", generatorsConfiguration: undefined } as never,
                context: { logger: { warn: vi.fn() }, runInteractiveTask: vi.fn() } as never,
                generatorGroup: {
                    groupName: "sdk-config",
                    generators: [
                        {
                            ...invocation("fernapi/fern-typescript-sdk", "typescript", "4.0.0"),
                            sdkConfigTargetIndex: 1
                        }
                    ],
                    audiences: { type: "all" }
                } as never,
                version: "1.2.3",
                shouldLogS3Url: false,
                token: { value: "token" } as never,
                whitelabel: undefined,
                replay: undefined,
                absolutePathToPreview: undefined,
                mode: undefined,
                fernignorePath: undefined,
                dynamicIrOnly: false,
                retryRateLimited: false,
                requireEnvVars: true,
                getSpecsTarGzBuffer,
                sdkConfigV1: {
                    sdkName: "petstore",
                    sdkVersion: "1.2.3",
                    targets: [
                        {
                            body: Buffer.from('{"targets":[{}]}'),
                            language: "typescript",
                            generatorVersion: "3.0.0",
                            requestedOutput: { type: "publish", publish: { registry: "npm" } },
                            publishCredential: { registry: "npm", token: "unselected-secret" }
                        },
                        {
                            body: Buffer.from('{"targets":[{}]}'),
                            language: "typescript",
                            generatorVersion: "4.0.0",
                            requestedOutput: { type: "publish", publish },
                            ...(publishCredential == null ? {} : { publishCredential })
                        }
                    ]
                }
            })
        ).rejects.toThrow(expectedError);

        expect(getSpecsTarGzBuffer).not.toHaveBeenCalled();
        expect(post).not.toHaveBeenCalled();
        expect(get).not.toHaveBeenCalled();
    });

    it("keeps normalized credential rotation out of request identity", () => {
        const generator = invocation("fernapi/fern-typescript-sdk", "typescript", "4.0.0");
        const createRequest = () =>
            createFernSdkGenApiRequest({
                apiName: "Petstore",
                organization: "acme",
                cliVersion: "0.0.0",
                generatorInvocation: generator,
                sdkVersion: "1.2.3",
                specsTarGzBuffer: Buffer.from("archive"),
                payload: { payloadKind: "sdk-config-v1", body: Buffer.from('{"schemaVersion":"sdk-config/v1"}') },
                requestedOutput: { type: "publish", publish: { registry: "npm" } }
            });
        const first = createRequest();
        const rotated = createRequest();
        const firstCredentials = createFernSdkGenApiPublishCredentials(
            first,
            [generator],
            [{ registry: "npm", token: "first-secret" }]
        );
        const rotatedCredentials = createFernSdkGenApiPublishCredentials(
            rotated,
            [generator],
            [{ registry: "npm", token: "rotated-secret" }]
        );

        expect(rotated.credentialSetId).toBe(first.credentialSetId);
        expect(rotated.idempotencyKey).toBe(first.idempotencyKey);
        expect(rotatedCredentials?.targets[0]).toMatchObject({ token: "rotated-secret" });
        expect(firstCredentials?.targets[0]).toMatchObject({ token: "first-secret" });
    });

    it("omits direct publish credentials for GitHub registry publication", () => {
        const generator = invocation("fernapi/fern-typescript-sdk", "typescript", "4.0.0");
        const publishCredential = { registry: "npm" as const, token: "github-publish-secret" };
        const request = createFernSdkGenApiRequest({
            apiName: "Petstore",
            organization: "acme",
            cliVersion: "0.0.0",
            generatorInvocation: generator,
            sdkVersion: "1.2.3",
            specsTarGzBuffer: Buffer.from("archive"),
            payload: { payloadKind: "sdk-config-v1", body: Buffer.from('{"schemaVersion":"sdk-config/v1"}') },
            requestedOutput: {
                type: "github",
                repository: "acme/sdk",
                mode: "pull-request",
                publish: { registry: "npm", url: "https://npm.buildwithfern.com" }
            },
            publishCredential
        });
        const credentials = createFernSdkGenApiPublishCredentials(request, [generator], [publishCredential]);

        expect(request.targets[0]?.requestedOutput).toEqual({
            type: "github",
            repository: "acme/sdk",
            mode: "pull-request",
            publish: { registry: "npm", url: "https://npm.buildwithfern.com" }
        });
        expect(request.credentialSetId).toBeUndefined();
        expect(credentials).toBeUndefined();
        expect(JSON.stringify(request)).not.toContain("github-publish-secret");
    });

    it("keeps generators.yml direct publishing validation unchanged", () => {
        const generator = invocation("fernapi/fern-typescript-sdk", "typescript", "3.999.999");
        generator.outputMode = FernFiddle.OutputMode.publishV2(
            FernFiddle.PublishOutputModeV2.npmOverride({
                registryUrl: "https://registry.npmjs.org",
                packageName: "@acme/sdk",
                token: "npm-secret"
            })
        );

        const [prepared] = prepareFernSdkGenApiRoutes({
            generators: [generator],
            enabled: true,
            requireEnvVars: true,
            isPreview: false
        });

        expect(prepared?.error).toBeUndefined();
        expect(prepared?.route).toMatchObject({ configKind: "legacy-fern" });
        expect(prepared?.generatorInvocation.outputMode).toEqual(generator.outputMode);
    });

    it("warns when a legacy target falls back to Fiddle generation", async () => {
        const generator = invocation("fernapi/fern-csharp-sdk", "csharp", "2.999.999");
        generator.outputMode = FernFiddle.OutputMode.publishV2(
            FernFiddle.PublishOutputModeV2.nugetOverride({
                registryUrl: "https://nuget.org/",
                packageName: "Acme",
                apiKey: "nuget-secret"
            })
        );
        runGenerator.mockResolvedValue({
            createdSnippets: false,
            snippetsS3PreSignedReadUrl: undefined,
            actualVersion: "1.2.3",
            pullRequestUrl: undefined,
            noChangesDetected: undefined,
            publishTarget: undefined
        });
        const warn = vi.fn();
        const debug = vi.fn();

        await runRemoteGenerationForAPIWorkspace({
            projectConfig: { organization: "acme" } as never,
            organization: "acme",
            workspace: {
                workspaceName: "petstore",
                generatorsConfiguration: undefined,
                toFernWorkspace: vi.fn().mockResolvedValue({
                    definition: { rootApiFile: { contents: { name: "Petstore" } } },
                    cliVersion: "0.0.0"
                })
            } as never,
            context: {
                logger: { warn, debug },
                runInteractiveTask: async (_options: { name: string }, run: (taskContext: never) => Promise<void>) => {
                    await run({ logger: { warn: vi.fn(), debug: vi.fn(), info: vi.fn() } } as never);
                    return true;
                }
            } as never,
            generatorGroup: { groupName: "sdk", generators: [generator], audiences: { type: "all" } } as never,
            version: "1.2.3",
            shouldLogS3Url: false,
            token: { value: "token" } as never,
            whitelabel: undefined,
            replay: undefined,
            absolutePathToPreview: undefined,
            mode: undefined,
            fernignorePath: undefined,
            skipFernignore: true,
            dynamicIrOnly: false,
            validateWorkspace: false,
            retryRateLimited: false,
            requireEnvVars: true
        });

        expect(warn).toHaveBeenCalledWith(
            "fernapi/fern-csharp-sdk 2.999.999 will use legacy Fiddle generation instead of sdk-gen-api: sdk-gen-api does not support direct nuget registry publication"
        );
        expect(debug).not.toHaveBeenCalledWith(expect.stringContaining("Fiddle generation"));
        expect(JSON.stringify(warn.mock.calls)).not.toContain("nuget-secret");
        expect(runGenerator).toHaveBeenCalledWith(expect.objectContaining({ sdkGenApiRoute: undefined }));
    });

    describe("direct RubyGems publishing", () => {
        function directRubyGemsGenerator(): generatorsYml.GeneratorInvocation {
            const generator = invocation("fernapi/fern-ruby-sdk", "ruby", "1.999.999");
            generator.outputMode = FernFiddle.OutputMode.publishV2(
                FernFiddle.PublishOutputModeV2.rubyGemsOverride({
                    registryUrl: "https://rubygems.org/",
                    packageName: "acme",
                    apiKey: "rubygems-secret"
                })
            );
            return generator;
        }

        it.each([true, false])("rejects it before generation (sdk-gen-api enabled=%s)", (enabled) => {
            const [prepared] = prepareFernSdkGenApiRoutes({
                generators: [directRubyGemsGenerator()],
                enabled,
                requireEnvVars: true,
                isPreview: false
            });

            expect(prepared?.route).toBeUndefined();
            expect(prepared?.error).toBeInstanceOf(CliError);
            expect(prepared?.error).toMatchObject({
                code: CliError.Code.ConfigError,
                message:
                    "fernapi/fern-ruby-sdk: Direct RubyGems publishing is not supported. Add a github block to this generator (for example, github: { repository: your-org/your-ruby-sdk }) so the gem is published by the GitHub Actions workflow generated in that repository."
            });
        });

        it("allows previews, which download files instead of publishing", () => {
            const [prepared] = prepareFernSdkGenApiRoutes({
                generators: [directRubyGemsGenerator()],
                enabled: false,
                requireEnvVars: true,
                isPreview: true
            });

            expect(prepared?.error).toBeUndefined();
        });

        it("allows RubyGems publishing through a github block", () => {
            const generator = invocation("fernapi/fern-ruby-sdk", "ruby", "1.999.999");
            generator.outputMode = FernFiddle.OutputMode.githubV2(
                FernFiddle.GithubOutputModeV2.pullRequest({
                    owner: "acme",
                    repo: "acme-ruby",
                    publishInfo: FernFiddle.GithubPublishInfo.rubygems({
                        registryUrl: "https://rubygems.org/",
                        packageName: "acme",
                        apiKey: "rubygems-api-key"
                    })
                })
            );

            const [prepared] = prepareFernSdkGenApiRoutes({
                generators: [generator],
                enabled: false,
                requireEnvVars: false,
                isPreview: false
            });

            expect(prepared?.error).toBeUndefined();
        });

        it("fails remote generation before source preparation or target work", async () => {
            const getSpecsTarGzBuffer = vi.fn();
            const runInteractiveTask = vi.fn();

            await expect(
                runRemoteGenerationForAPIWorkspace({
                    projectConfig: { organization: "acme" } as never,
                    organization: "acme",
                    workspace: { workspaceName: "petstore", generatorsConfiguration: undefined } as never,
                    context: { logger: { warn: vi.fn() }, runInteractiveTask } as never,
                    generatorGroup: {
                        groupName: "ruby",
                        generators: [directRubyGemsGenerator()],
                        audiences: { type: "all" }
                    } as never,
                    version: "1.2.3",
                    shouldLogS3Url: false,
                    token: { value: "token" } as never,
                    whitelabel: undefined,
                    replay: undefined,
                    absolutePathToPreview: undefined,
                    mode: undefined,
                    fernignorePath: undefined,
                    skipFernignore: true,
                    dynamicIrOnly: false,
                    validateWorkspace: false,
                    retryRateLimited: false,
                    requireEnvVars: true,
                    getSpecsTarGzBuffer
                })
            ).rejects.toThrow("Direct RubyGems publishing is not supported");
            expect(getSpecsTarGzBuffer).not.toHaveBeenCalled();
            expect(runInteractiveTask).not.toHaveBeenCalled();
            expect(runGenerator).not.toHaveBeenCalled();
        });
    });

    it("removes a post-barrier automation failure without cancelling valid undispatched siblings", async () => {
        const remove = vi.spyOn(FernSdkGenApiBatch.prototype, "remove");
        const cancel = vi.spyOn(FernSdkGenApiBatch.prototype, "cancel");

        const result = await runMixedFailure("post-barrier");

        expect(result.recordSuccess).toHaveBeenCalledTimes(1);
        expect(result.recordFailure).toHaveBeenCalledTimes(1);
        expect(remove).toHaveBeenCalledWith("1", expect.objectContaining({ message: "post-barrier target failure" }));
        expect(cancel).not.toHaveBeenCalled();
    });

    it("cancels the batch for a post-barrier non-automation failure", async () => {
        const cancel = vi.spyOn(FernSdkGenApiBatch.prototype, "cancel");

        await expect(runMixedFailure("post-barrier", { automation: false })).rejects.toThrow(
            "post-barrier target failure"
        );
        expect(cancel).toHaveBeenCalledWith(expect.objectContaining({ message: "post-barrier target failure" }));
    });
});
