import type { OpenAPISpec, Spec } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { LazyFernWorkspace, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import type { InteractiveTaskContext, TaskContext } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { noop } from "lodash-es";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

import { mapFernGroupToSdkConfig } from "../mapFernGroupToSdkConfig.js";
import { resolveMigrationSourceSpecs } from "../projectMigrationSource.js";

const CLI_VERSION = "0.0.0";
const COMPOSED_WORKSPACE = join(
    AbsoluteFilePath.of(path.dirname(fileURLToPath(import.meta.url))),
    RelativeFilePath.of("fixtures/composed-workspace/unioned")
);

function createTaskContextRunningInteractiveTasks(): TaskContext {
    const context = createMockTaskContext();
    const interactiveContext: InteractiveTaskContext = { ...context, setSubtitle: noop };
    return {
        ...context,
        runInteractiveTask: async (_options, run) => {
            await run(interactiveContext);
            return true;
        }
    };
}

function openApiSpec(absoluteFilepath: string): OpenAPISpec {
    return {
        type: "openapi",
        absoluteFilepath: AbsoluteFilePath.of(absoluteFilepath),
        absoluteFilepathToOverrides: undefined,
        absoluteFilepathToOverlays: undefined,
        source: { type: "openapi", file: AbsoluteFilePath.of(absoluteFilepath) }
    };
}

async function composedWorkspace(): Promise<LazyFernWorkspace> {
    const specsByDirectoryName: Record<string, Spec[]> = {
        "empathic-voice-interface": [
            openApiSpec(join(COMPOSED_WORKSPACE, RelativeFilePath.of("../empathic-voice-interface/evi-openapi.json")))
        ],
        tts: [openApiSpec(join(COMPOSED_WORKSPACE, RelativeFilePath.of("../tts/tts-openapi.json")))]
    };
    const workspace = new LazyFernWorkspace({
        absoluteFilePath: COMPOSED_WORKSPACE,
        generatorsConfiguration: undefined,
        workspaceName: "unioned",
        cliVersion: CLI_VERSION,
        context: createTaskContextRunningInteractiveTasks(),
        loadAPIWorkspace: async ({ absolutePathToWorkspace }) => {
            const specs = specsByDirectoryName[path.basename(absolutePathToWorkspace)];
            if (specs == null) {
                return { didSucceed: false, failures: {} };
            }
            return {
                didSucceed: true,
                workspace: new OSSWorkspace({
                    absoluteFilePath: AbsoluteFilePath.of(absolutePathToWorkspace),
                    allSpecs: specs,
                    specs: specs.filter((spec): spec is OpenAPISpec => spec.type === "openapi"),
                    generatorsConfiguration: undefined,
                    workspaceName: undefined,
                    cliVersion: CLI_VERSION
                })
            };
        }
    });
    return workspace;
}

async function composedWorkspaceDefinition() {
    const workspace = await composedWorkspace();
    const fernWorkspace = await workspace.toFernWorkspace({ context: createTaskContextRunningInteractiveTasks() });
    return fernWorkspace.definition;
}

function typescriptGenerator(): generatorsYml.GeneratorInvocation {
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

describe("SDK Config from a composed workspace", () => {
    it("carries the composing workspace's auth scheme, which no dependency spec declares", async () => {
        const result = mapFernGroupToSdkConfig({
            fernWorkspace: { definition: await composedWorkspaceDefinition() },
            group: {
                groupName: "ts-sdk",
                audiences: { type: "all" },
                generators: [typescriptGenerator()],
                reviewers: undefined
            },
            source: { specs: [{ id: "evi", type: "openapi", path: "evi-openapi.json" }] }
        });

        expect(result.sdkConfig.api?.auth?.schemes).toEqual([
            {
                type: "api-key",
                id: "HeaderAuthScheme",
                location: "header",
                name: "X-Hume-Api-Key",
                environmentVariable: "HUME_API_KEY"
            }
        ]);
    });

    it("carries the composing workspace's environments and default url", async () => {
        const result = mapFernGroupToSdkConfig({
            fernWorkspace: { definition: await composedWorkspaceDefinition() },
            group: {
                groupName: "ts-sdk",
                audiences: { type: "all" },
                generators: [typescriptGenerator()],
                reviewers: undefined
            },
            source: { specs: [{ id: "evi", type: "openapi", path: "evi-openapi.json" }] }
        });

        expect(result.sdkConfig.api?.defaultEnvironment).toBe("prod");
        expect(result.sdkConfig.api?.baseUrl).toBe("Base");
        expect(result.sdkConfig.api?.environments).toEqual([
            {
                name: "prod",
                urls: [
                    { name: "Base", url: "https://api.hume.ai/" },
                    { name: "evi", url: "wss://api.hume.ai/v0/evi" },
                    { name: "stream", url: "wss://api.hume.ai/v0/stream" },
                    { name: "tts", url: "wss://api.hume.ai/v0/tts" }
                ]
            }
        ]);
    });

    it("resolves migration source specs namespaced by dependency, with AsyncAPI detected as such", async () => {
        const workspace = await composedWorkspace();
        const fernWorkspace = await workspace.toFernWorkspace({
            context: createTaskContextRunningInteractiveTasks()
        });

        const specs = resolveMigrationSourceSpecs({
            workspace,
            fernWorkspace,
            generator: typescriptGenerator()
        });

        expect(specs.map((spec) => [spec.namespace, spec.type])).toEqual([
            ["empathic-voice", "openapi"],
            ["tts", "openapi"]
        ]);
    });
});
