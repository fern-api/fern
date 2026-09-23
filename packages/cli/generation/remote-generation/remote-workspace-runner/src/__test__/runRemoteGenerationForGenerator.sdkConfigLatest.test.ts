import { gzipSync } from "node:zlib";
import type { generatorsYml } from "@fern-api/configuration";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { validateSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import { beforeEach, describe, expect, it, vi } from "vitest";

const generateIntermediateRepresentation = vi.hoisted(() => vi.fn());

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
        vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", "https://sdk-gen-api.test");
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
