import type { OpenAPISpec, Spec } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import type { InteractiveTaskContext, TaskContext } from "@fern-api/task-context";
import { noop } from "lodash-es";
import path from "path";
import { fileURLToPath } from "url";

import { LazyFernWorkspace } from "../LazyFernWorkspace.js";
import { OSSWorkspace } from "../OSSWorkspace.js";
import { LoadAPIWorkspace } from "../utils/loadAPIWorkspace.js";
import { createMockTaskContext } from "./helpers/createMockTaskContext.js";

const CLI_VERSION = "0.0.0";
const FIXTURES = join(
    AbsoluteFilePath.of(path.dirname(fileURLToPath(import.meta.url))),
    RelativeFilePath.of("fixtures")
);
const COMPOSED_WORKSPACE = join(FIXTURES, RelativeFilePath.of("composed-workspace/unioned"));

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

function namespaceOf(spec: Spec): string | undefined {
    return spec.type === "protobuf" ? undefined : spec.namespace;
}

function filenameOf(spec: Spec): string {
    return spec.type === "protobuf"
        ? spec.relativeFilepathToProtobufRoot
        : (spec.absoluteFilepath.split("/").pop() ?? "");
}

function loadWorkspacesExposing(specsByDirectoryName: Record<string, Spec[]>): LoadAPIWorkspace {
    return async ({ absolutePathToWorkspace }) => {
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
    };
}

function composedWorkspace(loadAPIWorkspace: LoadAPIWorkspace): LazyFernWorkspace {
    return new LazyFernWorkspace({
        absoluteFilePath: COMPOSED_WORKSPACE,
        generatorsConfiguration: undefined,
        workspaceName: "unioned",
        cliVersion: CLI_VERSION,
        context: createTaskContextRunningInteractiveTasks(),
        loadAPIWorkspace
    });
}

describe("LazyFernWorkspace source specs", () => {
    const evi = openApiSpec("/hume/empathic-voice-interface/evi-openapi.json");
    const eviAsync = openApiSpec("/hume/empathic-voice-interface/evi-asyncapi.json");
    const tts = openApiSpec("/hume/tts/tts-openapi.json");

    it("exposes each dependency's specs namespaced by the package marker directory", async () => {
        const workspace = composedWorkspace(
            loadWorkspacesExposing({
                "empathic-voice-interface": [evi, eviAsync],
                tts: [tts]
            })
        );

        const specs = await workspace.getSourceSpecs();

        expect(specs.map((spec) => [namespaceOf(spec), filenameOf(spec)])).toEqual([
            ["empathic-voice", "evi-openapi.json"],
            ["empathic-voice", "evi-asyncapi.json"],
            ["tts", "tts-openapi.json"]
        ]);
    });

    it("is discoverable through the source-spec capability the archive resolver checks", async () => {
        const { exposesSourceSpecs } = await import("@fern-api/api-workspace-commons");
        const workspace = composedWorkspace(loadWorkspacesExposing({ "empathic-voice-interface": [evi], tts: [tts] }));

        expect(exposesSourceSpecs(workspace)).toBe(true);
    });

    it("rejects a generator-level specs override, which composition cannot honour", async () => {
        const workspace = composedWorkspace(loadWorkspacesExposing({ "empathic-voice-interface": [evi], tts: [tts] }));

        await expect(workspace.getAllSpecsForGenerator([{ openapi: "other.json" }])).rejects.toThrow(
            /cannot be combined with a generator-level specs override/
        );
    });

    it("fails rather than yielding an empty archive when no dependency carries specs", async () => {
        const workspace = composedWorkspace(loadWorkspacesExposing({ "empathic-voice-interface": [], tts: [] }));

        await expect(workspace.getSourceSpecs()).rejects.toThrow(/exposes no source specs/);
    });

    it("returns the same specs on a second call, from the cached composition", async () => {
        let loads = 0;
        const workspace = composedWorkspace(async (args) => {
            loads += 1;
            return loadWorkspacesExposing({ "empathic-voice-interface": [evi], tts: [tts] })(args);
        });

        const first = await workspace.getSourceSpecs();
        const second = await workspace.getSourceSpecs();

        expect(second).toEqual(first);
        expect(loads).toBe(2);
    });
});
