import { gunzipSync, gzipSync } from "node:zlib";
import type { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { validateSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import { beforeEach, describe, expect, it, vi } from "vitest";

const generateIntermediateRepresentation = vi.hoisted(() => vi.fn());
const migrateIntermediateRepresentationForInvocation = vi.hoisted(() =>
    vi.fn(async ({ intermediateRepresentation }) => intermediateRepresentation)
);
const createAndStartJob = vi.hoisted(() => vi.fn());
const pollJobAndReportStatus = vi.hoisted(() => vi.fn());

vi.mock("@fern-api/api-workspace-commons", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/api-workspace-commons")>()),
    getOriginGitCommit: () => undefined,
    getOriginGitCommitIsDirty: () => false
}));

vi.mock("@fern-api/ir-generator", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/ir-generator")>()),
    generateIntermediateRepresentation
}));

vi.mock("@fern-api/ir-utils", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/ir-utils")>()),
    getOriginalName: () => "Petstore"
}));

vi.mock("@fern-api/register", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/register")>()),
    convertIrToFdrApi: () => ({})
}));

vi.mock("../migrateIntermediateRepresentationForInvocation.js", () => ({
    migrateIntermediateRepresentationForInvocation
}));

vi.mock("../createAndStartJob.js", () => ({ createAndStartJob }));
vi.mock("../pollJobAndReportStatus.js", () => ({ pollJobAndReportStatus }));

import { discoverLatestSdkGenApiGeneratorVersions } from "../discoverSdkGenApiGeneratorVersions.js";
import {
    createFernSdkGenApiRequest,
    type FernSdkGenApiBuildParameters,
    FernSdkGenApiPreparationBatch
} from "../fernSdkGenApi.js";
import type { FernSdkGenApiSourceArchive } from "../fernSdkGenApiSourceArchive.js";
import { prepareFernSdkGenApiRoutes } from "../runRemoteGenerationForAPIWorkspace.js";
import { runRemoteGenerationForGenerator } from "../runRemoteGenerationForGenerator.js";

describe("runRemoteGenerationForGenerator synthesized SDK Config latest", () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", "https://sdk-gen-api.test");
        migrateIntermediateRepresentationForInvocation.mockClear();
        createAndStartJob.mockReset().mockResolvedValue({ jobId: "job-1", taskIds: ["task-1"] });
        pollJobAndReportStatus.mockReset().mockResolvedValue(buildResponse());
        generateIntermediateRepresentation.mockReset().mockReturnValue({
            apiName: "Petstore",
            specVersion: "1.0.0"
        });
    });

    it("submits MCP latest as sdk-config-v1 without fernGenerator.version", async () => {
        const generatorInvocation = mcpInvocation();
        const [prepared] = prepareRoute(generatorInvocation);
        if (prepared?.route == null) {
            throw new Error("Expected an unpinned MCP SDK Config route");
        }
        const sourceArchive = archive();
        const run = vi.fn(async (parameters: FernSdkGenApiBuildParameters) => {
            expect(parameters.sdkGenApiRoute).toEqual(prepared.route);
            expect(parameters.payload.payloadKind).toBe("sdk-config-v1");
            expect(parameters.payload.body.toString("utf8")).not.toContain('"latest"');

            const request = createFernSdkGenApiRequest({
                apiName: parameters.apiName,
                organization: parameters.organization,
                cliVersion: parameters.cliVersion,
                generatorInvocation: parameters.generatorInvocation,
                sdkGenApiRoute: parameters.sdkGenApiRoute,
                sdkVersion: parameters.sdkVersion,
                apiVersion: parameters.apiVersion,
                specsTarGzBuffer: parameters.specsTarGzBuffer,
                payload: parameters.payload,
                requestedOutput: parameters.requestedOutput
            });
            expect(request.targets[0]).toMatchObject({
                payloadKind: "sdk-config-v1",
                fernGenerator: { id: "fernapi/fern-mcp-server" }
            });
            expect(request.targets[0]?.fernGenerator).not.toHaveProperty("version");
            return buildResponse();
        });

        const parameters = mcpRunParameters({ generatorInvocation, prepared, sourceArchive, run, version: "1.2.3" });

        await expect(runRemoteGenerationForGenerator(parameters)).resolves.toMatchObject({ actualVersion: "1.2.3" });
        expect(run).toHaveBeenCalledTimes(1);
    });

    it("submits a generators.yml MCP target with no version instead of asking for --version", async () => {
        const generatorInvocation = mcpInvocation();
        const [prepared] = prepareRoute(generatorInvocation);
        if (prepared?.route == null) {
            throw new Error("Expected an unpinned MCP SDK Config route");
        }
        const run = vi.fn((_parameters: FernSdkGenApiBuildParameters) => Promise.resolve(buildResponse()));
        const parameters = mcpRunParameters({
            generatorInvocation,
            prepared,
            sourceArchive: archive(),
            run,
            version: undefined
        });

        await expect(runRemoteGenerationForGenerator(parameters)).resolves.toMatchObject({ actualVersion: "1.2.3" });
        expect(run).toHaveBeenCalledTimes(1);
        // An MCP server has no package version, so sdk-gen-api resolves it.
        expect(run.mock.calls[0]?.[0].sdkVersion).toBeUndefined();
    });

    it("resolves generators.yml latest once for runtime bundle migration and request serialization", async () => {
        const generatorInvocation = typescriptInvocation();
        const intermediateRepresentation = {
            apiName: "Petstore",
            specVersion: "1.0.0",
            generationMetadata: {
                cliVersion: "0.0.0",
                generatorName: generatorInvocation.name,
                generatorVersion: "latest",
                generatorConfig: {}
            }
        };
        generateIntermediateRepresentation.mockReturnValue(intermediateRepresentation);
        const [prepared] = prepareRoute(generatorInvocation);
        if (prepared?.route == null || prepared.route.payloadKind !== "fern-runtime-bundle") {
            throw new Error("Expected an unpinned Fern runtime bundle route");
        }
        const sourceArchive = archive();
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                targets: [{ targetId: "generator", state: "RESOLVED", compatibleVersion: "3.99.4" }]
            })
        });
        vi.stubGlobal("fetch", fetchMock);
        const run = vi.fn(async (parameters: FernSdkGenApiBuildParameters) => {
            const bundle = JSON.parse(gunzipSync(parameters.payload.body).toString("utf8"));
            expect(JSON.stringify(bundle)).not.toContain('"latest"');
            expect(bundle.ir.generationMetadata.generatorVersion).toBe("3.99.4");
            expect(bundle.ir.publishConfig).toMatchObject({ type: "filesystem", generateFullProject: true });

            const request = createFernSdkGenApiRequest({
                apiName: parameters.apiName,
                organization: parameters.organization,
                cliVersion: parameters.cliVersion,
                generatorInvocation: parameters.generatorInvocation,
                resolvedGeneratorVersion: parameters.resolvedGeneratorVersion,
                sdkGenApiRoute: parameters.sdkGenApiRoute,
                sdkVersion: parameters.sdkVersion,
                apiVersion: parameters.apiVersion,
                specsTarGzBuffer: parameters.specsTarGzBuffer,
                payload: parameters.payload
            });
            expect(request.targets[0]?.fernGenerator).toEqual({
                id: "fernapi/fern-typescript-sdk",
                version: "3.99.4"
            });
            expect(JSON.stringify(request)).not.toContain('"latest"');
            return buildResponse();
        });

        await runRemoteGenerationForGenerator({
            projectConfig: { organization: "acme" } as never,
            organization: "acme",
            workspace: workspace() as never,
            interactiveTaskContext: context() as never,
            generatorInvocation,
            version: "1.2.3",
            audiences: { type: "all" },
            shouldLogS3Url: false,
            token: { value: "token" } as never,
            whitelabel: undefined,
            replay: undefined,
            irVersionOverride: undefined,
            absolutePathToPreview: undefined,
            isPreview: true,
            readme: undefined,
            fernignorePath: undefined,
            dynamicIrOnly: false,
            retryRateLimited: false,
            requireEnvVars: true,
            specsTarGzBuffer: sourceArchive.buffer,
            sdkGenApiSourceArchive: sourceArchive,
            sdkGenApiRoute: prepared.route,
            sdkGenApiPreparationBatch: new FernSdkGenApiPreparationBatch(["0"]),
            sdkGenApiBatch: { run } as never,
            sdkGenApiTargetIdSeed: "0",
            generateFullProject: true
        });

        const discoveryCalls = fetchMock.mock.calls.filter(([url]) =>
            String(url).includes("generator-versions/discover")
        );
        expect(discoveryCalls).toHaveLength(1);
        const discoveryRequest = JSON.parse(discoveryCalls[0]?.[1]?.body as string);
        expect(discoveryRequest.targets[0]).toEqual({
            targetId: "generator",
            generatorId: "fernapi/fern-typescript-sdk",
            language: "typescript",
            currentVersion: "latest",
            includeMajor: true
        });
        expect(migrateIntermediateRepresentationForInvocation).toHaveBeenCalledWith(
            expect.objectContaining({
                generatorInvocation: expect.objectContaining({ version: "3.99.4" })
            })
        );
        expect(generatorInvocation.version).toBe("latest");
        expect(intermediateRepresentation.generationMetadata.generatorVersion).toBe("latest");
    });

    describe("fern generate --preview with GitHub output", () => {
        const githubPush = () =>
            FernFiddle.OutputMode.githubV2(
                FernFiddle.GithubOutputModeV2.push({ owner: "acme", repo: "sdk", branch: "${SDK_BRANCH}" })
            );

        async function submittedTarget(overrides: Partial<Parameters<typeof runRemoteGenerationForGenerator>[0]>) {
            vi.stubEnv("SDK_BRANCH", "api-updates-293596b");
            const generatorInvocation = { ...typescriptInvocation(), version: "3.54.0", outputMode: githubPush() };
            const [prepared] = prepareFernSdkGenApiRoutes({
                generators: [generatorInvocation],
                isSdkGenApiEnabled: () => true,
                sdkConfigV1: overrides.sdkConfigV1,
                requireEnvVars: true,
                isPreview: true
            });
            if (prepared?.route == null) {
                throw new Error("Expected an sdk-gen-api route");
            }
            const sourceArchive = archive();
            let target: ReturnType<typeof createFernSdkGenApiRequest>["targets"][number] | undefined;
            const run = vi.fn(async (parameters: FernSdkGenApiBuildParameters) => {
                target = createFernSdkGenApiRequest({
                    apiName: parameters.apiName,
                    organization: parameters.organization,
                    cliVersion: parameters.cliVersion,
                    generatorInvocation: parameters.generatorInvocation,
                    sdkGenApiRoute: parameters.sdkGenApiRoute,
                    sdkVersion: parameters.sdkVersion,
                    specsTarGzBuffer: parameters.specsTarGzBuffer,
                    payload: parameters.payload,
                    requestedOutput: parameters.requestedOutput,
                    autoVersionPreviewOutput: parameters.autoVersionPreviewOutput,
                    githubOptions: parameters.githubOptions
                }).targets[0];
                return buildResponse();
            });
            await runRemoteGenerationForGenerator({
                projectConfig: { organization: "acme" } as never,
                organization: "acme",
                workspace: workspace() as never,
                interactiveTaskContext: context() as never,
                generatorInvocation: prepared.generatorInvocation,
                version: "1.2.3",
                audiences: { type: "all" },
                shouldLogS3Url: false,
                token: { value: "token" } as never,
                whitelabel: undefined,
                replay: undefined,
                irVersionOverride: undefined,
                absolutePathToPreview: AbsoluteFilePath.of("/tmp/fern-preview"),
                readme: undefined,
                fernignorePath: undefined,
                dynamicIrOnly: false,
                retryRateLimited: false,
                requireEnvVars: true,
                specsTarGzBuffer: sourceArchive.buffer,
                sdkGenApiSourceArchive: sourceArchive,
                sdkGenApiRoute: prepared.route,
                sdkGenApiPreparationBatch: new FernSdkGenApiPreparationBatch(["0"]),
                sdkGenApiBatch: { run } as never,
                sdkGenApiTargetIdSeed: "0",
                ...overrides
            });
            if (run.mock.calls.length !== 1) {
                throw new Error(`Expected one sdk-gen-api build, got ${run.mock.calls.length}`);
            }
            return target;
        }

        it("requests a download instead of a GitHub push with a blanked branch", async () => {
            await expect(submittedTarget({})).resolves.toMatchObject({ requestedOutput: { type: "download" } });
        });

        it("keeps AUTO and sends the GitHub context for semantic preview versioning", async () => {
            const target = await submittedTarget({ version: "AUTO" });

            expect(target?.requestedOutput).toEqual({ type: "download" });
            expect(target?.sdk).toEqual({ name: "Petstore", version: "AUTO" });
            expect(target?.autoVersionPreview).toEqual({
                github: expect.objectContaining({ type: "github", repository: "acme/sdk", mode: "push" })
            });
        });

        it("uses the sanitized GitHub context retained by the SDK Config preview loader", async () => {
            const target = await submittedTarget({
                version: undefined,
                sdkConfigV1: {
                    sdkName: "Petstore",
                    sdkVersion: "AUTO",
                    targets: [
                        {
                            body: Buffer.from('{"schemaVersion":"sdk-config/v1"}'),
                            language: "typescript",
                            generatorVersion: "4.0.0",
                            requestedOutput: { type: "download" },
                            autoVersionPreviewOutput: {
                                type: "github",
                                repository: "acme/sdk",
                                mode: "pull-request"
                            }
                        }
                    ]
                }
            });

            expect(target?.requestedOutput).toEqual({ type: "download" });
            expect(target?.sdk).toEqual({ name: "Petstore", version: "AUTO" });
            expect(target?.autoVersionPreview).toEqual({
                github: expect.objectContaining({ type: "github", repository: "acme/sdk", mode: "pull-request" })
            });
        });

        it("keeps the GitHub output when sdk preview pushes a preview branch", async () => {
            await expect(
                submittedTarget({
                    absolutePathToPreview: undefined,
                    isPreview: false,
                    fiddlePreview: true,
                    pushPreviewBranch: true
                })
            ).resolves.toMatchObject({
                requestedOutput: { type: "github", repository: "acme/sdk", mode: "push" }
            });
        });
    });

    it("keeps legacy Postman publication on Fiddle without sdk-gen-api output mapping", async () => {
        const generatorInvocation = {
            ...typescriptInvocation(),
            outputMode: FernFiddle.OutputMode.publishV2(
                FernFiddle.PublishOutputModeV2.postman({
                    apiKey: "postman-api-key",
                    workspaceId: "postman-workspace"
                })
            )
        };
        const sourceArchive = archive();

        await expect(
            runRemoteGenerationForGenerator({
                projectConfig: { organization: "acme" } as never,
                organization: "acme",
                workspace: workspace() as never,
                interactiveTaskContext: context() as never,
                generatorInvocation,
                version: "1.2.3",
                audiences: { type: "all" },
                shouldLogS3Url: false,
                token: { value: "token" } as never,
                whitelabel: undefined,
                replay: undefined,
                irVersionOverride: undefined,
                absolutePathToPreview: undefined,
                isPreview: false,
                readme: undefined,
                fernignorePath: undefined,
                dynamicIrOnly: false,
                retryRateLimited: false,
                requireEnvVars: true,
                specsTarGzBuffer: sourceArchive.buffer,
                sdkGenApiRoute: undefined,
                generateFullProject: true
            })
        ).resolves.toMatchObject({ actualVersion: "1.2.3" });

        expect(createAndStartJob).toHaveBeenCalledTimes(1);
        expect(createAndStartJob).toHaveBeenCalledWith(
            expect.objectContaining({ generatorInvocation, version: "1.2.3" })
        );
        expect(pollJobAndReportStatus).toHaveBeenCalledTimes(1);
    });

    it("rejects latest runtime resolution at the SDK Config cutover before migration or submission", async () => {
        const generatorInvocation = typescriptInvocation();
        const [prepared] = prepareRoute(generatorInvocation);
        if (prepared?.route == null || prepared.route.payloadKind !== "fern-runtime-bundle") {
            throw new Error("Expected an unpinned Fern runtime bundle route");
        }
        const sourceArchive = archive();
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    targets: [{ targetId: "generator", state: "RESOLVED", compatibleVersion: "4.0.0" }]
                })
            })
        );
        const failAndThrow = vi.fn((message: string | undefined, error?: unknown) => {
            throw error ?? new Error(message);
        });
        const run = vi.fn(async () => buildResponse());

        await expect(
            runRemoteGenerationForGenerator({
                projectConfig: { organization: "acme" } as never,
                organization: "acme",
                workspace: workspace() as never,
                interactiveTaskContext: { ...context(), failAndThrow } as never,
                generatorInvocation,
                version: "1.2.3",
                audiences: { type: "all" },
                shouldLogS3Url: false,
                token: { value: "token" } as never,
                whitelabel: undefined,
                replay: undefined,
                irVersionOverride: undefined,
                absolutePathToPreview: undefined,
                isPreview: true,
                readme: undefined,
                fernignorePath: undefined,
                dynamicIrOnly: false,
                retryRateLimited: false,
                requireEnvVars: true,
                specsTarGzBuffer: sourceArchive.buffer,
                sdkGenApiSourceArchive: sourceArchive,
                sdkGenApiRoute: prepared.route,
                sdkGenApiPreparationBatch: new FernSdkGenApiPreparationBatch(["0"]),
                sdkGenApiBatch: { run } as never,
                sdkGenApiTargetIdSeed: "0"
            })
        ).rejects.toThrow("Run `fern sdk migrate`");
        expect(failAndThrow).toHaveBeenCalledWith(
            expect.stringContaining(
                "SDK_CONFIG_V1_REQUIRED; generator=fernapi/fern-typescript-sdk; language=typescript; requestedVersion=4.0.0; cutoverVersion=4.0.0; receivedConfigKind=legacy-fern; expectedConfigKind=sdk-config-v1"
            ),
            undefined,
            { code: CliError.Code.ConfigError }
        );
        expect(migrateIntermediateRepresentationForInvocation).not.toHaveBeenCalled();
        expect(run).not.toHaveBeenCalled();
        expect(generatorInvocation.version).toBe("latest");
    });

    it("shares concurrent latest runtime discovery for the same coordinate", async () => {
        let resolveResponse: ((response: { ok: boolean; json: () => Promise<unknown> }) => void) | undefined;
        const fetchMock = vi.fn(
            () =>
                new Promise<{ ok: boolean; json: () => Promise<unknown> }>((resolve) => {
                    resolveResponse = resolve;
                })
        );
        vi.stubGlobal("fetch", fetchMock);
        const request = {
            origin: "https://sdk-gen-api.test",
            organization: "acme",
            token: { value: "token" } as never,
            generatorId: "fernapi/fern-typescript-sdk",
            language: "typescript"
        };

        const first = discoverLatestSdkGenApiGeneratorVersions(request);
        const second = discoverLatestSdkGenApiGeneratorVersions(request);

        expect(fetchMock).toHaveBeenCalledOnce();
        resolveResponse?.({
            ok: true,
            json: async () => ({
                targets: [{ targetId: "generator", state: "RESOLVED", compatibleVersion: "3.99.4" }]
            })
        });
        await expect(Promise.all([first, second])).resolves.toEqual([
            { targetId: "generator", state: "RESOLVED", compatibleVersion: "3.99.4" },
            { targetId: "generator", state: "RESOLVED", compatibleVersion: "3.99.4" }
        ]);
    });

    it("allows replay.enabled when sdkGenApiRoute is set", async () => {
        const generatorInvocation = mcpInvocation();
        const [prepared] = prepareRoute(generatorInvocation);
        if (prepared?.route == null) {
            throw new Error("Expected an unpinned MCP SDK Config route");
        }
        const sourceArchive = archive();
        const run = vi.fn(async () => buildResponse());
        const replay: generatorsYml.ReplayConfigSchema = { enabled: true };

        await expect(
            runRemoteGenerationForGenerator({
                projectConfig: { organization: "acme" } as never,
                organization: "acme",
                workspace: workspace() as never,
                interactiveTaskContext: context() as never,
                generatorInvocation,
                version: "1.2.3",
                audiences: { type: "all" },
                shouldLogS3Url: false,
                token: { value: "token" } as never,
                whitelabel: undefined,
                replay,
                irVersionOverride: undefined,
                absolutePathToPreview: undefined,
                isPreview: true,
                readme: undefined,
                fernignorePath: undefined,
                dynamicIrOnly: false,
                retryRateLimited: false,
                requireEnvVars: true,
                specsTarGzBuffer: sourceArchive.buffer,
                sdkGenApiSourceArchive: sourceArchive,
                sdkGenApiRoute: prepared.route,
                sdkGenApiPreparationBatch: new FernSdkGenApiPreparationBatch(["0"]),
                sdkGenApiBatch: { run } as never,
                sdkGenApiTargetIdSeed: "0",
                mapFernGroupToSdkConfig: () => ({
                    diagnostics: [],
                    sdkConfig: validateSdkConfigV1({
                        schemaVersion: "sdk-config/v1",
                        sdkName: "Petstore",
                        source: { specs: [{ id: "source-0", type: "openapi", path: "fern/specs/openapi0.json" }] },
                        targets: [{ language: "mcp", output: { delivery: "files" } }]
                    })
                })
            })
        ).resolves.toMatchObject({ actualVersion: "1.2.3" });
        expect(run).toHaveBeenCalledTimes(1);
    });
});

function mcpRunParameters({
    generatorInvocation,
    prepared,
    sourceArchive,
    run,
    version
}: {
    generatorInvocation: generatorsYml.GeneratorInvocation;
    prepared: NonNullable<ReturnType<typeof prepareRoute>[number]>;
    sourceArchive: FernSdkGenApiSourceArchive;
    run: (parameters: FernSdkGenApiBuildParameters) => Promise<ReturnType<typeof buildResponse>>;
    version: string | undefined;
}): Parameters<typeof runRemoteGenerationForGenerator>[0] {
    return {
        projectConfig: { organization: "acme" } as never,
        organization: "acme",
        workspace: workspace() as never,
        interactiveTaskContext: context() as never,
        generatorInvocation,
        version,
        audiences: { type: "all" },
        shouldLogS3Url: false,
        token: { value: "token" } as never,
        whitelabel: undefined,
        replay: undefined,
        irVersionOverride: undefined,
        absolutePathToPreview: undefined,
        isPreview: true,
        readme: undefined,
        fernignorePath: undefined,
        dynamicIrOnly: false,
        retryRateLimited: false,
        requireEnvVars: true,
        specsTarGzBuffer: sourceArchive.buffer,
        sdkGenApiSourceArchive: sourceArchive,
        sdkGenApiRoute: prepared.route,
        sdkGenApiPreparationBatch: new FernSdkGenApiPreparationBatch(["0"]),
        sdkGenApiBatch: { run } as never,
        sdkGenApiTargetIdSeed: "0",
        generateFullProject: true,
        mapFernGroupToSdkConfig: () => ({
            diagnostics: [],
            sdkConfig: validateSdkConfigV1({
                schemaVersion: "sdk-config/v1",
                sdkName: "Petstore",
                source: { specs: [{ id: "source-0", type: "openapi", path: "fern/specs/openapi0.json" }] },
                targets: [{ language: "mcp", output: { delivery: "files" } }]
            })
        })
    };
}

function prepareRoute(generatorInvocation: generatorsYml.GeneratorInvocation) {
    return prepareFernSdkGenApiRoutes({
        generators: [generatorInvocation],
        isSdkGenApiEnabled: () => true,
        requireEnvVars: true,
        isPreview: false
    });
}

function mcpInvocation(): generatorsYml.GeneratorInvocation {
    return {
        name: "fernapi/fern-mcp-server",
        version: "latest",
        language: "mcp",
        config: { target: "hosted", serverName: "Petstore" },
        keywords: [],
        smartCasing: false,
        smartCasingDigitWordBoundary: false,
        disableExamples: false,
        outputMode: FernFiddle.OutputMode.downloadFiles({})
    } as never;
}

function typescriptInvocation(): generatorsYml.GeneratorInvocation {
    return {
        name: "fernapi/fern-typescript-sdk",
        version: "latest",
        language: "typescript",
        config: {},
        keywords: [],
        smartCasing: false,
        smartCasingDigitWordBoundary: false,
        disableExamples: false,
        outputMode: FernFiddle.OutputMode.downloadFiles({})
    } as never;
}

function archive(): FernSdkGenApiSourceArchive {
    return {
        buffer: gzipSync(Buffer.from("archive")),
        manifest: { specs: [{ type: "openapi", specPath: "/fern/specs/openapi0.json" }] },
        specIndexes: [0]
    };
}

function workspace() {
    return {
        cliVersion: "0.0.0",
        getSources: () => [],
        definition: {
            rootApiFile: { contents: { name: "Petstore" } },
            specVersion: "1.0.0"
        }
    };
}

function context() {
    return {
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn() },
        failAndThrow: (message: string | undefined, error?: unknown) => {
            throw error ?? new Error(message);
        }
    };
}

function buildResponse() {
    return {
        createdSnippets: false as const,
        snippetsS3PreSignedReadUrl: undefined,
        actualVersion: "1.2.3",
        pullRequestUrl: undefined,
        noChangesDetected: undefined,
        publishTarget: undefined
    };
}
