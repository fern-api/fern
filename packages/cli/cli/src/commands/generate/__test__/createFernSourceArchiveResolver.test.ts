import { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { ConjureWorkspace, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import {
    createGroupedSpecsTarGzArchiveSettled,
    validateSdkConfigImportSettings
} from "@fern-api/local-workspace-runner";
import { type FernSourceArchiveRequest } from "@fern-api/remote-workspace-runner";
import { createMockTaskContext } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFernSourceArchiveResolver } from "../createFernSourceArchiveResolver.js";

vi.mock("@fern-api/local-workspace-runner", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/local-workspace-runner")>()),
    createGroupedSpecsTarGzArchiveSettled: vi.fn(),
    validateSdkConfigImportSettings: vi.fn()
}));

function makeGenerator(): generatorsYml.GeneratorInvocation {
    return {
        name: "fernapi/fern-typescript-sdk",
        version: "4.0.0",
        config: {},
        outputMode: FernFiddle.remoteGen.OutputMode.downloadFiles({}),
        automation: { generate: false, upgrade: false, preview: false, verify: false },
        containerImage: undefined,
        irVersionOverride: undefined,
        absolutePathToLocalOutput: AbsoluteFilePath.of("/tmp/test-output"),
        absolutePathToLocalSnippets: undefined,
        keywords: undefined,
        smartCasing: false,
        smartCasingDigitWordBoundary: false,
        disableExamples: false,
        language: "typescript",
        publishMetadata: undefined,
        readme: undefined,
        settings: undefined
    };
}

describe("createFernSourceArchiveResolver", () => {
    beforeEach(() => {
        vi.mocked(createGroupedSpecsTarGzArchiveSettled).mockReset();
        vi.mocked(validateSdkConfigImportSettings).mockReset();
    });

    it("returns an actionable error when the workspace cannot expose source specs", async () => {
        const context = createMockTaskContext();
        const generatorInvocation = makeGenerator();
        const workspace = new ConjureWorkspace({
            context,
            generatorsConfiguration: undefined,
            workspaceName: "conjure-api",
            cliVersion: "0.0.0",
            absoluteFilePath: AbsoluteFilePath.of("/tmp/conjure-api"),
            relativePathToConjureDirectory: RelativeFilePath.of("conjure")
        });
        const group: generatorsYml.GeneratorGroup = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [generatorInvocation],
            reviewers: undefined
        };
        const request: FernSourceArchiveRequest = {
            generatorIndex: 3,
            sdkConfigTargetIndex: 1,
            generatorInvocation,
            sdkGenApiRoute: {
                generatorId: generatorInvocation.name,
                language: "typescript",
                requestedVersion: generatorInvocation.version,
                cutoverVersion: "4.0.0",
                configKind: "sdk-config-v1",
                payloadKind: "sdk-config-v1"
            }
        };

        const resolution = await createFernSourceArchiveResolver({ workspace, context, group })([request]);

        expect(resolution.sourceArchives).toEqual(new Map());
        expect(resolution.errors.get(3)).toMatchObject({
            message:
                "Generator index 3 (fernapi/fern-typescript-sdk) requires a source archive, but workspace type conjure does not expose source specs"
        });
    });

    it("preserves the preparation error when archive outcomes violate the invariant", async () => {
        const context = createMockTaskContext();
        const generatorInvocation = makeGenerator();
        const workspace = new OSSWorkspace({
            allSpecs: [],
            specs: [],
            generatorsConfiguration: undefined,
            workspaceName: "openapi-api",
            cliVersion: "0.0.0",
            absoluteFilePath: AbsoluteFilePath.of("/tmp/openapi-api")
        });
        const group: generatorsYml.GeneratorGroup = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [generatorInvocation],
            reviewers: undefined
        };
        const request: FernSourceArchiveRequest = {
            generatorIndex: 1,
            sdkConfigTargetIndex: 0,
            generatorInvocation,
            sdkGenApiRoute: {
                generatorId: generatorInvocation.name,
                language: "typescript",
                requestedVersion: generatorInvocation.version,
                cutoverVersion: "4.0.0",
                configKind: "sdk-config-v1",
                payloadKind: "sdk-config-v1"
            }
        };
        const preparationError = new Error("source preparation failed");
        vi.mocked(createGroupedSpecsTarGzArchiveSettled).mockResolvedValue({
            archive: {
                buffer: Buffer.alloc(0),
                manifest: { specs: [] },
                specIndexesByGeneratorIndex: new Map([[1, []]])
            },
            errorsByGeneratorIndex: new Map([[1, preparationError]])
        });

        await expect(
            createFernSourceArchiveResolver({
                workspace,
                context,
                group,
                sdkConfigV1: {
                    sdkName: "api",
                    sdkVersion: "1.0.0",
                    audiences: [],
                    targets: [
                        { body: Buffer.from("{}"), language: "typescript", clientPathParameterStyle: "inline" },
                        { body: Buffer.from("{}"), language: "typescript", clientPathParameterStyle: "wrapped" }
                    ]
                }
            })([request])
        ).rejects.toMatchObject({
            message: "Generator index 1 produced both a source archive and a source preparation error",
            cause: preparationError
        });
        expect(createGroupedSpecsTarGzArchiveSettled).toHaveBeenCalledWith(
            expect.objectContaining({ audiences: { type: "select", audiences: [] } })
        );
        expect(validateSdkConfigImportSettings).toHaveBeenCalledWith([], {
            clientPathParameterStyle: "inline"
        });
    });

    it("uses the selected target path parameter style and falls back to the root style", async () => {
        const context = createMockTaskContext();
        const generatorInvocation = makeGenerator();
        const workspace = new OSSWorkspace({
            allSpecs: [],
            specs: [],
            generatorsConfiguration: undefined,
            workspaceName: "openapi-api",
            cliVersion: "0.0.0",
            absoluteFilePath: AbsoluteFilePath.of("/tmp/openapi-api")
        });
        const group: generatorsYml.GeneratorGroup = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [generatorInvocation],
            reviewers: undefined
        };
        const route = {
            generatorId: generatorInvocation.name,
            language: "typescript" as const,
            requestedVersion: generatorInvocation.version,
            cutoverVersion: "4.0.0",
            configKind: "sdk-config-v1" as const,
            payloadKind: "sdk-config-v1" as const
        };
        const requests: FernSourceArchiveRequest[] = [
            { generatorIndex: 0, sdkConfigTargetIndex: 1, generatorInvocation, sdkGenApiRoute: route },
            { generatorIndex: 1, generatorInvocation, sdkGenApiRoute: route }
        ];
        vi.mocked(createGroupedSpecsTarGzArchiveSettled).mockResolvedValue({
            archive: {
                buffer: Buffer.alloc(0),
                manifest: { specs: [] },
                specIndexesByGeneratorIndex: new Map([
                    [0, []],
                    [1, []]
                ])
            },
            errorsByGeneratorIndex: new Map()
        });

        await createFernSourceArchiveResolver({
            workspace,
            context,
            group,
            sdkConfigV1: {
                sdkName: "api",
                sdkVersion: "1.0.0",
                clientPathParameterStyle: "inline",
                targets: [
                    { body: Buffer.from("{}"), language: "typescript" },
                    { body: Buffer.from("{}"), language: "typescript", clientPathParameterStyle: "wrapped" }
                ]
            }
        })(requests);

        expect(validateSdkConfigImportSettings).toHaveBeenNthCalledWith(1, [], {
            clientPathParameterStyle: "wrapped"
        });
        expect(validateSdkConfigImportSettings).toHaveBeenNthCalledWith(2, [], {
            clientPathParameterStyle: "inline"
        });
    });
});
