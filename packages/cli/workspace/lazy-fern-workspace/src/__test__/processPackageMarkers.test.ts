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
    const users = openApiSpec("/apis/users-api/users-openapi.json");
    const usersAsync = openApiSpec("/apis/users-api/users-asyncapi.json");
    const payments = openApiSpec("/apis/payments-api/payments-openapi.json");

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
                users: "/apis/users-api",
                payments: "/apis/payments-api"
            }),
            structuralValidationResult: structuralValidationResult({
                "users/__package__.yml": exportingPackageMarker("users"),
                "payments/__package__.yml": exportingPackageMarker("payments")
            }),
            context: createTaskContextRunningInteractiveTasks(),
            cliVersion: CLI_VERSION,
            loadAPIWorkspace: loadWorkspacesFrom({
                "/apis/users-api": [users, usersAsync],
                "/apis/payments-api": [payments]
            })
        });

        if (!result.didSucceed) {
            throw new Error(`Expected package markers to process, got failures: ${JSON.stringify(result.failures)}`);
        }

        expect(result.specs.map((spec) => [namespaceOf(spec), specFilename(spec)])).toEqual([
            ["payments", "payments-openapi.json"],
            ["users", "users-openapi.json"],
            ["users", "users-asyncapi.json"]
        ]);
    });

    it("reports a dependency that already namespaced its own specs, rather than overwriting it", async () => {
        const result = await processPackageMarkers({
            dependenciesConfiguration: localDependencies({ users: "/apis/users-api" }),
            structuralValidationResult: structuralValidationResult({
                "users/__package__.yml": exportingPackageMarker("users")
            }),
            context: createTaskContextRunningInteractiveTasks(),
            cliVersion: CLI_VERSION,
            loadAPIWorkspace: loadWorkspacesFrom({
                "/apis/users-api": [
                    { ...users, namespace: "profiles" },
                    { ...usersAsync, namespace: "profiles" },
                    { ...payments, namespace: "accounts" }
                ]
            })
        });

        if (!result.didSucceed) {
            throw new Error(`Expected package markers to process, got failures: ${JSON.stringify(result.failures)}`);
        }

        expect(result.namespaceCollisions).toEqual([
            { compositionNamespace: "users", dependencyNamespace: "accounts" },
            { compositionNamespace: "users", dependencyNamespace: "profiles" }
        ]);
    });

    it("reports no collision when the dependency's specs are unnamespaced", async () => {
        const result = await processPackageMarkers({
            dependenciesConfiguration: localDependencies({ payments: "/apis/payments-api" }),
            structuralValidationResult: structuralValidationResult({
                "payments/__package__.yml": exportingPackageMarker("payments")
            }),
            context: createTaskContextRunningInteractiveTasks(),
            cliVersion: CLI_VERSION,
            loadAPIWorkspace: loadWorkspacesFrom({ "/apis/payments-api": [payments] })
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
                users: "/apis/users-api",
                payments: "/apis/payments-api"
            }),
            structuralValidationResult: structuralValidationResult({
                "users/__package__.yml": exportingPackageMarker("users"),
                "payments/__package__.yml": exportingPackageMarker("payments")
            }),
            context: createTaskContextRunningInteractiveTasks(),
            cliVersion: CLI_VERSION,
            loadAPIWorkspace: loadWorkspacesFrom({
                "/apis/users-api": [users],
                "/apis/payments-api": []
            })
        });

        if (!result.didSucceed) {
            throw new Error(`Expected package markers to process, got failures: ${JSON.stringify(result.failures)}`);
        }

        expect(result.namespacesWithoutSpecs).toEqual(["payments"]);
    });

    it("namespaces by directory, not by the dependency name the marker exports", async () => {
        const result = await processPackageMarkers({
            dependenciesConfiguration: localDependencies({ "users-dependency": "/apis/users-api" }),
            structuralValidationResult: structuralValidationResult({
                "users/__package__.yml": exportingPackageMarker("users-dependency")
            }),
            context: createTaskContextRunningInteractiveTasks(),
            cliVersion: CLI_VERSION,
            loadAPIWorkspace: loadWorkspacesFrom({ "/apis/users-api": [users] })
        });

        if (!result.didSucceed) {
            throw new Error(`Expected package markers to process, got failures: ${JSON.stringify(result.failures)}`);
        }

        expect(result.specs.map(namespaceOf)).toEqual(["users"]);
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
            dependenciesConfiguration: localDependencies({ payments: "/apis/payments-api" }),
            structuralValidationResult: structuralValidationResult({
                "payments/__package__.yml": exportingPackageMarker("payments")
            }),
            context: createTaskContextRunningInteractiveTasks(),
            cliVersion: CLI_VERSION,
            loadAPIWorkspace: loadWorkspacesFrom({ "/apis/payments-api": [] })
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
                "payments/__package__.yml": exportingPackageMarker("payments")
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
