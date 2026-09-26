import { FernDefinition, type IdentifiableSource, ParsedFernFile, type Spec } from "@fern-api/api-workspace-commons";
import { dependenciesYml } from "@fern-api/configuration-loader";
import { entries, keys } from "@fern-api/core-utils";
import { PackageMarkerFileSchema } from "@fern-api/fern-definition-schema";
import { dirname, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { size } from "lodash-es";

import { OSSWorkspace } from "../OSSWorkspace.js";
import { LoadAPIWorkspace } from "./loadAPIWorkspace.js";
import { loadDependency } from "./loadDependency.js";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "./Result.js";
import { validateStructureOfYamlFiles } from "./validateStructureOfYamlFiles.js";

export declare namespace processPackageMarkers {
    export type Return = SuccessfulResult | FailedResult;

    export interface SuccessfulResult {
        didSucceed: true;
        packageMarkers: Record<RelativeFilePath, ParsedFernFile<PackageMarkerFileSchema>>;
        importedDefinitions: Record<RelativeFilePath, ImportedDefinition>;
        specs: Spec[];
        sources: IdentifiableSource[];
        namespaceCollisions: NamespaceCollision[];
        namespacesWithoutSpecs: RelativeFilePath[];
    }

    export interface NamespaceCollision {
        compositionNamespace: RelativeFilePath;
        dependencyNamespace: string;
    }

    export interface FailedResult {
        didSucceed: false;
        failures: Record<RelativeFilePath, WorkspaceLoader.DependencyFailure>;
    }

    export interface ImportedDefinition {
        url: string | undefined;
        definition: FernDefinition;
    }
}

export async function processPackageMarkers({
    dependenciesConfiguration,
    structuralValidationResult,
    context,
    cliVersion,
    settings,
    loadAPIWorkspace
}: {
    dependenciesConfiguration: dependenciesYml.DependenciesConfiguration;
    structuralValidationResult: validateStructureOfYamlFiles.SuccessfulResult;
    context: TaskContext;
    cliVersion: string;
    settings?: OSSWorkspace.Settings;
    loadAPIWorkspace?: LoadAPIWorkspace;
}): Promise<processPackageMarkers.Return> {
    const packageMarkers: Record<RelativeFilePath, ParsedFernFile<PackageMarkerFileSchema>> = {};
    const importedDefinitions: Record<RelativeFilePath, processPackageMarkers.ImportedDefinition> = {};
    const specsByNamespace: Record<RelativeFilePath, Spec[]> = {};
    const sourcesByNamespace: Record<RelativeFilePath, IdentifiableSource[]> = {};
    const namespaceCollisions: processPackageMarkers.NamespaceCollision[] = [];
    const failures: Record<RelativeFilePath, WorkspaceLoader.DependencyFailure> = {};

    await Promise.all(
        entries(structuralValidationResult.packageMarkers).map(async ([pathOfPackageMarker, packageMarker]) => {
            if (packageMarker.contents.export == null) {
                packageMarkers[pathOfPackageMarker] = packageMarker;
            } else {
                const { export: _, ...otherPackageMarkerKeys } = packageMarker.contents;
                if (size(otherPackageMarkerKeys) > 0) {
                    failures[pathOfPackageMarker] = {
                        type: WorkspaceLoaderFailureType.EXPORTING_PACKAGE_MARKER_OTHER_KEYS,
                        pathOfPackageMarker
                    };
                } else {
                    const pathToPackage = dirname(pathOfPackageMarker);
                    const areDefinitionsDefinedInPackage = keys(structuralValidationResult.namedDefinitionFiles).some(
                        (filepath) => filepath !== pathOfPackageMarker && filepath.startsWith(pathToPackage)
                    );
                    if (areDefinitionsDefinedInPackage) {
                        failures[pathOfPackageMarker] = {
                            type: WorkspaceLoaderFailureType.EXPORT_PACKAGE_HAS_DEFINITIONS,
                            pathToPackage
                        };
                    } else {
                        const loadDependencyResult = await loadDependency({
                            dependencyName:
                                typeof packageMarker.contents.export === "string"
                                    ? packageMarker.contents.export
                                    : packageMarker.contents.export.dependency,
                            dependenciesConfiguration,
                            context,
                            rootApiFile: structuralValidationResult.rootApiFile.contents,
                            cliVersion,
                            settings,
                            loadAPIWorkspace
                        });
                        if (loadDependencyResult.didSucceed) {
                            const namespace = dirname(pathOfPackageMarker);
                            importedDefinitions[namespace] = {
                                definition: loadDependencyResult.definition,
                                url:
                                    typeof packageMarker.contents.export === "object"
                                        ? packageMarker.contents.export.url
                                        : undefined
                            };
                            namespaceCollisions.push(
                                ...collectNamespaceCollisions(loadDependencyResult.specs, namespace)
                            );
                            specsByNamespace[namespace] = loadDependencyResult.specs.map((spec) =>
                                withNamespace(spec, namespace)
                            );
                            sourcesByNamespace[namespace] = loadDependencyResult.sources;
                        } else {
                            failures[pathOfPackageMarker] = loadDependencyResult.failure;
                        }
                    }
                }
            }
        })
    );

    if (size(failures) > 0) {
        return {
            didSucceed: false,
            failures
        };
    } else {
        return {
            didSucceed: true,
            packageMarkers,
            importedDefinitions,
            specs: flattenInNamespaceOrder(specsByNamespace),
            sources: flattenInNamespaceOrder(sourcesByNamespace),
            namespaceCollisions,
            namespacesWithoutSpecs: keys(specsByNamespace)
                .filter((namespace) => (specsByNamespace[namespace] ?? []).length === 0)
                .sort()
        };
    }
}

function collectNamespaceCollisions(
    specs: Spec[],
    compositionNamespace: RelativeFilePath
): processPackageMarkers.NamespaceCollision[] {
    const dependencyNamespaces = new Set(
        specs.flatMap((spec) => (spec.type !== "protobuf" && spec.namespace != null ? [spec.namespace] : []))
    );
    return [...dependencyNamespaces].sort().map((dependencyNamespace) => ({
        compositionNamespace,
        dependencyNamespace
    }));
}

function withNamespace(spec: Spec, namespace: string): Spec {
    return spec.type === "protobuf" ? spec : { ...spec, namespace };
}

function flattenInNamespaceOrder<T>(byNamespace: Record<RelativeFilePath, T[]>): T[] {
    return keys(byNamespace)
        .sort()
        .flatMap((namespace) => byNamespace[namespace] ?? []);
}
