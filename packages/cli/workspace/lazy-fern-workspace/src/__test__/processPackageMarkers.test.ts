import type { OpenAPISpec, Spec } from "@fern-api/api-workspace-commons";
import type { dependenciesYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import type { InteractiveTaskContext, TaskContext } from "@fern-api/task-context";
import { noop } from "lodash-es";

import { OSSWorkspace } from "../OSSWorkspace.js";
import { LoadAPIWorkspace } from "../utils/loadAPIWorkspace.js";
import { processPackageMarkers } from "../utils/processPackageMarkers.js";
import { validateStructureOfYamlFiles } from "../utils/validateStructureOfYamlFiles.js";
import { createMockTaskContext } from "./helpers/createMockTaskContext.js";

const CLI_VERSION = "0.0.0";

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

function namespaceOf(spec: Spec): string | undefined {
    return spec.type === "protobuf" ? undefined : spec.namespace;
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

function specBearingWorkspace(absoluteFilePath: string, specs: Spec[]): OSSWorkspace {
    return new OSSWorkspace({
        absoluteFilePath: AbsoluteFilePath.of(absoluteFilePath),
        allSpecs: specs,
        specs: specs.filter((spec): spec is OpenAPISpec => spec.type === "openapi"),
        generatorsConfiguration: undefined,
        workspaceName: undefined,
        cliVersion: CLI_VERSION
    });
}

function exportingPackageMarker(
    dependencyName: string
): validateStructureOfYamlFiles.SuccessfulResult["packageMarkers"][RelativeFilePath] {
    return {
        contents: { export: dependencyName },
        rawContents: `export: ${dependencyName}`,
        defaultUrl: undefined
    };
}

function structuralValidationResult(
    packageMarkers: Record<string, ReturnType<typeof exportingPackageMarker>>
): validateStructureOfYamlFiles.SuccessfulResult {
    return {
        didSucceed: true,
        rootApiFile: {
            contents: { name: "api" },
            rawContents: "name: api",
            defaultUrl: undefined
        },
        namedDefinitionFiles: {},
        packageMarkers: Object.fromEntries(
            Object.entries(packageMarkers).map(([path, marker]) => [RelativeFilePath.of(path), marker])
        )
    };
}

function localDependencies(dependencies: Record<string, string>): dependenciesYml.DependenciesConfiguration {
    return {
        dependencies: Object.fromEntries(
            Object.entries(dependencies).map(([name, absoluteFilepath]) => [
                name,
                {
                    type: "local",
                    absoluteFilepath: AbsoluteFilePath.of(absoluteFilepath),
                    path: `..${absoluteFilepath}`
                }
            ])
        )
    } as dependenciesYml.DependenciesConfiguration;
}

describe("processPackageMarkers", () => {
    const evi = openApiSpec("/hume/empathic-voice-interface/evi-openapi.json");
    const eviAsync = openApiSpec("/hume/empathic-voice-interface/evi-asyncapi.json");
    const tts = openApiSpec("/hume/tts/tts-openapi.json");

    function loadWorkspacesFrom(specsByPath: Record<string, Spec[]>): LoadAPIWorkspace {
        return async ({ absolutePathToWorkspace }) => {
            const specs = specsByPath[absolutePathToWorkspace];
            if (specs == null) {
                return { didSucceed: false, failures: {} };
            }
            return { didSucceed: true, workspace: specBearingWorkspace(absolutePathToWorkspace, specs) };
        };
    }

    it("carries every dependency's specs, namespaced by its package marker directory", async () => {
        const result = await processPackageMarkers({
            dependenciesConfiguration: localDependencies({
                "empathic-voice": "/hume/empathic-voice-interface",
                tts: "/hume/tts"
            }),
            structuralValidationResult: structuralValidationResult({
                "empathic-voice/__package__.yml": exportingPackageMarker("empathic-voice"),
                "tts/__package__.yml": exportingPackageMarker("tts")
            }),
            context: createTaskContextRunningInteractiveTasks(),
            cliVersion: CLI_VERSION,
            loadAPIWorkspace: loadWorkspacesFrom({
                "/hume/empathic-voice-interface": [evi, eviAsync],
                "/hume/tts": [tts]
            })
        });

        if (!result.didSucceed) {
            throw new Error(`Expected package markers to process, got failures: ${JSON.stringify(result.failures)}`);
        }

        expect(result.specs.map((spec) => [namespaceOf(spec), specFilename(spec)])).toEqual([
            ["empathic-voice", "evi-openapi.json"],
            ["empathic-voice", "evi-asyncapi.json"],
            ["tts", "tts-openapi.json"]
        ]);
    });

    it("reports a dependency that already namespaced its own specs, rather than overwriting it", async () => {
        const result = await processPackageMarkers({
            dependenciesConfiguration: localDependencies({ "empathic-voice": "/hume/empathic-voice-interface" }),
            structuralValidationResult: structuralValidationResult({
                "empathic-voice/__package__.yml": exportingPackageMarker("empathic-voice")
            }),
            context: createTaskContextRunningInteractiveTasks(),
            cliVersion: CLI_VERSION,
            loadAPIWorkspace: loadWorkspacesFrom({
                "/hume/empathic-voice-interface": [
                    { ...evi, namespace: "chat" },
                    { ...eviAsync, namespace: "chat" },
                    { ...tts, namespace: "batch" }
                ]
            })
        });

        if (!result.didSucceed) {
            throw new Error(`Expected package markers to process, got failures: ${JSON.stringify(result.failures)}`);
        }

        expect(result.namespaceCollisions).toEqual([
            { compositionNamespace: "empathic-voice", dependencyNamespace: "batch" },
            { compositionNamespace: "empathic-voice", dependencyNamespace: "chat" }
        ]);
    });

    it("reports no collision when the dependency's specs are unnamespaced", async () => {
        const result = await processPackageMarkers({
            dependenciesConfiguration: localDependencies({ tts: "/hume/tts" }),
            structuralValidationResult: structuralValidationResult({
                "tts/__package__.yml": exportingPackageMarker("tts")
            }),
            context: createTaskContextRunningInteractiveTasks(),
            cliVersion: CLI_VERSION,
            loadAPIWorkspace: loadWorkspacesFrom({ "/hume/tts": [tts] })
        });

        if (!result.didSucceed) {
            throw new Error(`Expected package markers to process, got failures: ${JSON.stringify(result.failures)}`);
        }

        expect(result.namespaceCollisions).toEqual([]);
        expect(result.namespacesWithoutSpecs).toEqual([]);
    });

    it("names the composed dependencies that carried no specs", async () => {
        const result = await processPackageMarkers({
            dependenciesConfiguration: localDependencies({
                "empathic-voice": "/hume/empathic-voice-interface",
                tts: "/hume/tts"
            }),
            structuralValidationResult: structuralValidationResult({
                "empathic-voice/__package__.yml": exportingPackageMarker("empathic-voice"),
                "tts/__package__.yml": exportingPackageMarker("tts")
            }),
            context: createTaskContextRunningInteractiveTasks(),
            cliVersion: CLI_VERSION,
            loadAPIWorkspace: loadWorkspacesFrom({
                "/hume/empathic-voice-interface": [evi],
                "/hume/tts": []
            })
        });

        if (!result.didSucceed) {
            throw new Error(`Expected package markers to process, got failures: ${JSON.stringify(result.failures)}`);
        }

        expect(result.namespacesWithoutSpecs).toEqual(["tts"]);
    });

    it("namespaces by directory, not by the dependency name the marker exports", async () => {
        const result = await processPackageMarkers({
            dependenciesConfiguration: localDependencies({ "evi-dependency": "/hume/empathic-voice-interface" }),
            structuralValidationResult: structuralValidationResult({
                "empathic-voice/__package__.yml": exportingPackageMarker("evi-dependency")
            }),
            context: createTaskContextRunningInteractiveTasks(),
            cliVersion: CLI_VERSION,
            loadAPIWorkspace: loadWorkspacesFrom({ "/hume/empathic-voice-interface": [evi] })
        });

        if (!result.didSucceed) {
            throw new Error(`Expected package markers to process, got failures: ${JSON.stringify(result.failures)}`);
        }

        expect(result.specs.map(namespaceOf)).toEqual(["empathic-voice"]);
    });

    it("yields no specs when the composing workspace has no exporting package markers", async () => {
        const result = await processPackageMarkers({
            dependenciesConfiguration: localDependencies({}),
            structuralValidationResult: structuralValidationResult({}),
            context: createTaskContextRunningInteractiveTasks(),
            cliVersion: CLI_VERSION,
            loadAPIWorkspace: loadWorkspacesFrom({})
        });

        if (!result.didSucceed) {
            throw new Error(`Expected package markers to process, got failures: ${JSON.stringify(result.failures)}`);
        }

        expect(result.specs).toEqual([]);
    });

    it("yields no specs when a dependency workspace carries none", async () => {
        const result = await processPackageMarkers({
            dependenciesConfiguration: localDependencies({ tts: "/hume/tts" }),
            structuralValidationResult: structuralValidationResult({
                "tts/__package__.yml": exportingPackageMarker("tts")
            }),
            context: createTaskContextRunningInteractiveTasks(),
            cliVersion: CLI_VERSION,
            loadAPIWorkspace: loadWorkspacesFrom({ "/hume/tts": [] })
        });

        if (!result.didSucceed) {
            throw new Error(`Expected package markers to process, got failures: ${JSON.stringify(result.failures)}`);
        }

        expect(result.specs).toEqual([]);
    });

    it("fails without carrying specs when the dependency is absent from dependencies.yml", async () => {
        const result = await processPackageMarkers({
            dependenciesConfiguration: localDependencies({}),
            structuralValidationResult: structuralValidationResult({
                "tts/__package__.yml": exportingPackageMarker("tts")
            }),
            context: createTaskContextRunningInteractiveTasks(),
            cliVersion: CLI_VERSION,
            loadAPIWorkspace: loadWorkspacesFrom({})
        });

        expect(result.didSucceed).toBe(false);
    });
});

function specFilename(spec: Spec): string {
    if (spec.type === "protobuf") {
        return spec.relativeFilepathToProtobufRoot;
    }
    return spec.absoluteFilepath.split("/").slice(-1)[0] ?? "";
}
