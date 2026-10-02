import { gunzipSync, gzipSync } from "node:zlib";
import type { generatorsYml } from "@fern-api/configuration";
import { CliError } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { validateSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import { beforeEach, describe, expect, it, vi } from "vitest";

const generateIntermediateRepresentation = vi.hoisted(() => vi.fn());
const migrateIntermediateRepresentationForInvocation = vi.hoisted(() =>
    vi.fn(async ({ intermediateRepresentation }) => intermediateRepresentation)
);

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

function prepareRoute(generatorInvocation: generatorsYml.GeneratorInvocation) {
    return prepareFernSdkGenApiRoutes({
        generators: [generatorInvocation],
        enabled: true,
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
