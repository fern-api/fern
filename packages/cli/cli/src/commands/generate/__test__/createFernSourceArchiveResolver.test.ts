import { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { ConjureWorkspace, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createGroupedSpecsTarGzArchiveSettled } from "@fern-api/local-workspace-runner";
import { type FernSourceArchiveRequest } from "@fern-api/remote-workspace-runner";
import { createMockTaskContext } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFernSourceArchiveResolver } from "../createFernSourceArchiveResolver.js";

vi.mock("@fern-api/local-workspace-runner", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/local-workspace-runner")>()),
    createGroupedSpecsTarGzArchiveSettled: vi.fn()
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
            generatorIndex: 3,
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
                specIndexesByGeneratorIndex: new Map([[3, []]])
            },
            errorsByGeneratorIndex: new Map([[3, preparationError]])
        });

        await expect(createFernSourceArchiveResolver({ workspace, context, group })([request])).rejects.toMatchObject({
            message: "Generator index 3 produced both a source archive and a source preparation error",
            cause: preparationError
        });
    });
});
