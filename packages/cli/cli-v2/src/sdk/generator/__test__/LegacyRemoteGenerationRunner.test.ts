import { type Audiences, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createSpecsTarGzArchive } from "@fern-api/local-workspace-runner";
import { createMockTaskContext } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@fern-api/local-workspace-runner", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/local-workspace-runner")>()),
    createSpecsTarGzArchive: vi.fn()
}));

import { createCliV2SourceArchives } from "../LegacyRemoteGenerationRunner.js";

describe("createCliV2SourceArchives", () => {
    beforeEach(() => {
        vi.mocked(createSpecsTarGzArchive)
            .mockReset()
            .mockResolvedValue({
                buffer: Buffer.from("source"),
                manifest: { specs: [] }
            });
    });

    it("preserves selected audiences when creating the source archive", async () => {
        const workspace = new OSSWorkspace({
            specs: [],
            allSpecs: [],
            absoluteFilePath: AbsoluteFilePath.of("/tmp/fern"),
            cliVersion: "0.0.0",
            generatorsConfiguration: undefined,
            workspaceName: "petstore",
            changelog: undefined
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
        const audiences: Audiences = { type: "select", audiences: ["public", "partner"] };
        const context = createMockTaskContext();

        await createCliV2SourceArchives({
            workspace,
            context,
            audiences,
            requests: [
                {
                    generatorIndex: 0,
                    generatorInvocation,
                    sdkGenApiRoute: {
                        generatorId: generatorInvocation.name,
                        language: "typescript",
                        requestedVersion: generatorInvocation.version,
                        cutoverVersion: "4.0.0",
                        configKind: "sdk-config-v1",
                        payloadKind: "sdk-config-v1"
                    }
                }
            ]
        });

        expect(createSpecsTarGzArchive).toHaveBeenCalledWith({
            specs: [],
            context,
            audiences
        });
    });
});
