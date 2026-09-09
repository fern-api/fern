import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { NOOP_LOGGER } from "@fern-api/logger";
import { createMockTaskContext, type InteractiveTaskContext, TaskAbortSignal } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { parseSdkConfigV1, validateSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    checkVersionDoesNotAlreadyExist: vi.fn(),
    computeSemanticVersion: vi.fn(),
    convertIrToFdrApi: vi.fn(),
    createFdrService: vi.fn(),
    createVenusService: vi.fn(),
    detectAirGappedMode: vi.fn(),
    generateIntermediateRepresentation: vi.fn(),
    runFernSdkGenApiBuild: vi.fn()
}));

vi.mock("@fern-api/api-workspace-commons", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/api-workspace-commons")>()),
    checkVersionDoesNotAlreadyExist: mocks.checkVersionDoesNotAlreadyExist,
    computeSemanticVersion: mocks.computeSemanticVersion
}));

vi.mock("@fern-api/core", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/core")>()),
    createFdrService: mocks.createFdrService,
    createVenusService: mocks.createVenusService
}));

vi.mock("@fern-api/ir-generator", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/ir-generator")>()),
    generateIntermediateRepresentation: mocks.generateIntermediateRepresentation
}));

vi.mock("@fern-api/ir-utils", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/ir-utils")>()),
    getOriginalName: () => "Petstore"
}));

vi.mock("@fern-api/lazy-fern-workspace", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/lazy-fern-workspace")>()),
    detectAirGappedMode: mocks.detectAirGappedMode
}));

vi.mock("@fern-api/register", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/register")>()),
    convertIrToFdrApi: mocks.convertIrToFdrApi
}));

vi.mock("../fernSdkGenApi.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../fernSdkGenApi.js")>()),
    runFernSdkGenApiBuild: mocks.runFernSdkGenApiBuild
}));

import { runRemoteGenerationForGenerator } from "../runRemoteGenerationForGenerator.js";
import type { LoadedSdkConfig } from "../sdkConfigInput.js";

describe("runRemoteGenerationForGenerator with SDK Config", () => {
    beforeEach(() => {
        vi.stubEnv("IGNORE_GIT_IN_METADATA", "true");
        vi.clearAllMocks();
        mocks.computeSemanticVersion.mockResolvedValue("legacy-computed-version");
        mocks.generateIntermediateRepresentation.mockReturnValue({
            apiName: "Petstore",
            specVersion: "2024-01-01",
            selfHosted: false
        });
        mocks.runFernSdkGenApiBuild.mockResolvedValue({
            createdSnippets: false,
            snippetsS3PreSignedReadUrl: undefined,
            actualVersion: "1.0.0",
            pullRequestUrl: undefined,
            noChangesDetected: undefined,
            publishTarget: undefined
        });
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("uses the parsed SDK Config default version and skips every FDR path", async () => {
        await runRemoteGenerationForGenerator(createInput(createSdkConfig()));

        expect(mocks.computeSemanticVersion).not.toHaveBeenCalled();
        expect(mocks.runFernSdkGenApiBuild).toHaveBeenCalledWith(expect.objectContaining({ sdkVersion: "1.0.0" }));
        expect(mocks.generateIntermediateRepresentation).toHaveBeenCalledWith(
            expect.objectContaining({ version: "1.0.0" })
        );
        expect(mocks.createFdrService).not.toHaveBeenCalled();
        expect(mocks.detectAirGappedMode).not.toHaveBeenCalled();
        expect(mocks.createVenusService).not.toHaveBeenCalled();
        expect(mocks.convertIrToFdrApi).not.toHaveBeenCalled();
    });

    it("uses the matching target SDK version override", async () => {
        await runRemoteGenerationForGenerator(createInput(createSdkConfig("2.3.4")));

        expect(mocks.runFernSdkGenApiBuild).toHaveBeenCalledWith(expect.objectContaining({ sdkVersion: "2.3.4" }));
        expect(mocks.computeSemanticVersion).not.toHaveBeenCalled();
    });

    it("gives an explicit CLI SDK version precedence over SDK Config", async () => {
        mocks.runFernSdkGenApiBuild.mockResolvedValue({
            createdSnippets: false,
            snippetsS3PreSignedReadUrl: undefined,
            actualVersion: "9.9.9",
            pullRequestUrl: undefined,
            noChangesDetected: undefined,
            publishTarget: undefined
        });

        await runRemoteGenerationForGenerator(createInput(createSdkConfig("2.3.4"), "9.9.9"));

        expect(mocks.runFernSdkGenApiBuild).toHaveBeenCalledWith(expect.objectContaining({ sdkVersion: "9.9.9" }));
        expect(mocks.checkVersionDoesNotAlreadyExist).toHaveBeenCalledWith(
            expect.objectContaining({ version: "9.9.9" })
        );
        expect(mocks.computeSemanticVersion).not.toHaveBeenCalled();
    });

    it("rejects dynamic IR-only mode without touching FDR", async () => {
        const input = createInput(createSdkConfig());

        await expect(runRemoteGenerationForGenerator({ ...input, dynamicIrOnly: true })).rejects.toBeInstanceOf(
            TaskAbortSignal
        );
        expect(mocks.createFdrService).not.toHaveBeenCalled();
        expect(mocks.detectAirGappedMode).not.toHaveBeenCalled();
        expect(mocks.runFernSdkGenApiBuild).not.toHaveBeenCalled();
    });
});

function createInput(
    sdkConfig: LoadedSdkConfig,
    version?: string
): Parameters<typeof runRemoteGenerationForGenerator>[0] {
    const baseContext = createMockTaskContext({ logger: NOOP_LOGGER });
    const interactiveTaskContext: InteractiveTaskContext = {
        ...baseContext,
        setSubtitle: () => undefined
    };
    const absoluteFilePath = AbsoluteFilePath.of("/tmp/fern/api");
    const workspace = new FernWorkspace({
        absoluteFilePath,
        cliVersion: "0.0.0",
        workspaceName: "petstore",
        generatorsConfiguration: undefined,
        dependenciesConfiguration: { dependencies: {} },
        definition: {
            absoluteFilePath,
            rootApiFile: {
                rawContents: "name: Petstore\n",
                contents: { name: "Petstore" },
                defaultUrl: undefined
            },
            namedDefinitionFiles: {},
            packageMarkers: {},
            importedDefinitions: {}
        }
    });
    const generatorInvocation: generatorsYml.GeneratorInvocation = {
        name: "fernapi/fern-typescript-sdk",
        version: "4.0.0",
        config: {},
        outputMode: FernFiddle.remoteGen.OutputMode.downloadFiles({}),
        automation: { generate: false, upgrade: false, preview: false, verify: false },
        containerImage: undefined,
        irVersionOverride: undefined,
        absolutePathToLocalOutput: AbsoluteFilePath.of("/tmp/generated-sdk"),
        absolutePathToLocalSnippets: undefined,
        keywords: [],
        smartCasing: true,
        smartCasingDigitWordBoundary: false,
        disableExamples: false,
        language: "typescript",
        publishMetadata: undefined,
        readme: undefined,
        settings: undefined
    };

    return {
        projectConfig: {
            _absolutePath: AbsoluteFilePath.of("/tmp/fern/fern.config.json"),
            rawConfig: { organization: "acme", version: "0.0.0" },
            organization: "acme",
            version: "0.0.0"
        },
        organization: "acme",
        workspace,
        interactiveTaskContext,
        generatorInvocation,
        version,
        audiences: { type: "all" },
        shouldLogS3Url: false,
        token: { type: "organization", value: "token" },
        whitelabel: undefined,
        replay: undefined,
        irVersionOverride: undefined,
        absolutePathToPreview: undefined,
        readme: undefined,
        fernignorePath: undefined,
        dynamicIrOnly: false,
        retryRateLimited: false,
        requireEnvVars: true,
        specsTarGzBuffer: Buffer.from("source"),
        sdkGenApiSourceArchive: {
            buffer: Buffer.from("source"),
            manifest: { specs: [{ type: "openapi", specPath: "/fern/specs/openapi0.json" }] },
            specIndexes: [0]
        },
        sdkGenApiRoute: {
            generatorId: generatorInvocation.name,
            language: "typescript",
            requestedVersion: generatorInvocation.version,
            cutoverVersion: "4.0.0",
            configKind: "sdk-config-v1",
            payloadKind: "sdk-config-v1"
        },
        sdkConfig,
        sdkGenApiTargetIdSeed: "0"
    };
}

function createSdkConfig(targetSdkVersion?: string): LoadedSdkConfig {
    const document = validateSdkConfigV1({
        schemaVersion: "sdk-config/v1",
        sdkName: "Acme SDK",
        source: { specs: [{ id: "api", type: "openapi", path: "./openapi.yml" }] },
        output: { delivery: "zip" },
        targets: [
            {
                language: "typescript",
                ...(targetSdkVersion != null ? { sdkVersion: targetSdkVersion } : {})
            }
        ]
    });
    return {
        absolutePath: AbsoluteFilePath.of("/tmp/fern/sdk-config.yml"),
        body: Buffer.from(JSON.stringify(document)),
        config: parseSdkConfigV1(document)
    };
}
